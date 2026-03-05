/** @jest-environment jsdom */

import Player from '../src/umd';
import { buildControls, registerControl } from '../src/control';
import { createUI } from '../src/ui';

// Isolate the UI-creation side-effects so the tests focus on delegation.
jest.mock('../src/ui', () => ({ createUI: jest.fn() }));
jest.mock('../src/control', () => {
  const actual = jest.requireActual('../src/control');
  return {
    buildControls: jest.fn(() => []),
    registerControl: jest.fn(),
    normalizeControlsConfig: actual.normalizeControlsConfig,
    DEFAULT_CONTROLS: actual.DEFAULT_CONTROLS,
  };
});
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

describe('UMD Player — controls configuration', () => {
  const buildControlsMock = buildControls as jest.Mock;
  const createUIMock = createUI as jest.Mock;
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
    buildControlsMock.mockClear();
    (registerControl as jest.Mock).mockClear();
    createUIMock.mockClear();
  });

  test('uses default controls layout when no controls config is provided', async () => {
    const player = new Player(media);
    await player.init();

    expect(buildControlsMock).toHaveBeenCalledWith({
      top: ['progress'],
      'bottom-left': ['play', 'time', 'volume'],
      'bottom-right': ['captions', 'settings', 'fullscreen'],
    });
  });

  test('passes the flat controls config directly to buildControls', async () => {
    const player = new Player(media, {
      controls: {
        top: ['progress'],
        'bottom-left': ['play', 'volume'],
        'bottom-right': ['fullscreen'],
      },
    });
    await player.init();

    expect(buildControlsMock).toHaveBeenCalledWith({
      top: ['progress'],
      'bottom-left': ['play', 'volume'],
      'bottom-right': ['fullscreen'],
    });
  });

  test('maps layers format to flat format', async () => {
    const player = new Player(media, {
      controls: {
        layers: {
          left: ['play', 'volume'],
          middle: ['progress'],
          right: ['fullscreen'],
        },
      },
    });
    await player.init();

    expect(buildControlsMock).toHaveBeenCalledWith({
      'bottom-left': ['play', 'volume'],
      top: ['progress'],
      'bottom-right': ['fullscreen'],
    });
  });

  test('uses default controls when only alwaysVisible flag is set', async () => {
    const player = new Player(media, { controls: { alwaysVisible: true } });
    await player.init();

    expect(buildControlsMock).toHaveBeenCalledWith({
      top: ['progress'],
      'bottom-left': ['play', 'time', 'volume'],
      'bottom-right': ['captions', 'settings', 'fullscreen'],
    });
  });

  test('passes alwaysVisible:true to createUI', async () => {
    const player = new Player(media, { controls: { alwaysVisible: true } });
    await player.init();

    expect(createUIMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      { alwaysVisible: true }
    );
  });

  test('passes alwaysVisible:false to createUI when not set', async () => {
    const player = new Player(media);
    await player.init();

    expect(createUIMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      { alwaysVisible: false }
    );
  });
});

describe('UMD Player — currentTime / duration', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('currentTime getter returns 0 before init()', () => {
    const umdPlayer = new Player(media);
    expect(umdPlayer.currentTime).toBe(0);
  });

  test('currentTime getter delegates to CorePlayer after init()', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    corePlayer.events.emit('loadedmetadata');
    // Advance time via the core directly
    corePlayer.events.emit('timeupdate');
    Object.defineProperty(media, 'currentTime', { value: 12, configurable: true });
    corePlayer.events.emit('timeupdate');

    expect(umdPlayer.currentTime).toBe(corePlayer.currentTime);
  });

  test('currentTime setter delegates to CorePlayer after init()', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    const seekHandler = jest.fn();
    corePlayer.events.on('cmd:seek', seekHandler);

    umdPlayer.currentTime = 30;

    expect(seekHandler).toHaveBeenCalledWith(30);
  });

  test('currentTime setter throws before init()', () => {
    const umdPlayer = new Player(media);
    expect(() => { umdPlayer.currentTime = 5; }).toThrow('OpenPlayer.currentTime must be set after init()');
  });

  test('duration getter returns 0 before init()', () => {
    const umdPlayer = new Player(media);
    expect(umdPlayer.duration).toBe(0);
  });

  test('duration getter delegates to CorePlayer after init()', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    corePlayer.events.emit('loadedmetadata');
    Object.defineProperty(media, 'duration', { value: 120, configurable: true });
    corePlayer.events.emit('durationchange');

    expect(umdPlayer.duration).toBe(corePlayer.duration);
  });
});

