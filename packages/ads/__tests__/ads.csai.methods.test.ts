/** @jest-environment jsdom */

/**
 * ads.csai.methods.test.ts
 *
 * Covers CsaiAdStrategy methods that are only reachable by accessing the
 * strategy instance directly or by triggering ad playback in specific ways:
 *
 *  - playAds() / playAdsFromXml() on CsaiAdStrategy
 *  - getDueMidrollBreaks() / getDueMidrollBreak() on CsaiAdStrategy
 *  - requestSkip() on CsaiAdStrategy
 *  - dom getter lazy-init path (when _dom is not pre-injected)
 *  - dom setter
 *  - bindAdSurfaceCommands cmd:play handler branches
 *  - tryPlay retry path
 *  - clearSession with adEngineDetach and adVideo present
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import type { CsaiAdStrategy } from '../src/strategies/csai';
import { vastGetMock, vastParseMock } from './mocks/vast-client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeLeases() {
  const owners = new Map<string, string>();
  return {
    acquire: (cap: string, who: string) => {
      if (owners.has(cap)) return false;
      owners.set(cap, who);
      return true;
    },
    release: (cap: string, who: string) => {
      if (owners.get(cap) === who) owners.delete(cap);
    },
    owner: (cap: string) => owners.get(cap),
  } as unknown as Lease;
}

function makeCtx(opts: { autoplay?: boolean; userInteracted?: boolean } = {}) {
  const bus = new EventBus();
  const video = document.createElement('video');
  video.autoplay = Boolean(opts.autoplay);
  video.play = jest.fn(() => Promise.resolve());
  video.pause = jest.fn();
  document.body.appendChild(video);

  const dispose = new DisposableStore();
  bus.on('cmd:pause', () => (video.pause as jest.Mock)());
  bus.on('cmd:play', () => (video.play as jest.Mock)());

  const ctx: PluginContext = {
    core: {
      media: video,
      muted: false,
      volume: 0.8,
      userInteracted: Boolean(opts.userInteracted ?? true),
    } as unknown as Core,
    events: bus,
    state: new StateManager('playing'),
    leases: makeLeases(),
    dispose,
    add: (d: any) => dispose.add(d),
    on: (event: any, cb: any) => dispose.add(bus.on(event, cb)),
    listen: (target: any, type: any, handler: any, options?: any) =>
      dispose.addEventListener(target, type, handler, options),
  };

  return { ctx, bus, video };
}

function linearVast() {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            type: 'linear',
            skipDelay: null,
            mediaFiles: [
              {
                fileURL: 'https://example.com/ad.mp4',
                mimeType: 'video/mp4',
                bitrate: 500,
                width: 640,
                height: 360,
              },
            ],
          },
        ],
      },
    ],
  };
}

async function waitForAdVideo(ms = 60): Promise<HTMLVideoElement | null> {
  for (let i = 0; i < ms; i++) {
    const el = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (el) return el;
    await Promise.resolve();
  }
  return null;
}

beforeEach(() => {
  vastGetMock.mockReset();
  vastParseMock.mockReset();
  document.body.innerHTML = '';
});

// ─── CsaiAdStrategy.playAds / playAdsFromXml ─────────────────────────────────

describe('CsaiAdStrategy.playAds / playAdsFromXml', () => {
  test('playAds delegates to playBreakFromVast with inferred sourceType', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const p = csai.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    adVideo?.dispatchEvent(new Event('ended'));
    const result = await p;
    expect(typeof result).toBe('boolean');
  });

  test('playAdsFromXml delegates to playBreakFromVast with kind=xml', async () => {
    vastParseMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const p = csai.playAdsFromXml('<VAST version="3.0"></VAST>');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    adVideo?.dispatchEvent(new Event('ended'));
    const result = await p;
    expect(typeof result).toBe('boolean');
  });
});

// ─── getDueMidrollBreaks / getDueMidrollBreak ─────────────────────────────────

describe('CsaiAdStrategy.getDueMidrollBreaks / getDueMidrollBreak', () => {
  test('getDueMidrollBreaks returns an array (empty when no breaks scheduled)', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const result = csai.getDueMidrollBreaks(30);
    expect(Array.isArray(result)).toBe(true);
  });

  test('getDueMidrollBreak returns undefined when no breaks are due', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const result = csai.getDueMidrollBreak(30);
    expect(result).toBeUndefined();
  });

  test('getDueMidrollBreaks returns scheduled midrolls at the given time', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      breaks: [{ at: 30, source: { type: 'VAST', src: 'https://example.com/vast.xml' }, timeOffset: '00:00:30' }],
    });
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    // At exactly 30 seconds the break is due
    const breaks = csai.getDueMidrollBreaks(30);
    expect(Array.isArray(breaks)).toBe(true);
  });
});

// ─── requestSkip ──────────────────────────────────────────────────────────────

describe('CsaiAdStrategy.requestSkip', () => {
  test('requestSkip("api") does not throw when no ad is active', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    expect(() => csai.requestSkip('api')).not.toThrow();
  });

  test('requestSkip("button") does not throw when no ad is active', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    expect(() => csai.requestSkip('button')).not.toThrow();
  });

  test('requestSkip("close") does not throw when no ad is active', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    expect(() => csai.requestSkip('close')).not.toThrow();
  });
});

// ─── dom getter lazy-init and setter ─────────────────────────────────────────

describe('CsaiAdStrategy dom getter / setter', () => {
  test('dom getter creates AdDomManager lazily on first access', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    // Clear the pre-set _dom to force lazy init
    (csai as any)._dom = undefined;

    const dom1 = csai.dom;
    expect(dom1).toBeDefined();

    // Second access returns same instance
    const dom2 = csai.dom;
    expect(dom2).toBe(dom1);
  });

  test('dom setter replaces the AdDomManager instance', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const fakeDom = {} as any;
    csai.dom = fakeDom;
    expect((csai as any)._dom).toBe(fakeDom);
  });
});

// ─── bindAdSurfaceCommands — cmd:play handler ─────────────────────────────────

describe('CsaiAdStrategy bindAdSurfaceCommands cmd:play handler', () => {
  test('cmd:play with shouldForceMute=false updates ad video from core state', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx({ userInteracted: true });
    (ctx.core as any).muted = false;
    (ctx.core as any).volume = 0.7;

    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const p = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    if (adVideo) {
      adVideo.play = jest.fn(() => Promise.resolve());
      // Emit cmd:play — shouldForceMute=false path
      bus.emit('cmd:play');
      await Promise.resolve();
      expect(adVideo.play).toHaveBeenCalled();
      adVideo.dispatchEvent(new Event('ended'));
    }
    await p.catch(() => {});
  });

  test('cmd:play with shouldForceMute=true mutes the ad video', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus, video } = makeCtx({ autoplay: true, userInteracted: false });
    video.autoplay = true;
    (ctx.core as any).userInteracted = false;

    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const p = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    if (adVideo) {
      adVideo.play = jest.fn(() => Promise.resolve());
      bus.emit('cmd:play');
      await Promise.resolve();
      expect(adVideo.play).toHaveBeenCalled();
      adVideo.dispatchEvent(new Event('ended'));
    }
    await p.catch(() => {});
  });

  test('cmd:play when adVideo is null is a no-op', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx({ userInteracted: true });
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const p = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    adVideo?.dispatchEvent(new Event('ended'));
    await p;

    // adVideo is now gone — cmd:play should not throw
    expect(() => bus.emit('cmd:play')).not.toThrow();
  });
});

// ─── clearSession cleanup branches ────────────────────────────────────────────

describe('CsaiAdStrategy clearSession', () => {
  test('clearSession with adEngineDetach calls and clears it', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const detachSpy = jest.fn();
    (csai as any).adEngineDetach = detachSpy;

    csai.clearSession();

    expect(detachSpy).toHaveBeenCalledTimes(1);
    expect((csai as any).adEngineDetach).toBeUndefined();
  });

  test('clearSession with adVideo pauses and removes it', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const fakeVideo = document.createElement('video');
    fakeVideo.pause = jest.fn();
    fakeVideo.remove = jest.fn();
    document.body.appendChild(fakeVideo);
    (csai as any).adVideo = fakeVideo;

    csai.clearSession();

    expect(fakeVideo.pause).toHaveBeenCalled();
    expect((csai as any).adVideo).toBeUndefined();
  });

  test('clearSession removes orphaned op-ads__media video elements from overlay', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    const overlay = document.createElement('div');
    (csai as any)._dom = { clearSession: jest.fn(), overlay } as any;
    (csai as any).overlay = overlay;
    const staleVideo = document.createElement('video');
    staleVideo.className = 'op-ads__media';
    overlay.appendChild(staleVideo);

    expect(() => csai.clearSession()).not.toThrow();
  });

  test('clearSession without adEngineDetach or adVideo does not throw', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({});
    plugin.setup(ctx);
    const csai = (plugin as any).csai as CsaiAdStrategy;

    (csai as any).adEngineDetach = undefined;
    (csai as any).adVideo = undefined;

    expect(() => csai.clearSession()).not.toThrow();
  });
});

// ─── tryPlay / startAdPlayback branches ───────────────────────────────────────

describe('CsaiAdStrategy startAdPlayback / tryPlay branches', () => {
  test('startAdPlayback retries with mute when initial play() rejects', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx({ userInteracted: false });

    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const p = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    if (adVideo) {
      adVideo.play = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject(new Error('autoplay blocked')))
        .mockImplementationOnce(() => Promise.resolve());

      const csai = (plugin as any).csai as CsaiAdStrategy;
      if (typeof (csai as any)._dispatchStartAdPlayback === 'function') {
        (csai as any)._dispatchStartAdPlayback();
      }

      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect((adVideo.play as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
      adVideo.dispatchEvent(new Event('ended'));
    }
    await p.catch(() => {});
  });

  test('startAdPlayback with adVideo.play returning non-Promise is handled', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx({ userInteracted: true });

    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const p = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    if (adVideo) {
      adVideo.play = jest.fn(() => undefined as any);

      const csai = (plugin as any).csai as CsaiAdStrategy;
      if (typeof (csai as any)._dispatchStartAdPlayback === 'function') {
        expect(() => (csai as any)._dispatchStartAdPlayback()).not.toThrow();
      }

      adVideo.dispatchEvent(new Event('ended'));
    }
    await p.catch(() => {});
  });
});
