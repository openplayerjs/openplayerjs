/** @jest-environment jsdom */

import { DisposableStore } from '../src/core/dispose';
import { EventBus } from '../src/core/events';
import type { Lease } from '../src/core/lease';
import type { Player } from '../src/core/player';
import type { PluginContext } from '../src/core/plugin';
import { StateManager } from '../src/core/state';
import { AdsPlugin } from '../src/plugins/ads';
import { vastGetMock } from './mocks/vast-client';

function makeLeases(): Lease {
  const owners = new Map<string, string>();
  const acquire = jest.fn<boolean, [string, string]>((capability, who) => {
    if (owners.has(capability)) return false;
    owners.set(capability, who);
    return true;
  });
  const release = jest.fn<void, [string, string]>((capability, who) => {
    if (owners.get(capability) === who) owners.delete(capability);
  });
  const owner = jest.fn<string | undefined, [string]>((capability) => owners.get(capability));
  return { acquire, release, owner } as any;
}

function makeCtx() {
  const bus = new EventBus();
  const video = document.createElement('video');
  const dispose = new DisposableStore();
  bus.on('playback:pause', () => (video as any).pause());
  bus.on('playback:play', () => void (video as any).play());

  const ctx: PluginContext = {
    player: { media: video } as unknown as Player,
    events: bus as any,
    state: new StateManager('playing'),
    leases: makeLeases(),

    dispose,
    add: (d) => dispose.add(d as any),
    on: (event: any, cb: any) => dispose.add(bus.on(event, cb)),
    listen: (target: any, type: any, handler: any, options?: any) =>
      dispose.addEventListener(target, type, handler, options),
  };

  return { ctx, bus, video };
}

async function nextTick(times = 1) {
  for (let i = 0; i < times; i++) await Promise.resolve();
}

async function waitForAdVideo(): Promise<HTMLVideoElement> {
  for (let i = 0; i < 30; i++) {
    const el = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (el) return el;
    await nextTick();
  }
  throw new Error('Ad video was not mounted');
}

function parsedWithTwoLinearCreatives(order: 'bumper-first' | 'full-first') {
  const bumper = {
    linear: {
      mediaFiles: [
        {
          type: 'video/mp4',
          fileURL: 'https://example.com/bumper.mp4',
          bitrate: 300,
          width: 640,
          height: 360,
        },
      ],
    },
  };

  const full = {
    linear: {
      mediaFiles: [
        {
          type: 'video/mp4',
          fileURL: 'https://example.com/full.mp4',
          bitrate: 800,
          width: 640,
          height: 360,
        },
      ],
    },
  };

  const creatives = order === 'bumper-first' ? [bumper, full] : [full, bumper];

  return {
    ads: [
      {
        sequence: '1',
        creatives,
      },
    ],
  };
}

