/** @jest-environment jsdom */

import type { OverlayState } from '@openplayerjs/core';
import { Core, getOverlayManager } from '@openplayerjs/core';

// Mock isMobile to exercise createVolumeControl returning null vs normal rendering.
jest.mock('@openplayerjs/core', () => {
  const actual = jest.requireActual('@openplayerjs/core');
  return { ...actual, isMobile: jest.fn() };
});

import { isMobile } from '@openplayerjs/core';
import createVolumeControl from '../src/controls/volume';

jest.useFakeTimers();

function makeCore() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Core(v, { plugins: [] });
  return p;
}

function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}

describe('VolumeControl branch coverage', () => {
  test('returns null on mobile', () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(true);
    const c = createVolumeControl();
    expect(c).toBeNull();
  });

  test('updates icon branches and ignores ad element volume errors (try/catch)', async () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(false);

    const p = makeCore();
    // jest.useFakeTimers() also fakes queueMicrotask; run all timers then flush Promises
    // so DefaultMediaEngine attaches and registers the cmd:setVolume handler.
    jest.runAllTimers();
    await Promise.resolve();
    const c = nn(createVolumeControl());
    const el = c.create(p);
    document.body.appendChild(el);

    const btn = nn(el.querySelector('button')) as HTMLButtonElement;
    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;

    // Create an "ad media element" that throws when setting volume.
    const badAdMedia = document.createElement('video');
    Object.defineProperty(badAdMedia, 'volume', {
      configurable: true,
      get() {
        return 1;
      },
      set() {
        throw new Error('nope');
      },
    });

    // Activate overlay and provide fullscreenVideoEl via overlay state so getActiveMedia() uses it
    const mgr = getOverlayManager(p);
    const overlay: OverlayState = {
      id: 'ads',
      priority: 100,
      mode: 'normal',
      duration: 10,
      value: 1,
      canSeek: false,
      fullscreenVideoEl: badAdMedia,
    };
    mgr.activate(overlay);

    // Drive to muted branch
    slider.value = '0';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(btn.classList.contains('op-controls__mute--muted')).toBe(true);

    // Half volume branch
    slider.value = '0.3';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(btn.classList.contains('op-controls__mute--half')).toBe(true);

    // Full volume branch
    slider.value = '1';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(btn.classList.contains('op-controls__mute--muted')).toBe(false);
    expect(btn.classList.contains('op-controls__mute--half')).toBe(false);

    // Toggle mute button restores volume
    p.media.volume = 1;
    btn.click();
    expect(p.media.volume).toBe(0);
    btn.click();
    expect(p.media.volume).toBeGreaterThan(0);

    // Fire loadedmetadata and volumechange with the overlay active to cover the
    // ad-element sync branches (lines 157-170 and 190-192 in volume.ts).
    // badAdMedia.volume setter throws, which is silently caught.
    p.events.emit('loadedmetadata');
    p.events.emit('volumechange');
  });

  test('slider input and mute button sync to overlay video when el !== core.surface', async () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(false);

    const p = makeCore();
    jest.runAllTimers();
    await Promise.resolve();
    const c = nn(createVolumeControl());
    const el = c.create(p);
    document.body.appendChild(el);

    const btn = nn(el.querySelector('button')) as HTMLButtonElement;
    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;

    // Use a normal video element (not throwing) so the try block fully executes
    const adMedia = document.createElement('video');

    const mgr = getOverlayManager(p);
    mgr.activate({
      id: 'ads-vol',
      priority: 100,
      mode: 'normal',
      duration: 10,
      value: 1,
      canSeek: false,
      fullscreenVideoEl: adMedia,
    } as OverlayState);

    // Slider input: el.volume and el.muted should be set (lines 100-101)
    p.volume = 0.8;
    slider.value = '0.5';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(adMedia.volume).toBeCloseTo(0.5, 5);
    expect(adMedia.muted).toBe(false);

    // Slider to 0 sets muted=true on adMedia
    slider.value = '0';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(adMedia.muted).toBe(true);

    // Restore volume
    p.volume = 0.7;
    slider.value = '0.7';
    slider.dispatchEvent(new Event('input', { bubbles: true }));

    // Mute button: el.volume=0, el.muted=true, btn.title updated (lines 126-129)
    btn.click();
    expect(adMedia.volume).toBe(0);
    expect(adMedia.muted).toBe(true);

    // Unmute button: el.volume restored, el.muted=false, btn.title updated (lines 141-144)
    btn.click();
    expect(adMedia.muted).toBe(false);
    expect(adMedia.volume).toBeGreaterThan(0);
  });
});
