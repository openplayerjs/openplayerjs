/** @jest-environment jsdom */

import { Core } from '@openplayerjs/core';
import type { Control } from '../src/control';
import createPlayControl from '../src/controls/play';
import createVolumeControl from '../src/controls/volume';
import { createUI } from '../src/ui';

function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}

function makeCore() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return new Core(v, { plugins: [] });
}

function makeAudioCore() {
  const a = document.createElement('audio');
  a.src = 'https://example.com/audio.mp3';
  document.body.appendChild(a);
  return new Core(a, { plugins: [] });
}

async function flushTimersAndMicrotasks() {
  jest.advanceTimersByTime(0);
  await Promise.resolve();
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('UI createUI + controls autohide', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('createUI wraps media and adds focusable media container', () => {
    const p = makeCore();
    const media = p.media;

    const controls = [createPlayControl(), createVolumeControl()].filter(Boolean) as Control[];
    createUI(p, media, controls);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    expect(wrapper).toBeTruthy();
    const mediaContainer = wrapper.querySelector('.op-media') as HTMLDivElement;
    expect(mediaContainer).toBeTruthy();
    expect(mediaContainer.tabIndex).toBe(0);

    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;
    expect(controlsRoot).toBeTruthy();
    expect(controlsRoot.querySelector('.op-controls-layer__top')).toBeTruthy();
    expect(controlsRoot.querySelector('.op-controls-layer__bottom')).toBeTruthy();
  });

  test('pointer move shows controls then hides after 3s and sets hidden class on media container', async () => {
    const p = makeCore();
    const media = p.media;
    // Simulate playing so scheduleHide is active
    Object.defineProperty(media, 'paused', { value: false, configurable: true });
    const pc = nn(createPlayControl());
    createUI(p, media, [pc]);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    (document.activeElement as HTMLElement | null)?.blur?.();
    wrapper.dispatchEvent(new Event('pointermove', { bubbles: true }));
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    outside.focus();
    expect(wrapper.contains(document.activeElement)).toBe(false);

    jest.advanceTimersByTime(3100);
    await flushTimersAndMicrotasks();

    await flushTimersAndMicrotasks();
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');
  });

  test('focus inside controls keeps it visible longer and hides after ~6.5s', () => {
    const p = makeCore();
    const media = p.media;
    // Simulate playing so scheduleHide fires
    Object.defineProperty(media, 'paused', { value: false, configurable: true });
    const controls = [createPlayControl(), createVolumeControl()].filter(Boolean) as Control[];
    createUI(p, media, controls);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    const playBtn = controlsRoot.querySelector('.op-controls__playpause') as HTMLButtonElement;
    playBtn.focus();
    controlsRoot.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    jest.advanceTimersByTime(3000);
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    jest.advanceTimersByTime(4000);
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');
  });

  test('when media area is focused and keydown happens, controls remain visible (timer cleared)', async () => {
    const p = makeCore();
    // Simulate playing so the initial pointermove → hide chain works
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    const pc = nn(createPlayControl());
    createUI(p, p.media, [pc]);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const mediaContainer = wrapper.querySelector('.op-media') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    wrapper.dispatchEvent(new Event('pointermove', { bubbles: true }));
    jest.advanceTimersByTime(3100);
    await Promise.resolve();
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');

    mediaContainer.focus();
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    jest.advanceTimersByTime(7000);
    await Promise.resolve();
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');
  });

  test('when controls have focus and last interaction was pointer, hideControls is skipped', async () => {
    const p = makeCore();
    // Simulate playing so scheduleHide fires
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    const pc = nn(createPlayControl());
    createUI(p, p.media, [pc]);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;
    const playBtn = controlsRoot.querySelector('.op-controls__playpause') as HTMLButtonElement;

    playBtn.focus();
    // pointer interaction sets lastInteraction to 'pointer'
    wrapper.dispatchEvent(new Event('pointermove', { bubbles: true }));

    jest.advanceTimersByTime(3100);
    await flushTimersAndMicrotasks();

    // should remain visible because controls still have focus
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');
  });

  test('keydown while controls have focus keeps controls visible for keyboard duration then hides', async () => {
    const p = makeCore();
    // Simulate playing so scheduleHide fires
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    const controls = [createPlayControl(), createVolumeControl()].filter(Boolean) as Control[];
    createUI(p, p.media, controls);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;
    const playBtn = controlsRoot.querySelector('.op-controls__playpause') as HTMLButtonElement;

    playBtn.focus();
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    jest.advanceTimersByTime(3000);
    await flushTimersAndMicrotasks();
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    // total > 6500ms keyboard show duration
    jest.advanceTimersByTime(4000);
    await flushTimersAndMicrotasks();
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');
  });

  test('autoplay-unmute button is removed when volumechange reports unmuted', async () => {
    // maybeAutoplayUnmute is only executed for the audio UI.
    const p = makeAudioCore();

    type AutoplayHack = Core & {
      canAutoplay: boolean;
      canAutoplayMuted: boolean;
      play: () => Promise<void>;
    };
    const ph = p as unknown as AutoplayHack;

    // Make maybeAutoplayUnmute deterministic in jsdom by executing the queued microtask immediately.
    const qmSpy = jest.spyOn(globalThis, 'queueMicrotask').mockImplementation((cb) => cb());

    // Force maybeAutoplayUnmute path.
    ph.canAutoplay = false;
    ph.canAutoplayMuted = true;
    p.media.autoplay = true;
    ph.play = jest.fn().mockResolvedValue(undefined);

    const pc = nn(createPlayControl());
    createUI(p, p.media, [pc]);

    await flushMicrotasks();

    expect(document.querySelector('.op-player__unmute')).toBeTruthy();

    p.muted = false;
    p.events.emit('volumechange');
    await Promise.resolve();

    expect(document.querySelector('.op-player__unmute')).toBeFalsy();

    qmSpy.mockRestore();
  });

  // ── New tests for play-state-gated autohide ───────────────────────────────

  test('controls do not hide on pointer interaction when media is paused', async () => {
    const p = makeCore();
    // media.paused defaults to true in jsdom
    createUI(p, p.media, []);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    wrapper.dispatchEvent(new Event('pointermove', { bubbles: true }));
    jest.advanceTimersByTime(4000);
    await flushTimersAndMicrotasks();

    // scheduleHide returns early when paused — controls must stay visible
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');
  });

  test('pause event shows controls and cancels any pending hide timer', async () => {
    const p = makeCore();
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    createUI(p, p.media, []);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    // Start a hide timer via pointermove while playing
    wrapper.dispatchEvent(new Event('pointermove', { bubbles: true }));

    // Media pauses — handler must show controls
    Object.defineProperty(p.media, 'paused', { value: true, configurable: true });
    p.events.emit('pause');

    // Advance past the 3 s timer that was queued before the pause
    jest.advanceTimersByTime(4000);
    await flushTimersAndMicrotasks();

    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');
  });

  test('playing event schedules a hide timer', async () => {
    const p = makeCore();
    // Start paused — no timer active yet
    createUI(p, p.media, []);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    // Simulate playback starting; also make the guard pass
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    p.events.emit('playing');

    // Controls are still visible immediately
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    // After the POINTER_SHOW_MS (3 s) timeout, controls hide
    jest.advanceTimersByTime(3100);
    await flushTimersAndMicrotasks();

    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');
  });

  test('ended event shows controls even if they were previously hidden', async () => {
    const p = makeCore();
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    createUI(p, p.media, []);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    // Hide controls via the playing-event timer
    p.events.emit('playing');
    jest.advanceTimersByTime(3100);
    await flushTimersAndMicrotasks();
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');

    // Media ends — controls must reappear
    Object.defineProperty(p.media, 'paused', { value: true, configurable: true });
    p.events.emit('ended');

    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');
  });
});
