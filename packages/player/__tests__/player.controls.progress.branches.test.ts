/** @jest-environment jsdom */

import type { OverlayManager, OverlayState } from '@openplayerjs/core';
import { Core, getOverlayManager } from '@openplayerjs/core';
import createProgressControl from '../src/controls/progress';

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

describe('ProgressControl branch coverage', () => {
  test('hides for live/Infinity when no overlay', () => {
    const p = makeCore();
    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    // Live stream path
    p.isLive = true;
    p.events.emit('durationchange');
    expect(el.getAttribute('aria-hidden')).toBe('true');

    // Infinity duration path
    p.isLive = false;
    (p.media as any).duration = Infinity;
    p.events.emit('durationchange');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  test('overlay enables visibility + seek disabled, and pressed blocks UI updates', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 10;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;

    // Activate overlay that disallows seek: should remain visible but disabled
    const mgr = getOverlayManager(p);
    mgr.activate({
      id: 'ads',
      priority: 100,
      mode: 'normal',
      duration: 30,
      value: 5,
      canSeek: false,
      bufferedPct: 20,
    });

    p.events.emit('timeupdate');
    expect(el.getAttribute('aria-hidden')).toBe('false');
    expect(slider.disabled).toBe(true);
    expect(slider.classList.contains('op-progress--disabled')).toBe(true);

    // Pressed blocks updateUI branch
    const before = slider.value;
    slider.classList.add('op-progress--pressed');
    p.media.currentTime = 15;
    p.events.emit('timeupdate');
    // value should not have been overwritten while pressed
    expect(slider.value).toBe(before);
  });

  test('waiting/play/ended branches touch loading/error and reset', () => {
    const p = makeCore();
    (p.media as any).duration = 50;
    p.media.currentTime = 1;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    const buffer = nn(el.querySelector('progress')) as HTMLProgressElement;

    p.events.emit('waiting');
    expect(slider.classList.contains('loading')).toBe(true);

    p.events.emit('play'); // should clear loading/error and remove aria-valuenow/valuetext
    expect(slider.classList.contains('loading')).toBe(false);
    expect(el.hasAttribute('aria-valuenow')).toBe(false);

    // ended resets UI
    slider.max = '50';
    slider.style.backgroundSize = '10% 100%';
    buffer.value = 60;

    p.events.emit('ended');
    expect(slider.max).toBe('0');
    expect(buffer.value).toBe(0);
    expect(slider.style.backgroundSize).toBe('0% 100%');
  });

  test('rail tap-to-seek works when tap lands on progress overlays (mobile touchstart)', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 0;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    // Stub getBoundingClientRect so we can compute percent.
    el.getBoundingClientRect = () => ({
      left: 0,
      width: 200,
      top: 0,
      height: 10,
      right: 200,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Tap at x=50 => 25% => 25s
    const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(touchEvent, 'touches', {
      value: [{ clientX: 50 }],
    });

    const played = nn(el.querySelector('.op-controls__progress--played')) as HTMLElement;
    played.dispatchEvent(touchEvent);

    expect(p.currentTime).toBeCloseTo(25, 3);
  });

  test('rail tap-to-seek does not seek when seeking is disabled (overlay canSeek=false)', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 0;

    // Disable seeking via overlay manager
    const om = getOverlayManager(p) as OverlayManager;
    om.active = { canSeek: false } as OverlayState;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);
    el.getBoundingClientRect = () => ({
      left: 0,
      width: 200,
      top: 0,
      height: 10,
      right: 200,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(touchEvent, 'touches', { value: [{ clientX: 150 }] }); // 75%
    const played = nn(el.querySelector('.op-controls__progress--played')) as HTMLElement;
    played.dispatchEvent(touchEvent);

    expect(p.currentTime).toBe(0);
  });

  test('rail tap-to-seek ignored when duration is Infinity (live-ish)', () => {
    const p = makeCore();
    (p.media as any).duration = Infinity;
    p.media.currentTime = 0;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);
    el.getBoundingClientRect = () => ({
      left: 0,
      width: 200,
      top: 0,
      height: 10,
      right: 200,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(touchEvent, 'touches', { value: [{ clientX: 100 }] });
    const played = nn(el.querySelector('.op-controls__progress--played')) as HTMLElement;
    played.dispatchEvent(touchEvent);

    expect(p.currentTime).toBe(0);
  });

  test('playing event removes loading and error classes from slider', () => {
    const p = makeCore();
    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    slider.classList.add('loading');
    slider.classList.add('error');

    p.events.emit('playing');
    expect(slider.classList.contains('loading')).toBe(false);
    expect(slider.classList.contains('error')).toBe(false);
  });

  test('change event on slider seeks and releases pressed state', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 10;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    slider.max = '100';
    slider.value = '30';
    slider.classList.add('op-progress--pressed');

    slider.dispatchEvent(new Event('change'));
    expect(p.currentTime).toBe(30);
    expect(slider.classList.contains('op-progress--pressed')).toBe(false);
  });

  test('click on range input early-returns without seeking', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 0;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);
    el.getBoundingClientRect = () => ({
      left: 0,
      width: 200,
      top: 0,
      height: 10,
      right: 200,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    // Click event whose target is the range slider itself (should early-return, not seek)
    const clickEvent = new MouseEvent('click', { bubbles: true, clientX: 50 });
    slider.dispatchEvent(clickEvent);

    // currentTime should remain 0 because the early-return branch fired
    expect(p.currentTime).toBe(0);
  });

  test('click on progress container (not range input) triggers seekFromClientX', () => {
    const p = makeCore();
    (p.media as any).duration = 100;
    p.media.currentTime = 0;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    // Click directly on the container (not on the range input) — calls seekFromClientX
    const clickEvent = new MouseEvent('click', { bubbles: false, clientX: 50 });
    el.dispatchEvent(clickEvent);

    // jsdom returns width=0 for getBoundingClientRect, so pct clamps to 1 and seeks to duration
    expect(p.currentTime).toBeGreaterThan(0);
  });

  test('document pointermove outside progress hides tooltip', () => {
    const p = makeCore();
    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const tooltip = el.querySelector('.op-controls__tooltip') as HTMLElement;
    tooltip.classList.add('op-controls__tooltip--visible');

    // Move pointer over a non-progress element
    const outsideEl = document.createElement('div');
    document.body.appendChild(outsideEl);
    const moveEvent = new MouseEvent('pointermove', { bubbles: true });
    Object.defineProperty(moveEvent, 'target', { value: outsideEl });
    document.dispatchEvent(moveEvent);

    expect(tooltip.classList.contains('op-controls__tooltip--visible')).toBe(false);
  });
});
