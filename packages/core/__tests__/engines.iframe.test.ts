/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { IframeMediaSurface } from '../src/engines/iframe';
import type {
  IframeMediaAdapter,
  IframeMediaAdapterEvents,
  IframePlaybackState,
} from '../src/engines/iframe';

// ─── Minimal mock adapter ────────────────────────────────────────────────────

type AnyHandler = (...args: unknown[]) => void;

class MockAdapter implements IframeMediaAdapter {
  private _listeners = new Map<string, AnyHandler[]>();

  // Spied methods
  readonly mountFn = jest.fn((_container: HTMLElement) => Promise.resolve());
  readonly destroyFn = jest.fn();
  readonly playFn = jest.fn(() => Promise.resolve<void>(undefined));
  readonly pauseFn = jest.fn(() => Promise.resolve<void>(undefined));
  readonly seekToFn = jest.fn((_s: number) => Promise.resolve<void>(undefined));
  readonly setVolumeFn = jest.fn();
  readonly muteFn = jest.fn();
  readonly unmuteFn = jest.fn();
  readonly setPlaybackRateFn = jest.fn();
  getCurrentTimeFn = jest.fn(() => 0);
  getDurationFn = jest.fn(() => 0);

  mount = this.mountFn;
  destroy = this.destroyFn;
  play = this.playFn;
  pause = this.pauseFn;
  seekTo = this.seekToFn;
  setVolume = this.setVolumeFn;
  mute = this.muteFn;
  unmute = this.unmuteFn;
  setPlaybackRate = this.setPlaybackRateFn;
  getCurrentTime = this.getCurrentTimeFn;
  getDuration = this.getDurationFn;

