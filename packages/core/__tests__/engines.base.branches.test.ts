/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { Lease } from '../src/core/lease';
import type { MediaEngineContext, MediaSource } from '../src/core/media';
import { StateManager } from '../src/core/state';
import { HtmlMediaSurface } from '../src/core/surface';
import { BaseMediaEngine } from '../src/engines/base';

class TestEngine extends BaseMediaEngine {
  name = 'test-engine';
  version = '0.0.0';
  capabilities = ['media-engine'];
  priority = 1;
  canPlay(_source: MediaSource): boolean {
    return true;
  }
  attach(_ctx: MediaEngineContext): void {
    // no-op
  }
  detach(): void {
    // no-op
  }

  exposeBindCommands(ctx: MediaEngineContext) {
    this.bindCommands(ctx);
  }
  exposeBindPlayPauseCommands(ctx: MediaEngineContext) {
    this.bindPlayPauseCommands(ctx);
  }
  exposeBindMediaEvents(media: HTMLMediaElement, events: EventBus) {
    this.bindMediaEvents(media, events);
  }
  exposeUnbindMediaEvents() {
    this.unbindMediaEvents();
  }
  exposeUnbindCommands() {
    this.unbindCommands();
  }

  exposeAddMediaListener(media: HTMLMediaElement, event: string, handler: EventListenerOrEventListenerObject) {
    this.addMediaListener(media, event, handler);
  }

  exposeCreateShim(media: HTMLMediaElement) {
    return this.createMediaSurfaceShim(media);
  }
}

function ctx(media: HTMLMediaElement) {
  const surface = new HtmlMediaSurface(media);
  return {
    media,
    container: media.parentElement ?? media,
    events: new EventBus(),
    config: {},
    activeSource: { src: 'https://example.com/a.mp4', type: 'video/mp4' },
    core: {
      leases: new Lease(),
      state: new StateManager('idle'),
    } as any,
    surface,
    setSurface(s: any) {
      return s;
    },
    resetSurface() {
      return surface;
    },
  } as unknown as MediaEngineContext;
}

describe('BaseMediaEngine branch coverage', () => {
  test('bindCommands obeys playback lease owner and handles seek try/catch', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const context = ctx(media);

    // Exercise normal (no owner) path — volume/muted have no lease gate after Option A fix
    engine.exposeBindCommands(context);
    context.events.emit('cmd:setVolume', 0.5);
    context.events.emit('cmd:setMuted', true);
    context.events.emit('cmd:setRate', 1.5);
    expect(media.volume).toBe(0.5);
    expect(media.muted).toBe(true);
    expect(media.playbackRate).toBe(1.5);

    // Force currentTime setter to throw to hit catch branch
    Object.defineProperty(media, 'currentTime', {
      set() {
        throw new Error('nope');
      },
      get() {
        return 0;
      },
      configurable: true,
    });
    context.events.emit('cmd:seek', 10);

    // Now deny ownership: volume/muted still update (no lease gate), rate stays gated
    context.core.leases.acquire('playback', 'someone-else');
    context.events.emit('cmd:setVolume', 0.1);
    context.events.emit('cmd:setMuted', false);
    context.events.emit('cmd:setRate', 0.75);
    // volume and muted update since lease gate removed for them
    expect(media.volume).toBe(0.1);
    expect(media.muted).toBe(false);
    // rate gated — stays at previous value
    expect(media.playbackRate).toBe(1.5);

    engine.exposeUnbindCommands();
  });

  test('bindPlayPauseCommands calls play/pause when engine owns playback', async () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const context = ctx(media);

    const playSpy = jest.fn(() => Promise.resolve());
    const pauseSpy = jest.fn();
    media.play = playSpy;
    media.pause = pauseSpy;

    engine.exposeBindPlayPauseCommands(context);
    context.events.emit('cmd:play');
    // playImpl is async fire-and-forget; flush microtasks
    await Promise.resolve();
    expect(playSpy).toHaveBeenCalled();

    context.events.emit('cmd:pause');
    expect(pauseSpy).toHaveBeenCalled();

    // Ownership denied => early-return branches
    context.core.leases.acquire('playback', 'not-test-engine');
    context.events.emit('cmd:play');
    context.events.emit('cmd:pause');
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(pauseSpy).toHaveBeenCalledTimes(1);

    engine.exposeUnbindCommands();
  });

  test('bind/unbindMediaEvents wires and unwires media -> event bus mapping', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const events = new EventBus();
    const seen: string[] = [];

    events.on('loadedmetadata', () => seen.push('loadedmetadata'));
    events.on('playing', () => seen.push('playing'));
    events.on('pause', () => seen.push('paused'));
    events.on('ended', () => seen.push('ended'));

    engine.exposeBindMediaEvents(media, events);

    media.dispatchEvent(new Event('loadedmetadata'));
    media.dispatchEvent(new Event('playing'));
    media.dispatchEvent(new Event('pause'));
    media.dispatchEvent(new Event('ended'));
    expect(seen).toEqual(expect.arrayContaining(['loadedmetadata', 'playing', 'paused', 'ended']));

    // ensure unbind branch runs
    engine.exposeUnbindMediaEvents();
    const prevLen = seen.length;
    media.dispatchEvent(new Event('ended'));
    expect(seen.length).toBe(prevLen);
  });

  test('addMediaListener registers a DOM listener that is removed by unbindMediaEvents', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const calls: string[] = [];

    engine.exposeAddMediaListener(media, 'play', () => calls.push('play'));

    media.dispatchEvent(new Event('play'));
    expect(calls).toEqual(['play']);

    // unbindMediaEvents cleans up listeners added via addMediaListener
    engine.exposeUnbindMediaEvents();
    media.dispatchEvent(new Event('play'));
    expect(calls).toHaveLength(1); // no new call
  });
});

