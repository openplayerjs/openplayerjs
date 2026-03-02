/** @jest-environment jsdom */

import type { Core } from '@openplayer/core';
import { EventBus, Lease, StateManager } from '@openplayer/core';
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

    constructor(_cfg: any) {
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

function makeCtx(opts: { autoplay?: boolean; preload?: '' | 'none' | 'metadata' | 'auto'; leaseOwner?: string } = {}) {
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

  return {
    media,
    events,
    config: {},
    activeSource: { src: 'https://example.com/stream.m3u8', type: 'application/x-mpegURL' },
    core,
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
    const ctx = makeCtx({ autoplay: false, preload: 'none' });
    engine.attach(ctx);
    const adapter = (engine as any).adapter as any;

    // first cmd:startLoad should start loading
    ctx.events.emit('cmd:startLoad');
    expect(adapter.startLoad).toHaveBeenCalledTimes(1);

    // second emission is a no-op (startedLoad guard)
    ctx.events.emit('cmd:startLoad');
    expect(adapter.startLoad).toHaveBeenCalledTimes(1);
  });

  test('cmd:startLoad is a no-op when autoStartLoad is true (preload != none)', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx({ autoplay: false, preload: 'metadata' });
    engine.attach(ctx);
    const adapter = (engine as any).adapter as any;

    ctx.events.emit('cmd:startLoad');
    expect(adapter.startLoad).not.toHaveBeenCalled();
  });

  test('media play event forces pause when lease is owned by another surface', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx({ autoplay: false, preload: 'metadata', leaseOwner: 'ads' });
    engine.attach(ctx);

    ctx.media.dispatchEvent(new Event('play'));
    expect((ctx.media.pause as any).mock.calls.length).toBeGreaterThan(0);
  });

  test('media pause event stops load and resets startedLoad so next cmd:startLoad works', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx({ autoplay: false, preload: 'none' });
    engine.attach(ctx);
    const adapter = (engine as any).adapter as any;

    // start loading
    ctx.events.emit('cmd:startLoad');
    expect(adapter.startLoad).toHaveBeenCalledTimes(1);
    expect((engine as any).startedLoad).toBe(true);

    // pause resets startedLoad
    ctx.media.dispatchEvent(new Event('pause'));
    expect(adapter.stopLoad).toHaveBeenCalledTimes(1);
    expect((engine as any).startedLoad).toBe(false);

    // cmd:startLoad works again after reset
    ctx.events.emit('cmd:startLoad');
    expect(adapter.startLoad).toHaveBeenCalledTimes(2);
  });

  test('adapter events: MANIFEST_PARSED resolves readiness, media_attached autoplay path, duration events, metadata, texttrack updates', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx({ autoplay: true, preload: 'auto' });
    const seen: string[] = [];
    ctx.events.on('loadedmetadata', () => seen.push('ready'));
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
