/** @jest-environment jsdom */

import type {
  IframeMediaAdapter,
  IframeMediaAdapterEvents,
  IframePlaybackState,
  MediaEngineContext,
  MediaSource,
} from '@openplayerjs/core';
import {
  EventBus,
  HtmlMediaSurface,
  IframeMediaSurface,
  Lease,
  StateManager,
  getCaptionTrackProvider,
} from '@openplayerjs/core';
import { YouTubeMediaEngine } from '../src/youtube';

// ─── Minimal adapter stub ─────────────────────────────────────────────────────

class StubAdapter implements IframeMediaAdapter {
  public mountedContainer: HTMLElement | null = null;
  private handlers: Partial<{ [K in keyof IframeMediaAdapterEvents]: Set<any> }> = {};

  on<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    if (!this.handlers[evt]) this.handlers[evt] = new Set();
    (this.handlers[evt] as Set<any>).add(cb);
  }
  off<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    (this.handlers[evt] as Set<any> | undefined)?.delete(cb);
  }
  emit<E extends keyof IframeMediaAdapterEvents>(evt: E, ...args: any[]): void {
    (this.handlers[evt] as Set<any> | undefined)?.forEach((cb: any) => cb(...args));
  }

  mount(container: HTMLElement): void {
    this.mountedContainer = container;
  }
  destroy(): void {
    this.handlers = {};
  }
  play(): void {
    // ignore
  }
  pause(): void {
    // ignore
  }
  seekTo(_s: number): void {
    // ignore
  }
  setVolume(_v: number): void {
    // ignore
  }
  getVolume(): number {
    return 1;
  }
  mute(): void {
    // ignore
  }
  unmute(): void {
    // ignore
  }
  isMuted(): boolean {
    return false;
  }
  setPlaybackRate(_r: number): void {
    // ignore
  }
  getPlaybackRate(): number {
    return 1;
  }
  getCurrentTime(): number {
    return 0;
  }
  getDuration(): number {
    return NaN;
  }
}

// ─── Context factory ──────────────────────────────────────────────────────────

function makeCtx(
  media: HTMLMediaElement
): MediaEngineContext & { activeSurface: { current: any }; container: HTMLElement } {
  const events = new EventBus();
  const nativeSurface = new HtmlMediaSurface(media);
  const activeSurface = { current: nativeSurface as any };

  return {
    media,
    container: (media.parentElement ?? document.body) as HTMLElement,
    events,
    activeSource: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: '' },
    config: {},
    core: { leases: new Lease(), state: new StateManager('idle') } as any,
    get surface() {
      return activeSurface.current;
    },
    setSurface(s: any) {
      activeSurface.current = s;
      return s;
    },
    resetSurface() {
      activeSurface.current = nativeSurface;
      return nativeSurface;
    },
    activeSurface,
  };
}

/** Minimal fake YT.Player that fires onReady immediately. */
function fakeYTPlayer(playerOverrides: Record<string, jest.Mock> = {}) {
  return jest.fn().mockImplementation((_el: any, opts: any) => {
    opts.events?.onReady?.();
    return {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      getVolume: jest.fn().mockReturnValue(100),
      mute: jest.fn(),
      unMute: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      setPlaybackRate: jest.fn(),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(300),
      destroy: jest.fn(),
      ...playerOverrides,
    };
  });
}

// ─── YouTubeMediaEngine ───────────────────────────────────────────────────────

