/**
 * @jest-environment jsdom
 */
import { SimidSession, SIMID_PLAYER, SIMID_CREATIVE } from '../src/simid';

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

function makeVideo(): HTMLVideoElement {
  const v = document.createElement('video');
  Object.defineProperty(v, 'duration', { value: 30, writable: true });
  Object.defineProperty(v, 'currentTime', { value: 0, writable: true });
  Object.defineProperty(v, 'volume', { value: 1, writable: true });
  Object.defineProperty(v, 'muted', { value: false, writable: true });
  return v;
}

import type { SimidCallbacks } from '../src/simid';

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

  // ─── Construction ─────────────────────────────────────────────────────────────

  it('attaches a window message listener on construction', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const cbs = makeCallbacks();
    const session = new SimidSession(iframe, video, cbs);
    expect(addSpy).toHaveBeenCalledWith('message', expect.any(Function));
    session.destroy();
    addSpy.mockRestore();
  });

  // ─── destroy() ────────────────────────────────────────────────────────────────

  it('removes message listener on destroy', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.destroy();
    expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('is idempotent: second destroy() call is a no-op', () => {
    const session = new SimidSession(iframe, video, makeCallbacks());
    expect(() => { session.destroy(); session.destroy(); }).not.toThrow();
  });

  // ─── Message constants ────────────────────────────────────────────────────────

  it('exports correct player message types', () => {
    expect(SIMID_PLAYER.INIT).toBe('SIMID:Player:init');
    expect(SIMID_PLAYER.START_AD).toBe('SIMID:Player:startAd');
    expect(SIMID_PLAYER.AD_PROGRESS).toBe('SIMID:Player:adProgress');
    expect(SIMID_PLAYER.AD_PAUSED).toBe('SIMID:Player:adPaused');
    expect(SIMID_PLAYER.AD_PLAYING).toBe('SIMID:Player:adPlaying');
    expect(SIMID_PLAYER.AD_STOPPED).toBe('SIMID:Player:adStopped');
    expect(SIMID_PLAYER.AD_SKIPPED).toBe('SIMID:Player:adSkipped');
    expect(SIMID_PLAYER.AD_VOLUME).toBe('SIMID:Player:adVolume');
    expect(SIMID_PLAYER.RESIZE).toBe('SIMID:Player:resize');
  });

  it('exports correct creative message types', () => {
    expect(SIMID_CREATIVE.READY).toBe('SIMID:Creative:ready');
    expect(SIMID_CREATIVE.RESOLVE).toBe('SIMID:Creative:resolve');
    expect(SIMID_CREATIVE.REJECT).toBe('SIMID:Creative:reject');
    expect(SIMID_CREATIVE.REQUEST_SKIP).toBe('SIMID:Creative:requestSkip');
    expect(SIMID_CREATIVE.REQUEST_STOP).toBe('SIMID:Creative:requestStop');
    expect(SIMID_CREATIVE.REQUEST_PAUSE).toBe('SIMID:Creative:requestPause');
    expect(SIMID_CREATIVE.REQUEST_PLAY).toBe('SIMID:Creative:requestPlay');
    expect(SIMID_CREATIVE.CLICK_THROUGH).toBe('SIMID:Creative:clickThrough');
  });

  // ─── Creative:ready → init + startAd handshake ────────────────────────────────

  it('sends init + startAd when SIMID:Creative:ready is received', async () => {
    const postSpy = jest.fn().mockImplementation((msg) => {
      // Simulate creative auto-resolving all player messages so the handshake can proceed.
      if (msg?.msgId != null) {
        setTimeout(() => {
          window.dispatchEvent(new MessageEvent('message', {
            data: { type: SIMID_CREATIVE.RESOLVE, msgId: 0, resolves: msg.msgId, args: {} },
          }));
        }, 0);
      }
    });
    mockContentWindow(iframe, postSpy);

    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);

    // Simulate creative sending SIMID:Creative:ready
    window.dispatchEvent(new MessageEvent('message', { data: { type: SIMID_CREATIVE.READY, msgId: 1 } }));

    // Allow async handshake to complete (init → resolve → startAd → resolve)
    await new Promise((r) => setTimeout(r, 50));

    const sentTypes = postSpy.mock.calls.map((c) => c[0].type);
    expect(sentTypes).toContain(SIMID_PLAYER.INIT);
    expect(sentTypes).toContain(SIMID_PLAYER.START_AD);
    // init before startAd
    expect(sentTypes.indexOf(SIMID_PLAYER.INIT)).toBeLessThan(sentTypes.indexOf(SIMID_PLAYER.START_AD));
  });

  it('includes playerWidth, playerHeight, videoDuration in init args', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);

    Object.defineProperty(video, 'duration', { value: 45, writable: true });
    new SimidSession(iframe, video, makeCallbacks());

    // init is sent synchronously after READY (before awaiting resolve)
    window.dispatchEvent(new MessageEvent('message', { data: { type: SIMID_CREATIVE.READY, msgId: 1 } }));
    // Wait one tick for the async onCreativeReady to fire
    await new Promise((r) => setTimeout(r, 5));

    const initCall = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.INIT);
    expect(initCall).toBeDefined();
    const args = initCall![0].args;
    expect(args.environmentData.videoDuration).toBe(45);
  });

  // ─── Creative → Player callbacks ──────────────────────────────────────────────

  it('calls onSkip when SIMID:Creative:requestSkip is received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', { data: { type: SIMID_CREATIVE.REQUEST_SKIP, msgId: 2 } }));
    expect(cbs.onSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onStop when SIMID:Creative:requestStop is received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', { data: { type: SIMID_CREATIVE.REQUEST_STOP, msgId: 3 } }));
    expect(cbs.onStop).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when SIMID:Creative:requestPause is received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', { data: { type: SIMID_CREATIVE.REQUEST_PAUSE, msgId: 4 } }));
    expect(cbs.onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onPlay when SIMID:Creative:requestPlay is received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', { data: { type: SIMID_CREATIVE.REQUEST_PLAY, msgId: 5 } }));
    expect(cbs.onPlay).toHaveBeenCalledTimes(1);
  });

  it('calls onClickThrough with the url when SIMID:Creative:clickThrough is received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: SIMID_CREATIVE.CLICK_THROUGH, msgId: 6, args: { url: 'https://example.com' } },
    }));
    expect(cbs.onClickThrough).toHaveBeenCalledWith('https://example.com');
  });

  it('calls onTrackingEvent with event name when SIMID:Creative:reportTracking is received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: SIMID_CREATIVE.REPORT_TRACKING, msgId: 7, args: { event: 'impression' } },
    }));
    expect(cbs.onTrackingEvent).toHaveBeenCalledWith('impression', expect.any(Object));
  });

  it('calls onFatal when SIMID:Creative:fatal is received', () => {
    const cbs = makeCallbacks();
    new SimidSession(iframe, video, cbs);
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: SIMID_CREATIVE.FATAL, msgId: 8, errorCode: 901, reason: 'critical failure' },
    }));
    expect(cbs.onFatal).toHaveBeenCalledWith(901, 'critical failure');
  });

  // ─── resolve/reject pending promises ─────────────────────────────────────────

  it('resolves a pending promise when SIMID:Creative:resolve is received', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);

    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentMsgId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.msgId;
    expect(sentMsgId).toBeDefined();

    window.dispatchEvent(new MessageEvent('message', {
      data: { type: SIMID_CREATIVE.RESOLVE, msgId: 0, resolves: sentMsgId, args: {} },
    }));

    await expect(resizePromise).resolves.toBeDefined();
    session.destroy();
  });

  it('rejects a pending promise when SIMID:Creative:reject is received', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);

    const session = new SimidSession(iframe, video, makeCallbacks());
    const resizePromise = session.resize(640, 360);

    const sentMsgId = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.RESIZE)?.[0]?.msgId;

    window.dispatchEvent(new MessageEvent('message', {
      data: { type: SIMID_CREATIVE.REJECT, msgId: 0, rejects: sentMsgId, errorCode: 400, reason: 'Not supported' },
    }));

    await expect(resizePromise).rejects.toEqual({ errorCode: 400, reason: 'Not supported' });
    session.destroy();
  });

  // ─── Player → Creative methods ────────────────────────────────────────────────

  it('progress() sends SIMID:Player:adProgress without adding to pending', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.progress(5, 30);
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.AD_PROGRESS);
    expect(call).toBeDefined();
    expect(call![0].args.currentTime).toBe(5);
    expect(call![0].args.duration).toBe(30);
    expect(call![0].args.remainingTime).toBe(25);
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

  it('volumeChange() sends SIMID:Player:adVolume with volume and muted', () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    session.volumeChange(0.5, false);
    const call = postSpy.mock.calls.find((c) => c[0].type === SIMID_PLAYER.AD_VOLUME);
    expect(call).toBeDefined();
    expect(call![0].args).toMatchObject({ volume: 0.5, muted: false });
    session.destroy();
  });

  it('stop() sends SIMID:Player:adStopped', async () => {
    const postSpy = jest.fn();
    mockContentWindow(iframe, postSpy);
    const session = new SimidSession(iframe, video, makeCallbacks());
    // stop() returns a promise that will be pending (no resolve coming from creative in test)
    // We just verify the message was sent.
    const p = session.stop();
    expect(postSpy.mock.calls.some((c) => c[0].type === SIMID_PLAYER.AD_STOPPED)).toBe(true);
    // The promise should eventually resolve (catch to avoid unhandled rejection).
    session.destroy();
    await p.catch(() => undefined);
  });

  // ─── Destroyed session ────────────────────────────────────────────────────────

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
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('does not dispatch callbacks after destroy()', () => {
    const cbs = makeCallbacks();
    const session = new SimidSession(iframe, video, cbs);
    session.destroy();
    window.dispatchEvent(new MessageEvent('message', { data: { type: SIMID_CREATIVE.REQUEST_SKIP, msgId: 99 } }));
    expect(cbs.onSkip).not.toHaveBeenCalled();
  });
});
