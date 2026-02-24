/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import { createUI } from '../src/ui';
import createProgressControl from '../src/ui/controls/progress';

describe('controls cleanup on player.destroy', () => {
  test('ProgressControl removes document listeners on destroy', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    const media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Player(media, { plugins: [], controls: { 'top-center': ['progress'] } } as any);

    // Create UI with just the progress control.
    const progress = createProgressControl()!;
    createUI(player, player.media, [progress]);

    // Sanity: progress control should have registered at least one document listener.
    expect(addSpy).toHaveBeenCalled();

    player.destroy();

    // Ensure listeners were removed (branch coverage: multiple doc listeners exist).
    const removedTypes = removeSpy.mock.calls.map((c) => c[0]);
    expect(removedTypes).toEqual(expect.arrayContaining(['pointerup', 'pointercancel', 'mouseup', 'touchend', 'pointermove']));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
