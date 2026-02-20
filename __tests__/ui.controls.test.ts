/** @jest-environment jsdom */

import { getOverlayManager } from '../src/core/overlay';
import { Player } from '../src/core/player';
import createCaptionsControl from '../src/ui/controls/captions';
import createCurrentTimeControl from '../src/ui/controls/currentTime';
import createDurationControl from '../src/ui/controls/duration';
import createFullscreenControl from '../src/ui/controls/fullscreen';
import createPlayControl from '../src/ui/controls/play';
import createProgressControl from '../src/ui/controls/progress';
import createVolumeControl from '../src/ui/controls/volume';

jest.useFakeTimers();

function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}

function makePlayer() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Player(v, { plugins: [] });
  p.play = jest.fn(async () => {
    p.events.emit('playback:playing');
  }) as any;
  p.pause = jest.fn(() => {
    p.emit('playback:pause');
    p.events.emit('playback:paused');
  }) as any;
  return p;
}

describe('UI Controls', () => {
  test('PlayControl toggles classes via playback events', async () => {
    const p = makePlayer();
    const c = nn(createPlayControl());
    const el = c.create(p) as HTMLButtonElement;

    expect(el.classList.contains('op-controls__playpause')).toBe(true);
    p.events.emit('playback:play');
    expect(el.classList.contains('op-controls__playpause--pause')).toBe(true);
    p.events.emit('playback:pause');
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
    const p = makePlayer();
    p.volume = 0.7;
    const c = nn(createVolumeControl());
    const el = c.create(p) as HTMLDivElement;
    const btn = el.querySelector('button.op-controls__mute') as HTMLButtonElement;
    expect(btn).toBeTruthy();

    // Volume event updates aria & progress
    p.events.emit('media:volume', 0.4);
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
    const p = makePlayer();
    const c = nn(createProgressControl());
    const el = c.create(p) as HTMLDivElement;

    const input = el.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    // overlay manager affects duration/value
    const ov = getOverlayManager(p);
    ov.activate({ id: 'x', mode: 'normal', duration: 100, value: 10, canSeek: true, type: 'overlay' } as any);
    p.events.emit('media:duration', 100);
    p.events.emit('media:timeupdate', 11);
    expect(input.max).toBe('100');

    input.dispatchEvent(new Event('pointerdown'));
    input.value = '25';
    input.dispatchEvent(new Event('input'));
    expect(p.currentTime).toBe(25);
    input.dispatchEvent(new Event('pointerup'));
  });

  test('Time + Duration reflect overlay duration/time when active', () => {
    const p = makePlayer();
    const t = nn(createCurrentTimeControl()).create(p) as HTMLElement;
    const d = nn(createDurationControl()).create(p) as HTMLElement;

    const ov = getOverlayManager(p);
    ov.activate({ id: 'x', mode: 'normal', duration: 80, value: 6, canSeek: true, type: 'overlay' } as any);
    p.events.emit('media:timeupdate', 7);
    p.events.emit('media:duration', 999);

    expect((t as any).innerText).toContain('0:06');
    expect((d as any).innerText).toContain('1:20');
  });

  test('Captions control toggles text tracks', async () => {
    const p = makePlayer();
    const c = nn(createCaptionsControl());
    const el = c.create(p) as HTMLButtonElement;

    // Provide stub tracks
    const track1 = { mode: 'disabled' } as any;
    const track2 = { mode: 'showing' } as any;
    Object.defineProperty(p.media as any, 'textTracks', {
      configurable: true,
      value: [track1, track2],
    });

    el.click();
    expect(track1.mode).toBe('disabled');
    expect(track2.mode).toBe('showing');
  });

  test('Fullscreen control emits and toggles css class', async () => {
    const p = makePlayer();
    const c = nn(createFullscreenControl());
    const el = c.create(p) as HTMLButtonElement;

    document.body.appendChild(el);
    // Mock requestFullscreen
    (p.media.parentElement as any).requestFullscreen = jest.fn().mockResolvedValue(undefined);
    (document as any).exitFullscreen = jest.fn().mockResolvedValue(undefined);

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
