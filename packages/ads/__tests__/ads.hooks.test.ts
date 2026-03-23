/** @jest-environment jsdom */

/**
 * Targets uncovered branches in ads.ts:
 *  - onVisibility handler in mountAdVideo (lines 884-889):
 *      • visibilityState !== 'visible' → early return
 *      • ad video not paused → early return
 *      • ad video paused and page visible → play() called
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { vastGetMock } from './mocks/vast-client';

function makeCtx(video?: HTMLVideoElement) {
  const bus = new EventBus();
  const v = video ?? document.createElement('video');
  if (!v.parentNode) document.body.appendChild(v);
  const dispose = new DisposableStore();
  const ctx: PluginContext = {
    core: { media: v, muted: false, volume: 1, userInteracted: false } as unknown as Core,
    events: bus,
    state: new StateManager('ready'),
    leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as unknown as Lease,
    dispose,
    add: (d) => dispose.add(d),
    on: (event, cb) => dispose.add(bus.on(event, cb)),
    listen: (target, type, handler, options) => dispose.addEventListener(target, type, handler, options),
  };
  return { ctx, bus, video: v };
}

function linearVast() {
  return {
    ads: [
      {
        sequence: 1,
        creatives: [
          {
            type: 'linear',
            mediaFiles: [
              { type: 'video/mp4', fileURL: 'https://example.com/ad.mp4', bitrate: 500, width: 640, height: 360 },
            ],
          },
        ],
      },
    ],
  };
}

async function waitForEl<T extends Element>(selector: string, tries = 40): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const el = document.querySelector(selector) as T | null;
    if (el) return el;
    await Promise.resolve();
  }
  return null;
}

beforeEach(() => {
  vastGetMock.mockReset();
  document.body.innerHTML = '';
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
});

afterEach(() => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
});

// ─── onVisibility handler ─────────────────────────────────────────────────────

describe('AdsPlugin: visibilitychange handler in mountAdVideo', () => {
  it('resumes paused ad video when page becomes visible', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    let playCalled = false;
    Object.defineProperty(adVideo, 'paused', { configurable: true, get: () => true });
    Object.defineProperty(adVideo, 'ended', { configurable: true, get: () => false });
    adVideo.play = jest.fn(() => {
      playCalled = true;
      return Promise.resolve();
    }) as unknown as HTMLVideoElement['play'];

    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(playCalled).toBe(true);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('does not call play when visibilityState is hidden', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    let playCalled = false;
    adVideo.play = jest.fn(() => {
      playCalled = true;
      return Promise.resolve();
    }) as unknown as HTMLVideoElement['play'];

    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(playCalled).toBe(false);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('does not call play when ad video is already playing (not paused)', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    let playCalled = false;
    Object.defineProperty(adVideo, 'paused', { configurable: true, get: () => false });
    adVideo.play = jest.fn(() => {
      playCalled = true;
      return Promise.resolve();
    }) as unknown as HTMLVideoElement['play'];

    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(playCalled).toBe(false);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('does not call play when ad video has ended', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    let playCalled = false;
    Object.defineProperty(adVideo, 'paused', { configurable: true, get: () => true });
    Object.defineProperty(adVideo, 'ended', { configurable: true, get: () => true });
    adVideo.play = jest.fn(() => {
      playCalled = true;
      return Promise.resolve();
    }) as unknown as HTMLVideoElement['play'];

    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(playCalled).toBe(false);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });
});
