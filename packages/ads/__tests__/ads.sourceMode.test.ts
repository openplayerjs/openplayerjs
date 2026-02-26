/** @jest-environment jsdom */

/**
 * Tests for:
 *  1. source:set handler — resets active/lease/overlay so ads play after source switching
 *  2. adSourcesMode: 'waterfall' — tries sources in order, plays first valid one
 *  3. adSourcesMode: 'playlist'  — plays each source's ads as a separate preroll break
 */

import type { Lease, Player, PluginContext } from '@openplayer/core';
import { DisposableStore, EventBus, StateManager } from '@openplayer/core';
import { AdsPlugin } from '../src/ads';
import { vastGetMock, vastParseMock } from './mocks/vast-client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLeases() {
  const owners = new Map<string, string>();

  const acquire = jest.fn<boolean, [string, string]>((cap, who) => {
    if (owners.has(cap)) return false;
    owners.set(cap, who);
    return true;
  }) as unknown as jest.MockedFunction<(cap: string, who: string) => boolean>;

  const release = jest.fn<void, [string, string]>((cap, who) => {
    if (owners.get(cap) === who) owners.delete(cap);
  }) as unknown as jest.MockedFunction<(cap: string, who: string) => void>;

  const owner = jest.fn<string | undefined, [string]>((cap) => owners.get(cap)) as unknown as jest.MockedFunction<
    (cap: string) => string | undefined
  >;

  return { leases: { acquire, release, owner } as unknown as Lease, acquire, release, owner };
}

function makeCtx(video?: HTMLVideoElement) {
  const bus = new EventBus();
  const media = video ?? document.createElement('video');
  const dispose = new DisposableStore();
  const lease = makeLeases();

  bus.on('cmd:pause', () => media.pause());
  bus.on('cmd:play', () => void media.play());

  const ctx: PluginContext = {
    player: { media } as unknown as Player,
    events: bus as any,
    state: new StateManager('playing'),
    leases: lease.leases,
    dispose,
    add: (d) => dispose.add(d as any),
    on: (event: any, cb: any) => dispose.add(bus.on(event, cb)),
    listen: (target: any, type: any, handler: any, options?: any) =>
      dispose.addEventListener(target, type, handler, options),
  };

  return { ctx, bus, media, lease };
}

function linearParsed() {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            linear: {
              mediaFiles: [
                { type: 'video/mp4', fileURL: 'https://example.com/ad.mp4', bitrate: 500, width: 640, height: 360 },
              ],
            },
          },
        ],
      },
    ],
  };
}

/** Polls for the ad video element, flushing microtasks each iteration. */
async function waitForAdVideo(tries = 60): Promise<HTMLVideoElement | null> {
  for (let i = 0; i < tries; i++) {
    const el = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (el) return el;
    await Promise.resolve();
  }
  return null;
}

// ---------------------------------------------------------------------------
// 1. source:set handler reset
// ---------------------------------------------------------------------------

