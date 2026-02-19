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
  jest.runOnlyPendingTimers();
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
    expect(mediaContainer.tabIndex).toBe(-1);

    const controlsRoot = wrapper.querySelector('.op-controls') as HTMLDivElement;
    expect(controlsRoot).toBeTruthy();
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
    const p = makePlayer();
    const media = p.media;
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
    const p = makePlayer();
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
});