// ─── createMediaSurfaceShim property accessors ───────────────────────────────

describe('BaseMediaEngine.createMediaSurfaceShim property accessors', () => {
  test('currentTime getter and setter proxy the underlying media element', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    // getter
    Object.defineProperty(media, 'currentTime', {
      configurable: true,
      get: () => 42,
      set: jest.fn(),
    });
    expect(shim.currentTime).toBe(42);

    // setter — verify write reaches the media element
    const setter = jest.fn();
    Object.defineProperty(media, 'currentTime', { configurable: true, get: () => 0, set: setter });
    shim.currentTime = 10;
    expect(setter).toHaveBeenCalledWith(10);
  });

  test('duration getter returns media.duration; setter is a no-op', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    Object.defineProperty(media, 'duration', { configurable: true, get: () => 120 });
    expect(shim.duration).toBe(120);

    // setter must not throw
    expect(() => {
      shim.duration = 999;
    }).not.toThrow();
  });

  test('volume getter and setter proxy the underlying media element', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    media.volume = 0.6;
    expect(shim.volume).toBeCloseTo(0.6);

    shim.volume = 0.3;
    expect(media.volume).toBeCloseTo(0.3);
  });

  test('muted getter and setter proxy the underlying media element', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    media.muted = false;
    expect(shim.muted).toBe(false);

    shim.muted = true;
    expect(media.muted).toBe(true);
  });

  test('playbackRate getter and setter proxy the underlying media element', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    media.playbackRate = 1.5;
    expect(shim.playbackRate).toBe(1.5);

    shim.playbackRate = 2.0;
    expect(media.playbackRate).toBe(2.0);
  });

  test('paused getter proxies media.paused', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    Object.defineProperty(media, 'paused', { configurable: true, get: () => true });
    expect(shim.paused).toBe(true);

    Object.defineProperty(media, 'paused', { configurable: true, get: () => false });
    expect(shim.paused).toBe(false);
  });

  test('ended getter proxies media.ended', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    Object.defineProperty(media, 'ended', { configurable: true, get: () => true });
    expect(shim.ended).toBe(true);
  });

  test('shim.play() delegates to media.play()', async () => {
    const media = document.createElement('video');
    const playSpy = jest.fn(() => Promise.resolve());
    media.play = playSpy;
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    await shim.play();
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  test('shim.pause() delegates to media.pause()', () => {
    const media = document.createElement('video');
    const pauseSpy = jest.fn();
    media.pause = pauseSpy;
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    shim.pause();
    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });

  test('shim.on() registers a DOM listener and returns a cleanup function', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const shim = engine.exposeCreateShim(media);

    const calls: string[] = [];
    const off = shim.on('play', () => calls.push('play'));

    media.dispatchEvent(new Event('play'));
    expect(calls).toEqual(['play']);

    // cleanup removes the listener
    off();
    media.dispatchEvent(new Event('play'));
    expect(calls).toHaveLength(1);
  });
});
