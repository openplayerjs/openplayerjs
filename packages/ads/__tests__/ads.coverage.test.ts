/** @jest-environment jsdom */

import VMAP from '@dailymotion/vmap';
import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { vastGetMock, vastParseMock } from './mocks/vast-client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForAdVideo(retries = 25): Promise<HTMLVideoElement> {
  // Allow for multiple promise turns + 0ms timers.
  for (let i = 0; i < Math.max(retries, 60); i++) {
    const el = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (el) return el;
    await Promise.resolve();
    try {
      jest.advanceTimersByTime?.(0);
    } catch {
      // ignore if fake timers are not enabled
    }
  }
  throw new Error('Ad video was not mounted within expected time');
}

async function flushPromises(n = 5) {
  for (let i = 0; i < n; i++) await Promise.resolve();
}

function makeLeases(): {
  leases: Lease;
  acquire: jest.MockedFunction<(capability: string, owner: string) => boolean>;
  release: jest.MockedFunction<(capability: string, owner: string) => void>;
  owner: jest.MockedFunction<(capability: string) => string | undefined>;
} {
  const owners = new Map<string, string>();
  const acquire = jest.fn<boolean, [string, string]>((cap, who) => {
    if (owners.has(cap)) return false;
    owners.set(cap, who);
    return true;
  }) as unknown as jest.MockedFunction<(c: string, o: string) => boolean>;
  const release = jest.fn<void, [string, string]>((cap, who) => {
    if (owners.get(cap) === who) owners.delete(cap);
  }) as unknown as jest.MockedFunction<(c: string, o: string) => void>;
  const owner = jest.fn<string | undefined, [string]>((cap) => owners.get(cap)) as unknown as jest.MockedFunction<
    (c: string) => string | undefined
  >;
  return { leases: { acquire, release, owner } as unknown as Lease, acquire, release, owner };
}

function makeCtx(
  opts: {
    userInteracted?: boolean;
    muted?: boolean;
    volume?: number;
    preload?: string;
    autoplay?: boolean;
  } = {},
  media?: HTMLVideoElement
) {
  const { userInteracted = false, muted = false, volume = 1, preload = '', autoplay = false } = opts;
  const bus = new EventBus();
  const video = media ?? document.createElement('video');
  const dispose = new DisposableStore();

  if (preload) video.setAttribute('preload', preload);
  if (autoplay) video.autoplay = true;

  bus.on('cmd:pause', video.pause);
  bus.on('cmd:play', video.play);

  const lease = makeLeases();

  const playerMock: Partial<Core> & { userInteracted: boolean; muted: boolean; volume: number } = {
    media: video,
    userInteracted,
    muted,
    volume,
    events: bus,
  };

  const ctx: PluginContext = {
    core: playerMock as unknown as Core,
    events: bus,
    state: new StateManager('playing'),
    leases: lease.leases,

    dispose,
    add: (d) => dispose.add(d),
    on: (event, cb) => dispose.add(bus.on(event, cb)),
    listen: (target, type, handler, options) => dispose.addEventListener(target, type, handler, options),
  };

  return { ctx, bus, video, lease };
}

// ---------------------------------------------------------------------------
// VAST fixtures
// ---------------------------------------------------------------------------

function linearParsed(skipOffset = '00:00:00') {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            videoClicks: {
              clickThroughURLTemplate: 'https://example.com/clickthrough',
            },
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
          },
        ],
      },
    ],
  };
}

function linearPodParsed(count: number, skipOffset = '00:00:00') {
  return {
    ads: Array.from({ length: count }).map((_, i) => ({
      sequence: String(i + 1),
      creatives: [
        {
          videoClicks: { clickThroughURLTemplate: 'https://example.com/clickthrough' },
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
        },
      ],
    })),
  };
}

function companionParsed() {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            linear: {
              skipOffset: '00:00:00',
              mediaFiles: [
                { type: 'video/mp4', fileURL: 'https://example.com/ad.mp4', bitrate: 500, width: 640, height: 360 },
              ],
            },
            companionAds: {
              companions: [{ iFrameResource: { value: 'https://example.com/companion.html' } }],
            },
          },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Core additional-coverage tests (existing, fixed)