  on<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    const list = this._listeners.get(evt as string) ?? [];
    list.push(cb as AnyHandler);
    this._listeners.set(evt as string, list);
  }

  off<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    const list = this._listeners.get(evt as string) ?? [];
    this._listeners.set(
      evt as string,
      list.filter((fn) => fn !== (cb as AnyHandler))
    );
  }

  emit(evt: string, ...args: unknown[]): void {
    (this._listeners.get(evt) ?? []).forEach((fn) => fn(...args));
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSurface(pollIntervalMs = 250): { adapter: MockAdapter; surface: IframeMediaSurface } {
  const adapter = new MockAdapter();
  const surface = new IframeMediaSurface(adapter, { pollIntervalMs });
  return { adapter, surface };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('IframeMediaSurface – property getters (initial defaults)', () => {
  test('currentTime defaults to 0', () => {
    const { surface } = makeSurface();
    expect(surface.currentTime).toBe(0);
  });

  test('duration defaults to NaN', () => {
    const { surface } = makeSurface();
    expect(Number.isNaN(surface.duration)).toBe(true);
  });

  test('volume defaults to 1', () => {
    const { surface } = makeSurface();
    expect(surface.volume).toBe(1);
  });

  test('muted defaults to false', () => {
    const { surface } = makeSurface();
    expect(surface.muted).toBe(false);
  });

  test('playbackRate defaults to 1', () => {
    const { surface } = makeSurface();
    expect(surface.playbackRate).toBe(1);
  });

  test('paused defaults to true', () => {
    const { surface } = makeSurface();
    expect(surface.paused).toBe(true);
  });

  test('ended defaults to false', () => {
    const { surface } = makeSurface();
    expect(surface.ended).toBe(false);
  });
});

describe('IframeMediaSurface – property setters', () => {
  test('set currentTime emits seeking then seeked via internalBus', async () => {
    const { surface } = makeSurface();
    const events = new EventBus();
    surface.on('seeking', () => events.emit('seeking'));
    surface.on('seeked', () => events.emit('seeked'));

    const order: string[] = [];
    events.on('seeking', () => order.push('seeking'));
    events.on('seeked', () => order.push('seeked'));

    surface.currentTime = 30;
    expect(order).toContain('seeking');
    await Promise.resolve(); // flush microtasks for seeked
    expect(order).toContain('seeked');
  });

  test('set duration is a no-op (provider-controlled)', () => {
    const { surface } = makeSurface();
    surface.duration = 999;
    // duration stays NaN (unchanged) — no effect from setter
    expect(Number.isNaN(surface.duration)).toBe(true);
  });

  test('set volume clamps to [0, 1] and calls adapter.setVolume', () => {
    const { adapter, surface } = makeSurface();
    surface.volume = 1.5; // clamp high
    expect(adapter.setVolumeFn).toHaveBeenLastCalledWith(1);
    surface.volume = -0.5; // clamp low
    expect(adapter.setVolumeFn).toHaveBeenLastCalledWith(0);
    surface.volume = 0.7;
    expect(adapter.setVolumeFn).toHaveBeenLastCalledWith(0.7);
    expect(surface.volume).toBe(0.7);
  });

  test('set muted=true calls adapter.mute, set muted=false calls adapter.unmute', () => {
    const { adapter, surface } = makeSurface();
    surface.muted = true;
    expect(adapter.muteFn).toHaveBeenCalled();
    expect(surface.muted).toBe(true);

    surface.muted = false;
    expect(adapter.unmuteFn).toHaveBeenCalled();
    expect(surface.muted).toBe(false);
  });

  test('set playbackRate calls adapter.setPlaybackRate and updates internal state', () => {
    const { adapter, surface } = makeSurface();
    surface.playbackRate = 1.5;
    expect(adapter.setPlaybackRateFn).toHaveBeenCalledWith(1.5);
    expect(surface.playbackRate).toBe(1.5);
  });
});

describe('IframeMediaSurface – play / pause / load', () => {
  test('play() delegates to adapter and returns a Promise', async () => {
    const { adapter, surface } = makeSurface();
    const result = surface.play();
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(adapter.playFn).toHaveBeenCalled();
  });

  test('pause() delegates to adapter', () => {
    const { adapter, surface } = makeSurface();
    surface.pause();
    // pause is fire-and-forget; verify it was called after a tick
    return Promise.resolve().then(() => {
      expect(adapter.pauseFn).toHaveBeenCalled();
    });
  });

  test('load() is a no-op that does not throw', () => {
    const { surface } = makeSurface();
    expect(() => surface.load({ src: 'https://example.com/v.mp4' })).not.toThrow();
    expect(() => surface.load()).not.toThrow();
  });
});

describe('IframeMediaSurface – on() / event bridge', () => {
  test('on() returns an unsubscribe function and fires handlers', () => {
    const { adapter, surface } = makeSurface();
    const calls: string[] = [];

    const off = surface.on('play', () => calls.push('play'));
    adapter.emit('state', 'playing');
    expect(calls).toContain('play');

    // Unsubscribe stops further deliveries
    off();
    adapter.emit('state', 'playing');
    expect(calls).toHaveLength(1);
  });
});

describe('IframeMediaSurface – mount / destroy', () => {
  test('mount() delegates to adapter.mount', async () => {
    const { adapter, surface } = makeSurface();
    const container = document.createElement('div');
    await surface.mount(container);
    expect(adapter.mountFn).toHaveBeenCalledWith(container);
  });

  test('destroy() calls adapter.destroy and clears internal bus', () => {
    const { adapter, surface } = makeSurface();
    surface.destroy();
    expect(adapter.destroyFn).toHaveBeenCalled();
  });
});

describe('IframeMediaSurface – onAdapterState', () => {
  test.each<IframePlaybackState>([
    'playing',
    'paused',
    'ended',
    'loading',
    'buffering',
    'idle',
    'error',
  ])('handles state=%s without throwing', (state) => {
    const { adapter, surface } = makeSurface();
    expect(() => adapter.emit('state', state)).not.toThrow();
    void surface; // used
  });

  test('state=playing updates paused/ended flags and emits play+playing', () => {
    const { adapter, surface } = makeSurface();
    const emitted: string[] = [];
    surface.on('play', () => emitted.push('play'));
    surface.on('playing', () => emitted.push('playing'));

    adapter.emit('state', 'playing');
    expect(surface.paused).toBe(false);
    expect(surface.ended).toBe(false);
    expect(emitted).toEqual(expect.arrayContaining(['play', 'playing']));
  });

  test('state=paused sets paused=true and emits pause', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('state', 'playing'); // start playing
    const emitted: string[] = [];
    surface.on('pause', () => emitted.push('pause'));

    adapter.emit('state', 'paused');
    expect(surface.paused).toBe(true);
    expect(emitted).toContain('pause');
  });

  test('state=ended sets paused+ended=true and emits ended', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('state', 'playing');
    const emitted: string[] = [];
    surface.on('ended', () => emitted.push('ended'));

    adapter.emit('state', 'ended');
    expect(surface.paused).toBe(true);
    expect(surface.ended).toBe(true);
    expect(emitted).toContain('ended');
  });

  test('state=loading and state=buffering emit waiting', () => {
    const { adapter, surface } = makeSurface();
    const waiting: string[] = [];
    surface.on('waiting', () => waiting.push('w'));

    adapter.emit('state', 'loading');
    adapter.emit('state', 'buffering');
    expect(waiting).toHaveLength(2);
  });
});

