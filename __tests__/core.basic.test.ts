/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { Lease } from '../src/core/lease';
import { PluginBus, PluginRegistry } from '../src/core/plugin';
import { StateManager } from '../src/core/state';
import { formatTime, isMobile, offset, predictMimeType } from '../src/core/utils';

describe('core basics', () => {
  test('EventBus on/emit/unsubscribe', () => {
    const bus = new EventBus();
    const calls: any[] = [];
    const off = bus.on('media:timeupdate', (p) => calls.push(p));
    bus.emit('media:timeupdate', 1);
    bus.emit('media:timeupdate', 2);
    expect(calls).toEqual([1, 2]);
    off();
    bus.emit('media:timeupdate', 3);
    expect(calls).toEqual([1, 2]);
  });

  test('PluginRegistry + PluginBus forward events', () => {
    const bus = new EventBus();
    const pb = new PluginBus<'x' | 'y'>(bus as any);
    const seen: any[] = [];
    pb.on('x', (...a) => seen.push(['x', ...a]));
    pb.emit('x', 1, 2);
    // PluginBus only forwards the first payload argument (by design)
    expect(seen).toEqual([['x', 1]]);

    const reg = new PluginRegistry();
    reg.register({ name: 'a', version: '1' });
    reg.register({ name: 'b', version: '1' });
    expect(reg.all().map((p) => p.name)).toEqual(['a', 'b']);
  });

  test('Lease acquire/release/owner', () => {
    const l = new Lease();
    expect(l.acquire('playback', 'a')).toBe(true);
    expect(l.acquire('playback', 'b')).toBe(false);
    expect(l.owner('playback')).toBe('a');
    l.release('playback', 'b');
    expect(l.owner('playback')).toBe('a');
    l.release('playback', 'a');
    expect(l.owner('playback')).toBeUndefined();
  });

  test('StateManager transitions and current', () => {
    const sm = new StateManager<'a' | 'b'>('a');
    expect(sm.current).toBe('a');
    sm.transition('b');
    expect(sm.current).toBe('b');
  });

  test('formatTime covers zeros, hours, and frames', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(1)).toBe('00:01');
    expect(formatTime(61)).toBe('01:01');
    expect(formatTime(3661)).toBe('01:01:01');
    expect(formatTime(1.5, 30)).toMatch(/00:01:15/); // 0.5 * 30 = 15 frames
  });

  test('offset uses bounding rect + scroll offsets', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    el.getBoundingClientRect = () =>
      ({
        left: 10,
        top: 20,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON() {
          //
        },
      }) as any;
    Object.defineProperty(window, 'pageXOffset', { value: 5, configurable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 7, configurable: true });
    const o = offset(el);
    expect(o.left).toBe(15);
    expect(o.top).toBe(27);
  });

  test('isMobile detects iOS and Android user agents', () => {
    const original = window.navigator.userAgent;
    Object.defineProperty(window.navigator, 'userAgent', { value: 'iPhone', configurable: true });
    expect(isMobile()).toBe(true);
    Object.defineProperty(window.navigator, 'userAgent', { value: 'Android', configurable: true });
    expect(isMobile()).toBe(true);
    Object.defineProperty(window.navigator, 'userAgent', { value: 'Desktop Chrome', configurable: true });
    expect(isMobile()).toBe(false);
    Object.defineProperty(window.navigator, 'userAgent', { value: original, configurable: true });
  });

  test('predictMimeType infers by extension and audio/video fallback', () => {
    const video = document.createElement('video');
    const audio = document.createElement('audio');

    expect(predictMimeType(video, 'https://x/y.mp4')).toBe('video/mp4');
    expect(predictMimeType(audio, 'https://x/y.mp4')).toBe('audio/mp4');
    expect(predictMimeType(video, 'https://x/y.m3u8')).toContain('mpegURL');
    expect(predictMimeType(video, 'https://x/y.mpd')).toContain('dash+xml');
    expect(predictMimeType(video, 'https://x/y.webm')).toBe('video/webm');
    expect(predictMimeType(audio, 'https://x/y.oga')).toBe('audio/ogg');
    expect(predictMimeType(audio, 'https://x/y.unknown')).toBe('audio/mp3');

    // no extension => fallback based on element type
    expect(predictMimeType(audio, 'https://x/y')).toBe('audio/mp3');
    expect(predictMimeType(video, 'https://x/y')).toBe('video/mp4');
  });
});