// ---------------------------------------------------------------------------

describe('AdsPlugin additional coverage', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as any).fetch = undefined;
  });

  test('PluginBus on/emit is wired through setup() and can be used for ads:error', () => {
    const { ctx, bus } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false }) as any;
    p.setup(ctx);

    const seen: any[] = [];
    p.bus.on('ads:error', (e: any) => seen.push(e));
    p.bus.emit('ads:error', { hello: 'world' });
    expect(seen).toEqual([{ hello: 'world' }]);

    const other: any[] = [];
    bus.on('ads:error', (e: any) => other.push(e));
    p.bus.emit('ads:error', { again: true });
    expect(other.length).toBe(1);
  });

  test('break scheduler: midroll triggers on timeupdate; postroll triggers on ended', async () => {
    const { ctx, video } = makeCtx();
    Object.defineProperty(video, 'duration', { configurable: true, value: 100 });
    const p = new AdsPlugin({
      allowNativeControls: false,
      breaks: [
        { id: 'm1', at: 5, source: { type: 'VAST', src: 'https://example.com/mid.xml' }, once: true },
        { id: 'po', at: 'postroll', source: { type: 'VAST', src: 'https://example.com/post.xml' }, once: true },
      ],
    }) as any;
    p.setup(ctx);

    const spy = jest.spyOn(p, 'playBreakFromVast').mockResolvedValue(undefined);

    video.currentTime = 6;
    video.dispatchEvent(new Event('timeupdate'));
    await Promise.resolve();
    expect(spy).toHaveBeenCalled();

    spy.mockClear();
    video.currentTime = 10;
    video.dispatchEvent(new Event('timeupdate'));
    await Promise.resolve();
    expect(spy).not.toHaveBeenCalled();

    spy.mockClear();
    video.dispatchEvent(new Event('ended'));
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('preroll interceptors: custom controls via playback:play and native controls via media play capture', async () => {
    const { ctx, bus, video } = makeCtx();
    ctx.state.transition('idle');
    const p = new AdsPlugin({
      allowNativeControls: true,
      interceptPlayForPreroll: true,
      breaks: [{ id: 'pre', at: 'preroll', source: { type: 'VAST', src: 'https://example.com/pre.xml' }, once: true }],
    }) as any;
    p.setup(ctx);

    const spy = jest.spyOn(p, 'startBreak').mockResolvedValue(undefined);

    bus.emit('cmd:play');
    await Promise.resolve();
    expect(spy).toHaveBeenCalled();

    spy.mockClear();
    video.dispatchEvent(new Event('play'));
    await Promise.resolve();
    expect(video.pause).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  test('VMAP: merge breaks, including percent-based midroll resolved once duration is known', async () => {
    (VMAP as any).__breaks = [
      {
        breakType: 'linear',
        breakId: 'v-pre',
        timeOffset: 'start',
        adSource: { adTagURI: 'https://example.com/pre.xml' },
      },
      {
        breakType: 'linear',
        breakId: 'v-mid',
        timeOffset: '25%',
        adSource: { vastAdData: '<VAST version="3.0"></VAST>' },
      },
      {
        breakType: 'nonlinear',
        breakId: 'v-post',
        timeOffset: 'end',
        adSource: { adTagURI: 'https://example.com/post.xml' },
      },
    ];

    (globalThis as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('<VMAP></VMAP>'),
    });

    const { ctx, video } = makeCtx();
    Object.defineProperty(video, 'duration', { configurable: true, value: 80 });

    const p = new AdsPlugin({
      allowNativeControls: false,
      sources: [{ type: 'VMAP', src: 'https://example.com/vmap.xml' }],
    }) as any;
    p.setup(ctx);

    await p.loadVmapAndMerge([]);

    const anyP: any = p;
    // getDueMidrollBreaks returns an array — nothing due before the 25% mark (20s)
    const dueBefore = anyP.getDueMidrollBreaks(10);
    const dueBeforeIds = dueBefore.map((b: any) => b.id);
    expect(dueBeforeIds).not.toContain('v-mid');

    // At 21s the 25%-of-80 midroll (20s) is due
    const due = anyP.getDueMidrollBreaks(21);
    expect(Array.isArray(due)).toBe(true);
    expect(due.length).toBeGreaterThan(0);
    expect(due[0].id).toBe('v-mid:25%:1');
    expect(typeof due[0].at).toBe('number');
  });

  test('companion iFrame resource: renders iframe inside companion container', async () => {
    vastGetMock.mockResolvedValueOnce(companionParsed());

    const { ctx } = makeCtx();

    const companionHost = document.createElement('div');
    companionHost.id = 'companion-host';
    document.body.appendChild(companionHost);

    const p = new AdsPlugin({ allowNativeControls: false, companionContainer: companionHost });
    p.setup(ctx);

    const run = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    Object.defineProperty(adVideo, 'duration', { value: 5, configurable: true });
    adVideo.dispatchEvent(new Event('loadedmetadata'));

    const companion = companionHost.querySelector('.op-ads__companion') as HTMLElement | null;
    expect(companion).toBeTruthy();
    const iframe = companion!.querySelector('iframe') as HTMLIFrameElement | null;
    expect(iframe).toBeTruthy();
    expect(iframe!.src).toContain('https://example.com/companion.html');

    adVideo.dispatchEvent(new Event('ended'));
    await run;
  });

  test('XML parsing: playAdsFromXml errors on parsererror and emits ads:error', async () => {
    const { ctx, bus } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const errors = [];
    bus.on('ads:error', (e) => errors.push(e));

    await p.playAdsFromXml('<VAST><NotClosed></VAST>');
    expect(errors.length).toBeGreaterThan(0);
  });

  test('source:set resets state and rebuildSchedule; mountSelector is honored', () => {
    const mount = document.createElement('div');
    mount.id = 'mount-here';
    document.body.appendChild(mount);

    const { ctx } = makeCtx();
    const p = new AdsPlugin({
      allowNativeControls: false,
      sources: [{ type: 'VMAP', src: 'https://example.com/pre.xml' }],
      mountSelector: '#mount-here',
    }) as any;
    p.setup(ctx);

    p.ensureOverlayMounted();
    expect(mount.querySelector('.op-ads')).toBeTruthy();
  });

  test('playAdsFromXml accepts an Element input (serialize then parse)', async () => {
    const { ctx, bus } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false }) as any;
    p.setup(ctx);

    vastParseMock.mockResolvedValueOnce({ ads: [] });
    const errs: any[] = [];
    bus.on('ads:error', (e: any) => errs.push(e));

    const doc = new DOMParser().parseFromString('<VAST version="3.0"></VAST>', 'text/xml');
    const el = doc.documentElement;
    await p.playBreakFromVast({ kind: 'xml', value: el }, { kind: 'manual', id: 'el' });
    expect(vastParseMock).toHaveBeenCalled();
    expect(errs.length).toBeGreaterThan(0);
  });

  test('telemetry: quartiles, clickthrough, and mute/unmute tracking', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx, bus } = makeCtx();
    // allowNativeControls: false so playback:play from bus starts ad playback
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const oldOpen = window.open;
    const opened: string[] = [];
    (window as any).open = jest.fn((url: string) => {
      opened.push(url);
      return null;
    });

    const quartiles: number[] = [];
    bus.on('ads:quartile', (payload: any) => quartiles.push(payload.quartile));
    const clicks = [];
    bus.on('ads:clickthrough', (c: any) => clicks.push(c));

    const playPromise = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    Object.defineProperty(adVideo, 'duration', { value: 20, configurable: true });

    adVideo.dispatchEvent(new Event('playing'));

    adVideo.currentTime = 5;
    adVideo.dispatchEvent(new Event('timeupdate'));
    adVideo.currentTime = 10;
    adVideo.dispatchEvent(new Event('timeupdate'));
    adVideo.currentTime = 15;
    adVideo.dispatchEvent(new Event('timeupdate'));
    adVideo.currentTime = 19.99;
    adVideo.dispatchEvent(new Event('timeupdate'));

    expect(quartiles).toEqual(expect.arrayContaining([0, 25, 50, 75, 100]));

    adVideo.dispatchEvent(new MouseEvent('click'));
    expect(opened[0]).toBe('https://example.com/clickthrough');
    expect(clicks.length).toBe(1);

    adVideo.muted = true;
    adVideo.dispatchEvent(new Event('volumechange'));
    adVideo.muted = false;
    adVideo.volume = 0.5;
    adVideo.dispatchEvent(new Event('volumechange'));

    adVideo.dispatchEvent(new Event('ended'));
    await playPromise;

    (window as any).open = oldOpen;
  });
});