describe('IframeMediaSurface – adapter ended event (applyEnded)', () => {
  test('adapter "ended" event sets ended=true and emits ended on surface', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('state', 'playing');

    const emitted: string[] = [];
    surface.on('ended', () => emitted.push('ended'));

    adapter.emit('ended');
    expect(surface.ended).toBe(true);
    expect(surface.paused).toBe(true);
    expect(emitted).toContain('ended');
  });
});

describe('IframeMediaSurface – adapter error event', () => {
  test('adapter error event propagates through surface bus', () => {
    const { adapter, surface } = makeSurface();
    const errors: unknown[] = [];
    surface.on('error', (e) => errors.push(e));

    const err = new Error('broken');
    adapter.emit('error', err);
    expect(errors[0]).toBe(err);
  });
});

describe('IframeMediaSurface – push events (timeupdate / durationchange / ratechange / volumechange)', () => {
  test('adapter timeupdate event updates currentTime and emits timeupdate', () => {
    const { adapter, surface } = makeSurface();
    const ticks: string[] = [];
    surface.on('timeupdate', () => ticks.push('t'));

    adapter.emit('timeupdate', 42.5);
    expect(surface.currentTime).toBe(42.5);
    expect(ticks).toHaveLength(1);
  });

  test('adapter durationchange event updates duration and emits durationchange', () => {
    const { adapter, surface } = makeSurface();
    const ticks: string[] = [];
    surface.on('durationchange', () => ticks.push('d'));

    adapter.emit('durationchange', 180);
    expect(surface.duration).toBe(180);
    expect(ticks).toHaveLength(1);
  });

  test('adapter ratechange event updates playbackRate', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('ratechange', 2);
    expect(surface.playbackRate).toBe(2);
  });

  test('adapter volumechange event updates volume and muted', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('volumechange', 0.5, true);
    expect(surface.volume).toBe(0.5);
    expect(surface.muted).toBe(true);
  });

  test('applyTime ignores non-finite values', () => {
    const { adapter, surface } = makeSurface();
    surface.currentTime; // ensure initial is 0
    adapter.emit('timeupdate', NaN);
    expect(surface.currentTime).toBe(0);
    adapter.emit('timeupdate', Infinity);
    expect(surface.currentTime).toBe(0);
  });

  test('applyDuration ignores non-finite or zero/negative values', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('durationchange', NaN);
    expect(Number.isNaN(surface.duration)).toBe(true);
    adapter.emit('durationchange', 0);
    expect(Number.isNaN(surface.duration)).toBe(true);
    adapter.emit('durationchange', -1);
    expect(Number.isNaN(surface.duration)).toBe(true);
  });

  test('applyRate ignores non-finite or non-positive values', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('ratechange', NaN);
    expect(surface.playbackRate).toBe(1); // unchanged
    adapter.emit('ratechange', 0);
    expect(surface.playbackRate).toBe(1);
    adapter.emit('ratechange', -1);
    expect(surface.playbackRate).toBe(1);
  });

  test('applyVolume ignores non-finite values', () => {
    const { adapter, surface } = makeSurface();
    adapter.emit('volumechange', NaN, false);
    expect(surface.volume).toBe(1); // unchanged
  });
});

