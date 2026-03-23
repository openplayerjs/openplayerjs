/** @jest-environment jsdom */

import { Core, getOverlayManager, type OverlayState } from '@openplayerjs/core';
import createFullscreenControl from '../src/controls/fullscreen';

jest.useFakeTimers();

function makeCore(video?: HTMLVideoElement) {
  const v = video ?? document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return new Core(v, { plugins: [] });
}

describe('BaseControl branch coverage', () => {
  describe('resolvePlayerRoot()', () => {
    test('returns media.closest(.op-player) when it exists', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'op-player';
      document.body.appendChild(wrapper);
      const v = document.createElement('video');
      v.src = 'https://example.com/video.mp4';
      wrapper.appendChild(v);

      // Create Core directly — do NOT use makeCore() which would move v to body via appendChild
      const p = new Core(v, { plugins: [] });
      const c = createFullscreenControl();
      c.create(p);

      const root = (c as any).resolvePlayerRoot() as HTMLElement;
      expect(root).toBe(wrapper);
    });

    test('returns media.parentElement when no .op-player ancestor exists', () => {
      const parent = document.createElement('div');
      // No op-player class
      document.body.appendChild(parent);
      const v = document.createElement('video');
      v.src = 'https://example.com/video.mp4';
      parent.appendChild(v);

      // Create Core directly — do NOT use makeCore() which re-appends v to body
      const p = new Core(v, { plugins: [] });
      const c = createFullscreenControl();
      c.create(p);

      const root = (c as any).resolvePlayerRoot() as HTMLElement;
      expect(root).toBe(parent);
    });

    test('returns document.body when media has no parentElement', () => {
      const v = document.createElement('video');
      // Do NOT append to DOM — no parentElement
      const p = new Core(v, { plugins: [] });
      const c = createFullscreenControl();
      c.create(p);

      const root = (c as any).resolvePlayerRoot() as HTMLElement;
      expect(root).toBe(document.body);
    });

    test('returns document.body when core.media is null (line 70 true branch)', () => {
      const p = makeCore();
      const c = createFullscreenControl();
      c.create(p);

      // Force media to null after create so resolvePlayerRoot hits the !media guard
      (c as any).core = { ...(c as any).core, media: null };
      const root = (c as any).resolvePlayerRoot() as HTMLElement;
      expect(root).toBe(document.body);
    });
  });

  describe('resolveFullscreenContainer()', () => {
    test('returns activeOverlay.fullscreenEl when overlay has one', () => {
      const p = makeCore();
      const c = createFullscreenControl();
      c.create(p);

      const fakeEl = document.createElement('div');
      getOverlayManager(p).activate({
        id: 'ads',
        priority: 100,
        mode: 'normal',
        duration: 30,
        value: 0,
        canSeek: false,
        fullscreenEl: fakeEl,
      } as OverlayState);

      const container = (c as any).resolveFullscreenContainer() as HTMLElement;
      expect(container).toBe(fakeEl);
    });

    test('falls back to resolvePlayerRoot when overlay has no fullscreenEl', () => {
      const p = makeCore();
      const c = createFullscreenControl();
      c.create(p);

      // Activate overlay WITHOUT fullscreenEl
      getOverlayManager(p).activate({
        id: 'ads-no-el',
        priority: 100,
        mode: 'normal',
        duration: 30,
        value: 0,
        canSeek: false,
      } as OverlayState);

      const container = (c as any).resolveFullscreenContainer() as HTMLElement;
      // Should be the player root, not undefined
      expect(container).toBeTruthy();
      expect(container).not.toBe(undefined);
    });
  });

  describe('resolveFullscreenVideoEl()', () => {
    test('returns activeOverlay.fullscreenVideoEl when overlay has one', () => {
      const p = makeCore();
      const c = createFullscreenControl();
      c.create(p);

      const fakeVideo = document.createElement('video');
      getOverlayManager(p).activate({
        id: 'ads-vid',
        priority: 100,
        mode: 'normal',
        duration: 30,
        value: 0,
        canSeek: false,
        fullscreenVideoEl: fakeVideo,
      } as OverlayState);

      const el = (c as any).resolveFullscreenVideoEl() as HTMLElement;
      expect(el).toBe(fakeVideo);
    });

    test('falls back to core.media when overlay has no fullscreenVideoEl', () => {
      const p = makeCore();
      const c = createFullscreenControl();
      c.create(p);

      // Activate overlay WITHOUT fullscreenVideoEl
      getOverlayManager(p).activate({
        id: 'ads-no-vid',
        priority: 100,
        mode: 'normal',
        duration: 30,
        value: 0,
        canSeek: false,
      } as OverlayState);

      const el = (c as any).resolveFullscreenVideoEl() as HTMLElement;
      expect(el).toBe(p.media);
    });

    test('returns null when core.media is null (line 81 ?? null fallback)', () => {
      const p = makeCore();
      const c = createFullscreenControl();
      c.create(p);

      // Force core.media to null — no overlay, no media
      (c as any).core = { ...(c as any).core, media: null };
      (c as any).activeOverlay = null;
      const el = (c as any).resolveFullscreenVideoEl();
      expect(el).toBeNull();
    });
  });
});
