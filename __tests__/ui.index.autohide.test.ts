/** @jest-environment jsdom */

import { Player } from '../src/core/player';
import type { Control } from '../src/ui/control';
import createPlayControl from '../src/ui/controls/play';
import createVolumeControl from '../src/ui/controls/volume';
import { createUI } from '../src/ui/index';

function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}

function makePlayer() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return new Player(v, { plugins: [] });
}

async function flushTimersAndMicrotasks() {
  // Flush pending timers (including 0ms timers created by focusout defers)
  jest.runOnlyPendingTimers();
  // Flush microtasks
  await Promise.resolve();
}

describe('UI createUI + controls autohide', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('createUI wraps media and adds focusable media container', () => {
    const p = makePlayer();
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
    // grid sections exist
    expect(controlsRoot.querySelector('.op-controls-layer__top')).toBeTruthy();
    expect(controlsRoot.querySelector('.op-controls-layer__bottom')).toBeTruthy();
  });

  test('pointer move shows controls then hides after 3s and sets hidden class on media container', async () => {
    const p = makePlayer();
    const media = p.media;
    const pc = nn(createPlayControl());
    createUI(p, media, [pc]);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;
    const mediaContainer = wrapper.querySelector('.op-media') as HTMLDivElement;

    // initial: visible
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    (document.activeElement as HTMLElement | null)?.blur?.();
    wrapper.dispatchEvent(new Event('pointermove', { bubbles: true }));
    // visible & scheduled
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    // IMPORTANT:
    // Do NOT focus the wrapper here: wrapper.focusin cancels the hide timer when focus is in the media area.
    // Instead, move focus to an element OUTSIDE the player to ensure controlsHaveFocus() is false at hide-time.
    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    outside.focus();
    expect(wrapper.contains(document.activeElement)).toBe(false);

    jest.advanceTimersByTime(3100);
    await flushTimersAndMicrotasks();

    // Some paths schedule a 0ms follow-up to re-check focus before hiding.
    // Run any remaining pending timers.
    await flushTimersAndMicrotasks();

    // If something re-showed controls in the same tick, ensure we’ve flushed everything
    // before asserting.
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');
    expect(mediaContainer.classList.contains('op-media--controls-hidden')).toBe(true);
  });

  test('focus inside controls keeps it visible longer and hides after ~6.5s', () => {
    const p = makePlayer();
    const media = p.media;
    const controls = [createPlayControl(), createVolumeControl()].filter(Boolean) as Control[];
    createUI(p, media, controls);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    // Focus play button
    const playBtn = controlsRoot.querySelector('.op-controls__playpause') as HTMLButtonElement;
    playBtn.focus();
    controlsRoot.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    // should remain visible
    jest.advanceTimersByTime(3000);
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    // after KEYBOARD_SHOW_MS
    jest.advanceTimersByTime(4000);
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');
  });

  test('when media area is focused and keydown happens, controls remain visible (timer cleared)', async () => {
    const p = makePlayer();
    const pc = nn(createPlayControl());
    createUI(p, p.media, [pc]);

    const wrapper = document.querySelector('.op-player') as HTMLDivElement;
    const mediaContainer = wrapper.querySelector('.op-media') as HTMLDivElement;
    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;

    // hide first
    wrapper.dispatchEvent(new Event('pointermove', { bubbles: true }));
    jest.advanceTimersByTime(3100);
    await Promise.resolve();
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');

    mediaContainer.focus();
    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');

    jest.advanceTimersByTime(7000);
    await Promise.resolve();
    // still visible because focus in media area cancels hide timer
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('false');
  });
});
