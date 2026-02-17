/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import { getOverlayManager } from '../src/core/overlay';
import createProgressControl from '../src/ui/controls/progress';

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

describe('ProgressControl branch coverage', () => {
  test('hides for live/Infinity when no overlay', () => {
    const p = makePlayer();
    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    // Live stream path
    (p as any).isLive = true;
    p.events.emit('media:duration');
    expect(el.getAttribute('aria-hidden')).toBe('true');

    // Infinity duration path
    (p as any).isLive = false;
    (p.media as any).duration = Infinity;
    p.events.emit('media:duration');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  test('overlay enables visibility + seek disabled, and pressed blocks UI updates', () => {
    const p = makePlayer();
    (p.media as any).duration = 100;
    (p.media as any).currentTime = 10;

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

    p.events.emit('media:timeupdate');
    expect(el.getAttribute('aria-hidden')).toBe('false');
    expect(slider.disabled).toBe(true);
    expect(slider.classList.contains('op-progress--disabled')).toBe(true);

    // Pressed blocks updateUI branch
    const before = slider.value;
    slider.classList.add('op-progress--pressed');
    (p.media as any).currentTime = 15;
    p.events.emit('media:timeupdate');
    // value should not have been overwritten while pressed
    expect(slider.value).toBe(before);
  });

  test('waiting/play/ended branches touch loading/error and reset', () => {
    const p = makePlayer();
    (p.media as any).duration = 50;
    (p.media as any).currentTime = 1;

    const c = createProgressControl();
    const el = c.create(p);
    document.body.appendChild(el);

    const slider = nn(el.querySelector('input[type="range"]')) as HTMLInputElement;
    const buffer = nn(el.querySelector('progress')) as HTMLProgressElement;

    p.events.emit('playback:waiting');
    expect(slider.classList.contains('loading')).toBe(true);

    p.events.emit('playback:play'); // should clear loading/error and remove aria-valuenow/valuetext
    expect(slider.classList.contains('loading')).toBe(false);
    expect(el.hasAttribute('aria-valuenow')).toBe(false);

    // ended resets UI
    slider.max = '50';
    slider.style.backgroundSize = '10% 100%';
    buffer.value = 60;

    p.events.emit('playback:ended');
    expect(slider.max).toBe('0');
    expect(buffer.value).toBe(0);
    expect(slider.style.backgroundSize).toBe('0% 100%');
  });
});