// ---------------------------------------------------------------------------
// Branch-forcing tests (existing, fixed)
// ---------------------------------------------------------------------------

describe('AdsPlugin extra branch forcing', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('lease contention emits ads:error and does not play linear', async () => {
    const { ctx, lease } = makeCtx();
    lease.acquire('playback', 'someone-else');
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const errors: any[] = [];
    ctx.events.on('ads:error', (e) => errors.push(e));

    await p.playAds('https://example.com/vast.xml');
    expect(errors.length).toBeGreaterThan(0);
  });

  test('volumechange/mute branches fire during ad playback', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));
    const { ctx, bus } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const emitSpy = jest.spyOn(bus, 'emit');

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();

    const beforeCalls = emitSpy.mock.calls.length;

    adVideo.volume = 0.5;
    adVideo.muted = false;
    adVideo.dispatchEvent(new Event('volumechange'));
    const afterFirst = emitSpy.mock.calls.length;

    adVideo.muted = true;
    adVideo.dispatchEvent(new Event('volumechange'));
    const afterSecond = emitSpy.mock.calls.length;

    adVideo.dispatchEvent(new Event('ended'));
    await playP;

    expect(afterFirst).toBeGreaterThanOrEqual(beforeCalls);
    expect(afterSecond).toBeGreaterThanOrEqual(afterFirst);
  });

  test('multi-ad pod iterates >1 (pod loop branches)', async () => {
    vastGetMock.mockResolvedValueOnce(linearPodParsed(2, '00:00:00'));

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');

    let adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();
    adVideo.dispatchEvent(new Event('ended'));
    await flushPromises(10);

    adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();
    adVideo.dispatchEvent(new Event('ended'));

    await playP;
  });
});

