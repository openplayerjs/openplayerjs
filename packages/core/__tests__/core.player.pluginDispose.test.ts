/** @jest-environment jsdom */

import { Core } from '../src/core';
import type { PlayerPlugin } from '../src/core/plugin';

describe('Player plugin disposal helpers', () => {
  function makeCore() {
    const v = document.createElement('video');
    v.src = 'https://example.com/video.mp4';
    document.body.appendChild(v);
    return new Core(v, { plugins: [] });
  }

  test('ctx.listen + ctx.on are automatically cleaned on destroy', () => {
    const p = makeCore();
    const winRemove = jest.spyOn(window, 'removeEventListener');

    const plugin: PlayerPlugin = {
      name: 'dispose-test',
      version: '1.0.0',
      setup(ctx) {
        ctx.listen(window, 'resize', () => undefined);
        ctx.on('timeupdate', () => undefined);
        ctx.add(() => undefined);
      },
    };

    p.registerPlugin(plugin);
    expect(p.events.listenerCount('timeupdate')).toBeGreaterThan(0);

    p.destroy();

    // EventBus is cleared, but we also want DOM listener cleanup.
    expect(winRemove).toHaveBeenCalled();
    winRemove.mockRestore();
  });
});
