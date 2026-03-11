/** @jest-environment jsdom */

import { Core } from '../src/core';
import { DefaultMediaEngine } from '../src/engines/html5';

describe('DefaultMediaEngine.canPlay()', () => {
  test('returns false when canPlayType returns empty string', () => {
    const mock = jest.spyOn(HTMLVideoElement.prototype, 'canPlayType').mockReturnValue('');
    const engine = new DefaultMediaEngine();
    expect(engine.canPlay({ src: 'https://example.com/v.mp4', type: 'video/mp4' })).toBe(false);
    mock.mockRestore();
  });

  test('returns true when canPlayType returns a non-empty string', () => {
    const mock = jest.spyOn(HTMLVideoElement.prototype, 'canPlayType').mockReturnValue('maybe');
    const engine = new DefaultMediaEngine();
    // With explicit type — exercises the left side of `source.type || ''`
    expect(engine.canPlay({ src: 'https://example.com/v.mp4', type: 'video/mp4' })).toBe(true);
    // Without type — exercises the right side of `source.type || ''` (falls back to '')
    expect(engine.canPlay({ src: 'https://example.com/v.mp4' })).toBe(true);
    mock.mockRestore();
  });
});

describe('DefaultMediaEngine — preload="none"', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('media.load() is called and player reaches loading state when preload is "none"', async () => {
    const media = document.createElement('video');
    media.preload = 'none';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsBefore = loadMock.mock.calls.length;

    const player = new Core(media);
    // maybeAutoLoad() is deferred via queueMicrotask; flush it before asserting
    await Promise.resolve();

    // attach() must call media.load() unconditionally — even with preload="none"
    expect(loadMock.mock.calls.length).toBeGreaterThan(callsBefore);
    // The load sequence emits 'loadstart' → state transitions to 'loading'
    expect(player.state.current).toBe('loading');

    player.destroy();
  });

  test('play() resolves and emits cmd:play when preload is "none" after loadedmetadata', async () => {
    const media = document.createElement('video');
    media.preload = 'none';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Core(media);

    const cmdPlay = jest.fn();
    player.events.on('cmd:play', cmdPlay);

    // Simulate the browser firing loadedmetadata (resolves whenReady())
    player.events.emit('loadedmetadata');

    await player.play();

    expect(cmdPlay).toHaveBeenCalledTimes(1);

    player.destroy();
  });

  test('cmd:startLoad with preload=none bumps preload to metadata and re-calls load() to trigger loadedmetadata', async () => {
    const media = document.createElement('video');
    media.preload = 'none';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Core(media);
    // Flush queueMicrotask so engine attaches and registers the cmd:startLoad handler
    await Promise.resolve();

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsAfterInit = loadMock.mock.calls.length;

    // player.play() emits cmd:startLoad before awaiting whenReady()
    player.events.emit('cmd:startLoad');

    expect(media.preload).toBe('metadata');
    expect(loadMock.mock.calls.length).toBeGreaterThan(callsAfterInit);

    player.destroy();
  });

  test('cmd:startLoad is a no-op once the player has passed loading state', () => {
    const media = document.createElement('video');
    media.preload = 'none';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Core(media);

    // Simulate metadata arriving → player becomes ready
    player.events.emit('loadedmetadata');
    expect(player.state.current).toBe('ready');

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsAfterReady = loadMock.mock.calls.length;

    // cmd:startLoad must not re-trigger loading once ready
    player.events.emit('cmd:startLoad');
    expect(media.preload).toBe('none'); // unchanged
    expect(loadMock.mock.calls.length).toBe(callsAfterReady);

    player.destroy();
  });

  test('media.load() is also called when preload is "auto"', async () => {
    const media = document.createElement('video');
    media.preload = 'auto';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsBefore = loadMock.mock.calls.length;

    const player = new Core(media);
    // Flush queueMicrotask so engine attaches
    await Promise.resolve();

    expect(loadMock.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(player.state.current).toBe('loading');

    player.destroy();
  });
});

describe('DefaultMediaEngine – cmd:startLoad guard branches', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('cmd:startLoad is a no-op when state is already "ready"', async () => {
    const media = document.createElement('video');
    media.preload = 'none';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Core(media);
    await Promise.resolve();

    // Simulate reaching ready state
    player.state.transition('ready');
    expect(player.state.current).toBe('ready');

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsBefore = loadMock.mock.calls.length;

    // cmd:startLoad should return early because state is 'ready'
    player.events.emit('cmd:startLoad');

    // No extra load() call
    expect(loadMock.mock.calls.length).toBe(callsBefore);

    player.destroy();
  });

  test('cmd:startLoad is a no-op when preload is not "none"', async () => {
    const media = document.createElement('video');
    media.preload = 'metadata'; // NOT 'none'
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Core(media);
    await Promise.resolve();

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsBefore = loadMock.mock.calls.length;

    // State is 'loading' (after attach), preload != 'none' → early return
    player.events.emit('cmd:startLoad');

    expect(loadMock.mock.calls.length).toBe(callsBefore);

    player.destroy();
  });
});
