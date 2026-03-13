/** @jest-environment jsdom */

import { Core } from '@openplayerjs/core';
import createFullscreenControl from '../src/controls/fullscreen';

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

describe('FullscreenControl branch coverage', () => {
  test('click enters, click again exits (branch: getFullscreenElement truthy)', async () => {
    const p = makeCore();
    const c = createFullscreenControl();
    type FullscreenControlHack = typeof c & { resolveFullscreenContainer: () => HTMLElement };
    const ch = c as unknown as FullscreenControlHack;
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    // Mock requestFullscreen + fullscreenElement tracking
    const container = nn(ch.resolveFullscreenContainer()) as HTMLElement;

    let fsEl: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return fsEl;
      },
    });

    const containerFs = container as HTMLElement & {
      requestFullscreen: jest.Mock<Promise<void>, [FullscreenOptions?]>;
    };
    containerFs.requestFullscreen = jest.fn(async () => {
      fsEl = container;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    const doc = document as Document & {
      exitFullscreen: jest.Mock<Promise<void>, []>;
    };
    doc.exitFullscreen = jest.fn(async () => {
      fsEl = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    btn.click();
    expect(containerFs.requestFullscreen).toHaveBeenCalled();

    // second click should exit
    btn.click();
    expect(doc.exitFullscreen).toHaveBeenCalled();
  });

  test('Escape key exits when fullscreen is active (keydown branch)', () => {
    const p = makeCore();
    const c = createFullscreenControl();
    type FullscreenControlHack = typeof c & { resolveFullscreenContainer: () => HTMLElement };
    const ch = c as unknown as FullscreenControlHack;
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    const container = nn(ch.resolveFullscreenContainer()) as HTMLElement;

    // Pretend fullscreen is active
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return container;
      },
    });

    const doc = document as Document & { exitFullscreen: jest.Mock<void, []> };
    doc.exitFullscreen = jest.fn();

    // Force internal isFullscreen true by dispatching fullscreenchange
    document.dispatchEvent(new Event('fullscreenchange'));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(doc.exitFullscreen).toHaveBeenCalled();
  });

  test('resize() enters width/height=true branches when screen dimensions are non-zero', async () => {
    // Mock non-zero screen dimensions so resize(screenW, screenH) takes if(width)/if(height) true branches
    const originalScreen = window.screen;
    Object.defineProperty(window, 'screen', {
      value: { width: 1280, height: 720, orientation: undefined },
      configurable: true,
    });

    // Wrap media in .op-media inside .op-player so mediaContainer !== container covers line 65/75
    const opPlayer = document.createElement('div');
    opPlayer.className = 'op-player';
    document.body.appendChild(opPlayer);
    const opMedia = document.createElement('div');
    opMedia.className = 'op-media';
    opPlayer.appendChild(opMedia);

    const v = document.createElement('video');
    v.src = 'https://example.com/video.mp4';
    opMedia.appendChild(v);
    const p = new Core(v, { plugins: [] });

    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    opPlayer.appendChild(btn);

    let fsEl: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return fsEl;
      },
    });

    const containerAny = opPlayer as unknown as HTMLElement & {
      requestFullscreen: jest.Mock<Promise<void>, []>;
    };
    containerAny.requestFullscreen = jest.fn(async () => {
      fsEl = opPlayer;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    const docAny = document as Document & { exitFullscreen: jest.Mock<Promise<void>, []> };
    docAny.exitFullscreen = jest.fn(async () => {
      fsEl = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    btn.click();
    // if(width) and if(height) branches should now execute (screenW=1280, screenH=720)
    expect(containerAny.requestFullscreen).toHaveBeenCalled();
    expect(opPlayer.style.width).toBe('100%');
    expect(opPlayer.style.height).toBe('100%');
    // video.style.width and opMedia.style.width set (mediaContainer !== container)
    expect(v.style.width).toBe('100%');
    expect(opMedia.style.width).toBe('100%');

    Object.defineProperty(window, 'screen', { value: originalScreen, configurable: true });
    c.destroy?.();
  });

  test('onOverlayChanged dispatches fullscreenchange when fullscreen element exists', () => {
    const p = makeCore();
    const c = createFullscreenControl();
    type FullscreenControlHack = typeof c & {
      resolveFullscreenContainer: () => HTMLElement;
      onOverlayChanged: () => void;
    };
    const ch = c as unknown as FullscreenControlHack;
    ch.create(p);

    const container = nn(ch.resolveFullscreenContainer()) as HTMLElement;

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return container;
      },
    });

    const spy = jest.fn();
    document.addEventListener('fullscreenchange', spy);

    ch.onOverlayChanged();
    expect(spy).toHaveBeenCalled();
  });
});
