/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import type { PlayerPlugin } from '../src/core/plugin';

describe('Player core', () => {
  function makePlayer() {
    const v = document.createElement('video');
    // Provide a source so Player.load() can resolve a media engine
    v.src = 'https://example.com/video.mp4';
    document.body.appendChild(v);
    return new Player(v, { plugins: [] });
  }

  test('emit notifies plugin onEvent (non media-engine)', () => {
    const p = makePlayer();
    const seen: [string, unknown][] = [];
    const plugin: PlayerPlugin = {
      name: 't',
      version: '1',
      setup() {
        //
      },
      onEvent(evt, payload) {
        seen.push([evt, payload]);
      },
    };
    p.registerPlugin(plugin);
    p.emit('media:rate', 1.25);
    expect(seen).toEqual([['media:rate', 1.25]]);
  });

  test('play is gated until loadedmetadata and does not double-fire; pause emits cmd:pause', async () => {
    const p = makePlayer();
    const calls: string[] = [];
    p.events.on('cmd:play', () => calls.push('play'));
    p.events.on('cmd:pause', () => calls.push('pause'));

    const playPromise = p.play();
    // Not ready yet: should not have emitted play.
    expect(calls).toEqual([]);

    // Simulate the engine signaling readiness.
    p.events.emit('loadedmetadata');
    await playPromise;

    // Now play should fire exactly once.
    expect(calls).toEqual(['play']);

    p.pause();
    expect(calls).toEqual(['play', 'pause']);

    // State transitions are bound to playing/pause events
    p.events.emit('playing');
    expect(p.state.current).toBe('playing');
    p.events.emit('pause');
    expect(p.state.current).toBe('paused');
  });

  test('lease change re-emits cached media state so plugin-owned surfaces can sync', async () => {
    const p = makePlayer();
    const seen: [string, unknown][] = [];
    p.events.on('cmd:setMuted', (m: boolean) => seen.push(['muted', m]));
    p.events.on('cmd:setVolume', (v: number) => seen.push(['volume', v]));

    // Update cached state.
    p.muted = true;
    p.volume = 0;

    // Acquire playback lease as if an ads plugin took over.
    p.leases.acquire('playback', 'ads');

    // bindLeaseSync uses queueMicrotask.
    await new Promise<void>((resolve) => {
      queueMicrotask(() => resolve());
    });

    // Last emitted should match cached state.
    expect(seen.slice(-2)).toEqual([
      ['volume', 0],
      ['muted', true],
    ]);
  });

  test('media sync updates cached fields from events', () => {
    const p = makePlayer();

    // Set values on media element so bindMediaSync reads them correctly
    Object.defineProperty(p.media, 'currentTime', { value: 12, writable: true, configurable: true });
    Object.defineProperty(p.media, 'duration', { value: 50, writable: true, configurable: true });
    Object.defineProperty(p.media, 'volume', { value: 0.4, writable: true, configurable: true });
    Object.defineProperty(p.media, 'muted', { value: true, writable: true, configurable: true });
    Object.defineProperty(p.media, 'playbackRate', { value: 1.5, writable: true, configurable: true });

    p.events.emit('timeupdate');
    p.events.emit('durationchange');
    p.events.emit('volumechange');
    p.events.emit('ratechange');

    expect(p.currentTime).toBe(12);
    expect(p.duration).toBe(50);
    expect(p.volume).toBe(0.4);
    expect(p.muted).toBe(true);
    expect(p.playbackRate).toBe(1.5);
  });

  test('destroy detaches active engine if present', () => {
    const p = makePlayer() as any;
    const detach = jest.fn();
    p.activeEngine = { detach };
    p.playerContext = { media: p.media, events: p.events, player: p };
    p.destroy();
    expect(detach).toHaveBeenCalled();
    expect(p.playerContext).toBeNull();
  });

  test('determineAutoplaySupport: unmuted autoplay works', async () => {
    const v = document.createElement('video') as HTMLVideoElement & {
      play: jest.Mock<Promise<void>, []>;
      pause: jest.Mock<void, []>;
    };
    v.src = 'https://example.com/video.mp4';
    v.volume = 0.7;
    v.muted = false;
    v.pause = jest.fn();
    v.play = jest.fn().mockResolvedValue(undefined);
    document.body.appendChild(v);
    const p = new Player(v, { plugins: [] });
    const promise = p.determineAutoplaySupport();
    // Ensure readiness after listeners are in place.
    p.events.emit('loadedmetadata');
    const res = await promise;
    expect(res).toEqual({ autoplay: true, muted: false });
    expect(v.play).toHaveBeenCalledTimes(1);
    expect(v.pause).toHaveBeenCalledTimes(1);
    expect(v.volume).toBe(0.7);
    expect(v.muted).toBe(false);
  });

  test('determineAutoplaySupport: only muted autoplay works', async () => {
    const v = document.createElement('video') as HTMLVideoElement & {
      play: jest.Mock<Promise<void>, []>;
      pause: jest.Mock<void, []>;
    };
    v.src = 'https://example.com/video.mp4';
    v.volume = 0.6;
    v.muted = false;
    v.pause = jest.fn();
    v.play = jest.fn().mockRejectedValueOnce(new Error('blocked')).mockResolvedValueOnce(undefined);
    document.body.appendChild(v);
    const p = new Player(v, { plugins: [] });
    const promise = p.determineAutoplaySupport();
    p.events.emit('loadedmetadata');
    const res = await promise;
    expect(res).toEqual({ autoplay: true, muted: true });
    expect(v.play).toHaveBeenCalledTimes(2);
    expect(v.pause).toHaveBeenCalledTimes(1);
    // state restored
    expect(v.volume).toBe(0.6);
    expect(v.muted).toBe(false);
  });

  test('determineAutoplaySupport: autoplay blocked', async () => {
    const v = document.createElement('video') as HTMLVideoElement & {
      play: jest.Mock<Promise<void>, []>;
      pause: jest.Mock<void, []>;
    };
    v.src = 'https://example.com/video.mp4';
    v.volume = 0.5;
    v.muted = false;
    v.pause = jest.fn();
    v.play = jest.fn().mockRejectedValue(new Error('blocked'));
    document.body.appendChild(v);
    const p = new Player(v, { plugins: [] });
    const promise = p.determineAutoplaySupport();
    p.events.emit('loadedmetadata');
    const res = await promise;
    expect(res).toEqual({ autoplay: false, muted: false });
    expect(v.play).toHaveBeenCalledTimes(2);
    expect(v.pause).toHaveBeenCalledTimes(0);
    expect(v.volume).toBe(0.5);
    expect(v.muted).toBe(false);
  });
});
