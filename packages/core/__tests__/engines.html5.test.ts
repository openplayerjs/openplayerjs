/** @jest-environment jsdom */

import { Player } from '../src/core/player';

describe('DefaultMediaEngine — preload="none"', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('media.load() is called and player reaches loading state when preload is "none"', () => {
    const media = document.createElement('video');
    media.preload = 'none';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsBefore = loadMock.mock.calls.length;

    const player = new Player(media);

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

    const player = new Player(media);

    const cmdPlay = jest.fn();
    player.events.on('cmd:play', cmdPlay);

    // Simulate the browser firing loadedmetadata (resolves whenReady())
    player.events.emit('loadedmetadata');

    await player.play();

    expect(cmdPlay).toHaveBeenCalledTimes(1);

    player.destroy();
  });

  test('cmd:startLoad with preload=none bumps preload to metadata and re-calls load() to trigger loadedmetadata', () => {
    const media = document.createElement('video');
    media.preload = 'none';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const player = new Player(media);

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

    const player = new Player(media);

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

  test('media.load() is also called when preload is "auto"', () => {
    const media = document.createElement('video');
    media.preload = 'auto';
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const loadMock = HTMLMediaElement.prototype.load as jest.Mock;
    const callsBefore = loadMock.mock.calls.length;

    const player = new Player(media);

    expect(loadMock.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(player.state.current).toBe('loading');

    player.destroy();
  });
});
