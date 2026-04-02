/** @jest-environment jsdom */

import type { MediaEnginePlugin, MediaSource } from '../src/core/media';
import {
  formatTime,
  generateISODateTime,
  offset,
  predictMimeType,
  readMediaSources,
  resolveMediaEngine,
} from '../src/core/utils';

function makeEngine(name: string, canPlayTypes: string[], priority = 0): MediaEnginePlugin {
  return {
    name,
    version: '1.0.0',
    priority,
    capabilities: ['media-engine'],
    canPlay: (source: MediaSource) => canPlayTypes.some((t) => source.type === t || source.src.endsWith(t)),
    attach: jest.fn(),
  };
}

const mp4Source: MediaSource = { src: 'https://cdn.example.com/video.mp4', type: 'video/mp4' };
const hlsSource: MediaSource = { src: 'https://cdn.example.com/stream.m3u8', type: 'application/x-mpegURL' };

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
    expect(predictMimeType(v, 'https://example.com/clip.ogg')).toBe('video/ogg'); // video path of ogg ternary
    expect(predictMimeType(a, 'https://example.com/sound.ogg')).toBe('audio/ogg'); // audio path of ogg ternary
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

  test('predictMimeType falls back to default for unrecognised extensions', () => {
    const v = document.createElement('video');
    const a = document.createElement('audio');
    // Unknown extension hits the default case in the switch
    expect(predictMimeType(v, 'https://example.com/clip.xyz')).toBe('video/mp4');
    expect(predictMimeType(a, 'https://example.com/clip.xyz')).toBe('audio/mp3');
  });

  test('offset returns element coordinates combined with window scroll offsets', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    // Patch pageXOffset/pageYOffset to a non-zero value so the left-side || branch is taken
    Object.defineProperty(window, 'pageXOffset', { get: () => 80, configurable: true });
    Object.defineProperty(window, 'pageYOffset', { get: () => 40, configurable: true });

    const r1 = offset(el);
    // getBoundingClientRect returns zeros in jsdom; position = 0 + scroll
    expect(r1.left).toBe(80);
    expect(r1.top).toBe(40);

    // Reset to 0 so the right-side || branch (scrollLeft / scrollTop) is exercised
    Object.defineProperty(window, 'pageXOffset', { get: () => 0, configurable: true });
    Object.defineProperty(window, 'pageYOffset', { get: () => 0, configurable: true });

    const r2 = offset(el);
    expect(r2.left).toBe(0);
    expect(r2.top).toBe(0);

    document.body.removeChild(el);
  });

  it('returns empty array when media has no src and no source elements', () => {
    const media = document.createElement('video');
    expect(readMediaSources(media)).toEqual([]);
  });

  it('reads src attribute and infers MIME type from extension', () => {
    const media = document.createElement('video');
    Object.defineProperty(media, 'src', { value: 'https://cdn.example.com/video.mp4' });
    const sources = readMediaSources(media);
    expect(sources).toHaveLength(1);
    expect(sources[0].src).toBe('https://cdn.example.com/video.mp4');
    expect(sources[0].type).toBe('video/mp4');
  });

  it('infers application/x-mpegURL for m3u8 src', () => {
    const media = document.createElement('video');
    Object.defineProperty(media, 'src', { value: 'https://cdn.example.com/stream.m3u8' });
    const sources = readMediaSources(media);
    expect(sources[0].type).toBe('application/x-mpegURL');
  });

  it('reads child <source> elements', () => {
    const media = document.createElement('video');
    const s1 = document.createElement('source');
    s1.src = 'https://cdn.example.com/video.mp4';
    s1.type = 'video/mp4';
    const s2 = document.createElement('source');
    s2.src = 'https://cdn.example.com/video.webm';
    s2.type = 'video/webm';
    media.appendChild(s1);
    media.appendChild(s2);
    const sources = readMediaSources(media);
    expect(sources).toHaveLength(2);
    expect(sources[0].type).toBe('video/mp4');
    expect(sources[1].type).toBe('video/webm');
  });

  it('uses the type attribute from <source> when present', () => {
    const media = document.createElement('video');
    const s = document.createElement('source');
    s.src = 'https://cdn.example.com/stream.m3u8';
    s.type = 'application/vnd.apple.mpegurl';
    media.appendChild(s);
    const sources = readMediaSources(media);
    expect(sources[0].type).toBe('application/vnd.apple.mpegurl');
  });

  it('throws when sources array is empty', () => {
    const engine = makeEngine('default', ['video/mp4']);
    expect(() => resolveMediaEngine([engine], [])).toThrow('empty source');
  });

  it('throws when no engine can play the source', () => {
    const engine = makeEngine('hls', ['application/x-mpegURL']);
    expect(() => resolveMediaEngine([engine], [mp4Source])).toThrow('No compatible media engine found');
  });

  it('returns the matching engine and source', () => {
    const defaultEngine = makeEngine('default', ['video/mp4']);
    const { engine, source } = resolveMediaEngine([defaultEngine], [mp4Source]);
    expect(engine.name).toBe('default');
    expect(source).toBe(mp4Source);
  });

  it('returns the first source that any engine can play', () => {
    const defaultEngine = makeEngine('default', ['video/mp4']);
    const sources = [hlsSource, mp4Source];
    const { source } = resolveMediaEngine([defaultEngine], sources);
    // default engine can't play HLS, picks mp4
    expect(source.type).toBe('video/mp4');
  });

  it('respects engine priority order (higher priority wins)', () => {
    // Both engines can play mp4; hlsEngine has higher priority
    const defaultEngine = makeEngine('default', ['video/mp4'], 0);
    const hlsEngine = makeEngine('hls', ['video/mp4', 'application/x-mpegURL'], 50);
    // Pass engines pre-sorted by priority descending (as Core does)
    const sortedEngines = [hlsEngine, defaultEngine];
    const { engine } = resolveMediaEngine(sortedEngines, [mp4Source]);
    expect(engine.name).toBe('hls');
  });

  it('falls through to the next engine when the first cannot play the source', () => {
    const hlsEngine = makeEngine('hls', ['application/x-mpegURL'], 50);
    const defaultEngine = makeEngine('default', ['video/mp4'], 0);
    const sortedEngines = [hlsEngine, defaultEngine];
    const { engine } = resolveMediaEngine(sortedEngines, [mp4Source]);
    expect(engine.name).toBe('default');
  });
});