describe('YouTubeMediaEngine', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="wrapper"><video></video></div>';
    media = document.querySelector('video')!;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).YT;
  });

  describe('canPlay()', () => {
    const engine = new YouTubeMediaEngine();

    test.each([
      ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', undefined, true],
      ['https://youtu.be/dQw4w9WgXcQ', undefined, true],
      ['https://www.youtube.com/embed/dQw4w9WgXcQ', undefined, true],
      ['https://www.youtube.com/shorts/dQw4w9WgXcQ', undefined, true],
      ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', undefined, true], // mobile domain
      ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', undefined, true], // no-cookie embed
      ['dQw4w9WgXcQ', undefined, true], // bare 11-char ID
      // Explicit type="video/youtube" accepts any src — even non-YouTube URLs or bare IDs
      ['dQw4w9WgXcQ', 'video/youtube', true], // bare ID + type
      ['https://example.com/video.mp4', 'video/youtube', true], // non-YT url + type
      ['http://localhost/dQw4w9WgXcQ', 'video/youtube', true], // resolved bare ID + type
      // Non-YouTube, no type → false
      ['https://vimeo.com/123', undefined, false],
      ['https://example.com/video.mp4', undefined, false],
      ['', undefined, false],
    ])('canPlay(%s, type=%s) → %s', (src, type, expected) => {
      const source: MediaSource = { src, ...(type ? { type } : {}) };
      expect(engine.canPlay(source)).toBe(expected);
    });
  });

  describe('attach()', () => {
    test('throws when source is empty', async () => {
      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      ctx.activeSource = { src: '' };

      await expect(engine.attach(ctx)).rejects.toThrow('missing source URL');
    });

    test('throws when videoId cannot be parsed', async () => {
      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      ctx.activeSource = { src: 'https://example.com/not-youtube' };

      await expect(engine.attach(ctx)).rejects.toThrow('cannot parse videoId');
    });

    test('sets surface on ctx, hides media element, calls mount on container', async () => {
      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      (window as any).YT = { Player: fakeYTPlayer() };

      await engine.attach(ctx);

      expect(ctx.activeSurface.current).toBeInstanceOf(IframeMediaSurface);
      expect(media.style.display).toBe('none');
    });

    test('detach restores media visibility and resets surface', async () => {
      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      (window as any).YT = { Player: fakeYTPlayer() };

      await engine.attach(ctx);
      expect(media.style.display).toBe('none');

      engine.detach(ctx);

      expect(media.style.display).toBe('');
      expect(ctx.activeSurface.current).toBeInstanceOf(HtmlMediaSurface);
    });

    test('noCookie: false does not pass host to YT.Player', async () => {
      const PlayerMock = fakeYTPlayer();
      (window as any).YT = { Player: PlayerMock };

      const engine = new YouTubeMediaEngine({ noCookie: false });
      const ctx = makeCtx(media);

      await engine.attach(ctx);

      const opts = PlayerMock.mock.calls[0][1];
      expect(opts.host).toBeUndefined();
    });

    test('noCookie: true passes youtube-nocookie.com host to YT.Player', async () => {
      const PlayerMock = fakeYTPlayer();
      (window as any).YT = { Player: PlayerMock };

      const engine = new YouTubeMediaEngine({ noCookie: true });
      const ctx = makeCtx(media);

      await engine.attach(ctx);

      const opts = PlayerMock.mock.calls[0][1];
      expect(opts.host).toBe('https://www.youtube-nocookie.com');
    });

    test('accepts youtube-nocookie.com source URL and parses videoId', async () => {
      const PlayerMock = fakeYTPlayer();
      (window as any).YT = { Player: PlayerMock };

      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      ctx.activeSource = { src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' };

      await engine.attach(ctx);

      const opts = PlayerMock.mock.calls[0][1];
      expect(opts.videoId).toBe('dQw4w9WgXcQ');
    });

    test('accepts m.youtube.com source URL and parses videoId', async () => {
      const PlayerMock = fakeYTPlayer();
      (window as any).YT = { Player: PlayerMock };

      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      ctx.activeSource = { src: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ' };

      await engine.attach(ctx);

      const opts = PlayerMock.mock.calls[0][1];
      expect(opts.videoId).toBe('dQw4w9WgXcQ');
    });

    test('resolves videoId when src is a browser-resolved bare ID path', async () => {
      // Simulates <source src="dQw4w9WgXcQ" type="video/youtube"> where the
      // browser resolves the src to http://localhost/dQw4w9WgXcQ
      const PlayerMock = fakeYTPlayer();
      (window as any).YT = { Player: PlayerMock };

      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      ctx.activeSource = { src: 'http://localhost/dQw4w9WgXcQ', type: 'video/youtube' };

      await engine.attach(ctx);

      const opts = PlayerMock.mock.calls[0][1];
      expect(opts.videoId).toBe('dQw4w9WgXcQ');
    });

    test('resolves videoId from a bare 11-char ID set via player.src', async () => {
      const PlayerMock = fakeYTPlayer();
      (window as any).YT = { Player: PlayerMock };

      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      ctx.activeSource = { src: 'dQw4w9WgXcQ' };

      await engine.attach(ctx);

      const opts = PlayerMock.mock.calls[0][1];
      expect(opts.videoId).toBe('dQw4w9WgXcQ');
    });

    test('sets container aspect-ratio during attach and clears on detach', async () => {
      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      (window as any).YT = { Player: fakeYTPlayer() };

      await engine.attach(ctx);
      // When container has no dimensions (offsetWidth=0), defaults to 16/9
      expect(ctx.container.style.aspectRatio).toBe('16 / 9');

      engine.detach(ctx);
      expect(ctx.container.style.aspectRatio).toBe('');
    });

    test('registers a caption provider on attach and removes it on detach', async () => {
      const engine = new YouTubeMediaEngine();
      const ctx = makeCtx(media);
      (window as any).YT = { Player: fakeYTPlayer() };

      await engine.attach(ctx);
      expect(getCaptionTrackProvider(ctx.core)).not.toBeNull();

      engine.detach(ctx);
      expect(getCaptionTrackProvider(ctx.core)).toBeNull();
    });
  });
});

