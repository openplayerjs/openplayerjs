/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import { togglePlayback } from '../src/ui/playback';

function makePlayer() {
  const v = document.createElement('video');
  document.body.appendChild(v);
  const p = new Player(v, { plugins: [] });
  return p;
}

describe('togglePlayback', () => {
  test('uses underlying media.paused rather than state machine (avoids double-tap after seek)', async () => {
    const p = makePlayer();

    // Simulate a state that might linger on mobile after scrubbing.
    p.state.transition('seeking');

    // Media is paused => should call play(), not pause().
    Object.defineProperty(p.media, 'paused', { value: true, configurable: true });
    p.play = jest.fn(async () => undefined) as any;
    p.pause = jest.fn(() => undefined) as any;

    await togglePlayback(p);
    expect(p.play).toHaveBeenCalledTimes(1);
    expect(p.pause).toHaveBeenCalledTimes(0);

    // Media is playing => should pause.
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    await togglePlayback(p);
    expect(p.pause).toHaveBeenCalledTimes(1);
  });
});
