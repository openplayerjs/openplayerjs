/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import type { PlayerPlugin } from '../src/core/plugin';

describe('Player plugin disposal helpers', () => {
  function makePlayer() {
    const v = document.createElement('video');
    v.src = 'https://example.com/video.mp4';
    document.body.appendChild(v);
    return new Player(v, { plugins: [] });
  }

  test('ctx.listen + ctx.on are automatically cleaned on destroy', () => {
    const p = makePlayer();
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
