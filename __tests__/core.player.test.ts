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
    const seen: any[] = [];
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

  test('play triggers engine resolution and emits playback:play; pause emits playback:pause and updates state on paused/playing', async () => {
    const p = makePlayer();
    const calls: string[] = [];
    p.events.on('playback:play', () => calls.push('play'));
    p.events.on('playback:pause', () => calls.push('pause'));

    await p.play();
    p.pause();
    expect(calls).toEqual(['play', 'pause']);

    // State transitions are bound to playback:playing/paused events
    p.events.emit('playback:playing');
    expect(p.state.current).toBe('playing');
    p.events.emit('playback:paused');
    expect(p.state.current).toBe('paused');
  });

  test('media sync updates cached fields from events', () => {
    const p = makePlayer();
    p.events.emit('media:timeupdate', 12);
    p.events.emit('media:duration', 50);
    p.events.emit('media:volume', 0.4);
    p.events.emit('media:muted', true);
    p.events.emit('media:rate', 1.5);

    expect(p.currentTime).toBe(12);
    expect(p.duration).toBe(50);
    expect(p.volume).toBe(0.4);
    expect(p.muted).toBe(true);
    expect(p.playbackRate).toBe(1.5);
  });

  test('destroy detaches active engine if present', () => {
    const p = makePlayer() as any;
    const detach = jest.fn();
    p.activeEngine = { detach } as any;
    p.playerContext = { media: p.media, events: p.events, player: p } as any;
    p.destroy();
    expect(detach).toHaveBeenCalled();
    expect(p.playerContext).toBeNull();
  });
});
