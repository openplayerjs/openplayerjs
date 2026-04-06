/** @jest-environment jsdom */

import type { Core } from '@openplayerjs/core';
import { EventBus, HtmlMediaSurface, Lease, StateManager } from '@openplayerjs/core';
import type { HlsConfig } from 'hls.js';
import Hls from 'hls.js';
import { HlsMediaEngine } from '../src/hls';

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

    loadSource = jest.fn();
    attachMedia = jest.fn();
    detachMedia = jest.fn();
    startLoad = jest.fn();
    stopLoad = jest.fn();
    recoverMediaError = jest.fn();
    swapAudioCodec = jest.fn();
    destroy = jest.fn();

    constructor(_cfg: HlsConfig) {
      //
    }

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

function createTestMediaEngineContext(
  opts: { autoplay?: boolean; preload?: '' | 'none' | 'metadata' | 'auto'; leaseOwner?: string } = {}
) {
  const media = document.createElement('video');
  media.autoplay = Boolean(opts.autoplay);
  media.preload = opts.preload ?? 'metadata';
  media.play = jest.fn(() => Promise.resolve());
  media.pause = jest.fn();

  const events = new EventBus();
  const core = {
    isLive: false,
    leases: new Lease(),
    state: new StateManager('idle'),
  } as Core;

  if (opts.leaseOwner) core.leases.acquire('playback', opts.leaseOwner);

  const surface = new HtmlMediaSurface(media);
  return {
    media,
    container: media.parentElement ?? media,
    events,
    config: {},
    activeSource: { src: 'https://example.com/stream.m3u8', type: 'application/x-mpegURL' },
    core,
    surface,
    setSurface(s: any) {
      return s;
    },
    resetSurface() {
      return surface;
    },
  };
}

