/** @jest-environment jsdom */

import { Player } from '@openplayer/core';
import createFullscreenControl from '../src/controls/fullscreen';

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
    const p = makePlayer();
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

  test('onOverlayChanged dispatches fullscreenchange when fullscreen element exists', () => {
    const p = makePlayer();
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