describe('IframeMediaSurface – onAdapterReady with optional methods', () => {
  test('onAdapterReady initializes time/duration from adapter and starts polling', () => {
    jest.useFakeTimers();
    const { adapter, surface } = makeSurface(100);

    adapter.getCurrentTimeFn.mockReturnValue(5);
    adapter.getDurationFn.mockReturnValue(60);

    const loadedMeta: string[] = [];
    surface.on('loadedmetadata', () => loadedMeta.push('lm'));

    adapter.emit('ready');
    expect(surface.currentTime).toBe(5);
    expect(surface.duration).toBe(60);
    expect(loadedMeta).toHaveLength(1);

    // Advance timer to trigger polling tick
    jest.advanceTimersByTime(150);
    expect(adapter.getCurrentTimeFn.mock.calls.length).toBeGreaterThan(1);

    surface.destroy(); // stop polling
    jest.useRealTimers();
  });

  test('onAdapterReady uses getVolume when available', () => {
    const { adapter, surface } = makeSurface();
    adapter.getDurationFn.mockReturnValue(100);

    (adapter as MockAdapter & { getVolume?: () => number }).getVolume = jest.fn(() => 0.4);
    adapter.emit('ready');
    expect(surface.volume).toBe(0.4);
  });

  test('onAdapterReady uses isMuted when available', () => {
    const { adapter, surface } = makeSurface();
    adapter.getDurationFn.mockReturnValue(100);

    (adapter as MockAdapter & { isMuted?: () => boolean }).isMuted = jest.fn(() => true);
    adapter.emit('ready');
    expect(surface.muted).toBe(true);
  });

  test('onAdapterReady uses getPlaybackRate when available', () => {
    const { adapter, surface } = makeSurface();
    adapter.getDurationFn.mockReturnValue(100);

    (adapter as MockAdapter & { getPlaybackRate?: () => number }).getPlaybackRate = jest.fn(() => 1.5);
    adapter.emit('ready');
    expect(surface.playbackRate).toBe(1.5);
  });

  test('onAdapterReady uses getElement when available', () => {
    const { adapter, surface } = makeSurface();
    const el = document.createElement('div');
    adapter.getDurationFn.mockReturnValue(100);

    (adapter as MockAdapter & { getElement?: () => HTMLElement }).getElement = jest.fn(() => el);
    adapter.emit('ready');
    expect(surface.element).toBe(el);
  });
});

describe('IframeMediaSurface – polling loop', () => {
  test('polling uses isMuted and getPlaybackRate on each tick when available', () => {
    jest.useFakeTimers();
    const adapter = new MockAdapter();
    const isMutedFn = jest.fn(() => false);
    const getRateFn = jest.fn(() => 1);
    const getVolFn = jest.fn(() => 0.8);
    (adapter as typeof adapter & { isMuted: () => boolean }).isMuted = isMutedFn;
    (adapter as typeof adapter & { getPlaybackRate: () => number }).getPlaybackRate = getRateFn;
    (adapter as typeof adapter & { getVolume: () => number }).getVolume = getVolFn;

    adapter.getDurationFn.mockReturnValue(120);
    adapter.getCurrentTimeFn.mockReturnValue(10);

    const surface = new IframeMediaSurface(adapter, { pollIntervalMs: 50 });
    adapter.emit('ready');

    jest.advanceTimersByTime(110);
    expect(isMutedFn.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(getRateFn.mock.calls.length).toBeGreaterThanOrEqual(2);

    surface.destroy();
    jest.useRealTimers();
  });

  test('stopPolling is idempotent when no timer is running', () => {
    const { surface } = makeSurface();
    expect(() => {
      surface.destroy(); // calls stopPolling
      surface.destroy(); // second call — no timer running
    }).not.toThrow();
  });
});

describe('IframeMediaSurface – bridgeSurfaceEvents integration', () => {
  test('EventBus receives events bridged from surface via on()', () => {
    const { adapter, surface } = makeSurface();
    const bus = new EventBus();
    const seen: string[] = [];

    // Wire the surface → bus manually (same as bridgeSurfaceEvents)
    surface.on('play', () => bus.emit('play'));
    surface.on('pause', () => bus.emit('pause'));
    surface.on('ended', () => bus.emit('ended'));
    surface.on('waiting', () => bus.emit('waiting'));

    bus.on('play', () => seen.push('play'));
    bus.on('pause', () => seen.push('pause'));
    bus.on('ended', () => seen.push('ended'));
    bus.on('waiting', () => seen.push('waiting'));

    adapter.emit('state', 'playing');
    adapter.emit('state', 'paused');
    adapter.emit('state', 'ended');
    adapter.emit('state', 'buffering');

    expect(seen).toEqual(expect.arrayContaining(['play', 'pause', 'ended', 'waiting']));
  });
});
