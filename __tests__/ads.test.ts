/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import type { Lease } from '../src/core/lease';
import type { Player } from '../src/core/player';
import type { PluginContext } from '../src/core/plugin';
import { StateManager } from '../src/core/state';
import { AdsPlugin } from '../src/plugins/ads';
import { trackerCtorMock, vastGetMock, vastParseMock } from './mocks/vast-client';

async function waitForAdVideo(): Promise<HTMLVideoElement> {
  for (let i = 0; i < 20; i++) {
    const el = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (el) return el;
    await Promise.resolve();
  }
  throw new Error('Ad video was not mounted');
}

function makeLeases(): {
  leases: Lease;
  acquire: jest.MockedFunction<(capability: string, owner: string) => boolean>;
  release: jest.MockedFunction<(capability: string, owner: string) => void>;
  owner: jest.MockedFunction<(capability: string) => string | undefined>;
} {
  const owners = new Map<string, string>();

  // jest.fn typing in Jest expects 0 or 2 generic args; use <Return, ArgsTuple>.
  const acquire = jest.fn<boolean, [string, string]>((capability, who) => {
    if (owners.has(capability)) return false;
    owners.set(capability, who);
    return true;
  }) as unknown as jest.MockedFunction<(capability: string, owner: string) => boolean>;

  const release = jest.fn<void, [string, string]>((capability, who) => {
    if (owners.get(capability) === who) owners.delete(capability);
  }) as unknown as jest.MockedFunction<(capability: string, owner: string) => void>;

  // IMPORTANT: Lease.owner returns string | undefined (not null).
  const owner = jest.fn<string | undefined, [string]>((capability) =>
    owners.get(capability)
  ) as unknown as jest.MockedFunction<(capability: string) => string | undefined>;

  return { leases: { acquire, release, owner } as any, acquire, release, owner };
}

function makeCtx(media?: HTMLVideoElement) {
  const bus = new EventBus();
  const video = media ?? document.createElement('video');

  // Simulate player reacting to playback bus events.
  bus.on('playback:pause', () => (video as any).pause());
  bus.on('playback:play', () => void (video as any).play());

  const lease = makeLeases();

  const ctx: PluginContext = {
    // PluginContext expects a full Player; tests only need `.media`.
    player: { media: video } as unknown as Player,
    // EventBus is capable of emitting arbitrary plugin events; PlayerEvent typing is stricter than runtime.
    events: bus as any,
    // Real StateManager has `current` getter (readonly) + transition(); ads tests mutate via transition().
    state: new StateManager('playing'),
    leases: lease.leases,
  };

  return { ctx, bus, video, lease };
}

