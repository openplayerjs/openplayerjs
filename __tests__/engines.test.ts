/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { Player } from '../src/core/player';
import { HlsMediaEngine } from '../src/engines/hls';
import { DefaultMediaEngine } from '../src/engines/html5';

// Ensure our Hls.js stub provides the methods HlsMediaEngine expects (attach/detach/destroy etc.)
jest.mock('hls.js', () => {
  return {
    __esModule: true,
    default: class HlsMock {
      static isSupported() {
        return true;
      }
      static Events: any = {
        MEDIA_ATTACHED: 'MEDIA_ATTACHED',
        MANIFEST_PARSED: 'MANIFEST_PARSED',
        ERROR: 'ERROR',
      };
      on = jest.fn();
      off = jest.fn();
      loadSource = jest.fn();
      attachMedia = jest.fn();
      detachMedia = jest.fn();
      destroy = jest.fn();
      startLoad = jest.fn();
      stopLoad = jest.fn();
      recoverMediaError = jest.fn();
    },
  };
});

function makeCtx() {
  const media = document.createElement('video');
  media.src = 'https://example.com/video.mp4';
  // jsdom: define duration as writable for tests
  Object.defineProperty(media, 'duration', { value: 10, writable: true, configurable: true });
  const events = new EventBus();
  const player = new Player(media, { plugins: [] });
  return { media, events, player };
}

describe('Media engines', () => {
  test('BaseMediaEngine binds media events and commands (seek/volume/rate/play/pause)', () => {
    const engine = new DefaultMediaEngine();
    const { media, events, player } = makeCtx();
    const seen: string[] = [];
    events.on('playback:ready', () => seen.push('ready'));
    events.on('media:timeupdate', () => seen.push('time'));
    events.on('media:duration', () => seen.push('dur'));

    // attach binds listeners + commands
    engine.attach({ media, events, player, activeSource: { src: 'x.mp4', type: 'video/mp4' } } as any);

    media.currentTime = 1;
    media.dispatchEvent(new Event('timeupdate'));
    media.dispatchEvent(new Event('loadedmetadata'));
    media.dispatchEvent(new Event('durationchange'));
    expect(seen).toContain('ready');
    expect(seen).toContain('time');
    expect(seen).toContain('dur');

    // command bindings
    events.emit('playback:seek', 5);
    expect(media.currentTime).toBe(5);

    events.emit('media:volume', 0.5);
    expect(media.volume).toBe(0.5);

    events.emit('media:muted', true);
    expect(media.muted).toBe(true);

    events.emit('media:rate', 1.25);
    expect(media.playbackRate).toBe(1.25);

    const playSpy = jest.spyOn(media, 'play').mockResolvedValue(undefined as any);
    const pauseSpy = jest.spyOn(media, 'pause').mockImplementation(() => {
      //
    });
    events.emit('playback:play');
    events.emit('playback:pause');
    expect(playSpy).toHaveBeenCalled();
    expect(pauseSpy).toHaveBeenCalled();

    engine.detach();
  });

  test('BaseMediaEngine respects playback lease owner (cannot handle when owned by another)', () => {
    const engine = new DefaultMediaEngine();
    const { media, events, player } = makeCtx();
    engine.attach({ media, events, player, activeSource: { src: 'x.mp4', type: 'video/mp4' } } as any);

    // someone else owns playback -> commands should no-op
    player.leases.acquire('playback', 'other');
    events.emit('playback:seek', 7);
    expect(media.currentTime).not.toBe(7);

    engine.detach();
  });

  test('DefaultMediaEngine canPlay uses canPlayType', () => {
    const engine = new DefaultMediaEngine();
    const source = { src: 'x.mp4', type: 'video/mp4' };
    expect(engine.canPlay(source as any)).toBe(true);
  });

  test('HlsMediaEngine canPlay and attaches adapter', async () => {
    const engine = new HlsMediaEngine({ debug: true });
    const { media, events, player } = makeCtx();
    const src = { src: 'https://x/y.m3u8', type: 'application/x-mpegURL' };
    expect(engine.canPlay(src as any)).toBe(true);

    engine.attach({ media, events, player, activeSource: src } as any);
    // Trigger play command to cover playback:play command listener
    const playSpy = jest.spyOn(media, 'play').mockResolvedValue(undefined as any);
    events.emit('playback:play');
    // playback handlers in HlsMediaEngine schedule work in microtasks
    await Promise.resolve();
    expect(playSpy).toHaveBeenCalled();

    engine.detach();
  });
});