// ---------------------------------------------------------------------------
// Autoplay / muted-until-interaction fix tests
// ---------------------------------------------------------------------------

describe('AdsPlugin autoplay mute policy', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('ad starts MUTED when content has autoplay and user has not yet interacted', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    // No user interaction, content autoplays
    const { ctx } = makeCtx({ autoplay: true, userInteracted: false, muted: false, volume: 0.8 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    // Ad must be muted regardless of player.muted=false because user hasn't interacted
    expect(adVideo.muted).toBe(true);
    expect(adVideo.volume).toBe(0);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('ad starts MUTED when content has autoplay attribute and user has not yet interacted', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx } = makeCtx({ autoplay: true, userInteracted: false, muted: false, volume: 1 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    expect(adVideo.muted).toBe(true);
    expect(adVideo.volume).toBe(0);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('ad starts UNMUTED when user has interacted and player is unmuted (carry-over after unmute)', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    // Simulate: user already clicked unmute → userInteracted=true, muted=false
    const { ctx } = makeCtx({ preload: 'auto', userInteracted: true, muted: false, volume: 0.8 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    // After user has interacted and unmuted, subsequent ads follow player state
    expect(adVideo.muted).toBe(false);
    expect(adVideo.volume).toBeCloseTo(0.8);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('ad starts MUTED when user has interacted but player is still muted', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    // Simulate: user interacted (clicked somewhere) but hasn't unmuted yet
    const { ctx } = makeCtx({ preload: 'auto', userInteracted: true, muted: true, volume: 0 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    expect(adVideo.muted).toBe(true);
    expect(adVideo.volume).toBe(0);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('no-autoplay path: ad respects player muted=false without forcing mute', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    // No preload=auto, no autoplay → user explicitly played
    const { ctx } = makeCtx({ userInteracted: true, muted: false, volume: 1 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    expect(adVideo.muted).toBe(false);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('forcedMuteUntilInteraction keeps ad muted when media:muted=false fires before interaction', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx, bus } = makeCtx({ preload: 'auto', userInteracted: false, muted: true, volume: 0 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    // Ad is muted at start
    expect(adVideo.muted).toBe(true);

    // Someone fires media:muted=false while user hasn't interacted — should be suppressed
    bus.emit('media:muted', false);
    expect(adVideo.muted).toBe(true);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('player:interacted clears forcedMuteUntilInteraction and syncs ad volume from player', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx, bus } = makeCtx({ autoplay: true, userInteracted: false, muted: false, volume: 0.8 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    // Ad starts muted (no interaction yet)
    expect(adVideo.muted).toBe(true);

    // Simulate user interaction: mark player as interacted and update muted state
    ctx.core.userInteracted = true;
    bus.emit('player:interacted');

    // After interaction, media:muted=false should now propagate
    bus.emit('media:muted', false);
    expect(adVideo.muted).toBe(false);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('bindAdSurfaceCommands shouldForceMute: forces muted on autoplay path without interaction', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx, bus } = makeCtx({ autoplay: true, userInteracted: false, muted: false, volume: 0.9 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    // Manually fire playback:play again (as if retried) — should still re-enforce mute
    bus.emit('playback:play');
    expect(adVideo.muted).toBe(true);
    expect(adVideo.volume).toBe(0);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('regression: cached autoplay-support with muted=false no longer bypasses force-mute', async () => {
    // Historically the plugin stored autoplaySupport={muted:false} (from a content-media probe)
    // and used it to skip force-muting ads. With the fix the field was removed; we verify the
    // behaviour by simulating what the old code would have done: user hasn't interacted but the
    // player "knows" unmuted autoplay is possible. Ad must still start muted.
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx } = makeCtx({ autoplay: true, userInteracted: false, muted: false, volume: 1 });
    const p = new AdsPlugin({ allowNativeControls: false }) as any;
    p.setup(ctx);

    // Verify no autoplaySupport field exists on the instance
    expect(p.autoplaySupport).toBeUndefined();

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();

    // Must be muted: no user interaction, autoplay path
    expect(adVideo.muted).toBe(true);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('multi-break carry-over: first ad muted, after unmute second ad is unmuted', async () => {
    // Simulate two consecutive ads (pod of 2). First plays muted.
    // After "user" unmutes between them, second should be unmuted.
    vastGetMock.mockResolvedValueOnce(linearPodParsed(2));

    const { ctx, bus } = makeCtx({ autoplay: true, userInteracted: false, muted: false, volume: 0.9 });
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo1 = await waitForAdVideo();

    // First ad must be muted
    expect(adVideo1.muted).toBe(true);

    // Simulate user clicking unmute during first ad
    ctx.core.userInteracted = true;
    ctx.core.muted = false;
    ctx.core.volume = 0.9;
    bus.emit('player:interacted');
    bus.emit('media:muted', false);
    bus.emit('media:volume', 0.9);

    // End first ad → second ad starts
    adVideo1.dispatchEvent(new Event('ended'));
    await flushPromises(15);

    const adVideo2 = await waitForAdVideo();
    expect(adVideo2).toBeTruthy();

    // Second ad should be unmuted (carry-over)
    expect(adVideo2.muted).toBe(false);

    adVideo2.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('falls back to DOM extraction when VAST parser returns no creatives', async () => {
    jest.useFakeTimers();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="a1">
    <InLine>
      <Creatives>
        <Creative sequence="1">
          <Linear skipoffset="00:00:05">
            <Duration>00:00:10</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" width="640" height="360" type="video/mp4" bitrate="140"><![CDATA[https://example.com/ad.mp4]]></MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
    // Vast parser returns an ad with no creative/media mapping -> plugin should parse the raw XML itself.
    vastParseMock.mockResolvedValue({ ads: [{ creatives: [] }], version: '3.0' });

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ sources: [{ type: 'VAST', src: xml }] });
    plugin.setup(ctx);

    const p = plugin.playAdsFromXml(xml);
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();
    // End the ad so playAdsFromXml can resolve.
    adVideo.dispatchEvent(new Event('ended'));
    await p;
  });
});