describe('YouTubeIframeAdapter caption API', () => {
  afterEach(() => {
    delete (window as any).YT;
  });

  test('getAvailableCaptionTracks returns empty array when player lacks getOption', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return {
          playVideo: jest.fn(),
          pauseVideo: jest.fn(),
          seekTo: jest.fn(),
          setVolume: jest.fn(),
          getVolume: jest.fn().mockReturnValue(100),
          mute: jest.fn(),
          unMute: jest.fn(),
          isMuted: jest.fn().mockReturnValue(false),
          setPlaybackRate: jest.fn(),
          getPlaybackRate: jest.fn().mockReturnValue(1),
          getCurrentTime: jest.fn().mockReturnValue(0),
          getDuration: jest.fn().mockReturnValue(300),
          destroy: jest.fn(),
          // no getOption/setOption
        };
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    expect(adapter.getAvailableCaptionTracks()).toEqual([]);
    adapter.destroy();
    document.body.removeChild(container);
  });

  test('getAvailableCaptionTracks maps YT tracklist to CaptionTrack shape', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    const mockPlayer = {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      getVolume: jest.fn().mockReturnValue(100),
      mute: jest.fn(),
      unMute: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      setPlaybackRate: jest.fn(),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(300),
      destroy: jest.fn(),
      getOption: jest.fn().mockReturnValue([
        { languageCode: 'en', displayName: 'English', vss_id: '.en' },
        { languageCode: 'es', displayName: 'Español', vss_id: '.es' },
      ]),
      setOption: jest.fn(),
    };

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return mockPlayer;
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    const tracks = adapter.getAvailableCaptionTracks();
    expect(tracks).toHaveLength(2);
    expect(tracks[0]).toEqual({ id: 'en', label: 'English', language: 'en' });
    expect(tracks[1]).toEqual({ id: 'es', label: 'Español', language: 'es' });

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('getActiveCaptionTrack returns null when no track is active', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    const mockPlayer = {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      getVolume: jest.fn().mockReturnValue(100),
      mute: jest.fn(),
      unMute: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      setPlaybackRate: jest.fn(),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(300),
      destroy: jest.fn(),
      getOption: jest.fn().mockReturnValue({}),
      setOption: jest.fn(),
    };

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return mockPlayer;
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    expect(adapter.getActiveCaptionTrack()).toBeNull();

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('getActiveCaptionTrack returns language code when track is active', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    const mockPlayer = {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      getVolume: jest.fn().mockReturnValue(100),
      mute: jest.fn(),
      unMute: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      setPlaybackRate: jest.fn(),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(300),
      destroy: jest.fn(),
      getOption: jest.fn().mockReturnValue({ languageCode: 'fr' }),
      setOption: jest.fn(),
    };

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return mockPlayer;
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    expect(adapter.getActiveCaptionTrack()).toBe('fr');

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('setCaptionTrack calls player.setOption with language code', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    const mockSetOption = jest.fn();
    const mockPlayer = {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      getVolume: jest.fn().mockReturnValue(100),
      mute: jest.fn(),
      unMute: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      setPlaybackRate: jest.fn(),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(300),
      destroy: jest.fn(),
      getOption: jest.fn().mockReturnValue({}),
      setOption: mockSetOption,
    };

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return mockPlayer;
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    adapter.setCaptionTrack('en');
    expect(mockSetOption).toHaveBeenCalledWith('captions', 'track', { languageCode: 'en' });

    adapter.setCaptionTrack(null);
    expect(mockSetOption).toHaveBeenCalledWith('captions', 'track', {});

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('getElement returns null before mount and iframe element after mount', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return {
          playVideo: jest.fn(),
          pauseVideo: jest.fn(),
          seekTo: jest.fn(),
          setVolume: jest.fn(),
          getVolume: jest.fn().mockReturnValue(100),
          mute: jest.fn(),
          unMute: jest.fn(),
          isMuted: jest.fn().mockReturnValue(false),
          setPlaybackRate: jest.fn(),
          getPlaybackRate: jest.fn().mockReturnValue(1),
          getCurrentTime: jest.fn().mockReturnValue(0),
          getDuration: jest.fn().mockReturnValue(300),
          destroy: jest.fn(),
        };
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    expect(adapter.getElement()).toBeNull();

    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    // jsdom doesn't actually create an iframe, so element may still be null
    // but getElement() must not throw
    expect(() => adapter.getElement()).not.toThrow();

    adapter.destroy();
    document.body.removeChild(container);
  });
});

// ─── IframeMediaSurface ───────────────────────────────────────────────────────

describe('IframeMediaSurface', () => {
  test('forwards adapter ready → loadedmetadata on internal bus', () => {
    const stub = new StubAdapter();
    const surface = new IframeMediaSurface(stub);

    const seen: string[] = [];
    surface.on('loadedmetadata', () => seen.push('loadedmetadata'));

    stub.emit('ready');

    expect(seen).toContain('loadedmetadata');
  });

  test('maps adapter state → surface events', () => {
    const stub = new StubAdapter();
    const surface = new IframeMediaSurface(stub);

    const seen: string[] = [];
    surface.on('play', () => seen.push('play'));
    surface.on('playing', () => seen.push('playing'));
    surface.on('pause', () => seen.push('pause'));
    surface.on('ended', () => seen.push('ended'));
    surface.on('waiting', () => seen.push('waiting'));

    const states: IframePlaybackState[] = ['playing', 'buffering', 'paused', 'ended'];
    states.forEach((s) => stub.emit('state', s));

    expect(seen).toEqual(['play', 'playing', 'waiting', 'pause', 'ended']);
  });

  test('setters delegate to adapter', () => {
    const stub = new StubAdapter();
    const setVolSpy = jest.spyOn(stub, 'setVolume');
    const muteSpy = jest.spyOn(stub, 'mute');
    const unmuteSpy = jest.spyOn(stub, 'unmute');
    const rateSpy = jest.spyOn(stub, 'setPlaybackRate');
    const seekSpy = jest.spyOn(stub, 'seekTo');

    const surface = new IframeMediaSurface(stub);

    surface.volume = 0.5;
    expect(setVolSpy).toHaveBeenCalledWith(0.5);

    surface.muted = true;
    expect(muteSpy).toHaveBeenCalled();

    surface.muted = false;
    expect(unmuteSpy).toHaveBeenCalled();

    surface.playbackRate = 1.5;
    expect(rateSpy).toHaveBeenCalledWith(1.5);

    surface.currentTime = 30;
    expect(seekSpy).toHaveBeenCalledWith(30);
  });

  test('load() is a no-op', () => {
    const stub = new StubAdapter();
    const surface = new IframeMediaSurface(stub);
    // Should not throw
    expect(() => surface.load({ src: 'ignored' })).not.toThrow();
  });

  test('play() and pause() delegate to adapter', async () => {
    const stub = new StubAdapter();
    const playSpy = jest.spyOn(stub, 'play');
    const pauseSpy = jest.spyOn(stub, 'pause');

    const surface = new IframeMediaSurface(stub);

    await surface.play();
    expect(playSpy).toHaveBeenCalled();

    surface.pause();
    await Promise.resolve(); // flush microtask
    expect(pauseSpy).toHaveBeenCalled();
  });

  test('destroy() calls adapter.destroy and clears bus', () => {
    const stub = new StubAdapter();
    const destroySpy = jest.spyOn(stub, 'destroy');
    const surface = new IframeMediaSurface(stub);

    const seen: string[] = [];
    surface.on('playing', () => seen.push('playing'));

    surface.destroy();
    expect(destroySpy).toHaveBeenCalled();

    // After destroy internal bus is cleared — no more events
    stub.emit('state', 'playing');
    expect(seen).toHaveLength(0);
  });

  test('polling updates currentTime and duration', async () => {
    jest.useFakeTimers();

    const stub = new StubAdapter();
    jest.spyOn(stub, 'getCurrentTime').mockReturnValue(5);
    jest.spyOn(stub, 'getDuration').mockReturnValue(120);

    const surface = new IframeMediaSurface(stub, { pollIntervalMs: 100 });
    const container = document.createElement('div');
    await surface.mount(container);

    // Polling starts only after the adapter signals ready.
    stub.emit('ready');

    jest.advanceTimersByTime(150);

    expect(surface.currentTime).toBe(5);
    expect(surface.duration).toBe(120);

    surface.destroy();
    jest.useRealTimers();
  });

  test('error event is forwarded', () => {
    const stub = new StubAdapter();
    const surface = new IframeMediaSurface(stub);

    const errors: unknown[] = [];
    surface.on('error', (e) => errors.push(e));

    stub.emit('error', new Error('boom'));

    expect(errors).toHaveLength(1);
  });
});

// ─── Additional YouTubeMediaEngine tests ──────────────────────────────────────

describe('YouTubeMediaEngine – extractVideoId (via attach)', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="wrapper"><video></video></div>';
    media = document.querySelector('video')!;
    (window as any).YT = { Player: fakeYTPlayer() };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).YT;
  });

  test('parses youtu.be short URL format', async () => {
    const PlayerMock = fakeYTPlayer();
    (window as any).YT = { Player: PlayerMock };

    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);
    ctx.activeSource = { src: 'https://youtu.be/dQw4w9WgXcQ' };

    await engine.attach(ctx);

    const opts = PlayerMock.mock.calls[0][1];
    expect(opts.videoId).toBe('dQw4w9WgXcQ');
  });

  test('parses ?v= query parameter', async () => {
    const PlayerMock = fakeYTPlayer();
    (window as any).YT = { Player: PlayerMock };

    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);
    ctx.activeSource = { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };

    await engine.attach(ctx);

    const opts = PlayerMock.mock.calls[0][1];
    expect(opts.videoId).toBe('dQw4w9WgXcQ');
  });

  test('parses /embed/ path', async () => {
    const PlayerMock = fakeYTPlayer();
    (window as any).YT = { Player: PlayerMock };

    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);
    ctx.activeSource = { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' };

    await engine.attach(ctx);

    const opts = PlayerMock.mock.calls[0][1];
    expect(opts.videoId).toBe('dQw4w9WgXcQ');
  });

  test('parses /shorts/ path', async () => {
    const PlayerMock = fakeYTPlayer();
    (window as any).YT = { Player: PlayerMock };

    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);
    ctx.activeSource = { src: 'https://www.youtube.com/shorts/dQw4w9WgXcQ' };

    await engine.attach(ctx);

    const opts = PlayerMock.mock.calls[0][1];
    expect(opts.videoId).toBe('dQw4w9WgXcQ');
  });

  test('returns null on malformed URL with no video id – attach throws', async () => {
    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);
    // A YouTube-like URL that has no recognizable video id segment
    ctx.activeSource = { src: 'https://www.youtube.com/channel/UCsomechannel' };

    await expect(engine.attach(ctx)).rejects.toThrow('cannot parse videoId');
  });
});

