/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import { createCenterOverlayDom } from '../src/ui/overlay';
import { bindCenterOverlay } from '../src/ui/events';

jest.useFakeTimers();

function makePlayer() {
  const v = document.createElement('video');
  document.body.appendChild(v);
  (v as any).canPlayType = () => 'probably';
  const p = new Player(v, { plugins: [] });
  // spy play/pause
  p.play = jest.fn(async () => {
    p.events.emit('playback:playing');
  }) as any;
  p.pause = jest.fn(() => {
    p.emit('playback:pause');
    p.events.emit('playback:paused');
  }) as any;
  return p;
}

describe('bindCenterOverlay', () => {
  test('waiting/seeking show loader, seeked/play show button, playing hides both, ended shows button', async () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    wrapper.append(overlay.button, overlay.loader);

    bindCenterOverlay(player, overlay, wrapper);

    // waiting => loader on, button off
    player.events.emit('playback:waiting');
    expect(overlay.loader.getAttribute('aria-hidden')).toBe('false');
    expect(overlay.button.getAttribute('aria-hidden')).toBe('true');

    // seeking => loader on
    player.events.emit('playback:seeking');
    expect(overlay.loader.getAttribute('aria-hidden')).toBe('false');

    // seeked => loader off, button on
    player.events.emit('playback:seeked');
    expect(overlay.loader.getAttribute('aria-hidden')).toBe('true');
    expect(overlay.button.getAttribute('aria-hidden')).toBe('false');

    // play => button visible, aria pressed true after playing?
    player.events.emit('playback:play');
    expect(overlay.button.getAttribute('aria-hidden')).toBe('false');

    // playing => hide both
    player.events.emit('playback:playing');
    expect(overlay.button.getAttribute('aria-hidden')).toBe('true');
    expect(overlay.loader.getAttribute('aria-hidden')).toBe('true');

    // ended => show button again
    player.events.emit('playback:ended');
    expect(overlay.button.getAttribute('aria-hidden')).toBe('false');
  });

  test('keyboard K/Enter/Space toggles play/pause using player methods', async () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    bindCenterOverlay(player, overlay, wrapper);

    // press K
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', bubbles: true }));
    expect(player.play).toHaveBeenCalled();

    // simulate state as playing, press Enter to pause
    player.state.transition('playing');
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(player.pause).toHaveBeenCalled();

    // Space toggles too
    player.state.transition('paused');
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(player.play).toHaveBeenCalledTimes(2);
  });

  test('arrow volume keys update player.volume and preserve last volume through mute toggle', () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    bindCenterOverlay(player, overlay, wrapper);

    player.volume = 0.5;
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(player.volume).toBeCloseTo(0.4, 5);

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
    expect(player.muted).toBe(true);
    expect(player.volume).toBe(0);

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
    expect(player.muted).toBe(false);
    expect(player.volume).toBeGreaterThan(0);
  });
});
