/** @jest-environment jsdom */

import { Core } from '@openplayer/core';
import { togglePlayback } from '../src/playback';

function makeCore() {
  const v = document.createElement('video');
  document.body.appendChild(v);
  const p = new Core(v, { plugins: [] });
  return p;
}

describe('togglePlayback', () => {
  test('uses underlying media.paused rather than state machine (avoids double-tap after seek)', async () => {
    const p = makeCore();

    // Simulate a state that might linger on mobile after scrubbing.
    p.state.transition('seeking');

    // Media is paused => should call play(), not pause().
    Object.defineProperty(p.media, 'paused', { value: true, configurable: true });
    p.play = jest.fn(async () => undefined) as unknown as Core['play'];
    p.pause = jest.fn(() => undefined) as unknown as Core['pause'];

    await togglePlayback(p);
    expect(p.play).toHaveBeenCalledTimes(1);
    expect(p.pause).toHaveBeenCalledTimes(0);

    // Media is playing => should pause.
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    await togglePlayback(p);
    expect(p.pause).toHaveBeenCalledTimes(1);
  });
});
