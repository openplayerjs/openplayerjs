/** @jest-environment jsdom */

import type { OverlayState } from '@openplayerjs/core';
import { Core, getOverlayManager } from '@openplayerjs/core';
import createCaptionsControl from '../src/controls/captions';
import createCurrentTimeControl from '../src/controls/currentTime';
import createDurationControl from '../src/controls/duration';
import createFullscreenControl from '../src/controls/fullscreen';
import createPlayControl from '../src/controls/play';
import createProgressControl from '../src/controls/progress';
import createTimeControl from '../src/controls/time';
import createVolumeControl from '../src/controls/volume';

jest.useFakeTimers();

function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}

function makeCore() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Core(v, { plugins: [] });
  // Provide deterministic implementations for tests.
  p.play = jest.fn(async () => {
    p.events.emit('playing');
  }) as unknown as Core['play'];
  p.pause = jest.fn(() => {
    p.emit('cmd:pause');
    p.events.emit('pause');
  }) as unknown as Core['pause'];
  return p;
}

describe('UI Controls', () => {
  test('PlayControl toggles classes via playback events', async () => {
    const p = makeCore();
    const c = nn(createPlayControl());
    const el = c.create(p) as HTMLButtonElement;

    expect(el.classList.contains('op-controls__playpause')).toBe(true);
    p.events.emit('play');
    expect(el.classList.contains('op-controls__playpause--pause')).toBe(true);
    p.events.emit('pause');
    expect(el.classList.contains('op-controls__playpause--pause')).toBe(false);

    // click calls play/pause
    await el.click();
    expect(p.play).toHaveBeenCalled();
    p.state.transition('playing');
    // togglePlayback uses underlying media.paused; simulate playing.
    Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
    await el.click();
    expect(p.pause).toHaveBeenCalled();
  });

  test('VolumeControl reacts to media:volume and media:muted and preserves last volume on mute click', async () => {
    const p = makeCore();
    p.volume = 0.7;
    const c = nn(createVolumeControl());
    const el = c.create(p) as HTMLDivElement;
    const btn = el.querySelector('button.op-controls__mute') as HTMLButtonElement;
    expect(btn).toBeTruthy();

    // Volume event updates aria & progress
    Object.defineProperty(p.media, 'volume', { value: 0.4, configurable: true, writable: true });
    Object.defineProperty(p.media, 'muted', { value: false, configurable: true, writable: true });
    p.events.emit('volumechange');
    const display = el.querySelector('progress.op-controls__volume--display') as HTMLProgressElement;
    expect(display.value).toBeCloseTo(4, 3);

    // mute toggles to 0 volume
    btn.click();
    expect(p.muted).toBe(true);
    expect(p.volume).toBe(0);

    // unmute restores last non-zero
    btn.click();
    expect(p.muted).toBe(false);
    expect(p.volume).toBeGreaterThan(0);
  });

  test('ProgressControl updates played/buffered and seeking emits playback:seek', () => {
    const p = makeCore();
    const c = nn(createProgressControl());
    const el = c.create(p) as HTMLDivElement;

    const input = el.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    // overlay manager affects duration/value
    const ov = getOverlayManager(p);
    const overlay: OverlayState = { id: 'x', priority: 10, mode: 'normal', duration: 100, value: 10, canSeek: true };
    ov.activate(overlay);
    p.events.emit('durationchange');
    p.events.emit('timeupdate');
    expect(input.max).toBe('100');

    input.dispatchEvent(new Event('pointerdown'));
    input.value = '25';
    input.dispatchEvent(new Event('input'));
    expect(p.currentTime).toBe(25);
    input.dispatchEvent(new Event('pointerup'));
  });

  test('Time + Duration reflect overlay duration/time when active', () => {
    const p = makeCore();
    const t = nn(createCurrentTimeControl()).create(p) as HTMLElement;
    const d = nn(createDurationControl()).create(p) as HTMLElement;

    const ov = getOverlayManager(p);
    const overlay: OverlayState = { id: 'x', priority: 10, mode: 'normal', duration: 80, value: 6, canSeek: true };
    ov.activate(overlay);
    p.events.emit('timeupdate');
    p.events.emit('durationchange');

    expect(t.innerText).toContain('0:06');
    expect(d.innerText).toContain('1:20');
  });

  test('Captions control toggles text tracks', async () => {
    const p = makeCore();
    const c = nn(createCaptionsControl());
    const el = c.create(p) as HTMLButtonElement;

    // Provide stub tracks
    const track1 = { mode: 'disabled' as TextTrackMode } as unknown as TextTrack;
    const track2 = { mode: 'showing' as TextTrackMode } as unknown as TextTrack;
    const tracks = [track1, track2] as unknown as TextTrackList;
    Object.defineProperty(p.media, 'textTracks', {
      configurable: true,
      value: tracks,
    });

    el.click();
    expect(track1.mode).toBe('disabled');
    expect(track2.mode).toBe('showing');
  });

  test('TimeControl renders currentTime, delimiter, and duration in one container', () => {
    const p = makeCore();
    const c = nn(createTimeControl());
    const el = c.create(p) as HTMLElement;

    expect(el.className).toBe('op-controls-time');
    expect(el.querySelector('.op-controls__current')).not.toBeNull();
    expect(el.querySelector('.op-controls__time-delimiter')).not.toBeNull();
    expect(el.querySelector('.op-controls__duration')).not.toBeNull();
    c.destroy?.();
  });

  test('Fullscreen control emits and toggles css class', async () => {
    const p = makeCore();
    const c = nn(createFullscreenControl());
    const el = c.create(p) as HTMLButtonElement;

    document.body.appendChild(el);
    // Mock requestFullscreen
    const container = p.media.parentElement as HTMLElement & {
      requestFullscreen: jest.Mock<Promise<void>, []>;
    };
    container.requestFullscreen = jest.fn().mockResolvedValue(undefined);
    const doc = document as Document & { exitFullscreen: jest.Mock<Promise<void>, []> };
    doc.exitFullscreen = jest.fn().mockResolvedValue(undefined);

    // FullscreenControl reacts to document fullscreenchange events.
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => document.body,
    });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(el.classList.contains('op-controls__fullscreen--out')).toBe(true);

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => null,
    });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(el.classList.contains('op-controls__fullscreen--out')).toBe(false);
  });
});