describe('HlsMediaEngine branch coverage', () => {
  beforeEach(() => {
    (Hls as any)._supported = true;
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  test('canPlay respects Hls.isSupported and .m3u8 suffix', () => {
    const engine = new HlsMediaEngine();
    (Hls as any)._supported = false;
    expect(engine.canPlay({ src: 'https://example.com/stream.m3u8', type: '' })).toBe(false);

    (Hls as any)._supported = true;
    expect(engine.canPlay({ src: 'https://example.com/stream.m3u8', type: '' })).toBe(true);
    expect(engine.canPlay({ src: 'https://example.com/stream.mp4', type: 'video/mp4' })).toBe(false);
  });

  test('cmd:startLoad triggers startLoad for preload=none and is idempotent', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'none' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    // first cmd:startLoad should start loading
    ctx.events.emit('cmd:startLoad');
    expect(adapter!.startLoad).toHaveBeenCalledTimes(1);

    // second emission is a no-op (startedLoad guard)
    ctx.events.emit('cmd:startLoad');
    expect(adapter!.startLoad).toHaveBeenCalledTimes(1);
  });

  test('cmd:startLoad is a no-op when autoStartLoad is true (preload != none)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    ctx.events.emit('cmd:startLoad');
    expect(adapter!.startLoad).not.toHaveBeenCalled();
  });

  test('media play event forces pause when lease is owned by another surface', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata', leaseOwner: 'ads' });
    engine.attach(ctx);

    ctx.media.dispatchEvent(new Event('play'));
    expect((ctx.media.pause as any).mock.calls.length).toBeGreaterThan(0);
  });

  test('media pause event stops load and resets startedLoad so next cmd:startLoad works', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'none' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    // start loading
    ctx.events.emit('cmd:startLoad');
    expect(adapter!.startLoad).toHaveBeenCalledTimes(1);
    expect((engine as any).startedLoad).toBe(true);

    // pause resets startedLoad
    ctx.media.dispatchEvent(new Event('pause'));
    expect(adapter!.stopLoad).toHaveBeenCalledTimes(1);
    expect((engine as any).startedLoad).toBe(false);

    // cmd:startLoad works again after reset
    ctx.events.emit('cmd:startLoad');
    expect(adapter!.startLoad).toHaveBeenCalledTimes(2);
  });

  test('adapter events trigger readiness, autoplay, and metadata updates', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: true, preload: 'auto' });
    const seen: string[] = [];
    ctx.events.on('loadedmetadata', () => seen.push('ready'));
    ctx.events.on('media:duration', () => seen.push('duration'));
    ctx.events.on('playback:metadataready', () => seen.push('metadata'));
    ctx.events.on('texttrack:listchange', () => seen.push('tracks'));

    engine.attach(ctx);

    // grab the underlying mocked adapter and emit events
    const adapter = engine.getAdapter();
    adapter!.emit((Hls as any).Events.MANIFEST_PARSED, null, {});
    adapter!.emit((Hls as any).Events.MEDIA_ATTACHED, null, {});
    adapter!.emit((Hls as any).Events.LEVEL_UPDATED, null, { details: { live: true, totalduration: 123 } });
    adapter!.emit((Hls as any).Events.LEVEL_LOADED, null, { details: { live: false, totalduration: 456 } });
    adapter!.emit((Hls as any).Events.FRAG_PARSING_METADATA, null, { foo: 'bar' });
    adapter!.emit((Hls as any).Events.SUBTITLE_TRACKS_UPDATED, null, {});

    expect(seen).toEqual(expect.arrayContaining(['ready', 'duration', 'metadata', 'tracks']));
  });

  test('handles Hls error recovery and fallback branches', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    // MEDIA_ERROR first recovery
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.MEDIA_ERROR });
    expect(adapter!.recoverMediaError).toHaveBeenCalledTimes(1);

    // second MEDIA_ERROR quickly -> swapAudioCodec branch
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.MEDIA_ERROR });
    expect(adapter!.swapAudioCodec).toHaveBeenCalledTimes(1);
    expect(adapter!.recoverMediaError).toHaveBeenCalledTimes(2);

    // NETWORK_ERROR branch (no destroy)
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.NETWORK_ERROR });
    expect(adapter!.destroy).not.toHaveBeenCalled();

    // default branch destroys
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.OTHER_ERROR });
    expect(adapter!.destroy).toHaveBeenCalled();
  });

  test('detach cleans adapter and unbinds events (adapterListeners empty branch)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext();
    engine.attach(ctx);
    engine.detach();

    // calling detach again should hit !adapter branch in unbindAdapterEvents
    engine.detach();
    expect(engine.getAdapter()).toBeNull();
  });

  // ── canPlay explicit MIME / URL branches ──────────────────────────────────

  test('canPlay – accepts application/x-mpegURL MIME type', () => {
    const engine = new HlsMediaEngine();
    expect(engine.canPlay({ src: 'https://example.com/stream', type: 'application/x-mpegURL' })).toBe(true);
  });

  test('canPlay – accepts application/vnd.apple.mpegurl MIME type', () => {
    const engine = new HlsMediaEngine();
    expect(engine.canPlay({ src: 'https://example.com/stream', type: 'application/vnd.apple.mpegurl' })).toBe(true);
  });

  test('canPlay – rejects non-HLS MIME type (video/mp4)', () => {
    const engine = new HlsMediaEngine();
    expect(engine.canPlay({ src: 'https://example.com/video.mp4', type: 'video/mp4' })).toBe(false);
  });

  test('canPlay – rejects non-.m3u8 URL without MIME type', () => {
    const engine = new HlsMediaEngine();
    expect(engine.canPlay({ src: 'https://example.com/video.mp4', type: '' })).toBe(false);
  });

  test('canPlay – accepts URL with .m3u8 extension and no MIME type', () => {
    const engine = new HlsMediaEngine();
    expect(engine.canPlay({ src: 'https://example.com/stream.m3u8', type: '' })).toBe(true);
  });

  test('canPlay – accepts .m3u8 URL with query string and no MIME type (fallback branch)', () => {
    // The URL constructor will parse this correctly, pathname ends with .m3u8
    const engine = new HlsMediaEngine();
    expect(engine.canPlay({ src: 'https://example.com/stream.m3u8?token=abc', type: '' })).toBe(true);
  });

  // ── ERROR handler: non-fatal errors ──────────────────────────────────────

  test('ERROR handler – data.fatal=false – no recovery action taken, playback:error still emitted', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const errors: any[] = [];
    ctx.events.on('playback:error', (d: any) => errors.push(d));

    // Non-fatal error — should NOT call recoverMediaError or destroy
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: false, type: (Hls as any).ErrorTypes.MEDIA_ERROR });

    expect(adapter!.recoverMediaError).not.toHaveBeenCalled();
    expect(adapter!.destroy).not.toHaveBeenCalled();
    expect(errors).toHaveLength(1);
  });

  // ── ERROR MEDIA_ERROR: recoverSwapAudioCodecDate guard (within 3s) ───────

  test('ERROR MEDIA_ERROR – third error within 3s window – swap codec skipped (recoverSwapAudioCodecDate guard)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    // First fatal MEDIA_ERROR → recoverMediaError (no swap)
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.MEDIA_ERROR });
    expect(adapter!.recoverMediaError).toHaveBeenCalledTimes(1);
    expect(adapter!.swapAudioCodec).toHaveBeenCalledTimes(0);

    // Second fatal MEDIA_ERROR within 3s → swap + recoverMediaError
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.MEDIA_ERROR });
    expect(adapter!.swapAudioCodec).toHaveBeenCalledTimes(1);
    expect(adapter!.recoverMediaError).toHaveBeenCalledTimes(2);

    // Third fatal MEDIA_ERROR within 3s → recoverSwapAudioCodecDate guard fires, no further swap/recover
    adapter!.emit((Hls as any).Events.ERROR, null, { fatal: true, type: (Hls as any).ErrorTypes.MEDIA_ERROR });
    expect(adapter!.swapAudioCodec).toHaveBeenCalledTimes(1); // still 1, no extra swap
    expect(adapter!.recoverMediaError).toHaveBeenCalledTimes(2); // still 2, no extra recover
  });

  // ── MEDIA_ATTACHED: autoplay=false path ──────────────────────────────────

  test('MEDIA_ATTACHED – autoplay=false – play is NOT triggered', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const playCalls: any[] = [];
    ctx.events.on('cmd:play', () => playCalls.push(1));

    adapter!.emit((Hls as any).Events.MEDIA_ATTACHED, null, {});

    // autoplay=false: no play should have been triggered
    expect(ctx.media.play).not.toHaveBeenCalled();
    expect(playCalls).toHaveLength(0);
  });

  test('MEDIA_ATTACHED – autoplay=true but lease owned by another – play is NOT triggered', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: true, preload: 'auto', leaseOwner: 'ads' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    adapter!.emit((Hls as any).Events.MEDIA_ATTACHED, null, {});

    // Lease owned by ads: canHandlePlayback returns false, play should not be called
    expect(ctx.media.play).not.toHaveBeenCalled();
  });

  // ── play event: startedLoad already true (idempotent) ────────────────────

  test('media play event – startedLoad already true – startLoad NOT called again', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'none' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    // First play starts loading
    ctx.media.dispatchEvent(new Event('play'));
    expect(adapter!.startLoad).toHaveBeenCalledTimes(1);
    expect((engine as any).startedLoad).toBe(true);

    // Second play event — startedLoad=true guard fires, no additional startLoad
    ctx.media.dispatchEvent(new Event('play'));
    expect(adapter!.startLoad).toHaveBeenCalledTimes(1);
  });

  // ── play event: autoStartLoad=true – early return, startLoad not called ──

  test('media play event – autoStartLoad=true (preload=metadata) – startLoad NOT called by play handler', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    ctx.media.dispatchEvent(new Event('play'));
    // autoStartLoad=true path returns early — adapter.startLoad not called via play handler
    expect(adapter!.startLoad).not.toHaveBeenCalled();
  });

  // ── pause event: autoStartLoad=true – stopLoad NOT called ────────────────

  test('media pause event – autoStartLoad=true (preload=metadata) – stopLoad NOT called', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    ctx.media.dispatchEvent(new Event('pause'));
    // onPause only acts when !autoStartLoad
    expect(adapter!.stopLoad).not.toHaveBeenCalled();
  });

  // ── getAdapter returns null after detach ──────────────────────────────────

  test('getAdapter returns null after detach', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext();
    engine.attach(ctx);
    engine.detach();
    expect(engine.getAdapter()).toBeNull();
  });

  // ── cmd:startLoad: adapter is null guard ─────────────────────────────────

  test('cmd:startLoad – no-op if adapter is null (before attach)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'none' });
    // Emit cmd:startLoad before attach — engine has no adapter
    // This is exercised via detaching and emitting
    engine.attach(ctx);
    engine.detach();
    // Should not throw even with no adapter
    expect(() => ctx.events.emit('cmd:startLoad')).not.toThrow();
  });

  // ── canPlay: Hls.isSupported=false short-circuits regardless of MIME ─────

  test('canPlay – Hls.isSupported=false – returns false even with valid MIME', () => {
    const engine = new HlsMediaEngine();
    (Hls as any)._supported = false;
    expect(engine.canPlay({ src: 'https://example.com/stream', type: 'application/x-mpegURL' })).toBe(false);
    expect(engine.canPlay({ src: 'https://example.com/stream.m3u8', type: '' })).toBe(false);
  });

  // ── generic event bridge: args.length > 1 path ────────────────────────────

  test('generic adapter event with 2+ args picks args[1] as data (args.length > 1 branch)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const received: any[] = [];
    // SUBTITLE_TRACKS_UPDATED is in MockHls.Events so the generic bridge is set up for it
    ctx.events.on('SUBTITLE_TRACKS_UPDATED' as any, (d: any) => received.push(d));

    // Emit with 2 args (simulating real hls.js convention: eventName + data) → picks args[1]
    (adapter as any).emit('SUBTITLE_TRACKS_UPDATED', 'SUBTITLE_TRACKS_UPDATED', { subtitleTracks: [] });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ subtitleTracks: [] });
  });

  test('generic adapter event with 1 arg picks args[0] as data (args.length <= 1 branch)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const received: any[] = [];
    ctx.events.on('SUBTITLE_TRACKS_UPDATED' as any, (d: any) => received.push(d));

    // Emit with 1 arg → picks args[0]
    (adapter as any).emit('SUBTITLE_TRACKS_UPDATED', { subtitleTracks: [] });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ subtitleTracks: [] });
  });

  // ── LEVEL_UPDATED: onCue callback ─────────────────────────────────────────

  test('LEVEL_UPDATED with onCue registered fires onCue for new SCTE35-OUT date ranges', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const cues: any[] = [];
    engine.onCue = (cue) => cues.push(cue);

    const dateRanges = {
      'scte-1': {
        attr: { 'SCTE35-OUT': '0xFC302F' },
        plannedDuration: 30,
        startDate: new Date('2025-01-01T00:00:00Z'),
      },
    };

    adapter!.emit((Hls as any).Events.LEVEL_UPDATED, null, {
      details: { live: false, totalduration: 0, dateRanges },
    });

    expect(cues).toHaveLength(1);
    expect(cues[0].scte35Out).toBe('0xFC302F');
    expect(cues[0].id).toBe('scte-1');
  });

  test('LEVEL_UPDATED: same id seen twice is deduplicated (seenCueIds guard)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const cues: any[] = [];
    engine.onCue = (cue) => cues.push(cue);

    const dateRanges = {
      'scte-dup': {
        attr: { 'SCTE35-OUT': '0xFC302F' },
        plannedDuration: 15,
        startDate: new Date(),
      },
    };

    adapter!.emit((Hls as any).Events.LEVEL_UPDATED, null, { details: { live: false, totalduration: 0, dateRanges } });
    adapter!.emit((Hls as any).Events.LEVEL_UPDATED, null, { details: { live: false, totalduration: 0, dateRanges } });

    // Second emission should be deduped
    expect(cues).toHaveLength(1);
  });

  test('LEVEL_UPDATED: range without SCTE35-OUT is skipped', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const cues: any[] = [];
    engine.onCue = (cue) => cues.push(cue);

    const dateRanges = {
      'no-scte': { attr: { 'OTHER-KEY': 'value' }, plannedDuration: 10, startDate: new Date() },
    };

    adapter!.emit((Hls as any).Events.LEVEL_UPDATED, null, { details: { live: false, totalduration: 0, dateRanges } });

    expect(cues).toHaveLength(0);
  });

  test('LEVEL_UPDATED: no onCue registered — no crash', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    // No onCue registered — should be a no-op
    const dateRanges = {
      'scte-no-cue': { attr: { 'SCTE35-OUT': '0xFC302F' }, plannedDuration: 30, startDate: new Date() },
    };
    expect(() =>
      adapter!.emit((Hls as any).Events.LEVEL_UPDATED, null, { details: { live: false, totalduration: 0, dateRanges } })
    ).not.toThrow();
  });

  // ── LEVEL_UPDATED: null/undefined dateRanges ──────────────────────────────

  test('LEVEL_UPDATED with no dateRanges is a no-op (early return)', () => {
    const engine = new HlsMediaEngine();
    const ctx = createTestMediaEngineContext({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = engine.getAdapter();

    const cues: any[] = [];
    engine.onCue = (cue) => cues.push(cue);

    adapter!.emit((Hls as any).Events.LEVEL_UPDATED, null, { details: { live: false, totalduration: 0 } });

    expect(cues).toHaveLength(0);
  });
});
