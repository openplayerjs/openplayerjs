/** @jest-environment jsdom */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { trackerCtorMock, vastGetMock, vastParseMock } from './mocks/vast-client';

async function waitForAdVideo(): Promise<HTMLVideoElement> {
  // In some environments the ad surface is mounted after a few promise turns.
  // We also tick 0ms timers in case the implementation uses setTimeout(0).
  for (let i = 0; i < 60; i++) {
    const el = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (el) return el;
    await Promise.resolve();
    try {
      jest.advanceTimersByTime?.(0);
    } catch {
      // ignore if fake timers are not enabled
    }
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
  const dispose = new DisposableStore();

  // Simulate player reacting to playback bus events.
  bus.on('cmd:pause', () => (video as any).pause());
  bus.on('cmd:play', () => void (video as any).play());

  const lease = makeLeases();

  const ctx: PluginContext = {
    core: { media: video } as unknown as Core,
    events: bus as any,
    state: new StateManager('playing'),
    leases: lease.leases,

    dispose,
    add: (d) => dispose.add(d as any),
    on: (event: any, cb: any) => dispose.add(bus.on(event, cb)),
    listen: (target: any, type: any, handler: any, options?: any) =>
      dispose.addEventListener(target, type, handler, options),
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
    // Flush enough microtasks for: loadRawDocForNonLinear + vastClient.get() + pauseAndAcquireLease
    for (let i = 0; i < 5; i++) await Promise.resolve();

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
    // Flush enough microtasks for: loadRawDocForNonLinear + vastClient.get() + playNonLinearOnlyBreak DOM render
    for (let i = 0; i < 5; i++) await Promise.resolve();

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

    // Companions must render outside the player.
    const companionHost = document.createElement('div');
    companionHost.id = 'companion-host';
    document.body.appendChild(companionHost);

    const p = new AdsPlugin({ allowNativeControls: false, companionContainer: companionHost });
    p.setup(ctx);

    const run = p.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForAdVideo();
    Object.defineProperty(adVideo, 'duration', { value: 5, configurable: true });
    adVideo.dispatchEvent(new Event('loadedmetadata'));

    const companion = companionHost.querySelector('.op-ads__companion') as HTMLElement | null;
    expect(companion).toBeTruthy();
    expect(companion?.querySelector('img')).toBeTruthy();

    expect(document.querySelector('.op-ads__nonlinear')).toBeTruthy();
    expect(document.getElementById('nl-inline')).toBeTruthy();

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