function linearParsed(skipOffset = '00:00:05') {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            linear: {
              skipOffset,
              mediaFiles: [
                {
                  type: 'video/mp4',
                  fileURL: 'https://example.com/ad.mp4',
                  bitrate: 500,
                  width: 640,
                  height: 360,
                },
              ],
            },
            companionAds: {
              companions: [
                {
                  staticResource: { value: 'https://example.com/companion.png' },
                  companionClickThroughURLTemplate: 'https://example.com/click',
                },
              ],
            },
            nonLinearAds: {
              nonLinears: [
                {
                  htmlResource: { value: '<div id="nl-inline">INLINE-NL</div>' },
                  nonLinearClickThroughURLTemplate: 'https://example.com/nlclick',
                  minSuggestedDuration: '00:00:02',
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

function nonLinearOnlyParsed() {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            nonLinearAds: {
              nonLinears: [
                {
                  htmlResource: { value: '<div id="nl-only">NL-ONLY</div>' },
                  nonLinearClickThroughURLTemplate: 'https://example.com/nlonly',
                  minSuggestedDuration: '00:00:03',
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

describe('AdsPlugin (ultimate patch)', () => {
  beforeEach(() => {
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    trackerCtorMock.mockClear();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('helper parsing: skip offsets and time offsets', () => {
    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const anyP: any = p;

    // skipOffset
    expect(anyP.computeSkipAtSeconds('00:00:10', 40)).toBe(10);
    expect(anyP.computeSkipAtSeconds('5', 40)).toBe(5);
    expect(anyP.computeSkipAtSeconds('25%', 40)).toBe(10);
    expect(anyP.computeSkipAtSeconds('bogus', 40)).toBeUndefined();

    // VMAP timeOffset parsing
    expect(anyP.parseVmapTimeOffset('start')).toEqual({ at: 'preroll' });
    expect(anyP.parseVmapTimeOffset('end')).toEqual({ at: 'postroll' });
    expect(anyP.parseVmapTimeOffset('00:00:12')).toEqual({ at: 12 });
    expect(anyP.parseVmapTimeOffset('25%')).toEqual({ at: 0, pendingPercent: 0.25 });
    expect(anyP.parseVmapTimeOffset('12')).toEqual({ at: 12 });
  });

  test('caption extraction is stable and produces vtt-only tracks', () => {
    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const anyP: any = p;

    const raw = {
      closedCaptionFiles: [
        { type: 'text/vtt', language: 'en', fileURL: 'https://example.com/en.vtt' },
        { type: 'application/ttml+xml', language: 'es', fileURL: 'https://example.com/es.ttml' },
      ],
    };

    const captions = anyP.ensureRawCaptions(raw);
    expect(captions.length).toBe(2);

    const adVideo = document.createElement('video');
    const tracks = anyP.attachAdCaptionTracks(adVideo, raw);
    expect(tracks.length).toBe(1);
    expect(tracks[0].src).toContain('en.vtt');
  });

  test('linear ad: creates skip button when DOM is missing and enables it after skipOffset', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:05'));

    const { ctx, video, lease } = makeCtx();

    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: true });
    p.setup(ctx);

    const seen: string[] = [];
    (p as any).bus.on('ads:requested', () => seen.push('requested'));
    (p as any).bus.on('ads:ad:start', () => seen.push('ad:start'));
    (p as any).bus.on('ads:impression', () => seen.push('impression'));

    const playPromise = p.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    // Linear breaks pause and acquire lease
    expect((video as any).pause).toHaveBeenCalled();
    expect(lease.acquire).toHaveBeenCalledWith('playback', 'ads');

    const skipBtn = document.querySelector('button.op-ads__skip-btn') as HTMLButtonElement;
    expect(skipBtn).toBeTruthy();
    const adVideo = await waitForAdVideo();
    Object.defineProperty(adVideo, 'duration', { value: 20, configurable: true });

    adVideo.currentTime = 1;
    adVideo.dispatchEvent(new Event('loadedmetadata'));
    adVideo.dispatchEvent(new Event('timeupdate'));
    expect(skipBtn.textContent).toMatch(/\d+/i);

    adVideo.currentTime = 6;
    adVideo.dispatchEvent(new Event('timeupdate'));
    expect(skipBtn.textContent).toBe('Skip Ad');

    const skipped: any[] = [];
    (p as any).bus.on('ads:skip', (payload: any) => skipped.push(payload));

    skipBtn.click();

    // Resolve onEnded
    await Promise.resolve();

    expect(seen).toEqual(expect.arrayContaining(['requested', 'ad:start', 'impression']));
    expect(skipped.length).toBe(1);

    await playPromise;
    expect(lease.release).toHaveBeenCalledWith('playback', 'ads');
  });

  test('non-linear-only break: does not pause content, does not acquire lease, auto-dismisses overlays', async () => {
    vastGetMock.mockResolvedValueOnce(nonLinearOnlyParsed());

    const { ctx, lease } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: true });
    p.setup(ctx);

    const play = p.playAds('https://example.com/nonlinear.xml');
    await Promise.resolve();

    // Non-linear-only breaks should not acquire the playback lease.
    // (Avoid asserting pause() call counts because HTMLMediaElement.prototype.pause is globally mocked.)
    expect(lease.acquire).not.toHaveBeenCalled();

    expect(document.querySelector('.op-ads__nonlinear')).toBeTruthy();
    expect(document.getElementById('nl-only')).toBeTruthy();

    jest.advanceTimersByTime(3100);
    await play;

    expect(document.querySelector('.op-ads__nonlinear')).toBeFalsy();
  });

  test('companion and non-linear renderers create DOM and close button removes non-linear units', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const run = p.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    Object.defineProperty(adVideo, 'duration', { value: 5, configurable: true });
    adVideo.dispatchEvent(new Event('loadedmetadata'));

    expect(document.querySelector('.op-ads__companion')).toBeTruthy();
    expect(document.querySelector('.op-ads__companion img')).toBeTruthy();

    expect(document.querySelector('.op-ads__nonlinear')).toBeTruthy();
    expect(document.getElementById('nl-inline')).toBeTruthy();

    const closeBtn = document.querySelector(
      '.op-ads__nonlinear-item button[aria-label="Close ad"]'
    ) as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.click();
    expect(document.getElementById('nl-inline')).toBeFalsy();

    adVideo.dispatchEvent(new Event('ended'));
    await run;
  });

  test('restores active content captions track after linear ad finishes', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx, video } = makeCtx();

    // Mock content textTracks (jsdom does not implement them).
    const t0: any = { kind: 'captions', language: 'en', label: 'English', mode: 'showing' };
    const t1: any = { kind: 'captions', language: 'es', label: 'Español', mode: 'disabled' };
    const list: any = { length: 2, 0: t0, 1: t1 };
    Object.defineProperty(video, 'textTracks', { value: list, configurable: true });

    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const run = p.playAds('https://example.com/vast.xml');
    // Allow async VAST fetch/parse + DOM mount to complete.
    for (let i = 0; i < 10; i++) await Promise.resolve();

    // Simulate a mode flip while ads play (some apps disable tracks temporarily)
    t0.mode = 'disabled';
    t1.mode = 'disabled';

    const adVideo = await waitForAdVideo();
    Object.defineProperty(adVideo, 'duration', { value: 5, configurable: true });
    adVideo.dispatchEvent(new Event('loadedmetadata'));
    adVideo.dispatchEvent(new Event('ended'));

    await run;

    expect(t0.mode).toBe('showing');
    expect(t1.mode).toBe('disabled');
  });

  test('rejects linear playback if playback lease is already owned', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx, lease } = makeCtx();

    // Pre-own the lease
    lease.acquire('playback', 'someone-else');

    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const errors: any[] = [];
    (ctx.events as any).on('ads:error', (e: any) => errors.push(e));

    await p.playAds('https://example.com/vast.xml');

    expect(errors.length).toBeGreaterThan(0);
  });
});
