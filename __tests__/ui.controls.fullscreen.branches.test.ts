/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import createFullscreenControl from '../src/ui/controls/fullscreen';

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

describe('FullscreenControl branch coverage', () => {
  test('click enters, click again exits (branch: getFullscreenElement truthy)', async () => {
    const p = makePlayer();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    // Mock requestFullscreen + fullscreenElement tracking
    const container = nn((c as any).resolveFullscreenContainer()) as HTMLElement;

    let fsEl: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return fsEl;
      },
    });

    (container as any).requestFullscreen = jest.fn(() => {
      fsEl = container;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    (document as any).exitFullscreen = jest.fn(() => {
      fsEl = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    btn.click();
    expect((container as any).requestFullscreen).toHaveBeenCalled();

    // second click should exit
    btn.click();
    expect((document as any).exitFullscreen).toHaveBeenCalled();
  });

  test('Escape key exits when fullscreen is active (keydown branch)', () => {
    const p = makePlayer();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    const container = nn((c as any).resolveFullscreenContainer()) as HTMLElement;

    // Pretend fullscreen is active
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return container;
      },
    });

    (document as any).exitFullscreen = jest.fn();

    // Force internal isFullscreen true by dispatching fullscreenchange
    document.dispatchEvent(new Event('fullscreenchange'));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect((document as any).exitFullscreen).toHaveBeenCalled();
  });

  test('onOverlayChanged dispatches fullscreenchange when fullscreen element exists', () => {
    const p = makePlayer();
    const c = createFullscreenControl() as any;
    c.create(p);

    const container = nn(c.resolveFullscreenContainer()) as HTMLElement;

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return container;
      },
    });

    const spy = jest.fn();
    document.addEventListener('fullscreenchange', spy);

    c.onOverlayChanged();
    expect(spy).toHaveBeenCalled();
  });
});
