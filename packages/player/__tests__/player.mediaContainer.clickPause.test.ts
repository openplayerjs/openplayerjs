/** @jest-environment jsdom */

import { Core, getOverlayManager } from '@openplayerjs/core';
import { createUI } from '../src/ui';

jest.mock('@openplayerjs/core', () => ({
  ...jest.requireActual('@openplayerjs/core'),
  isMobile: jest.fn(() => false),
}));

function makeVideo() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return v;
}

function setupVideoCore() {
  const video = makeVideo();
  const player = new Core(video, { plugins: [] });

  const pauseSpy = jest.fn(() => {
    player.events.emit('pause');
  });
  const playSpy = jest.fn(async () => {
    player.events.emit('playing');
  });
  player.pause = pauseSpy as any;
  player.play = playSpy as any;

  createUI(player, player.media, []);

  const wrapper = document.querySelector('.op-player') as HTMLDivElement;
  const mediaContainer = document.querySelector('.op-media') as HTMLDivElement;
  return { player, pauseSpy, playSpy, wrapper, mediaContainer };
}

function click(target: Element) {
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

describe('mediaContainer click-to-pause – video UI', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllTimers();
  });

  test('clicking the video area while playing pauses the video', () => {
    const { player, pauseSpy, mediaContainer } = setupVideoCore();

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });
    Object.defineProperty(player.media, 'ended', { value: false, configurable: true });

    click(mediaContainer);

    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });

  test('a pause flash is shown on the center button and clears after 350 ms', () => {
    const { player, mediaContainer } = setupVideoCore();

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });
    Object.defineProperty(player.media, 'ended', { value: false, configurable: true });

    click(mediaContainer);

    const btn = document.querySelector('.op-player__play') as HTMLButtonElement;
    expect(btn.classList.contains('op-player__play--flash')).toBe(true);

    jest.advanceTimersByTime(350);
    expect(btn.classList.contains('op-player__play--flash')).toBe(false);
  });

  test('clicking the video area while paused plays the video', async () => {
    const { player, playSpy, mediaContainer } = setupVideoCore();

    Object.defineProperty(player.media, 'paused', { value: true, configurable: true });
    Object.defineProperty(player.media, 'ended', { value: false, configurable: true });

    click(mediaContainer);
    await Promise.resolve();

    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  test('clicking while a LINEAR overlay (fullscreenVideoEl) is active does nothing', () => {
    const { player, pauseSpy, playSpy, mediaContainer } = setupVideoCore();

    const adVideo = document.createElement('video');
    getOverlayManager(player).activate({
      id: 'ads',
      priority: 100,
      mode: 'countdown',
      duration: 30,
      value: 30,
      canSeek: false,
      fullscreenVideoEl: adVideo as any,
    });

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });

    click(mediaContainer);

    expect(pauseSpy).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
  });

  test('clicking while a NON-LINEAR overlay (no fullscreenVideoEl) is active still pauses', () => {
    const { player, pauseSpy, mediaContainer } = setupVideoCore();

    // Non-linear ad: overlay registered but no separate fullscreen video
    getOverlayManager(player).activate({
      id: 'nonlinear',
      priority: 50,
      mode: 'normal',
      duration: 10,
      value: 0,
      canSeek: true,
    });

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });
    Object.defineProperty(player.media, 'ended', { value: false, configurable: true });

    click(mediaContainer);

    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });

  test('clicking a button descendant of mediaContainer does not toggle playback', () => {
    const { player, pauseSpy, playSpy, mediaContainer } = setupVideoCore();

    const innerBtn = document.createElement('button');
    mediaContainer.appendChild(innerBtn);

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });

    click(innerBtn);

    expect(pauseSpy).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
  });

  test('clicking a link descendant of mediaContainer does not toggle playback', () => {
    const { player, pauseSpy, mediaContainer } = setupVideoCore();

    const link = document.createElement('a');
    link.href = '#';
    mediaContainer.appendChild(link);

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });

    click(link);

    expect(pauseSpy).not.toHaveBeenCalled();
  });

  test('clicking directly on mediaContainer (not a descendant) triggers toggle', () => {
    const { player, pauseSpy, mediaContainer } = setupVideoCore();

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });
    Object.defineProperty(player.media, 'ended', { value: false, configurable: true });

    // Dispatch click where target IS mediaContainer itself
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(evt, 'target', { value: mediaContainer });
    mediaContainer.dispatchEvent(evt);

    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });

  test('clicking the .op-ads background during a non-linear ad pauses the video', () => {
    const { player, pauseSpy, wrapper } = setupVideoCore();

    // Simulate .op-ads covering the player (as the ads plugin creates it)
    const adsDiv = document.createElement('div');
    adsDiv.className = 'op-ads';
    wrapper.appendChild(adsDiv);

    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });
    Object.defineProperty(player.media, 'ended', { value: false, configurable: true });

    click(adsDiv);

    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });

  test('clicking inside the controls area does not toggle playback', () => {
    const { player, pauseSpy, playSpy } = setupVideoCore();

    const controlsRoot = document.querySelector('.op-controls') as HTMLDivElement;
    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });

    click(controlsRoot);

    expect(pauseSpy).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
  });
});

describe('mediaContainer click-to-pause – audio UI (excluded)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('audio player mediaContainer click does not toggle playback', () => {
    const audio = document.createElement('audio');
    audio.src = 'https://example.com/audio.mp3';
    document.body.appendChild(audio);

    const player = new Core(audio, { plugins: [] });
    const pauseSpy = jest.fn();
    player.pause = pauseSpy as any;

    createUI(player, player.media, []);

    const mediaContainer = document.querySelector('.op-media') as HTMLDivElement;
    Object.defineProperty(player.media, 'paused', { value: false, configurable: true });

    click(mediaContainer);

    expect(pauseSpy).not.toHaveBeenCalled();
  });
});
