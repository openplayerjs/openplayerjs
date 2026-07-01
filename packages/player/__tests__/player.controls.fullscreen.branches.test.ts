/** @jest-environment jsdom */

import { Core } from '@openplayerjs/core';
import createFullscreenControl from '../src/controls/fullscreen';

jest.useFakeTimers();

// ─── Test-only type helpers ───────────────────────────────────────────────────

// Exposes private methods on the fullscreen control for branch coverage
type FullscreenControlHandle = ReturnType<typeof createFullscreenControl> & {
  resolveFullscreenContainer: () => HTMLElement;
  onOverlayChanged: () => void;
};

// Vendor-prefixed fullscreen request methods (non-standard, browser-specific)
type VendorElement = HTMLElement & {
  mozRequestFullScreen?: (() => void) | (() => Promise<void>);
  webkitRequestFullScreen?: (() => void) | (() => Promise<void>);
  msRequestFullscreen?: (() => void) | (() => Promise<void>);
  webkitEnterFullscreen?: () => void;
};

// Vendor-prefixed fullscreen exit methods (non-standard, browser-specific)
type VendorDocument = Document & {
  mozCancelFullScreen?: () => void;
  webkitCancelFullScreen?: () => void;
  msExitFullscreen?: () => void;
};

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
    const ch = c as unknown as FullscreenControlHandle;
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

  test('requestFullscreen: uses mozRequestFullScreen when requestFullscreen absent', async () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    // Ensure no standard requestFullscreen on body/container
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return null;
      },
    });

    const container = (c as unknown as FullscreenControlHandle).resolveFullscreenContainer();
    // Remove standard requestFullscreen (if any) and add moz prefix
    Object.defineProperty(container, 'requestFullscreen', { value: undefined, configurable: true });
    const mozFn = jest.fn(async () => {});
    (container as VendorElement).mozRequestFullScreen = mozFn;

    btn.click();
    expect(mozFn).toHaveBeenCalled();
  });

  test('requestFullscreen: uses webkitRequestFullScreen when moz also absent', async () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return null;
      },
    });

    const container = (c as unknown as FullscreenControlHandle).resolveFullscreenContainer();
    Object.defineProperty(container, 'requestFullscreen', { value: undefined, configurable: true });
    (container as VendorElement).mozRequestFullScreen = undefined;
    const webkitFn = jest.fn(async () => {});
    (container as VendorElement).webkitRequestFullScreen = webkitFn;

    btn.click();
    expect(webkitFn).toHaveBeenCalled();
  });

  test('requestFullscreen: uses msRequestFullscreen when webkit also absent', async () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return null;
      },
    });

    const container = (c as unknown as FullscreenControlHandle).resolveFullscreenContainer();
    Object.defineProperty(container, 'requestFullscreen', { value: undefined, configurable: true });
    (container as VendorElement).mozRequestFullScreen = undefined;
    (container as VendorElement).webkitRequestFullScreen = undefined;
    const msFn = jest.fn(async () => {});
    (container as VendorElement).msRequestFullscreen = msFn;

    btn.click();
    expect(msFn).toHaveBeenCalled();
  });

  test('requestFullscreen: uses webkitEnterFullscreen as last resort', async () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return null;
      },
    });

    const container = (c as unknown as FullscreenControlHandle).resolveFullscreenContainer();
    Object.defineProperty(container, 'requestFullscreen', { value: undefined, configurable: true });
    (container as VendorElement).mozRequestFullScreen = undefined;
    (container as VendorElement).webkitRequestFullScreen = undefined;
    (container as VendorElement).msRequestFullscreen = undefined;
    const webkitEnterFn = jest.fn();
    (container as VendorElement).webkitEnterFullscreen = webkitEnterFn;

    btn.click();
    expect(webkitEnterFn).toHaveBeenCalled();
  });

  test('exitFullscreen: uses mozCancelFullScreen when exitFullscreen absent', () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    const container = (c as unknown as FullscreenControlHandle).resolveFullscreenContainer();
    let fsEl: Element | null = container;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return fsEl;
      },
    });
    // Remove standard exitFullscreen from document
    const origExit = document.exitFullscreen;
    Object.defineProperty(document, 'exitFullscreen', { value: undefined, configurable: true });

    const mozCancel = jest.fn(() => {
      fsEl = null;
    });
    (document as VendorDocument).mozCancelFullScreen = mozCancel;

    btn.click(); // getFullscreenElement() is truthy → calls exitFullscreen()
    expect(mozCancel).toHaveBeenCalled();

    // Restore
    Object.defineProperty(document, 'exitFullscreen', { value: origExit, configurable: true });
    delete (document as VendorDocument).mozCancelFullScreen;
  });

  test('exitFullscreen: uses msExitFullscreen when webkit also absent', () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    const container = (c as unknown as FullscreenControlHandle).resolveFullscreenContainer();
    let fsEl: Element | null = container;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return fsEl;
      },
    });
    const origExit = document.exitFullscreen;
    Object.defineProperty(document, 'exitFullscreen', { value: undefined, configurable: true });
    (document as VendorDocument).mozCancelFullScreen = undefined;
    (document as VendorDocument).webkitCancelFullScreen = undefined;

    const msExit = jest.fn(() => {
      fsEl = null;
    });
    (document as VendorDocument).msExitFullscreen = msExit;

    btn.click();
    expect(msExit).toHaveBeenCalled();

    Object.defineProperty(document, 'exitFullscreen', { value: origExit, configurable: true });
    delete (document as VendorDocument).msExitFullscreen;
  });

  test('exitFullscreen: uses webkitCancelFullScreen when moz absent', () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const btn = c.create(p) as HTMLButtonElement;
    document.body.appendChild(btn);

    const container = (c as unknown as FullscreenControlHandle).resolveFullscreenContainer();
    let fsEl: Element | null = container;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get() {
        return fsEl;
      },
    });
    const origExit = document.exitFullscreen;
    Object.defineProperty(document, 'exitFullscreen', { value: undefined, configurable: true });
    (document as VendorDocument).mozCancelFullScreen = undefined;

    const webkitCancel = jest.fn(() => {
      fsEl = null;
    });
    (document as VendorDocument).webkitCancelFullScreen = webkitCancel;

    btn.click();
    expect(webkitCancel).toHaveBeenCalled();

    Object.defineProperty(document, 'exitFullscreen', { value: origExit, configurable: true });
    delete (document as VendorDocument).webkitCancelFullScreen;
  });

  test('onOverlayChanged dispatches fullscreenchange when fullscreen element exists', () => {
    const p = makeCore();
    const c = createFullscreenControl();
    const ch = c as unknown as FullscreenControlHandle;
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
