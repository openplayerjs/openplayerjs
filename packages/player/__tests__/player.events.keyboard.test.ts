/** @jest-environment jsdom */

import { Core, getOverlayManager } from '@openplayerjs/core';
import { bindCenterOverlay } from '../src/events';
import { createCenterOverlayDom } from '../src/overlay';

jest.useFakeTimers();

function makeCore() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Core(v, { plugins: [] });
  // Stub play/pause to avoid jsdom play rejection and to drive state
  p.play = jest.fn(async () => {
    p.events.emit('playing');
  }) as unknown as Core['play'];
  p.pause = jest.fn(() => {
    p.events.emit('pause');
  }) as unknown as Core['pause'];
  return p;
}

describe('ui/events keyboard bindings', () => {
  test('Space/Enter on focused play and mute buttons triggers click', async () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    const bindings = createCenterOverlayDom(p);
    wrapper.appendChild(bindings.button);
    wrapper.appendChild(bindings.loader);

    // Create fake controls buttons to focus
    const controls = document.createElement('div');
    controls.className = 'op-controls';
    const playBtn = document.createElement('button');
    playBtn.className = 'op-controls__playpause';
    const muteBtn = document.createElement('button');
    muteBtn.className = 'op-controls__mute';
    controls.append(playBtn, muteBtn);
    wrapper.appendChild(controls);

    const playClick = jest.fn();
    const muteClick = jest.fn();
    playBtn.addEventListener('click', playClick);
    muteBtn.addEventListener('click', muteClick);

    bindCenterOverlay(p, wrapper, bindings);

    playBtn.focus();
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(playClick).toHaveBeenCalled();

    muteBtn.focus();
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(muteClick).toHaveBeenCalled();
  });

  test('ArrowUp/ArrowDown change volume and clamp; mute toggle restores last non-zero volume', async () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    const bindings = createCenterOverlayDom(p);
    wrapper.appendChild(bindings.button);
    wrapper.appendChild(bindings.loader);

    bindCenterOverlay(p, wrapper, bindings);

    p.volume = 0.5;
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(p.volume).toBeCloseTo(0.4, 5);

    // clamp at 0
    for (let i = 0; i < 20; i++) {
      wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    }
    expect(p.volume).toBe(0);

    // ArrowUp increases and stores lastVol
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(p.volume).toBeGreaterThan(0);

    // Mute then unmute restores last non-zero
    const before = p.volume;
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'M', bubbles: true }));
    expect(p.muted).toBe(true);
    expect(p.volume).toBe(0);

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'M', bubbles: true }));
    expect(p.muted).toBe(false);
    expect(p.volume).toBeCloseTo(before, 5);
  });

  test('Home/End and < > keys update time and rate', () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    const bindings = createCenterOverlayDom(p);
    wrapper.appendChild(bindings.button);
    wrapper.appendChild(bindings.loader);

    bindCenterOverlay(p, wrapper, bindings);

    // duration finite — set media.duration so bindMediaSync reads 100
    Object.defineProperty(p.media, 'duration', { value: 100, configurable: true, writable: true });
    p.events.emit('durationchange');
    p.currentTime = 50;

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(p.currentTime).toBe(0);

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(p.currentTime).toBe(100);

    p.playbackRate = 1;
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: '<', bubbles: true }));
    expect(p.playbackRate).toBeCloseTo(0.75, 5);
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: '>', bubbles: true }));
    expect(p.playbackRate).toBeCloseTo(1, 5);
  });

  test('window pointer/keyboard modality toggles class', () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player op-player__keyboard--inactive';
    document.body.appendChild(wrapper);

    const bindings = createCenterOverlayDom(p);
    wrapper.appendChild(bindings.button);
    wrapper.appendChild(bindings.loader);

    bindCenterOverlay(p, wrapper, bindings);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }));
    expect(wrapper.classList.contains('op-player__keyboard--inactive')).toBe(false);

    window.dispatchEvent(new Event('click'));
    expect(wrapper.classList.contains('op-player__keyboard--inactive')).toBe(true);
  });

  test('lastNonZeroVolume initializes to 1 when core.volume is 0 (|| 1 fallback)', () => {
    const p = makeCore();
    p.volume = 0; // force volume to 0 before binding
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    const bindings = createCenterOverlayDom(p);
    bindCenterOverlay(p, wrapper, bindings);

    // Unmute immediately (muted=false, lastNonZeroVolume=1 from || 1 init)
    p.muted = false;
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'M', bubbles: true }));
    // Press M again to unmute; restore = lastNonZeroVolume > 0 ? ... : 1 = 1
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'M', bubbles: true }));
    expect(p.volume).toBeGreaterThan(0);
  });

  test('custom step config > 0 is used for seek instead of default 5', () => {
    const v = document.createElement('video');
    v.src = 'https://example.com/video.mp4';
    document.body.appendChild(v);
    // Pass step=10 via config
    const p = new Core(v, { plugins: [], step: 10 } as any);
    Object.defineProperty(v, 'duration', { value: 100, configurable: true, writable: true });
    p.events.emit('durationchange');
    p.currentTime = 50;

    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    const bindings = createCenterOverlayDom(p);
    bindCenterOverlay(p, wrapper, bindings);

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(p.currentTime).toBeCloseTo(40, 3); // seeks back by 10, not 5
  });

  test('f key triggers mozRequestFullScreen when requestFullscreen is absent', () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    const bindings = createCenterOverlayDom(p);
    bindCenterOverlay(p, wrapper, bindings);

    const mozFn = jest.fn();
    // Set mozRequestFullScreen on wrapper (the keydown target)
    (wrapper as any).mozRequestFullScreen = mozFn;

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));
    expect(mozFn).toHaveBeenCalled();
  });

  test('f key triggers webkitRequestFullScreen when only webkit prefix exists', () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    const bindings = createCenterOverlayDom(p);
    bindCenterOverlay(p, wrapper, bindings);

    const webkitFn = jest.fn();
    (wrapper as any).mozRequestFullScreen = undefined;
    (wrapper as any).webkitRequestFullScreen = webkitFn;

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'F', bubbles: true }));
    expect(webkitFn).toHaveBeenCalled();
  });

  test('M key: pressing mute when volume already 0 does not store lastNonZeroVolume', () => {
    const p = makeCore();
    p.volume = 0;
    p.muted = false;
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    const bindings = createCenterOverlayDom(p);
    bindCenterOverlay(p, wrapper, bindings);

    // Mute when volume is already 0
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
    expect(p.muted).toBe(true);
    expect(p.volume).toBe(0);
  });

  test('ArrowDown with active overlay ad media syncs volume to ad element', async () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    const bindings = createCenterOverlayDom(p);
    bindCenterOverlay(p, wrapper, bindings);

    const adMedia = document.createElement('video');
    getOverlayManager(p).activate({
      id: 'ads-evt',
      priority: 100,
      mode: 'normal',
      duration: 30,
      value: 5,
      canSeek: false,
      fullscreenVideoEl: adMedia,
    });

    p.volume = 0.8;
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(adMedia.volume).toBeCloseTo(0.7, 5);
  });

  test('M key: unmute with active overlay ad media syncs volume restore', () => {
    const p = makeCore();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);
    const bindings = createCenterOverlayDom(p);
    bindCenterOverlay(p, wrapper, bindings);

    const adMedia = document.createElement('video');
    getOverlayManager(p).activate({
      id: 'ads-m',
      priority: 100,
      mode: 'normal',
      duration: 30,
      value: 5,
      canSeek: false,
      fullscreenVideoEl: adMedia,
    });

    p.volume = 0.8;
    // Mute
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'M', bubbles: true }));
    expect(adMedia.muted).toBe(true);
    // Unmute
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'M', bubbles: true }));
    expect(adMedia.muted).toBe(false);
    expect(adMedia.volume).toBeGreaterThan(0);
  });
});