function parsedWithMultipleAdsAndMixedCreatives() {
  // Ad 1 contains two playable creatives (bumper + full)
  // Ad 2 contains one playable creative
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            linear: {
              mediaFiles: [
                {
                  type: 'video/mp4',
                  fileURL: 'https://example.com/ad1-bumper.mp4',
                  bitrate: 200,
                  width: 640,
                  height: 360,
                },
              ],
            },
          },
          {
            linear: {
              mediaFiles: [
                {
                  type: 'video/mp4',
                  fileURL: 'https://example.com/ad1-full.mp4',
                  bitrate: 800,
                  width: 640,
                  height: 360,
                },
              ],
            },
          },
        ],
      },
      {
        sequence: '2',
        creatives: [
          {
            linear: {
              mediaFiles: [
                {
                  type: 'video/mp4',
                  fileURL: 'https://example.com/ad2-post.mp4',
                  bitrate: 500,
                  width: 640,
                  height: 360,
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

function parsedWithMultipleAdsAndSecondAdHasTwoCreatives() {
  // Ad 1 contains one playable creative
  // Ad 2 contains two playable creatives
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            linear: {
              mediaFiles: [
                {
                  type: 'video/mp4',
                  fileURL: 'https://example.com/ad1-only.mp4',
                  bitrate: 400,
                  width: 640,
                  height: 360,
                },
              ],
            },
          },
        ],
      },
      {
        sequence: '2',
        creatives: [
          {
            linear: {
              mediaFiles: [
                {
                  type: 'video/mp4',
                  fileURL: 'https://example.com/ad2-bumper.mp4',
                  bitrate: 200,
                  width: 640,
                  height: 360,
                },
              ],
            },
          },
          {
            linear: {
              mediaFiles: [
                {
                  type: 'video/mp4',
                  fileURL: 'https://example.com/ad2-full.mp4',
                  bitrate: 900,
                  width: 640,
                  height: 360,
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

describe('AdsPlugin pod playback: multiple linear creatives inside one <Ad>', () => {
  beforeEach(() => {
    vastGetMock.mockReset();
    document.body.innerHTML = '';
  });

  test('plays bumper then full when VAST contains two playable creatives in one Ad', async () => {
    vastGetMock.mockResolvedValueOnce(parsedWithTwoLinearCreatives('bumper-first'));

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: true });
    p.setup(ctx);

    // Trigger a manual VAST ad break.
    void (p as any).playAds('https://example.com/vast');

    const first = await waitForAdVideo();
    expect(first.src).toContain('bumper.mp4');

    // End bumper.
    first.dispatchEvent(new Event('ended'));
    await nextTick(5);

    const second = await waitForAdVideo();
    expect(second.src).toContain('full.mp4');

    // End full.
    second.dispatchEvent(new Event('ended'));
    await nextTick(5);

    // Overlay should be hidden after completion.
    const overlay = document.querySelector('.op-ads') as HTMLElement | null;
    expect(overlay).toBeTruthy();
    expect(overlay?.style.display).toBe('none');
  });

  test('plays full then bumper when creative order is reversed', async () => {
    vastGetMock.mockResolvedValueOnce(parsedWithTwoLinearCreatives('full-first'));

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: true });
    p.setup(ctx);

    void (p as any).playAds('https://example.com/vast');

    const first = await waitForAdVideo();
    expect(first.src).toContain('full.mp4');

    first.dispatchEvent(new Event('ended'));
    await nextTick(5);

    const second = await waitForAdVideo();
    expect(second.src).toContain('bumper.mp4');
  });

  test('plays all creatives across multiple <Ad> entries in VAST (Ad1 creatives then Ad2 creatives)', async () => {
    vastGetMock.mockResolvedValueOnce(parsedWithMultipleAdsAndMixedCreatives());

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: true });
    p.setup(ctx);

    void (p as any).playAds('https://example.com/vast');

    const v1 = await waitForAdVideo();
    expect(v1.src).toContain('ad1-bumper.mp4');
    v1.dispatchEvent(new Event('ended'));
    await nextTick(5);

    const v2 = await waitForAdVideo();
    expect(v2.src).toContain('ad1-full.mp4');
    v2.dispatchEvent(new Event('ended'));
    await nextTick(5);

    const v3 = await waitForAdVideo();
    expect(v3.src).toContain('ad2-post.mp4');
  });

  test('preserves ordering when later <Ad> contains multiple playable creatives', async () => {
    vastGetMock.mockResolvedValueOnce(parsedWithMultipleAdsAndSecondAdHasTwoCreatives());

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: true });
    p.setup(ctx);

    void (p as any).playAds('https://example.com/vast');

    const v1 = await waitForAdVideo();
    expect(v1.src).toContain('ad1-only.mp4');
    v1.dispatchEvent(new Event('ended'));
    await nextTick(5);

    const v2 = await waitForAdVideo();
    expect(v2.src).toContain('ad2-bumper.mp4');
    v2.dispatchEvent(new Event('ended'));
    await nextTick(5);

    const v3 = await waitForAdVideo();
    expect(v3.src).toContain('ad2-full.mp4');
  });
});