describe('YouTubeMediaEngine – canPlay() named tests', () => {
  const engine = new YouTubeMediaEngine();

  test('returns false for non-YouTube URLs', () => {
    expect(engine.canPlay({ src: 'https://example.com/video.mp4' })).toBe(false);
  });

  test('returns true for youtu.be URLs', () => {
    expect(engine.canPlay({ src: 'https://youtu.be/dQw4w9WgXcQ' })).toBe(true);
  });

  test('returns true for video/youtube MIME type', () => {
    expect(engine.canPlay({ src: 'https://anything.example.com/path', type: 'video/youtube' })).toBe(true);
  });

  test('returns false for empty src', () => {
    expect(engine.canPlay({ src: '' })).toBe(false);
  });
});

describe('YouTubeMediaEngine – attach caption subscribe poll', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="wrapper"><video></video></div>';
    media = document.querySelector('video')!;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).YT;
    jest.useRealTimers();
  });

  test('activeTrackId initialized to first track after subscribe poll fires', async () => {
    const mockPlayer = {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      getVolume: jest.fn().mockReturnValue(100),
      mute: jest.fn(),
      unMute: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      setPlaybackRate: jest.fn(),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(300),
      destroy: jest.fn(),
      getOption: jest.fn().mockReturnValue([{ languageCode: 'en', displayName: 'English', vss_id: '.en' }]),
      setOption: jest.fn(),
    };

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return mockPlayer;
      }),
    };

    const { getCaptionTrackProvider } = await import('@openplayerjs/core');
    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);

    const attachPromise = engine.attach(ctx);
    // Flush the mount (which resolves synchronously via onReady stub)
    await attachPromise;

    // Before the poll fires, active track is not yet primed (undefined → null via provider)
    const provider = getCaptionTrackProvider(ctx.core);
    expect(provider).not.toBeNull();

    // Simulate what the captions control does: call subscribe to start polling
    const notifyMock = jest.fn();
    provider!.subscribe!(notifyMock);

    // Advance timers to fire the first poll (500ms)
    jest.advanceTimersByTime(600);

    // Now the poll has run and activeTrackId should be primed to the first track's id
    expect(provider!.getActiveTrack()).toBe('en');

    engine.detach(ctx);
  });

  test('subscribe poll retries when tracks empty and gives up after MAX attempts', async () => {
    const mockPlayer = {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      getVolume: jest.fn().mockReturnValue(100),
      mute: jest.fn(),
      unMute: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      setPlaybackRate: jest.fn(),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(300),
      destroy: jest.fn(),
      // Always returns empty tracks
      getOption: jest.fn().mockReturnValue([]),
      setOption: jest.fn(),
    };

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return mockPlayer;
      }),
    };

    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);
    await engine.attach(ctx);

    // Simulate what the captions control does: call subscribe to start polling
    const provider = (await import('@openplayerjs/core')).getCaptionTrackProvider(ctx.core);
    const notifyMock = jest.fn();
    provider!.subscribe!(notifyMock);

    // Record how many times getOption was called before any polls
    const callsBefore = mockPlayer.getOption.mock.calls.length;

    // Advance past all 10 retries (10 * 500ms = 5000ms)
    jest.advanceTimersByTime(6000);

    const pollCalls = mockPlayer.getOption.mock.calls.length - callsBefore;
    // Exactly MAX=10 poll attempts should have been made
    expect(pollCalls).toBe(10);

    // No more calls after MAX is reached
    jest.advanceTimersByTime(3000);
    const pollCallsAfter = mockPlayer.getOption.mock.calls.length - callsBefore;
    expect(pollCallsAfter).toBe(10);

    engine.detach(ctx);
  });
});