describe('AdsPlugin – source:set resets ad state', () => {
  beforeEach(() => {
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('active flag is false after source:set, allowing preroll on next play', async () => {
    vastGetMock.mockResolvedValue(linearParsed());

    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({
      sources: [{ type: 'VAST', src: 'https://ad.example.com/vast1' }],
    });
    plugin.setup(ctx);

    // Force-set active=true (simulates an ad mid-play when source switch happens)
    (plugin as any).active = true;
    (plugin as any).ctx.leases.acquire('playback', 'ads');

    // Trigger source switch
    bus.emit('source:set' as any);
    await Promise.resolve();

    expect((plugin as any).active).toBe(false);
    // Lease should have been released
    expect((plugin as any).ctx.leases.owner('playback')).toBeUndefined();
  });

  test('overlay is hidden after source:set', async () => {
    vastGetMock.mockResolvedValue(linearParsed());

    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({
      sources: [{ type: 'VAST', src: 'https://ad.example.com/vast1' }],
    });
    plugin.setup(ctx);

    // Manually show overlay (simulates mid-ad state)
    (plugin as any).overlay.style.display = 'block';

    bus.emit('source:set' as any);
    await Promise.resolve();

    expect((plugin as any).overlay.style.display).toBe('none');
  });

  test('shouldInterceptPreroll returns true after source:set when active was stuck true', async () => {
    vastGetMock.mockResolvedValue(linearParsed());

    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({
      sources: [{ type: 'VAST', src: 'https://ad.example.com/vast1' }],
    });
    plugin.setup(ctx);

    // Simulate: ad was playing, active is stuck
    (plugin as any).active = true;

    bus.emit('source:set' as any);
    await Promise.resolve();

    // shouldInterceptPreroll should now return true (not blocked by active)
    expect((plugin as any).shouldInterceptPreroll()).toBe(true);
  });

  test('playedBreaks cleared after source:set so preroll can replay', async () => {
    vastGetMock.mockResolvedValue(linearParsed());

    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({
      sources: [{ type: 'VAST', src: 'https://ad.example.com/vast1' }],
    });
    plugin.setup(ctx);

    // Simulate a completed preroll in playedBreaks
    (plugin as any).playedBreaks.add('preroll:VAST:https://ad.example.com/vast1');

    bus.emit('source:set' as any);
    await Promise.resolve();

    expect((plugin as any).playedBreaks.size).toBe(0);
    expect((plugin as any).shouldInterceptPreroll()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Waterfall mode
// ---------------------------------------------------------------------------

describe('AdsPlugin – adSourcesMode: waterfall', () => {
  beforeEach(() => {
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('plays ads from the first source when it returns valid ads', async () => {
    vastGetMock.mockResolvedValue(linearParsed());

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      adSourcesMode: 'waterfall',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    // Trigger preroll and wait for ad video to appear
    (ctx.events as any).emit('cmd:play');
    const adVideo = await waitForAdVideo();

    // First source should have been called
    expect(vastGetMock).toHaveBeenCalledWith('https://ad1.example.com/vast');
    // Ad video should be mounted
    expect(adVideo).not.toBeNull();

    // Second source should NOT have been called (first succeeded)
    expect(vastGetMock).not.toHaveBeenCalledWith('https://ad2.example.com/vast');
  });

  test('falls back to second source when first returns no ads', async () => {
    // Source 1 returns empty (no ads), source 2 returns valid ads
    vastGetMock
      .mockResolvedValueOnce({ ads: [] }) // source 1: empty
      .mockResolvedValueOnce(linearParsed()); // source 2: valid

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      adSourcesMode: 'waterfall',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    (ctx.events as any).emit('cmd:play');
    const adVideo = await waitForAdVideo();

    // Both sources tried
    expect(vastGetMock).toHaveBeenCalledWith('https://ad1.example.com/vast');
    expect(vastGetMock).toHaveBeenCalledWith('https://ad2.example.com/vast');

    // Ad video from second source should be mounted
    expect(adVideo).not.toBeNull();
  });

  test('falls back through all sources and gracefully handles all-empty responses', async () => {
    vastGetMock.mockResolvedValue({ ads: [] }); // all sources return empty

    const { ctx, bus } = makeCtx();
    const events: string[] = [];
    bus.on('ads:error' as any, () => events.push('ads:error'));

    const plugin = new AdsPlugin({
      adSourcesMode: 'waterfall',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
        { type: 'VAST', src: 'https://ad3.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    (ctx.events as any).emit('cmd:play');
    // Flush all promises for 3 sources
    for (let i = 0; i < 10; i++) await Promise.resolve();

    expect(vastGetMock).toHaveBeenCalledWith('https://ad1.example.com/vast');
    expect(vastGetMock).toHaveBeenCalledWith('https://ad2.example.com/vast');
    expect(vastGetMock).toHaveBeenCalledWith('https://ad3.example.com/vast');

    // Plugin should not be in active state after all sources exhausted
    expect((plugin as any).active).toBe(false);
    // No ad video mounted
    expect(document.querySelector('video.op-ads__media')).toBeNull();
  });

  test('waterfall: first source fetch error falls back to second source', async () => {
    vastGetMock
      .mockRejectedValueOnce(new Error('network error')) // source 1: fetch fails
      .mockResolvedValueOnce(linearParsed()); // source 2: valid

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      adSourcesMode: 'waterfall',
      sources: [
        { type: 'VAST', src: 'https://failing.example.com/vast' },
        { type: 'VAST', src: 'https://working.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    (ctx.events as any).emit('cmd:play');
    const adVideo = await waitForAdVideo();

    expect(vastGetMock).toHaveBeenCalledWith('https://failing.example.com/vast');
    expect(vastGetMock).toHaveBeenCalledWith('https://working.example.com/vast');
    expect(adVideo).not.toBeNull();
  });

  test('waterfall with single source uses standard single-source path', async () => {
    vastGetMock.mockResolvedValue(linearParsed());

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      adSourcesMode: 'waterfall',
      sources: [{ type: 'VAST', src: 'https://ad1.example.com/vast' }],
    });
    plugin.setup(ctx);

    // resolvedBreaks should have one break WITHOUT a sources array (single-source path)
    const breaks: any[] = (plugin as any).resolvedBreaks;
    expect(breaks).toHaveLength(1);
    expect(breaks[0].sources).toBeUndefined();
    expect(breaks[0].source.src).toBe('https://ad1.example.com/vast');
  });

  test('waterfall: rebuildSchedule creates one break with all sources', () => {
    const { ctx } = makeCtx();
    vastGetMock.mockResolvedValue({ ads: [] });

    const plugin = new AdsPlugin({
      adSourcesMode: 'waterfall',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    const breaks: any[] = (plugin as any).resolvedBreaks;
    expect(breaks).toHaveLength(1);
    expect(breaks[0].at).toBe('preroll');
    expect(breaks[0].sources).toHaveLength(2);
    expect(breaks[0].sources[0].src).toBe('https://ad1.example.com/vast');
    expect(breaks[0].sources[1].src).toBe('https://ad2.example.com/vast');
  });
});

// ---------------------------------------------------------------------------
// 3. Playlist mode
// ---------------------------------------------------------------------------

describe('AdsPlugin – adSourcesMode: playlist', () => {
  beforeEach(() => {
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('rebuildSchedule creates one break per source', () => {
    const { ctx } = makeCtx();
    vastGetMock.mockResolvedValue({ ads: [] });

    const plugin = new AdsPlugin({
      adSourcesMode: 'playlist',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
        { type: 'VAST', src: 'https://ad3.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    const breaks: any[] = (plugin as any).resolvedBreaks;
    expect(breaks).toHaveLength(3);
    expect(breaks[0].source.src).toBe('https://ad1.example.com/vast');
    expect(breaks[1].source.src).toBe('https://ad2.example.com/vast');
    expect(breaks[2].source.src).toBe('https://ad3.example.com/vast');
    // Each break is independent (no waterfall sources array)
    for (const b of breaks) {
      expect(b.sources).toBeUndefined();
      expect(b.at).toBe('preroll');
    }
  });

  test('each break has a unique ID so they can all be played', () => {
    const { ctx } = makeCtx();
    vastGetMock.mockResolvedValue({ ads: [] });

    const plugin = new AdsPlugin({
      adSourcesMode: 'playlist',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    const breaks: any[] = (plugin as any).resolvedBreaks;
    const id0 = (plugin as any).getBreakId(breaks[0]);
    const id1 = (plugin as any).getBreakId(breaks[1]);
    expect(id0).not.toBe(id1);
  });

  test('playlist: getPrerollBreak advances to next source after first is played', async () => {
    vastGetMock.mockResolvedValue(linearParsed());

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      adSourcesMode: 'playlist',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    // Initially: first preroll break is available
    const first = (plugin as any).getPrerollBreak();
    expect(first?.source?.src).toBe('https://ad1.example.com/vast');

    // Mark first as played
    const firstId = (plugin as any).getBreakId(first);
    (plugin as any).playedBreaks.add(firstId);

    // Now: second preroll break should be returned
    const second = (plugin as any).getPrerollBreak();
    expect(second?.source?.src).toBe('https://ad2.example.com/vast');
  });

  test('playlist: VMAP sources are excluded from playlist breaks', () => {
    const { ctx } = makeCtx();
    vastGetMock.mockResolvedValue({ ads: [] });

    const plugin = new AdsPlugin({
      adSourcesMode: 'playlist',
      sources: [
        { type: 'VAST', src: 'https://ad1.example.com/vast' },
        { type: 'VMAP', src: 'https://vmap.example.com/vmap' },
        { type: 'VAST', src: 'https://ad2.example.com/vast' },
      ],
    });
    plugin.setup(ctx);

    // VMAP is handled separately; only VAST sources become playlist breaks
    const breaks: any[] = (plugin as any).resolvedBreaks;
    const vastBreaks = breaks.filter((b: any) => b.source?.type !== 'VMAP');
    expect(vastBreaks).toHaveLength(2);
  });
});
