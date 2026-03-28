/**
 * @jest-environment jsdom
 */
import { SimidSession, SIMID_PLAYER, SIMID_CREATIVE, SIMID_MEDIA } from '../src/simid';
import type { SimidCallbacks } from '../src/simid';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function mockContentWindow(iframe: HTMLIFrameElement, postMessage: jest.Mock) {
  Object.defineProperty(iframe, 'contentWindow', {
    get: () => ({ postMessage }),
    configurable: true,
  });
}

function makeIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = 'about:blank';
  document.body.appendChild(iframe);
  return iframe;
}

function makeVideo(overrides: Partial<{ duration: number; volume: number; muted: boolean; currentTime: number }> = {}): HTMLVideoElement {
  const v = document.createElement('video');
  Object.defineProperty(v, 'duration', { value: overrides.duration ?? 30, writable: true });
  Object.defineProperty(v, 'currentTime', { value: overrides.currentTime ?? 0, writable: true });
  Object.defineProperty(v, 'volume', { value: overrides.volume ?? 1, writable: true });
  Object.defineProperty(v, 'muted', { value: overrides.muted ?? false, writable: true });
  Object.defineProperty(v, 'paused', { value: true, writable: true });
  Object.defineProperty(v, 'ended', { value: false, writable: true });
  Object.defineProperty(v, 'currentSrc', { value: 'https://example.com/ad.mp4', writable: true });
  return v;
}

function makeCallbacks(overrides: Partial<SimidCallbacks> = {}): SimidCallbacks {
  return {
    onSkip: jest.fn(),
    onStop: jest.fn(),
    onPause: jest.fn(),
    onPlay: jest.fn(),
    onClickThrough: jest.fn(),
    onTrackingEvent: jest.fn(),
    onFatal: jest.fn(),
    onLog: jest.fn(),
    ...overrides,
  };
}

/** Dispatch a message with the given data (object or JSON string). */
function dispatch(data: unknown, asString = false) {
  window.dispatchEvent(
    new MessageEvent('message', { data: asString ? JSON.stringify(data) : data })
  );
}

/**
 * Parse a postSpy call's first argument regardless of outgoing format.
 * When the session uses 'json-string' format the spy receives a JSON string;
 * when it uses 'plain' format it receives a plain object.
 */
function getMsg(call: Parameters<jest.Mock>[0]): Record<string, unknown> {
  const data = call[0];
  return typeof data === 'string' ? JSON.parse(data) : (data as Record<string, unknown>);
}

