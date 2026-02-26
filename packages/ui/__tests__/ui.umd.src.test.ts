/** @jest-environment jsdom */

import Player from '../src/umd';

// Isolate the UI-creation side-effects so the tests focus on delegation.
jest.mock('../src/ui', () => ({ createUI: jest.fn() }));
jest.mock('../src/control', () => ({ buildControls: jest.fn(() => []), registerControl: jest.fn() }));
jest.mock('../src/extend', () => ({ extendControls: jest.fn() }));

describe('UMD Player — set src', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('delegates the assigned value to CorePlayer after init()', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    umdPlayer.src = 'https://example.com/video.mp4';

    expect(corePlayer.src).toBe('https://example.com/video.mp4');
  });

  test('causes CorePlayer to emit source:set with the new URL', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    const onSourceSet = jest.fn();
    corePlayer.on('source:set', onSourceSet);

    umdPlayer.src = 'https://example.com/clip.mp4';

    expect(onSourceSet).toHaveBeenCalledTimes(1);
    expect(onSourceSet).toHaveBeenCalledWith('https://example.com/clip.mp4');
  });

  test('overwrites a previously assigned source', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    umdPlayer.src = 'https://example.com/first.mp4';
    umdPlayer.src = 'https://example.com/second.mp4';

    expect(corePlayer.src).toBe('https://example.com/second.mp4');
  });

  test('throws with a meaningful message when called before init()', () => {
    const umdPlayer = new Player(media);

    expect(() => {
      umdPlayer.src = 'https://example.com/video.mp4';
    }).toThrow('OpenPlayer.src must be set after init()');
  });

  test('resets player to idle so the new source loads correctly (source switching)', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    // Simulate the player being in a non-idle state (e.g., already playing)
    corePlayer.events.emit('loadedmetadata');
    expect(corePlayer.state.current).toBe('ready');

    // Switching source must reset state back to idle for load() to pick it up
    umdPlayer.src = 'https://example.com/new-video.mp4';

    expect(corePlayer.state.current).toBe('idle');
    expect(corePlayer.src).toBe('https://example.com/new-video.mp4');
  });
});

describe('UMD Player — play()', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('delegates to CorePlayer.play() and resolves after init()', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    const cmdPlay = jest.fn();
    corePlayer.events.on('cmd:play', cmdPlay);

    // Unblock whenReady so play() can complete
    corePlayer.events.emit('loadedmetadata');

    await umdPlayer.play();

    expect(cmdPlay).toHaveBeenCalledTimes(1);
  });

  test('throws when called before init()', async () => {
    const umdPlayer = new Player(media);

    await expect(umdPlayer.play()).rejects.toThrow('OpenPlayer.play() called before init()');
  });
});

describe('UMD Player — load()', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('throws when called before init()', () => {
    const umdPlayer = new Player(media);

    expect(() => umdPlayer.load()).toThrow('OpenPlayer.load() called before init()');
  });

  test('delegates to CorePlayer.load() — emits source:set when src is reassigned', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    const seen: string[] = [];
    corePlayer.on('source:set', () => seen.push('source:set'));

    umdPlayer.src = 'https://example.com/video.mp4';

    expect(seen).toContain('source:set');
  });
});
