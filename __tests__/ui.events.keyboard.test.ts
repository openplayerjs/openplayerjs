/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import { bindCenterOverlay } from '../src/ui/events';
import { createCenterOverlayDom } from '../src/ui/overlay';

jest.useFakeTimers();

function makePlayer() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Player(v, { plugins: [] });
  // Stub play/pause to avoid jsdom play rejection and to drive state
  p.play = jest.fn(async () => {
    p.events.emit('playback:playing');
  }) as any;
  p.pause = jest.fn(() => {
    p.events.emit('playback:paused');
  }) as any;
  return p;
}

describe('ui/events keyboard bindings', () => {
  test('Space/Enter on focused play and mute buttons triggers click', async () => {
    const p = makePlayer();
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

    bindCenterOverlay(p, bindings, wrapper);

    playBtn.focus();
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(playClick).toHaveBeenCalled();

    muteBtn.focus();
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(muteClick).toHaveBeenCalled();
  });

  test('ArrowUp/ArrowDown change volume and clamp; mute toggle restores last non-zero volume', async () => {
    const p = makePlayer();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    const bindings = createCenterOverlayDom(p);
    wrapper.appendChild(bindings.button);
    wrapper.appendChild(bindings.loader);

    bindCenterOverlay(p, bindings, wrapper);

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
    const p = makePlayer();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player';
    document.body.appendChild(wrapper);

    const bindings = createCenterOverlayDom(p);
    wrapper.appendChild(bindings.button);
    wrapper.appendChild(bindings.loader);

    bindCenterOverlay(p, bindings, wrapper);

    // duration finite
    p.events.emit('media:duration', 100);
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
    const p = makePlayer();
    const wrapper = document.createElement('div');
    wrapper.className = 'op-player op-player__keyboard--inactive';
    document.body.appendChild(wrapper);

    const bindings = createCenterOverlayDom(p);
    wrapper.appendChild(bindings.button);
    wrapper.appendChild(bindings.loader);

    bindCenterOverlay(p, bindings, wrapper);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }));
    expect(wrapper.classList.contains('op-player__keyboard--inactive')).toBe(false);

    window.dispatchEvent(new Event('click'));
    expect(wrapper.classList.contains('op-player__keyboard--inactive')).toBe(true);
  });
});