/** Build a mock postSpy that auto-resolves all sent messages (plain-object format). */
function makeAutoResolveSpy(): jest.Mock {
  return jest.fn().mockImplementation((msg) => {
    // Works for plain-object format; json-string format tests use dispatch() directly.
    const id = msg?.messageId ?? msg?.msgId;
    if (id != null) {
      setTimeout(() => {
        dispatch({ type: SIMID_CREATIVE.RESOLVE, messageId: 0, resolves: id, args: {} });
      }, 0);
    }
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

describe('SIMID_PLAYER constants', () => {
  it('has correct message type values', () => {
    expect(SIMID_PLAYER.INIT).toBe('SIMID:Player:init');
    expect(SIMID_PLAYER.START_CREATIVE).toBe('SIMID:Player:startCreative');
    expect(SIMID_PLAYER.AD_PROGRESS).toBe('SIMID:Player:adProgress');
    expect(SIMID_PLAYER.AD_PAUSED).toBe('SIMID:Player:adPaused');
    expect(SIMID_PLAYER.AD_PLAYING).toBe('SIMID:Player:adPlaying');
    expect(SIMID_PLAYER.AD_STOPPED).toBe('SIMID:Player:adStopped');
    expect(SIMID_PLAYER.AD_SKIPPED).toBe('SIMID:Player:adSkipped');
    expect(SIMID_PLAYER.AD_VOLUME).toBe('SIMID:Player:adVolume');
    expect(SIMID_PLAYER.RESIZE).toBe('SIMID:Player:resize');
    expect(SIMID_PLAYER.APP_BACKGROUNDED).toBe('SIMID:Player:appBackgrounded');
    expect(SIMID_PLAYER.APP_FOREGROUNDED).toBe('SIMID:Player:appForegrounded');
    expect(SIMID_PLAYER.RESOLVE).toBe('resolve');
    expect(SIMID_PLAYER.REJECT).toBe('reject');
  });
});

describe('SIMID_MEDIA constants', () => {
  it('has correct message type values', () => {
    expect(SIMID_MEDIA.DURATION_CHANGE).toBe('SIMID:Media:durationchange');
    expect(SIMID_MEDIA.ENDED).toBe('SIMID:Media:ended');
    expect(SIMID_MEDIA.ERROR).toBe('SIMID:Media:error');
    expect(SIMID_MEDIA.PAUSE).toBe('SIMID:Media:pause');
    expect(SIMID_MEDIA.PLAY).toBe('SIMID:Media:play');
    expect(SIMID_MEDIA.PLAYING).toBe('SIMID:Media:playing');
    expect(SIMID_MEDIA.SEEKED).toBe('SIMID:Media:seeked');
    expect(SIMID_MEDIA.SEEKING).toBe('SIMID:Media:seeking');
    expect(SIMID_MEDIA.STALLED).toBe('SIMID:Media:stalled');
    expect(SIMID_MEDIA.TIME_UPDATE).toBe('SIMID:Media:timeupdate');
    expect(SIMID_MEDIA.VOLUME_CHANGE).toBe('SIMID:Media:volumechange');
  });
});

describe('SIMID_CREATIVE constants', () => {
  it('has correct message type values', () => {
    expect(SIMID_CREATIVE.READY).toBe('SIMID:Creative:ready');
    expect(SIMID_CREATIVE.GET_MEDIA_STATE).toBe('SIMID:Creative:getMediaState');
    expect(SIMID_CREATIVE.RESOLVE).toBe('SIMID:Creative:resolve');
    expect(SIMID_CREATIVE.REJECT).toBe('SIMID:Creative:reject');
    expect(SIMID_CREATIVE.REQUEST_SKIP).toBe('SIMID:Creative:requestSkip');
    expect(SIMID_CREATIVE.REQUEST_STOP).toBe('SIMID:Creative:requestStop');
    expect(SIMID_CREATIVE.REQUEST_PAUSE).toBe('SIMID:Creative:requestPause');
    expect(SIMID_CREATIVE.REQUEST_PLAY).toBe('SIMID:Creative:requestPlay');
    expect(SIMID_CREATIVE.CLICK_THROUGH).toBe('SIMID:Creative:clickThrough');
    expect(SIMID_CREATIVE.REPORT_TRACKING).toBe('SIMID:Creative:reportTracking');
    expect(SIMID_CREATIVE.FATAL).toBe('SIMID:Creative:fatal');
    expect(SIMID_CREATIVE.LOG).toBe('SIMID:Creative:log');
  });
});

// ─── SimidSession ─────────────────────────────────────────────────────────────

describe('SimidSession', () => {
  let iframe: HTMLIFrameElement;
  let video: HTMLVideoElement;

  beforeEach(() => {
    iframe = makeIframe();
    video = makeVideo();
  });

  afterEach(() => {
    iframe.remove();
  });

  // ─── Construction / destroy ──────────────────────────────────────────────

  it('attaches a window message listener on construction', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const session = new SimidSession(iframe, video, makeCallbacks());
    expect(addSpy).toHaveBeenCalledWith('message', expect.any(Function));
    session.destroy();
    addSpy.mockRestore();
  });

  it('removes message listener on destroy', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('is idempotent: second destroy() is a no-op', () => {
    const session = new SimidSession(iframe, video, makeCallbacks());
    expect(() => { session.destroy(); session.destroy(); }).not.toThrow();
  });

  it('rejects all pending promises on destroy', async () => {
    const postSpy = jest.fn(); // never resolves
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const p = session.resize(640, 360);
    session.destroy();
    await expect(p).rejects.toMatchObject({ errorCode: 900 });
  });

  // ─── JSON string message parsing ─────────────────────────────────────────

  it('handles messages posted as JSON strings', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REQUEST_SKIP, messageId: 1 }, /* asString */ true);
    expect(cbs.onSkip).toHaveBeenCalledTimes(1);
  });

  it('ignores malformed JSON string messages', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', { data: 'not-json{{{' }));
    expect(cbs.onSkip).not.toHaveBeenCalled();
  });

  it('ignores messages with no type field', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ messageId: 1 });
    expect(cbs.onSkip).not.toHaveBeenCalled();
  });

  it('ignores null message data', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', { data: null }));
    expect(cbs.onSkip).not.toHaveBeenCalled();
  });

  // ─── createSession (SIMID 1.2 handshake) ─────────────────────────────────

  it('responds with resolve when createSession is received', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-123', args: {} });

    const resolveCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.RESOLVE);
    expect(resolveCalls.length).toBeGreaterThanOrEqual(1);
    // The resolve args should reference the original messageId
    const resolveArgs = resolveCalls[0][0].args;
    expect(resolveArgs.messageId).toBe(0);
  });

  it('sends SIMID:Player:init after createSession', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-abc', args: {} });
    await new Promise((r) => setTimeout(r, 20));

    const sentTypes = postSpy.mock.calls.map((c) => c[0].type);
    expect(sentTypes).toContain(SIMID_PLAYER.INIT);
  });

  it('stores the sessionId from createSession and echoes it in subsequent messages', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'my-session', args: {} });
    await new Promise((r) => setTimeout(r, 20));

    session.pause();
    const pauseCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.AD_PAUSED);
    expect(pauseCall?.[0].sessionId).toBe('my-session');
    session.destroy();
  });

  it('does not send init twice if createSession arrives multiple times', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });
    dispatch({ type: 'createSession', messageId: 1, sessionId: 'sess-1', args: {} });
    await new Promise((r) => setTimeout(r, 30));

    const initCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCalls).toHaveLength(1);
  });

  // ─── SIMID:Creative:getMediaState ─────────────────────────────────────────

  it('responds to getMediaState with current media state', () => {
    const v = makeVideo({ currentTime: 5, duration: 30, volume: 0.8, muted: false });
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, v, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.GET_MEDIA_STATE, messageId: 2, args: {} });

    const resolveCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESOLVE);
    expect(resolveCall).toBeDefined();
    const value = resolveCall![0].args.value;
    expect(value.currentTime).toBe(5);
    expect(value.duration).toBe(30);
    expect(value.volume).toBe(0.8);
    expect(value.muted).toBe(false);
    expect(value.paused).toBe(true);
    expect(value.ended).toBe(false);
  });

  it('getMediaState includes currentSrc', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.GET_MEDIA_STATE, messageId: 3, args: {} });

    const resolveCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESOLVE);
    expect(resolveCall![0].args.value.currentSrc).toBe('https://example.com/ad.mp4');
  });

  it('getMediaState also works sent as JSON string', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    // Dispatching as a JSON string triggers json-string outgoing format.
    dispatch({ type: SIMID_CREATIVE.GET_MEDIA_STATE, messageId: 4 }, true);

    // The response is also a JSON string in this format; use getMsg() to parse it.
    const resolveCall = postSpy.mock.calls.find((c) => getMsg(c).type === SIMID_PLAYER.RESOLVE);
    expect(resolveCall).toBeDefined();
  });

  // ─── Outgoing format detection ────────────────────────────────────────────

  it('sends plain objects when creative uses plain object format (default)', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.GET_MEDIA_STATE, messageId: 1 });

    // With plain-object format, spy receives a plain object (not a JSON string).
    expect(typeof postSpy.mock.calls[0][0]).toBe('object');
    expect(postSpy.mock.calls[0][0].type).toBe(SIMID_PLAYER.RESOLVE);
  });

  it('sends JSON strings when creative sends JSON string messages', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    // Triggering format detection: creative sends a JSON-encoded string.
    dispatch({ type: SIMID_CREATIVE.GET_MEDIA_STATE, messageId: 1 }, /* asString */ true);

    // Player must now respond with a JSON string so the creative can JSON.parse(event.data).
    expect(typeof postSpy.mock.calls[0][0]).toBe('string');
    const parsed = JSON.parse(postSpy.mock.calls[0][0]);
    expect(parsed.type).toBe(SIMID_PLAYER.RESOLVE);
  });

  it('format detection persists: subsequent messages also use json-string format', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());

    // First message as JSON string → switches format.
    dispatch({ type: SIMID_CREATIVE.REQUEST_SKIP, messageId: 1 }, true);
    postSpy.mockClear();

    // Subsequent fire-and-forget messages should be JSON strings too.
    session.pause();
    expect(typeof postSpy.mock.calls[0][0]).toBe('string');
    const parsed = JSON.parse(postSpy.mock.calls[0][0]);
    expect(parsed.type).toBe(SIMID_PLAYER.AD_PAUSED);
    session.destroy();
  });

  it('createSession as JSON string triggers json-string format for init', async () => {
    const postSpy = jest.fn().mockImplementation((msg) => {
      // Auto-resolve in json-string mode: parse the string to get the messageId.
      const data = typeof msg === 'string' ? JSON.parse(msg) : msg;
      const id = data?.messageId;
      if (id != null) {
        setTimeout(() => dispatch({ type: SIMID_CREATIVE.RESOLVE, messageId: 0, resolves: id, args: {} }), 0);
      }
    });
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-js', args: {} }, true);
    await new Promise((r) => setTimeout(r, 30));

    // All outgoing messages should be JSON strings.
    for (const call of postSpy.mock.calls) {
      expect(typeof call[0]).toBe('string');
    }
    const initCall = postSpy.mock.calls.find((c) => getMsg(c).type === SIMID_PLAYER.INIT);
    expect(initCall).toBeDefined();
  });

  // ─── startCreative sent automatically after init resolves ────────────────

  it('sends startCreative after createSession → init → creative resolves init (no SIMID:Creative:ready needed)', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-auto', args: {} });
    await new Promise((r) => setTimeout(r, 30));

    const sentTypes = postSpy.mock.calls.map((c) => c[0].type);
    expect(sentTypes).toContain(SIMID_PLAYER.INIT);
    expect(sentTypes).toContain(SIMID_PLAYER.START_CREATIVE);
    // init must precede startCreative
    expect(sentTypes.indexOf(SIMID_PLAYER.INIT)).toBeLessThan(sentTypes.indexOf(SIMID_PLAYER.START_CREATIVE));
  });

  it('does not send startCreative twice when SIMID:Creative:ready arrives after auto-send', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-dedup', args: {} });
    await new Promise((r) => setTimeout(r, 30));

    // Now creative sends ready — started flag should already be set, so no second startCreative.
    dispatch({ type: SIMID_CREATIVE.READY, messageId: 5 });
    await new Promise((r) => setTimeout(r, 20));

    const startCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.START_CREATIVE);
    expect(startCalls).toHaveLength(1);
  });

  // ─── SIMID:Creative:ready handshake ──────────────────────────────────────

  it('sends init + startCreative when SIMID:Creative:ready is received (no prior createSession)', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 50));

    const sentTypes = postSpy.mock.calls.map((c) => c[0].type);
    expect(sentTypes).toContain(SIMID_PLAYER.INIT);
    expect(sentTypes).toContain(SIMID_PLAYER.START_CREATIVE);
    expect(sentTypes.indexOf(SIMID_PLAYER.INIT)).toBeLessThan(sentTypes.indexOf(SIMID_PLAYER.START_CREATIVE));
  });

  it('sends only startCreative on ready when createSession already handled init', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    // createSession triggers init
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-x', args: {} });
    await new Promise((r) => setTimeout(r, 20));

    // ready triggers startCreative (not a second init)
    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 30));

    const initCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.INIT);
    const startCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.START_CREATIVE);
    expect(initCalls).toHaveLength(1);
    expect(startCalls).toHaveLength(1);
  });

  it('does not send startCreative twice if ready fires more than once', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    dispatch({ type: SIMID_CREATIVE.READY, messageId: 2 });
    await new Promise((r) => setTimeout(r, 50));

    const startCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.START_CREATIVE);
    expect(startCalls).toHaveLength(1);
  });

  it('includes videoDuration in environmentData sent with init', async () => {
    const v = makeVideo({ duration: 45 });
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, v, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCall).toBeDefined();
    const env = initCall![0].args.environmentData;
    expect(env.videoDuration).toBe(45);
    expect(env.videoVolume).toBe(1);
  });

  it('environmentData includes SIMID 1.2 required fields', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    const env = initCall![0].args.environmentData;
    expect(env).toMatchObject({
      videoDimensions: expect.objectContaining({ width: expect.any(Number), height: expect.any(Number) }),
      creativeDimensions: expect.objectContaining({ width: expect.any(Number), height: expect.any(Number) }),
      fullscreen: false,
      fullscreenAllowed: true,
      variableDurationAllowed: false,
      skippableState: 'notSkippable',
      version: '1.2',
    });
  });

  it('environmentData videoVolume is 0 when video is muted', async () => {
    const v = makeVideo({ muted: true, volume: 1 });
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, v, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCall![0].args.environmentData.videoVolume).toBe(0);
    expect(initCall![0].args.environmentData.muted).toBe(true);
  });

  it('creativeData contains adParameters and clickThruUri from creativeInfo', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks(), {
      adParameters: 'param=1',
      clickThruUri: 'https://example.com',
    });

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCall![0].args.creativeData).toMatchObject({
      adParameters: 'param=1',
      clickThruUri: 'https://example.com',
    });
  });

  it('creativeData defaults to empty strings when creativeInfo is absent', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCall![0].args.creativeData.adParameters).toBe('');
  });

  // ─── Creative → Player callbacks ─────────────────────────────────────────

  it('calls onSkip when REQUEST_SKIP received (object)', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REQUEST_SKIP, messageId: 2 });
    expect(cbs.onSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when REQUEST_SKIP received (JSON string)', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REQUEST_SKIP, messageId: 2 }, true);
    expect(cbs.onSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onStop when REQUEST_STOP received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REQUEST_STOP, messageId: 3 });
    expect(cbs.onStop).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when REQUEST_PAUSE received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REQUEST_PAUSE, messageId: 4 });
    expect(cbs.onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onPlay when REQUEST_PLAY received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REQUEST_PLAY, messageId: 5 });
    expect(cbs.onPlay).toHaveBeenCalledTimes(1);
  });

  it('calls onClickThrough with url from args.url', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.CLICK_THROUGH, messageId: 6, args: { url: 'https://example.com' } });
    expect(cbs.onClickThrough).toHaveBeenCalledWith('https://example.com');
  });

  it('calls onClickThrough with url from args.clickThroughUrl (fallback)', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.CLICK_THROUGH, messageId: 6, args: { clickThroughUrl: 'https://fallback.com' } });
    expect(cbs.onClickThrough).toHaveBeenCalledWith('https://fallback.com');
  });

  it('does not call onClickThrough when url is empty', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.CLICK_THROUGH, messageId: 6, args: {} });
    expect(cbs.onClickThrough).not.toHaveBeenCalled();
  });

  it('calls onTrackingEvent with event name', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REPORT_TRACKING, messageId: 7, args: { event: 'impression' } });
    expect(cbs.onTrackingEvent).toHaveBeenCalledWith('impression', expect.any(Object));
  });

  it('calls onTrackingEvent using args.trackingEvent fallback', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.REPORT_TRACKING, messageId: 7, args: { trackingEvent: 'start' } });
    expect(cbs.onTrackingEvent).toHaveBeenCalledWith('start', expect.any(Object));
  });

  it('calls onFatal when SIMID:Creative:fatal received with error code and reason', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.FATAL, messageId: 8, errorCode: 901, reason: 'critical failure' });
    expect(cbs.onFatal).toHaveBeenCalledWith(901, 'critical failure');
  });

  it('calls onFatal with defaults when errorCode/reason absent', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.FATAL, messageId: 8 });
    expect(cbs.onFatal).toHaveBeenCalledWith(901, 'Creative fatal error');
  });

  it('calls onLog when SIMID:Creative:log received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    dispatch({ type: SIMID_CREATIVE.LOG, messageId: 9, args: { msg: 'hello' } });
    expect(cbs.onLog).toHaveBeenCalledWith({ msg: 'hello' });
  });

  it('does not throw when onLog is not provided', () => {
    const cbs = makeCallbacks({ onLog: undefined });
    new SimidSession(iframe, video, cbs);
    expect(() => dispatch({ type: SIMID_CREATIVE.LOG, messageId: 9, args: {} })).not.toThrow();
  });

  // ─── REQUEST_FULLSCREEN ──────────────────────────────────────────────────

  it('sends reject when requestFullscreen is not available', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    // Ensure no requestFullscreen on the parent
    const origReqFs = document.body.requestFullscreen;
    delete (document.body as any).requestFullscreen;

    new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: SIMID_CREATIVE.REQUEST_FULLSCREEN, messageId: 10 });

    const rejectCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.REJECT);
    expect(rejectCall).toBeDefined();
    (document.body as any).requestFullscreen = origReqFs;
  });

  // ─── REQUEST_RESIZE ───────────────────────────────────────────────────────

  it('sends SIMID:Player:resize when REQUEST_RESIZE received', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: SIMID_CREATIVE.REQUEST_RESIZE, messageId: 11 });
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.RESIZE)).toBe(true);
  });

  // ─── resolve/reject pending promises ─────────────────────────────────────

  it('resolves a pending promise when SIMID:Creative:resolve received (resolves field)', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.messageId;
    expect(sentId).toBeDefined();

    dispatch({ type: SIMID_CREATIVE.RESOLVE, messageId: 0, resolves: sentId, args: {} });
    await expect(resizePromise).resolves.toBeDefined();
    session.destroy();
  });

  it('resolves a pending promise when args.messageId is used instead of resolves', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.messageId;
    dispatch({ type: SIMID_CREATIVE.RESOLVE, messageId: 0, args: { messageId: sentId, value: {} } });
    await expect(resizePromise).resolves.toBeDefined();
    session.destroy();
  });

  it('rejects a pending promise when SIMID:Creative:reject received', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.messageId;

    dispatch({ type: SIMID_CREATIVE.REJECT, messageId: 0, rejects: sentId, errorCode: 400, reason: 'Not supported' });
    await expect(resizePromise).rejects.toMatchObject({ errorCode: 400 });
    session.destroy();
  });

  it('rejects via args.value when top-level errorCode absent', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.messageId;
    dispatch({ type: SIMID_CREATIVE.REJECT, messageId: 0, args: { messageId: sentId, value: { errorCode: 500, message: 'err' } } });
    await expect(resizePromise).rejects.toMatchObject({ errorCode: 500 });
    session.destroy();
  });

  it('ignores resolve for unknown messageId', () => {
    new SimidSession(iframe, video, makeCallbacks());
    expect(() => dispatch({ type: SIMID_CREATIVE.RESOLVE, resolves: 9999, args: {} })).not.toThrow();
  });

  it('ignores reject for unknown messageId', () => {
    new SimidSession(iframe, video, makeCallbacks());
    expect(() => dispatch({ type: SIMID_CREATIVE.REJECT, rejects: 9999 })).not.toThrow();
  });

  // ─── Player → Creative send methods ──────────────────────────────────────

  it('outgoing messages include messageId, timestamp, and args fields', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.progress(5, 30);
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.AD_PROGRESS);
    expect(call![0].messageId).toBeDefined();
    expect(call![0].timestamp).toBeDefined();
    expect(call![0].args).toBeDefined();
    session.destroy();
  });

  it('progress() sends correct args', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.progress(5, 30);
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.AD_PROGRESS);
    expect(call![0].args).toMatchObject({ currentTime: 5, duration: 30, remainingTime: 25 });
    session.destroy();
  });

  it('pause() sends SIMID:Player:adPaused', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.pause();
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.AD_PAUSED)).toBe(true);
    session.destroy();
  });

  it('resume() sends SIMID:Player:adPlaying', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.resume();
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.AD_PLAYING)).toBe(true);
    session.destroy();
  });

  it('skip() sends SIMID:Player:adSkipped', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.skip();
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.AD_SKIPPED)).toBe(true);
    session.destroy();
  });

  it('volumeChange() sends SIMID:Player:adVolume with correct args', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.volumeChange(0.5, false);
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.AD_VOLUME);
    expect(call![0].args).toMatchObject({ volume: 0.5, muted: false });
    session.destroy();
  });

  it('stop() sends SIMID:Player:adStopped', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const p = session.stop();
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.AD_STOPPED)).toBe(true);
    session.destroy();
    await p.catch(() => undefined);
  });

  it('stop() resolves immediately when session is destroyed', async () => {
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    await expect(session.stop()).resolves.toBeUndefined();
  });

  it('fatal() sends SIMID:Player:fatal with errorCode and reason', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.fatal(901, 'test error');
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.FATAL);
    expect(call![0].args).toMatchObject({ errorCode: 901, reason: 'test error' });
    session.destroy();
  });

  it('resize() returns a promise and sends SIMID:Player:resize', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const p = session.resize(1280, 720);
    await expect(p).resolves.toBeDefined();
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE);
    expect(call![0].args).toMatchObject({ width: 1280, height: 720 });
    session.destroy();
  });

  // ─── Public init() / start() API ─────────────────────────────────────────

  it('public init() sends SIMID:Player:init with provided data', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    await session.init({ adId: '1' }, { playerWidth: 640 });
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(call![0].args.creativeData).toMatchObject({ adId: '1' });
    session.destroy();
  });

  it('public start() sends SIMID:Player:startCreative', async () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    await session.start();
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.START_CREATIVE)).toBe(true);
    session.destroy();
  });

  // ─── Destroyed session guards ─────────────────────────────────────────────

  it('does not send messages after destroy()', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    postSpy.mockClear();
    session.pause();
    session.resume();
    session.volumeChange(0.5, false);
    session.skip();
    session.fatal(900, 'after destroy');
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('does not call callbacks after destroy()', () => {
    const cbs = makeCallbacks();
    const session = new SimidSession(iframe, video, cbs);
    session.destroy();
    dispatch({ type: SIMID_CREATIVE.REQUEST_SKIP, messageId: 99 });
    expect(cbs.onSkip).not.toHaveBeenCalled();
  });

  it('progress() is a no-op after destroy', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    postSpy.mockClear();
    session.progress(1, 30);
    expect(postSpy).not.toHaveBeenCalled();
  });

  // ─── postMessage error handling ───────────────────────────────────────────

  it('send() rejects promise when postMessage throws', async () => {
    const throwingSpy = jest.fn().mockImplementation(() => { throw new Error('cross-origin'); });
    mockContentWindow(iframe, throwingSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    await expect(session.resize(100, 100)).rejects.toThrow('cross-origin');
    session.destroy();
  });

  it('does not throw when iframe has no contentWindow', () => {
    Object.defineProperty(iframe, 'contentWindow', { get: () => null, configurable: true });
    const session = new SimidSession(iframe, video, makeCallbacks());
    expect(() => {
      session.pause();
      session.resume();
      session.skip();
      session.volumeChange(1, false);
      session.fatal(900, 'test');
      session.progress(1, 10);
    }).not.toThrow();
    session.destroy();
  });

  // ─── Legacy msgId compatibility ───────────────────────────────────────────

  it('handles legacy msgId field in incoming messages', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    // Older creatives use msgId instead of messageId
    dispatch({ type: SIMID_CREATIVE.REQUEST_SKIP, msgId: 5 });
    expect(cbs.onSkip).toHaveBeenCalled();
  });

  it('uses messageId from incoming resolve when resolves field is absent', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.messageId;
    // Resolve using args.messageId pattern (no top-level resolves)
    dispatch({ type: SIMID_CREATIVE.RESOLVE, args: { messageId: sentId, value: { ok: true } } });
    await expect(resizePromise).resolves.toMatchObject({ ok: true });
    session.destroy();
  });

  // ─── SIMID:Media:* event bridging ─────────────────────────────────────────

  it('sends SIMID:Media:timeupdate when video fires timeupdate', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    video.dispatchEvent(new Event('timeupdate'));

    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_MEDIA.TIME_UPDATE);
    expect(call).toBeDefined();
    expect(call![0].args).toMatchObject({ currentTime: expect.any(Number), duration: expect.any(Number) });
    session.destroy();
  });

  it('sends SIMID:Media:pause when video fires pause', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    video.dispatchEvent(new Event('pause'));

    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_MEDIA.PAUSE)).toBe(true);
    session.destroy();
  });

  it('sends SIMID:Media:play when video fires play', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    video.dispatchEvent(new Event('play'));

    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_MEDIA.PLAY)).toBe(true);
    session.destroy();
  });

  it('sends SIMID:Media:ended when video fires ended', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    video.dispatchEvent(new Event('ended'));

    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_MEDIA.ENDED)).toBe(true);
    session.destroy();
  });

  it('sends SIMID:Media:volumechange when video fires volumechange', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    video.dispatchEvent(new Event('volumechange'));

    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_MEDIA.VOLUME_CHANGE)).toBe(true);
    session.destroy();
  });

  it('sends SIMID:Media:durationchange when video fires durationchange', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    video.dispatchEvent(new Event('durationchange'));

    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_MEDIA.DURATION_CHANGE)).toBe(true);
    session.destroy();
  });

  it('media event messages include sessionId and timestamp', () => {
    const postSpy = makeAutoResolveSpy();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-media', args: {} });
    video.dispatchEvent(new Event('play'));

    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_MEDIA.PLAY);
    expect(call).toBeDefined();
    expect(call![0].sessionId).toBe('sess-media');
    expect(call![0].timestamp).toBeDefined();
    session.destroy();
  });

  it('does not send media events after destroy()', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    postSpy.mockClear();

    video.dispatchEvent(new Event('timeupdate'));
    video.dispatchEvent(new Event('play'));

    expect(postSpy).not.toHaveBeenCalled();
  });

  // ─── appBackgrounded / appForegrounded ────────────────────────────────────

  it('sends SIMID:Player:appBackgrounded when document becomes hidden', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.APP_BACKGROUNDED)).toBe(true);

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    session.destroy();
  });

  it('sends SIMID:Player:appForegrounded when document becomes visible', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-1', args: {} });

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.APP_FOREGROUNDED)).toBe(true);
    session.destroy();
  });

  it('does not send visibility events after destroy()', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    postSpy.mockClear();

    document.dispatchEvent(new Event('visibilitychange'));

    expect(postSpy).not.toHaveBeenCalled();
  });

  // ─── IAB reference 'resolve'/'reject' types (main bug fix) ───────────────
  // IAB simid_protocol.js and Google's compiled sample creative send type="resolve"
  // (not type="SIMID:Creative:resolve") when acknowledging player messages.

  it('resolves a pending promise when plain type="resolve" received (IAB reference pattern)', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.messageId;
    expect(sentId).toBeDefined();

    // IAB reference creative sends type="resolve", not "SIMID:Creative:resolve"
    dispatch({ type: 'resolve', messageId: 0, resolves: sentId, args: {} });
    await expect(resizePromise).resolves.toBeDefined();
    session.destroy();
  });

  it('rejects a pending promise when plain type="reject" received (IAB reference pattern)', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.messageId;

    dispatch({ type: 'reject', messageId: 0, rejects: sentId, errorCode: 403, reason: 'denied' });
    await expect(resizePromise).rejects.toMatchObject({ errorCode: 403 });
    session.destroy();
  });

  it('sends startCreative via the IAB reference resolve flow (Google sample creative scenario)', async () => {
    // Google's compiled SIMID creative sends createSession → resolves init with type="resolve"
    // then also sends SIMID:Creative:ready. Player must send startCreative exactly once.
    const postSpy = jest.fn().mockImplementation((msg) => {
      const data = typeof msg === 'string' ? JSON.parse(msg) : msg;
      const id = data?.messageId;
      if (id != null) {
        // Simulate creative using plain "resolve" type (IAB reference impl)
        setTimeout(() => dispatch({ type: 'resolve', messageId: 0, resolves: id, args: {} }), 0);
      }
    });
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-google', args: {} });
    await new Promise((r) => setTimeout(r, 30));

    const sentTypes = postSpy.mock.calls.map((c) => c[0].type);
    expect(sentTypes).toContain(SIMID_PLAYER.INIT);
    expect(sentTypes).toContain(SIMID_PLAYER.START_CREATIVE);
    // Exactly one startCreative
    expect(sentTypes.filter((t) => t === SIMID_PLAYER.START_CREATIVE)).toHaveLength(1);
  });

  it('resolves initPromise via plain "resolve" and then sends startCreative on ready', async () => {
    // Edge case: creative resolves init with "resolve" and THEN sends SIMID:Creative:ready
    const postSpy = jest.fn().mockImplementation((msg) => {
      const data = typeof msg === 'string' ? JSON.parse(msg) : msg;
      const id = data?.messageId;
      if (id != null) {
        setTimeout(() => dispatch({ type: 'resolve', messageId: 0, resolves: id, args: {} }), 0);
      }
    });
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-r', args: {} });
    await new Promise((r) => setTimeout(r, 30));

    // Creative also fires ready after init resolved
    dispatch({ type: SIMID_CREATIVE.READY, messageId: 5 });
    await new Promise((r) => setTimeout(r, 20));

    const startCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.START_CREATIVE);
    expect(startCalls).toHaveLength(1);
  });

  // ─── requestChangeAdDuration ─────────────────────────────────────────────

  it('calls onRequestChangeAdDuration when REQUEST_CHANGE_AD_DURATION received', () => {
    const onReq = jest.fn();
    const cbs = makeCallbacks({ onRequestChangeAdDuration: onReq });
    new SimidSession(iframe, video, cbs);

    dispatch({ type: SIMID_CREATIVE.REQUEST_CHANGE_AD_DURATION, messageId: 20, args: { durationChange: 5 } });
    expect(onReq).toHaveBeenCalledTimes(1);
    expect(onReq.mock.calls[0][0]).toBe(5);
  });

  it('resolve callback from onRequestChangeAdDuration sends player resolve', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);

    const onReq = jest.fn((_delta, resolve) => resolve());
    const cbs = makeCallbacks({ onRequestChangeAdDuration: onReq });
    new SimidSession(iframe, video, cbs);

    dispatch({ type: SIMID_CREATIVE.REQUEST_CHANGE_AD_DURATION, messageId: 20, args: { durationChange: 5 } });

    const resolveCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESOLVE);
    expect(resolveCall).toBeDefined();
    expect(resolveCall![0].args.messageId).toBe(20);
  });

  it('reject callback from onRequestChangeAdDuration sends player reject', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);

    const onReq = jest.fn((_delta, _resolve, reject) => reject(403, 'not allowed'));
    const cbs = makeCallbacks({ onRequestChangeAdDuration: onReq });
    new SimidSession(iframe, video, cbs);

    dispatch({ type: SIMID_CREATIVE.REQUEST_CHANGE_AD_DURATION, messageId: 21, args: { durationChange: 10 } });

    const rejectCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.REJECT);
    expect(rejectCall).toBeDefined();
    expect(rejectCall![0].args.messageId).toBe(21);
  });

  it('auto-rejects requestChangeAdDuration when no callback provided', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks()); // no onRequestChangeAdDuration

    dispatch({ type: SIMID_CREATIVE.REQUEST_CHANGE_AD_DURATION, messageId: 22, args: { durationChange: 5 } });

    const rejectCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.REJECT);
    expect(rejectCall).toBeDefined();
  });

  it('adDurationChange() sends SIMID:Player:adDurationChange with duration', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.adDurationChange(35);
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.AD_DURATION_CHANGE);
    expect(call).toBeDefined();
    expect(call![0].args).toMatchObject({ duration: 35 });
    session.destroy();
  });

  it('adDurationChange() is a no-op after destroy', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    postSpy.mockClear();
    session.adDurationChange(35);
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('variableDurationAllowed is true when onRequestChangeAdDuration callback is provided', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks({ onRequestChangeAdDuration: jest.fn() }));

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCall![0].args.environmentData.variableDurationAllowed).toBe(true);
  });

  it('variableDurationAllowed is false when onRequestChangeAdDuration callback is absent', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks()); // no onRequestChangeAdDuration

    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCall![0].args.environmentData.variableDurationAllowed).toBe(false);
  });

  // ─── creativeWindow / _targetOrigin pinning ───────────────────────────────

  it('pins _targetOrigin from event.origin on the first valid message', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    // Dispatch with an explicit origin (mirrors a real cross-origin postMessage from the iframe).
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://creative.test',
        data: { type: 'createSession', messageId: 0, sessionId: 'sess-pin', args: {} },
      })
    );

    // Session should have responded (sendResolve sent), proving postMsg ran with pinned origin.
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.RESOLVE)).toBe(true);
  });

  // ─── default message type branch ─────────────────────────────────────────

  it('ignores unrecognised message types without throwing', () => {
    new SimidSession(iframe, video, makeCallbacks());
    expect(() => dispatch({ type: 'UNKNOWN:Vendor:customEvent', messageId: 99, args: {} })).not.toThrow();
  });

  // ─── onCreativeReady: awaits in-flight initPromise ────────────────────────

  it('awaits initPromise when SIMID:Creative:ready arrives before INIT is acknowledged', async () => {
    // Non-auto-resolving spy so INIT stays pending when READY arrives.
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    new SimidSession(iframe, video, makeCallbacks());

    // createSession → initSent=true, initPromise pending (no resolve yet).
    dispatch({ type: 'createSession', messageId: 0, sessionId: 'sess-pending', args: {} });

    // READY arrives while INIT is still in flight → hits else if (this.initPromise) branch.
    dispatch({ type: SIMID_CREATIVE.READY, messageId: 1 });

    // Now acknowledge INIT to unblock the awaited initPromise.
    const initMsg = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    if (initMsg) {
      dispatch({ type: SIMID_CREATIVE.RESOLVE, messageId: 0, resolves: initMsg[0].messageId, args: {} });
    }
    await new Promise((r) => setTimeout(r, 20));

    // startCreative should be sent exactly once (via onCreativeReady, not the createSession .then path).
    const startCalls = postSpy.mock.calls.filter((c) => c[0].type === SIMID_PLAYER.START_CREATIVE);
    expect(startCalls).toHaveLength(1);
  });
});
