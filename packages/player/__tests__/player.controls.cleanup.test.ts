/** @jest-environment jsdom */

import { Core } from '@openplayerjs/core';
import type { PlayerUIConfig } from '../src/configuration';
import createProgressControl from '../src/controls/progress';
import { createUI } from '../src/ui';

describe('controls cleanup on player.destroy', () => {
  test('ProgressControl removes document listeners on destroy', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    const media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Core(media, { plugins: [], controls: { 'top-center': ['progress'] } } as PlayerUIConfig);

    // Create UI with just the progress control.
    const progress = createProgressControl()!;
    createUI(player, player.media, [progress]);

    // Sanity: progress control should have registered at least one document listener.
    expect(addSpy).toHaveBeenCalled();

    player.destroy();

    // Ensure listeners were removed (branch coverage: multiple doc listeners exist).
    const removedTypes = removeSpy.mock.calls.map((c) => c[0]);
    expect(removedTypes).toEqual(
      expect.arrayContaining(['pointerup', 'pointercancel', 'mouseup', 'touchend', 'pointermove'])
    );

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
