/** @jest-environment jsdom */

import { Core, getOverlayManager } from '@openplayer/core';
import { SettingsControl } from '../src/controls/settings';

function makeCore() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return new Core(v, { plugins: [] });
}

describe('SettingsControl availability vs overlays', () => {
  test('hides during ads overlay even when menu is closed, and reappears afterwards', () => {
    const player = makeCore();
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
