/** @jest-environment jsdom */

import { formatTime, generateISODateTime, predictMimeType } from '../src/core/utils';

describe('core/utils', () => {
  test('formatTime formats hours/minutes/seconds and optional frames', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(61)).toBe('01:01');
    expect(formatTime(3661)).toBe('01:01:01');
    // 1.5 seconds at 30 fps => 15 frames
    expect(formatTime(1.5, 30)).toBe('00:01:15');
  });

  test('generateISODateTime clamps and formats duration', () => {
    expect(generateISODateTime(0)).toBe('PT0S');
    expect(generateISODateTime(-10)).toBe('PT0S');
    expect(generateISODateTime(Number.NaN)).toBe('PT0S');
    expect(generateISODateTime(65)).toBe('PT1M5S');
    expect(generateISODateTime(3665)).toBe('PT1H1M5S');
  });

  test('predictMimeType defaults based on media kind and extension', () => {
    const v = document.createElement('video');
    const a = document.createElement('audio');

    expect(predictMimeType(v, 'https://example.com/video.mp4')).toBe('video/mp4');
    expect(predictMimeType(a, 'https://example.com/video.mp4')).toBe('audio/mp4');

    expect(predictMimeType(v, 'https://example.com/stream.m3u8')).toBe('application/x-mpegURL');
    expect(predictMimeType(v, 'https://example.com/manifest.mpd')).toBe('application/dash+xml');
    expect(predictMimeType(a, 'https://example.com/music.mp3')).toBe('audio/mp3');

    // No extension => default depends on audio vs video.
    expect(predictMimeType(v, 'https://example.com/watch')).toBe('video/mp4');
    expect(predictMimeType(a, 'https://example.com/listen')).toBe('audio/mp3');

    // Remaining format branches
    expect(predictMimeType(v, 'https://example.com/clip.ogg')).toBe('video/ogg');  // video path of ogg ternary
    expect(predictMimeType(a, 'https://example.com/sound.ogg')).toBe('audio/ogg');  // audio path of ogg ternary
    expect(predictMimeType(v, 'https://example.com/clip.ogv')).toBe('video/ogg');
    expect(predictMimeType(a, 'https://example.com/sound.oga')).toBe('audio/ogg');
    expect(predictMimeType(v, 'https://example.com/clip.3gp')).toBe('audio/3gpp');
    expect(predictMimeType(a, 'https://example.com/sound.wav')).toBe('audio/wav');
    expect(predictMimeType(a, 'https://example.com/sound.aac')).toBe('audio/aac');
    expect(predictMimeType(a, 'https://example.com/sound.flac')).toBe('audio/flac');
    expect(predictMimeType(v, 'https://example.com/clip.webm')).toBe('video/webm');
    expect(predictMimeType(a, 'https://example.com/sound.webm')).toBe('audio/webm');
  });

  test('predictMimeType returns default when given a non-URL string (bare video ID)', () => {
    const v = document.createElement('video');
    const a = document.createElement('audio');

    // Bare 11-char YouTube ID — not a valid URL, should not throw
    expect(() => predictMimeType(v, 'dQw4w9WgXcQ')).not.toThrow();
    expect(predictMimeType(v, 'dQw4w9WgXcQ')).toBe('video/mp4');
    expect(predictMimeType(a, 'dQw4w9WgXcQ')).toBe('audio/mp3');
  });
});
