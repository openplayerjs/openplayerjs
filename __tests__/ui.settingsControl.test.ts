/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import { getOverlayManager } from '../src/core/overlay';
import { SettingsControl } from '../src/ui/controls/settings';

function makePlayer() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return new Player(v, { plugins: [] });
}

describe('SettingsControl availability vs overlays', () => {
  test('hides during ads overlay even when menu is closed, and reappears afterwards', () => {
    const player = makePlayer();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    // Initial render should be visible because the built-in Speed submenu is available.
    expect((el as HTMLElement).style.display).toBe('');

    const overlayMgr = getOverlayManager(player);
    overlayMgr.activate({
      id: 'ads',
      priority: 100,
      mode: 'normal',
      duration: 10,
      value: 0,
      canSeek: false,
    });

    // During ads, speed submenu is suppressed, so the control should hide.
    expect((el as HTMLElement).style.display).toBe('none');

    overlayMgr.deactivate('ads');
    expect((el as HTMLElement).style.display).toBe('');
  });
});