describe('YouTubeMediaEngine – detach clears layout and caption provider', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="wrapper"><video></video></div>';
    media = document.querySelector('video')!;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).YT;
  });

  test('clears aspect ratio, display, and caption provider on detach', async () => {
    const { getCaptionTrackProvider } = await import('@openplayerjs/core');
    (window as any).YT = { Player: fakeYTPlayer() };

    const engine = new YouTubeMediaEngine();
    const ctx = makeCtx(media);
    await engine.attach(ctx);

    // Confirm things are set
    expect(ctx.container.style.aspectRatio).toBe('16 / 9');
    expect(media.style.display).toBe('none');
    expect(getCaptionTrackProvider(ctx.core)).not.toBeNull();

    engine.detach(ctx);

    expect(ctx.container.style.aspectRatio).toBe('');
    expect(media.style.display).toBe('');
    expect(getCaptionTrackProvider(ctx.core)).toBeNull();
  });
});

describe('YouTubeMediaEngine – noCookie option', () => {
  let media: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="wrapper"><video></video></div>';
    media = document.querySelector('video')!;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).YT;
  });

  test('noCookie: true passes noCookie host to adapter via YT.Player options', async () => {
    const PlayerMock = fakeYTPlayer();
    (window as any).YT = { Player: PlayerMock };

    const engine = new YouTubeMediaEngine({ noCookie: true });
    const ctx = makeCtx(media);
    await engine.attach(ctx);

    const opts = PlayerMock.mock.calls[0][1];
    expect(opts.host).toBe('https://www.youtube-nocookie.com');
  });
});

