/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { HtmlMediaSurface, bridgeSurfaceEvents } from '../src/core/surface';

describe('HtmlMediaSurface', () => {
  test('currentSrc falls back through currentSrc → src → empty string', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);

    // Both currentSrc and src are empty
    expect(surface.currentSrc).toBe('');

    // Only src is set — currentSrc stays '' so the || src branch is taken
    media.src = 'https://example.com/v.mp4';
    expect(surface.currentSrc).toBe('https://example.com/v.mp4');

    // Non-empty currentSrc — left-side of || is truthy, returned directly
    Object.defineProperty(media, 'currentSrc', {
      value: 'https://cdn.example.com/v.mp4',
      configurable: true,
    });
    expect(surface.currentSrc).toBe('https://cdn.example.com/v.mp4');
  });

  test('currentTime getter returns media.currentTime, falling back to 0', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);

    // Default is 0 → falsy, || 0 fallback branch taken
    expect(surface.currentTime).toBe(0);

    // Non-zero → left-side of || is truthy
    Object.defineProperty(media, 'currentTime', {
      value: 7.5,
      configurable: true,
      writable: true,
    });
    expect(surface.currentTime).toBe(7.5);
  });

  test('load() sets media.src only when the new source differs from the current one', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);
    const loadSpy = jest.spyOn(media, 'load').mockImplementation(() => {});

    // No source argument — source?.src is undefined (falsy) → skip src assignment
    surface.load();
    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(media.getAttribute('src')).toBeNull();

    // Source matches current src → condition false → skip assignment
    media.src = 'https://example.com/v.mp4';
    surface.load({ src: 'https://example.com/v.mp4' });
    expect(loadSpy).toHaveBeenCalledTimes(2);

    // New (different) source → condition true → src is reassigned
    surface.load({ src: 'https://example.com/v2.mp4' });
    expect(media.src).toBe('https://example.com/v2.mp4');
    expect(loadSpy).toHaveBeenCalledTimes(3);

    loadSpy.mockRestore();
  });

  test('on("error") delivers media.error when set, otherwise the raw Event', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);

    const received: unknown[] = [];
    surface.on('error', (e) => received.push(e));

    // media.error is null → handler receives the dispatched Event (the ?? right side)
    media.dispatchEvent(new Event('error'));
    expect(received[0]).toBeInstanceOf(Event);

    // media.error is non-null → handler receives it (the ?? left side)
    const fakeError = { code: 2, message: 'Network error' };
    Object.defineProperty(media, 'error', { value: fakeError, configurable: true });
    media.dispatchEvent(new Event('error'));
    expect(received[1]).toBe(fakeError);
  });

  test('non-error events invoke handler with undefined payload', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);

    const calls: unknown[] = [];
    const off = surface.on('playing', (v) => calls.push(v));

    media.dispatchEvent(new Event('playing'));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBeUndefined();

    // off() unregisters the listener
    off();
    media.dispatchEvent(new Event('playing'));
    expect(calls).toHaveLength(1);
  });

  test('get/set volume delegates to media.volume', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);

    expect(surface.volume).toBe(media.volume);

    surface.volume = 0.3;
    expect(media.volume).toBe(0.3);
    expect(surface.volume).toBe(0.3);
  });

  test('get/set muted delegates to media.muted', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);

    expect(surface.muted).toBe(false);

    surface.muted = true;
    expect(media.muted).toBe(true);
    expect(surface.muted).toBe(true);

    surface.muted = false;
    expect(surface.muted).toBe(false);
  });

  test('get/set playbackRate delegates to media.playbackRate', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);

    expect(surface.playbackRate).toBe(1);

    surface.playbackRate = 1.5;
    expect(media.playbackRate).toBe(1.5);
    expect(surface.playbackRate).toBe(1.5);
  });

  test('get paused and get ended reflect media state', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);
    // jsdom video starts paused and not ended
    expect(surface.paused).toBe(true);
    expect(surface.ended).toBe(false);
  });

  test('play() and pause() delegate to media', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);
    const playSpy = jest.spyOn(media, 'play').mockResolvedValue(undefined);
    const pauseSpy = jest.spyOn(media, 'pause').mockImplementation(() => {});

    surface.play();
    expect(playSpy).toHaveBeenCalled();

    surface.pause();
    expect(pauseSpy).toHaveBeenCalled();

    playSpy.mockRestore();
    pauseSpy.mockRestore();
  });
});

describe('bridgeSurfaceEvents', () => {
  test('forwards all wired surface events to the EventBus', () => {
    const media = document.createElement('video');
    const surface = new HtmlMediaSurface(media);
    const bus = new EventBus();
    const seen: string[] = [];

    bus.on('loadstart', () => seen.push('loadstart'));
    bus.on('loadedmetadata', () => seen.push('loadedmetadata'));
    bus.on('durationchange', () => seen.push('durationchange'));
    bus.on('timeupdate', () => seen.push('timeupdate'));
    bus.on('waiting', () => seen.push('waiting'));
    bus.on('seeking', () => seen.push('seeking'));
    bus.on('seeked', () => seen.push('seeked'));
    bus.on('ended', () => seen.push('ended'));
    bus.on('error', () => seen.push('error'));
    bus.on('play', () => seen.push('play'));
    bus.on('playing', () => seen.push('playing'));
    bus.on('pause', () => seen.push('pause'));
    bus.on('volumechange', () => seen.push('volumechange'));
    bus.on('ratechange', () => seen.push('ratechange'));

    const offs = bridgeSurfaceEvents(surface, bus);

    const events = [
      'loadstart', 'loadedmetadata', 'durationchange', 'timeupdate',
      'waiting', 'seeking', 'seeked', 'ended', 'error',
      'play', 'playing', 'pause', 'volumechange', 'ratechange',
    ];
    for (const evt of events) {
      media.dispatchEvent(new Event(evt));
    }

    expect(seen).toEqual(expect.arrayContaining(events));

    // offs should be an array of unsubscribers
    expect(Array.isArray(offs)).toBe(true);
    expect(offs.length).toBeGreaterThan(0);
    offs.forEach((off) => off()); // remove listeners without error
  });
});