describe('UMD Player — src getter', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('returns empty string before init()', () => {
    const umdPlayer = new Player(media);
    expect(umdPlayer.src).toBe('');
  });

  test('reflects the value set via the setter after init()', async () => {
    const umdPlayer = new Player(media);
    await umdPlayer.init();

    umdPlayer.src = 'https://example.com/clip.mp4';

    expect(umdPlayer.src).toBe('https://example.com/clip.mp4');
  });
});

describe('UMD Player — volume', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('getter returns 1 before init()', () => {
    const umdPlayer = new Player(media);
    expect(umdPlayer.volume).toBe(1);
  });

  test('setter throws before init()', () => {
    const umdPlayer = new Player(media);
    expect(() => { umdPlayer.volume = 0.5; }).toThrow('OpenPlayer.volume must be set after init()');
  });

  test('setter delegates to CorePlayer and getter reflects the new value', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    const volumeHandler = jest.fn();
    corePlayer.events.on('cmd:setVolume', volumeHandler);

    umdPlayer.volume = 0.6;

    expect(volumeHandler).toHaveBeenCalledWith(0.6);
    expect(umdPlayer.volume).toBe(corePlayer.volume);
  });

  test('setter clamps value to [0, 1] via CorePlayer', async () => {
    const umdPlayer = new Player(media);
    await umdPlayer.init();

    umdPlayer.volume = 2;
    expect(umdPlayer.volume).toBe(1);

    umdPlayer.volume = -1;
    expect(umdPlayer.volume).toBe(0);
  });
});

describe('UMD Player — muted', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('getter returns false before init()', () => {
    const umdPlayer = new Player(media);
    expect(umdPlayer.muted).toBe(false);
  });

  test('setter throws before init()', () => {
    const umdPlayer = new Player(media);
    expect(() => { umdPlayer.muted = true; }).toThrow('OpenPlayer.muted must be set after init()');
  });

  test('setter delegates to CorePlayer and getter reflects the new value', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    const muteHandler = jest.fn();
    corePlayer.events.on('cmd:setMuted', muteHandler);

    umdPlayer.muted = true;

    expect(muteHandler).toHaveBeenCalledWith(true);
    expect(umdPlayer.muted).toBe(true);

    umdPlayer.muted = false;
    expect(umdPlayer.muted).toBe(false);
  });
});

describe('UMD Player — playbackRate', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);
    delete (window as any).OpenPlayerPlugins;
  });

  test('getter returns 1 before init()', () => {
    const umdPlayer = new Player(media);
    expect(umdPlayer.playbackRate).toBe(1);
  });

  test('setter throws before init()', () => {
    const umdPlayer = new Player(media);
    expect(() => { umdPlayer.playbackRate = 2; }).toThrow('OpenPlayer.playbackRate must be set after init()');
  });

  test('setter delegates to CorePlayer and getter reflects the new value', async () => {
    const umdPlayer = new Player(media);
    const corePlayer = await umdPlayer.init();

    const rateHandler = jest.fn();
    corePlayer.events.on('cmd:setRate', rateHandler);

    umdPlayer.playbackRate = 1.5;

    expect(rateHandler).toHaveBeenCalledWith(1.5);
    expect(umdPlayer.playbackRate).toBe(corePlayer.playbackRate);
  });

  test('supports values below 1 (slow motion)', async () => {
    const umdPlayer = new Player(media);
    await umdPlayer.init();

    umdPlayer.playbackRate = 0.5;
    expect(umdPlayer.playbackRate).toBe(0.5);
  });
});
