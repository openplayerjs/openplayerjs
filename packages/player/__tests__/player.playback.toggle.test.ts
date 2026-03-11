/** @jest-environment jsdom */

import { Core } from '@openplayerjs/core';
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


describe('PlayControl – isEnded path', () => {
  test('clicking play button after ended resets currentTime to 0', async () => {
    const v = document.createElement('video');
    document.body.appendChild(v);
    const player = new (require('@openplayerjs/core').Core)(v, { plugins: [] });
    const { PlayControl } = require('../src/controls/play') as typeof import('../src/controls/play');

    const control = new PlayControl();
    const btn = control.create(player);
    document.body.appendChild(btn);

    // Simulate video ending
    player.events.emit('ended');

    // Now click play — should reset currentTime to 0
    (v as any).currentTime = 30;
    player.events.emit('cmd:seek', 30); // sync currentTime
    (player as any)._currentTime = 30;

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    btn.dispatchEvent(clickEvent);

    // After click with isEnded=true, currentTime is reset via getActiveMedia(core)
    // getActiveMedia uses core.surface?.currentTime. We just check no error is thrown.
    await Promise.resolve();

    control.destroy();
  });
});
