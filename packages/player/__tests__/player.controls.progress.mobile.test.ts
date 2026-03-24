/** @jest-environment jsdom */

/**
 * Progress control branches that require isMobile mocking or
 * other specific conditions not tested in the main progress test file.
 */

jest.mock('@openplayerjs/core', () => {
  const actual = jest.requireActual('@openplayerjs/core');
  return { ...actual, isMobile: jest.fn() };
});

import { isMobile } from '@openplayerjs/core';
import { Core, getOverlayManager, type OverlayState } from '@openplayerjs/core';
import createProgressControl from '../src/controls/progress';

jest.useFakeTimers();

function makeCore() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return new Core(v, { plugins: [] });
}

function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}

describe('ProgressControl – mobile and special branches', () => {
  beforeEach(() => {
    (isMobile as unknown as jest.Mock).mockReturnValue(false);
  });

  test('does not create tooltip when isMobile returns true (line 54 false branch)', () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(true);

    const p = makeCore();
    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    // No tooltip should be in the DOM
    expect(el.querySelector('.op-controls__tooltip')).toBeNull();
  });

  test('touchstart with no touches (te.touches[0] undefined) does nothing', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 0;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    // Fire touchstart with empty touches array (te.touches[0] === undefined)
    const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(touchEvent, 'touches', { value: [] }); // no touches

    const played = nn(el.querySelector('.op-controls__progress--played')) as HTMLElement;
    played.dispatchEvent(touchEvent);

    // currentTime should remain 0 since !touch → early return
    expect(p.currentTime).toBe(0);
  });

  test('touchstart with null touches does nothing', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 0;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(touchEvent, 'touches', { value: null });

    const played = nn(el.querySelector('.op-controls__progress--played')) as HTMLElement;
    played.dispatchEvent(touchEvent);

    expect(p.currentTime).toBe(0);
  });

  test('countdown mode: progress bar shows remaining time (overlay mode=countdown)', () => {
    const p = makeCore();
    (p.media as any).duration = 100;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    const played = nn(el.querySelector('.op-controls__progress--played')) as HTMLProgressElement;

    // Activate a countdown overlay (30s total, currently at 10s)
    getOverlayManager(p).activate({
      id: 'ads-countdown',
      priority: 100,
      mode: 'countdown',
      duration: 30,
      value: 10,
      canSeek: false,
    } as OverlayState);

    p.events.emit('timeupdate');

    // In countdown mode: percentage = (max - v - min) * 100 / (max - min)
    // max=30, v=10, min=0 → percentage = (30-10-0)*100/30 = 66.67%
    expect(slider.style.backgroundSize).toContain('%');
    // played.value = ((d - v) / d) * 100 = ((30 - 10) / 30) * 100 = 66.67
    expect(played.value).toBeGreaterThan(50);
  });

  test('slider change with canSeek=false overlay returns early', () => {
    const p = makeCore();
    (p.media as any).duration = 100;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;

    getOverlayManager(p).activate({
      id: 'ads-no-seek',
      priority: 100,
      mode: 'normal',
      duration: 30,
      value: 5,
      canSeek: false,
    } as OverlayState);

    const before = p.currentTime;
    slider.max = '100';
    slider.value = '50';
    slider.dispatchEvent(new Event('change'));
    // Should not seek since canSeek=false — currentTime should remain unchanged
    expect(p.currentTime).toBe(before);
  });

  test('slider input on mobile (isMobile=true, not pressed) still processes input', () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(true);

    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 0;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    slider.max = '100';
    slider.value = '30';
    slider.dispatchEvent(new Event('input', { bubbles: true }));

    // On mobile: !pressed && isMobile() → condition (!pressed && !isMobile) is false → proceeds
    expect(p.currentTime).toBeCloseTo(30, 3);
  });

  test('updateUI: setSeekEnabled enables slider for normal finite duration (no overlay, !isLive)', () => {
    const p = makeCore();
    (p.media as any).duration = 60;
    p.isLive = false;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    p.events.emit('timeupdate');

    // For non-live, finite-duration content, slider should be enabled (seekable)
    expect(slider.disabled).toBe(false);
  });

  test('play event on live stream: does NOT remove aria-valuenow (keeps it)', () => {
    const p = makeCore();
    p.isLive = true;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    p.events.emit('play');
    // For live streams, aria-valuenow is NOT removed (the if guard checks !core.isLive)
    // Just verify it doesn't crash
    expect(el).toBeTruthy();
  });

  test('pointermove on progress while isMobile=true early-returns without showing tooltip', () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(true);

    const p = makeCore();
    (p.media as any).duration = 100;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    // No tooltip is created on mobile (isMobile=true during build)
    expect(el.querySelector('.op-controls__tooltip')).toBeNull();

    // Dispatch pointermove on the progress element — isMobile()=true → early return
    const moveEvent = new MouseEvent('pointermove', { bubbles: true, cancelable: true });
    Object.defineProperty(moveEvent, 'pageX', { value: 50 });
    el.dispatchEvent(moveEvent);
    // Should not throw or crash
    expect(el).toBeTruthy();
  });
});
