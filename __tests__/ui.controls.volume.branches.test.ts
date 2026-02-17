/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import { getOverlayManager } from '../src/core/overlay';

// Mock isMobile to exercise createVolumeControl returning null vs normal rendering.
jest.mock('../src/core/utils', () => {
  const actual = jest.requireActual('../src/core/utils');
  return { ...actual, isMobile: jest.fn() };
});

import { isMobile } from '../src/core/utils';
import createVolumeControl from '../src/ui/controls/volume';

jest.useFakeTimers();

function makePlayer() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Player(v, { plugins: [] });
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

  test('updates icon branches and ignores ad element volume errors (try/catch)', () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(false);

    const p = makePlayer();
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
    mgr.activate({
      id: 'ads',
      priority: 100,
      mode: 'normal',
      duration: 10,
      value: 1,
      canSeek: false,
      fullscreenVideoEl: badAdMedia as any,
    } as any);

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
    (p.media as any).volume = 1;
    btn.click();
    expect((p.media as any).volume).toBe(0);
    btn.click();
    expect((p.media as any).volume).toBeGreaterThan(0);
  });
});
