/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import type { Control } from '../src/ui/control';
import createPlayControl from '../src/ui/controls/play';
import { createUI } from '../src/ui/index';

async function flushMicrotasks() {
  // queueMicrotask + async continuations can take a few turns in Jest/jsdom.
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
  }
}

describe('UI autoplay unmute affordance', () => {
  test('renders unmute button when autoplay requires muted and custom UI is used', async () => {
    const v = document.createElement('video') as HTMLVideoElement & {
      play: jest.Mock<Promise<void>, []>;
      pause: jest.Mock<void, []>;
    };
    v.src = 'https://example.com/video.mp4';
    v.autoplay = true;
    v.preload = 'auto';
    v.volume = 0.8;
    v.muted = false;
    v.pause = jest.fn();

    // First play attempt rejects, second (muted) resolves.
    v.play = jest
      .fn()
      .mockRejectedValueOnce(new Error('blocked'))
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    document.body.appendChild(v);
    const p = new Player(v, { plugins: [] });

    const controls = [createPlayControl()].filter(Boolean) as Control[];
    createUI(p, p.media, controls);

    // Simulate engine readiness so autoplay logic can run.
    p.events.emit('loadedmetadata');

    // allow queueMicrotask + awaits to run
    await flushMicrotasks();

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    expect(wrapper).toBeTruthy();

    const unmute = wrapper.querySelector('.op-player__unmute') as HTMLButtonElement;
    expect(unmute).toBeTruthy();

    // muted autoplay is applied
    expect(p.muted).toBe(true);
    expect(p.volume).toBe(0);

    // clicking unmute restores volume
    unmute.click();

    expect(p.muted).toBe(false);
    expect(p.volume).toBe(0.8);
    expect(wrapper.querySelector('.op-player__unmute')).toBeNull();
  });
});