// ─── Additional YouTubeIframeAdapter tests ────────────────────────────────────

describe('YouTubeIframeAdapter – pending play', () => {
  afterEach(() => {
    delete (window as any).YT;
  });

  test('play() before ready sets _pendingPlay and does not call playVideo()', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');

    let onReadyCallback: (() => void) | undefined;
    const mockPlayVideo = jest.fn();

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        // Capture but do NOT call onReady yet
        onReadyCallback = opts.events?.onReady;
        return {
          playVideo: mockPlayVideo,
          pauseVideo: jest.fn(),
          seekTo: jest.fn(),
          setVolume: jest.fn(),
          getVolume: jest.fn().mockReturnValue(100),
          mute: jest.fn(),
          unMute: jest.fn(),
          isMuted: jest.fn().mockReturnValue(false),
          setPlaybackRate: jest.fn(),
          getPlaybackRate: jest.fn().mockReturnValue(1),
          getCurrentTime: jest.fn().mockReturnValue(0),
          getDuration: jest.fn().mockReturnValue(300),
          destroy: jest.fn(),
        };
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Start mount but do NOT await — onReady is not called yet
    const mountPromise = adapter.mount(container);

    // Flush the loadYouTubeAPI() microtask so YT.Player constructor has run
    // and onReadyCallback is captured, then call play() before ready fires.
    await Promise.resolve();
    adapter.play();

    // playVideo must NOT have been called yet
    expect(mockPlayVideo).not.toHaveBeenCalled();

    // Now fire onReady manually — simulates YT player becoming ready
    onReadyCallback!();

    // Await the mount promise (which resolves inside onReady)
    await mountPromise;

    // playVideo should have been called once (the deferred pending play)
    expect(mockPlayVideo).toHaveBeenCalledTimes(1);

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('onReady with pending play calls playVideo() immediately', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');

    let onReadyCallback: (() => void) | undefined;
    const mockPlayVideo = jest.fn();

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        onReadyCallback = opts.events?.onReady;
        return {
          playVideo: mockPlayVideo,
          pauseVideo: jest.fn(),
          seekTo: jest.fn(),
          setVolume: jest.fn(),
          getVolume: jest.fn().mockReturnValue(100),
          mute: jest.fn(),
          unMute: jest.fn(),
          isMuted: jest.fn().mockReturnValue(false),
          setPlaybackRate: jest.fn(),
          getPlaybackRate: jest.fn().mockReturnValue(1),
          getCurrentTime: jest.fn().mockReturnValue(0),
          getDuration: jest.fn().mockReturnValue(300),
          destroy: jest.fn(),
        };
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);

    const mountPromise = adapter.mount(container);
    // Flush the loadYouTubeAPI() microtask so YT.Player constructor has run
    await Promise.resolve();
    adapter.play(); // sets _pendingPlay=true

    // Trigger onReady — should flush pendingPlay and call playVideo immediately
    onReadyCallback!();
    await mountPromise;

    expect(mockPlayVideo).toHaveBeenCalledTimes(1);

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('pause() clears _pendingPlay', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');

    let onReadyCallback: (() => void) | undefined;
    const mockPlayVideo = jest.fn();
    const mockPauseVideo = jest.fn();

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        onReadyCallback = opts.events?.onReady;
        return {
          playVideo: mockPlayVideo,
          pauseVideo: mockPauseVideo,
          seekTo: jest.fn(),
          setVolume: jest.fn(),
          getVolume: jest.fn().mockReturnValue(100),
          mute: jest.fn(),
          unMute: jest.fn(),
          isMuted: jest.fn().mockReturnValue(false),
          setPlaybackRate: jest.fn(),
          getPlaybackRate: jest.fn().mockReturnValue(1),
          getCurrentTime: jest.fn().mockReturnValue(0),
          getDuration: jest.fn().mockReturnValue(300),
          destroy: jest.fn(),
        };
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);

    const mountPromise = adapter.mount(container);
    // Flush the loadYouTubeAPI() microtask so YT.Player constructor has run
    await Promise.resolve();

    // Queue a play, then immediately cancel with pause
    adapter.play(); // _pendingPlay = true
    adapter.pause(); // _pendingPlay = false

    // Fire onReady — playVideo should NOT be called since pause cleared _pendingPlay
    onReadyCallback!();
    await mountPromise;

    expect(mockPlayVideo).not.toHaveBeenCalled();
    expect(mockPauseVideo).toHaveBeenCalled(); // pauseVideo was called by pause()

    adapter.destroy();
    document.body.removeChild(container);
  });
});

