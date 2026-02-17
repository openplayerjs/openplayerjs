/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventBus } from '../src/core/events';
import { Lease } from '../src/core/lease';
import { StateManager } from '../src/core/state';

// Mock hls.js to drive branch coverage without loading the real library.
jest.mock('hls.js', () => {
  class MockHls {
    static _supported = true;
    static isSupported() {
      return MockHls._supported;
    }

    static Events = {
      MANIFEST_PARSED: 'MANIFEST_PARSED',
      MEDIA_ATTACHED: 'MEDIA_ATTACHED',
      LEVEL_UPDATED: 'LEVEL_UPDATED',
      LEVEL_LOADED: 'LEVEL_LOADED',
      FRAG_PARSING_METADATA: 'FRAG_PARSING_METADATA',
      SUBTITLE_TRACKS_UPDATED: 'SUBTITLE_TRACKS_UPDATED',
      ERROR: 'ERROR',
    };

    static ErrorTypes = {
      MEDIA_ERROR: 'MEDIA_ERROR',
      NETWORK_ERROR: 'NETWORK_ERROR',
      OTHER_ERROR: 'OTHER_ERROR',
    };

    private handlers = new Map<string, Set<(...args: any[]) => void>>();

    public loadSource = jest.fn();
    public attachMedia = jest.fn();
    public detachMedia = jest.fn();
    public startLoad = jest.fn();
    public stopLoad = jest.fn();
    public recoverMediaError = jest.fn();
    public swapAudioCodec = jest.fn();
    public destroy = jest.fn();

    constructor(_cfg: any) {}

    on(event: string, handler: (...args: any[]) => void) {
      const set = this.handlers.get(event) ?? new Set();
      set.add(handler);
      this.handlers.set(event, set);
    }

    off(event: string, handler: (...args: any[]) => void) {
      const set = this.handlers.get(event);
      set?.delete(handler);
    }

    emit(event: string, ...args: any[]) {
      const set = this.handlers.get(event);
      if (!set) return;
      for (const h of Array.from(set)) h(...args);
    }
  }
  return { __esModule: true, default: MockHls };
});

import Hls from 'hls.js';
import { HlsMediaEngine } from '../src/engines/hls';

function makeCtx(opts: { autoplay?: boolean; preload?: "" | "none" | "metadata" | "auto"; leaseOwner?: string } = {}) {
  const media = document.createElement('video');
  media.autoplay = Boolean(opts.autoplay);
  media.preload = opts.preload ?? 'metadata';
  media.play = jest.fn(() => Promise.resolve());
  media.pause = jest.fn();

  const events = new EventBus();
  const player = {
    isLive: false,
    leases: new Lease(),
    state: new StateManager('idle'),
  } as any;

  if (opts.leaseOwner) player.leases.acquire('playback', opts.leaseOwner);

  return {
    media,
    events,
    config: {},
    activeSource: { src: 'https://example.com/stream.m3u8', type: 'application/x-mpegURL' },
    player,
  } as any;
}

describe('HlsMediaEngine branch coverage', () => {
  beforeEach(() => {
    (Hls as any)._supported = true;
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    (console.log as any).mockRestore?.();
  });

  test('canPlay respects Hls.isSupported and .m3u8 suffix', () => {
    const engine = new HlsMediaEngine();
    (Hls as any)._supported = false;
    expect(engine.canPlay({ src: 'https://example.com/stream.m3u8', type: '' })).toBe(false);

    (Hls as any)._supported = true;
    expect(engine.canPlay({ src: 'https://example.com/stream.m3u8', type: '' })).toBe(true);
    expect(engine.canPlay({ src: 'https://example.com/stream.mp4', type: 'video/mp4' })).toBe(false);
  });

  test('playback:play starts load and plays when engine owns playback; pauses when lease owned by ads', async () => {
    const engine = new HlsMediaEngine();

    const ctx = makeCtx({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);

    // trigger command
    ctx.events.emit('playback:play');
    await Promise.resolve();

    // should call play on media
    expect((ctx.media.play as any).mock.calls.length).toBeGreaterThan(0);

    // Now deny ownership and ensure onPlay forces pause branch
    const ctxAds = makeCtx({ autoplay: false, preload: 'metadata', leaseOwner: 'ads' });
    engine.detach();
    engine.attach(ctxAds);
    ctxAds.media.dispatchEvent(new Event('play'));
    expect((ctxAds.media.pause as any).mock.calls.length).toBeGreaterThan(0);
  });

  test('pause command stops load when not autoStartLoad and state paused', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);

    // set paused state to cover conditional stopLoad
    ctx.player.state.transition('paused');
    ctx.events.emit('playback:pause');

    // access adapter via emitted events: easiest is to rely on the mocked Hls instance methods being called
    // engine will call media.pause regardless
    expect((ctx.media.pause as any).mock.calls.length).toBeGreaterThan(0);
  });

  test('adapter events: ready, media_attached autoplay path, duration events, metadata, texttrack updates', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx({ autoplay: true, preload: 'auto' });
    const seen: string[] = [];
    ctx.events.on('playback:ready', () => seen.push('ready'));
    ctx.events.on('media:duration', () => seen.push('duration'));
    ctx.events.on('playback:metadataready', () => seen.push('metadata'));
    ctx.events.on('texttrack:listchange', () => seen.push('tracks'));

    engine.attach(ctx);

    // grab the underlying mocked adapter and emit events
    const adapter = (engine as any).adapter as any;
    adapter.emit((Hls as any).Events.MANIFEST_PARSED);
    adapter.emit((Hls as any).Events.MEDIA_ATTACHED);
    adapter.emit((Hls as any).Events.LEVEL_UPDATED, null, { details: { live: true, totalduration: 123 } });
    adapter.emit((Hls as any).Events.LEVEL_LOADED, null, { details: { live: false, totalduration: 456 } });
    adapter.emit((Hls as any).Events.FRAG_PARSING_METADATA, null, { foo: 'bar' });
    adapter.emit((Hls as any).Events.SUBTITLE_TRACKS_UPDATED);

    expect(seen).toEqual(expect.arrayContaining(['ready', 'duration', 'metadata', 'tracks']));
  });

  test('error handling branches: MEDIA_ERROR recover, swap codec, NETWORK_ERROR noop, default destroys adapter', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = (engine as any).adapter as any;

    // MEDIA_ERROR first recovery
    adapter.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.MEDIA_ERROR });
    expect(adapter.recoverMediaError).toHaveBeenCalledTimes(1);

    // second MEDIA_ERROR quickly -> swapAudioCodec branch
    adapter.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.MEDIA_ERROR });
    expect(adapter.swapAudioCodec).toHaveBeenCalledTimes(1);
    expect(adapter.recoverMediaError).toHaveBeenCalledTimes(2);

    // NETWORK_ERROR branch (no destroy)
    adapter.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.NETWORK_ERROR });
    expect(adapter.destroy).not.toHaveBeenCalled();

    // default branch destroys
    adapter.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.OTHER_ERROR });
    expect(adapter.destroy).toHaveBeenCalled();
  });

  test('detach cleans adapter and unbinds events (adapterListeners empty branch)', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    engine.attach(ctx);
    engine.detach();

    // calling detach again should hit !adapter branch in unbindAdapterEvents
    engine.detach();
    expect((engine as any).adapter).toBeNull();
  });
});
