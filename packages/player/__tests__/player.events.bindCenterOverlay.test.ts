/** @jest-environment jsdom */

import { Core, getOverlayManager } from '@openplayer/core';
import { bindCenterOverlay } from '../src/events';

function keydown(target: EventTarget, key: string, extra?: Partial<KeyboardEventInit>) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra });
  target.dispatchEvent(e);
  return e;
}

describe('ui/events - bindCenterOverlay', () => {
  test('switches keyboard styling class on pointer vs keyboard events', () => {
    document.body.innerHTML = '';
    const media = document.createElement('video');
    document.body.appendChild(media);
    const player = new Core(media, { duration: 10 });

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player op-player__keyboard--inactive';
    document.body.appendChild(wrapper);

    bindCenterOverlay(player, wrapper);

    keydown(window, 'k');
    expect(wrapper.classList.contains('op-player__keyboard--inactive')).toBe(false);

    // JSDOM may not provide PointerEvent; fall back to MouseEvent.
    const PE: any = (globalThis as any).PointerEvent ?? MouseEvent;
    wrapper.dispatchEvent(new PE('pointerdown', { bubbles: true }));
    expect(wrapper.classList.contains('op-player__keyboard--inactive')).toBe(true);
  });

  test('Space activates focused control button and prevents default', () => {
    document.body.innerHTML = '';
    const media = document.createElement('video');
    document.body.appendChild(media);
    const player = new Core(media, { duration: 10 });

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player op-player__keyboard--inactive';
    document.body.appendChild(wrapper);

    const btn = document.createElement('button');
    wrapper.appendChild(btn);
    btn.focus();
    const clickSpy = jest.spyOn(btn, 'click');

    bindCenterOverlay(player, wrapper);

    const e = keydown(wrapper, ' ');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);
  });

  test('ArrowUp/ArrowDown updates active overlay media when it differs from player.media', () => {
    document.body.innerHTML = '';
    const media = document.createElement('video');
    document.body.appendChild(media);
    const player = new Core(media, { duration: 10 });

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    const overlayVideo = document.createElement('video');
    overlayVideo.volume = 0.2;

    // Activate an overlay so bindCenterOverlay can mirror volume/fullscreen actions to it.
    getOverlayManager(player).activate({
      id: 'test-overlay',
      priority: 10,
      mode: 'normal',
      duration: 10,
      value: 0,
      canSeek: true,
      fullscreenVideoEl: overlayVideo as any,
    });

    bindCenterOverlay(player, wrapper);

    player.volume = 0.5;
    keydown(wrapper, 'ArrowUp');
    expect(player.volume).toBeCloseTo(0.6, 5);
    expect(overlayVideo.volume).toBeCloseTo(0.6, 5);

    keydown(wrapper, 'ArrowDown');
    expect(player.volume).toBeCloseTo(0.5, 5);
    expect(overlayVideo.volume).toBeCloseTo(0.5, 5);
  });

  test('mute toggle preserves/restores last non-zero volume', () => {
    document.body.innerHTML = '';
    const media = document.createElement('video');
    document.body.appendChild(media);
    const player = new Core(media, { duration: 10, startVolume: 0.7 });

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    bindCenterOverlay(player, wrapper);

    keydown(wrapper, 'm');
    expect(player.muted).toBe(true);
    expect(player.volume).toBe(0);

    keydown(wrapper, 'm');
    expect(player.muted).toBe(false);
    expect(player.volume).toBeCloseTo(0.7, 5);
  });

  test('fullscreen key uses requestFullscreen when available', () => {
    document.body.innerHTML = '';
    const media = document.createElement('video');
    document.body.appendChild(media);
    const player = new Core(media, { duration: 10 });

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    bindCenterOverlay(player, wrapper);

    const target = document.createElement('div') as any;
    target.requestFullscreen = jest.fn();
    const e = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true });
    Object.defineProperty(e, 'target', { value: target });
    wrapper.dispatchEvent(e);

    expect(target.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  test('fullscreen key falls back to webkitEnterFullscreen when requestFullscreen is missing', () => {
    document.body.innerHTML = '';
    const media = document.createElement('video');
    document.body.appendChild(media);
    const player = new Core(media, { duration: 10 });

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    // Attach overlay media so getActiveMedia returns a different element than player.media
    const overlayVideo = document.createElement('video') as any;
    overlayVideo.webkitEnterFullscreen = jest.fn();
    getOverlayManager(player).activate({
      id: 'test-overlay-2',
      priority: 10,
      mode: 'normal',
      duration: 10,
      value: 0,
      canSeek: true,
      fullscreenVideoEl: overlayVideo,
    });

    bindCenterOverlay(player, wrapper);

    // Ensure event.target is the overlay video to exercise the fallback chain.
    const e = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true });
    Object.defineProperty(e, 'target', { value: overlayVideo });
    wrapper.dispatchEvent(e);

    expect(overlayVideo.webkitEnterFullscreen).toHaveBeenCalledTimes(1);
  });

  test('End key does not seek when duration is Infinity (branch)', () => {
    document.body.innerHTML = '';
    const media = document.createElement('video');
    document.body.appendChild(media);
    const player = new Core(media, { duration: Infinity as any });
    player.currentTime = 12;

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    bindCenterOverlay(player, wrapper);

    keydown(wrapper, 'End');
    expect(player.currentTime).toBe(12);
  });
});