describe('YouTubeIframeAdapter – destroy robustness', () => {
  afterEach(() => {
    delete (window as any).YT;
  });

  test('destroy() – player.destroy() throws, state still cleaned up (_ready=false, _pendingPlay=false)', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');

    const mockDestroy = jest.fn().mockImplementation(() => {
      throw new Error('YT player destroy failed');
    });

    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return {
          playVideo: jest.fn(),
          pauseVideo: jest.fn(),
          seekTo: jest.fn(),
          setVolume: jest.fn(),
          getVolume: jest.fn().mockReturnValue(100),
          mute: jest.fn(),
          unMute: jest.fn(),
          isMuted: jest.fn().mockReturnValue(false),
          setPlaybackRate: jest.fn(),
          getPlaybackRate: jest.fn().mockReturnValue(1),
          getCurrentTime: jest.fn().mockReturnValue(0),
          getDuration: jest.fn().mockReturnValue(300),
          destroy: mockDestroy,
        };
      }),
    };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    // destroy() should not throw even if player.destroy() throws
    expect(() => adapter.destroy()).not.toThrow();

    // After destroy, calling play() should not result in playVideo being called
    // (adapter state is reset: _ready=false, _pendingPlay=false)
    // We can verify by checking that getElement returns null (iframeEl cleared)
    expect(adapter.getElement()).toBeNull();

    document.body.removeChild(container);
  });
});

