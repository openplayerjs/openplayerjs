/** @jest-environment jsdom */

import { Player } from '@openplayer/core';
import { createCenterOverlayDom } from '../src/overlay';

jest.useFakeTimers();

function makePlayer() {
  const v = document.createElement('video');
  document.body.appendChild(v);
  const p = new Player(v, { plugins: [] });
  p.play = jest.fn(async () => {
    p.events.emit('playing');
  }) as any;
  p.pause = jest.fn(() => {
    p.events.emit('pause');
  }) as any;
  return p;
}

describe('createCenterOverlayDom – center button click', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllTimers();
  });

  test('clicking the center button calls play when media is paused', async () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    document.body.appendChild(overlay.button);

    Object.defineProperty(player.media, 'paused', { value: true, configurable: true });

    overlay.button.click();
    await Promise.resolve(); // let the async handler settle

    expect(player.play).toHaveBeenCalledTimes(1);
  });

  test('clicking the center button calls pause when media is playing', async () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    document.body.appendChild(overlay.button);

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });
    Object.defineProperty(player.media, 'ended', { value: false, configurable: true });

    overlay.button.click();
    await Promise.resolve();

    expect(player.pause).toHaveBeenCalledTimes(1);
  });
});

describe('createCenterOverlayDom – flashPause', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllTimers();
  });

  test('adds --flash class immediately and removes it after timeout, then shows play state', () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    document.body.appendChild(overlay.button);

    overlay.flashPause(350);

    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(true);
    expect(overlay.button.getAttribute('aria-hidden')).toBe('false');
    // Not keyboard-focusable during flash (decorative)
    expect(overlay.button.tabIndex).toBe(-1);

    // Still flashing just before timeout
    jest.advanceTimersByTime(349);
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(true);

    // Timer fires → flash class removed, play state revealed
    jest.advanceTimersByTime(1);
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(false);
    expect(overlay.button.getAttribute('aria-hidden')).toBe('false');
    expect(overlay.button.tabIndex).toBe(0);
    expect(overlay.button.classList.contains('op-player__play--paused')).toBe(false);
  });

  test('showButton(false) during flash cancels it and hides the button normally', () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    document.body.appendChild(overlay.button);

    overlay.flashPause(350);
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(true);

    // Playback starts before flash ends
    overlay.showButton(false);

    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(false);
    expect(overlay.button.classList.contains('op-player__play--paused')).toBe(true);
    expect(overlay.button.getAttribute('aria-hidden')).toBe('true');

    // The cancelled timer must not fire
    jest.advanceTimersByTime(400);
    expect(overlay.button.classList.contains('op-player__play--paused')).toBe(true);
  });

  test('showButton(true) during flash is a no-op (flash timer handles the transition)', () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    document.body.appendChild(overlay.button);

    overlay.flashPause(350);

    // pause event fires → normally calls showButton(true), but flash is still active
    overlay.showButton(true);

    // Flash must still be active; timer has NOT fired
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(true);
    expect(overlay.button.tabIndex).toBe(-1);

    // Timer fires naturally
    jest.advanceTimersByTime(350);
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(false);
    expect(overlay.button.tabIndex).toBe(0);
  });

  test('calling flashPause twice cancels the first timer and starts a fresh one', () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    document.body.appendChild(overlay.button);

    overlay.flashPause(350);
    jest.advanceTimersByTime(200); // halfway through first flash

    // Second call – cancels first timer
    overlay.flashPause(350);
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(true);

    // Original timer would have fired at 350ms from start (150ms from now)
    jest.advanceTimersByTime(150);
    // Still flashing – the FIRST timer was cancelled
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(true);

    // Remaining 200ms until the SECOND timer fires
    jest.advanceTimersByTime(200);
    expect(overlay.button.classList.contains('op-player__play--flash')).toBe(false);
    expect(overlay.button.tabIndex).toBe(0);
  });
});

describe('createCenterOverlayDom – showButton blur branch', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('showButton(false) blurs the button when it is the active element', () => {
    const player = makePlayer();
    const overlay = createCenterOverlayDom(player);
    document.body.appendChild(overlay.button);

    // Ensure button is visible and focusable
    overlay.showButton(true);
    overlay.button.focus();
    expect(document.activeElement).toBe(overlay.button);

    const blurSpy = jest.spyOn(overlay.button, 'blur');
    overlay.showButton(false);

    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(overlay.button.getAttribute('aria-hidden')).toBe('true');
  });
});