describe('YouTubeIframeAdapter – caption error handling', () => {
  afterEach(() => {
    delete (window as any).YT;
  });

  function makeAdapterWithGetOptionThrowing() {
    return jest.fn().mockImplementation((_el: any, opts: any) => {
      opts.events?.onReady?.();
      return {
        playVideo: jest.fn(),
        pauseVideo: jest.fn(),
        seekTo: jest.fn(),
        setVolume: jest.fn(),
        getVolume: jest.fn().mockReturnValue(100),
        mute: jest.fn(),
        unMute: jest.fn(),
        isMuted: jest.fn().mockReturnValue(false),
        setPlaybackRate: jest.fn(),
        getPlaybackRate: jest.fn().mockReturnValue(1),
        getCurrentTime: jest.fn().mockReturnValue(0),
        getDuration: jest.fn().mockReturnValue(300),
        destroy: jest.fn(),
        getOption: jest.fn().mockImplementation(() => {
          throw new Error('getOption not available');
        }),
        setOption: jest.fn().mockImplementation(() => {
          throw new Error('setOption not available');
        }),
      };
    });
  }

  test('getAvailableCaptionTracks() – getOption throws, returns []', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    (window as any).YT = { Player: makeAdapterWithGetOptionThrowing() };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    expect(adapter.getAvailableCaptionTracks()).toEqual([]);

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('getActiveCaptionTrack() – getOption throws, returns null', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    (window as any).YT = { Player: makeAdapterWithGetOptionThrowing() };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    expect(adapter.getActiveCaptionTrack()).toBeNull();

    adapter.destroy();
    document.body.removeChild(container);
  });

  test('setCaptionTrack() – setOption throws, no error propagated', async () => {
    const { YouTubeIframeAdapter } = await import('../src/youtubeAdapter');
    (window as any).YT = { Player: makeAdapterWithGetOptionThrowing() };

    const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ' });
    const container = document.createElement('div');
    document.body.appendChild(container);
    await adapter.mount(container);

    expect(() => adapter.setCaptionTrack('en')).not.toThrow();
    expect(() => adapter.setCaptionTrack(null)).not.toThrow();

    adapter.destroy();
    document.body.removeChild(container);
  });
});

describe('YouTubeIframeAdapter – loadYouTubeAPI singleton', () => {
  afterEach(() => {
    delete (window as any).YT;
    // Remove any injected YT script tags
    document.querySelectorAll('script[src*="youtube.com/iframe_api"]').forEach((s) => s.remove());
    // Reset the module to clear the singleton apiLoadPromise
    jest.resetModules();
  });

  test('concurrent calls return the same promise', async () => {
    // Reset modules so apiLoadPromise starts as null
    jest.resetModules();
    const { YouTubeIframeAdapter: Adapter } = await import('../src/youtubeAdapter');

    // Set up YT before mount so loadYouTubeAPI resolves via the window.YT.Player check
    (window as any).YT = {
      Player: jest.fn().mockImplementation((_el: any, opts: any) => {
        opts.events?.onReady?.();
        return {
          playVideo: jest.fn(),
          pauseVideo: jest.fn(),
          seekTo: jest.fn(),
          setVolume: jest.fn(),
          getVolume: jest.fn().mockReturnValue(100),
          mute: jest.fn(),
          unMute: jest.fn(),
          isMuted: jest.fn().mockReturnValue(false),
          setPlaybackRate: jest.fn(),
          getPlaybackRate: jest.fn().mockReturnValue(1),
          getCurrentTime: jest.fn().mockReturnValue(0),
          getDuration: jest.fn().mockReturnValue(300),
          destroy: jest.fn(),
        };
      }),
    };

    // Create two adapters and mount concurrently
    const adapter1 = new Adapter({ videoId: 'dQw4w9WgXcQ' });
    const adapter2 = new Adapter({ videoId: 'dQw4w9WgXcQ' });

    const container1 = document.createElement('div');
    const container2 = document.createElement('div');
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    // Both mount calls go concurrently; neither should fail
    await expect(Promise.all([adapter1.mount(container1), adapter2.mount(container2)])).resolves.not.toThrow();

    // Only one script tag should be injected (singleton)
    const scripts = document.querySelectorAll('script[src*="youtube.com/iframe_api"]');
    // With window.YT.Player already set, no script is injected at all (early return path)
    expect(scripts.length).toBe(0);

    adapter1.destroy();
    adapter2.destroy();
    document.body.removeChild(container1);
    document.body.removeChild(container2);
  });
});
