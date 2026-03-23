/**
 * @jest-environment jsdom
 */
import { OmidSession } from '../src/omid';

function makeVideo(): HTMLVideoElement {
  const v = document.createElement('video');
  Object.defineProperty(v, 'duration', { value: 30, writable: true });
  Object.defineProperty(v, 'volume', { value: 1, writable: true });
  Object.defineProperty(v, 'muted', { value: false, writable: true });
  return v;
}

function makeOmidSdk(overrides: Record<string, any> = {}) {
  const adSession = {
    start: jest.fn(),
    finish: jest.fn(),
    triggerSessionStart: jest.fn(),
    error: jest.fn(),
  };
  const videoEvents = {
    impressionOccurred: jest.fn(),
    loaded: jest.fn(),
    start: jest.fn(),
    firstQuartile: jest.fn(),
    midpoint: jest.fn(),
    thirdQuartile: jest.fn(),
    complete: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    skipped: jest.fn(),
    volumeChange: jest.fn(),
    playerStateChange: jest.fn(),
    adUserInteraction: jest.fn(),
    bufferStart: jest.fn(),
    bufferFinish: jest.fn(),
  };
  const adEvents = {
    impressionOccurred: jest.fn(),
  };

  const sdk = {
    Partner: jest.fn().mockImplementation(() => ({})),
    VerificationScriptResource: jest.fn().mockImplementation(() => ({})),
    Context: jest.fn().mockImplementation(() => ({
      setVideoElement: jest.fn(),
      setAccessMode: jest.fn(),
    })),
    AdSession: jest.fn().mockImplementation(() => adSession),
    VideoEvents: jest.fn().mockImplementation(() => videoEvents),
    AdEvents: jest.fn().mockImplementation(() => adEvents),
    VastProperties: jest.fn().mockImplementation(() => ({})),
    AccessMode: { FULL: 'full', DOMAIN: 'domain', LIMITED: 'limited' },
    ...overrides,
  };

  return { sdk, adSession, videoEvents, adEvents };
}

describe('OmidSession', () => {
  const verifications = [{ vendor: 'test.com-omid', scriptUrl: 'https://test.com/omid.js', params: 'ctx=1' }];

  afterEach(() => {
    delete (window as any).OmidSessionClient;
  });

  // ─── isAvailable() ────────────────────────────────────────────────────────────

  it('isAvailable() returns false when SDK is not loaded', () => {
    delete (window as any).OmidSessionClient;
    expect(OmidSession.isAvailable()).toBe(false);
  });

  it('isAvailable() returns true when OmidSessionClient is on window', () => {
    (window as any).OmidSessionClient = {};
    expect(OmidSession.isAvailable()).toBe(true);
  });

  // ─── No-op when SDK absent ────────────────────────────────────────────────────

  it('is a graceful no-op when SDK is not loaded', () => {
    delete (window as any).OmidSessionClient;
    const session = new OmidSession(makeVideo(), verifications);
    expect(() => {
      session.impression();
      session.start(30, 1);
      session.firstQuartile();
      session.midpoint();
      session.thirdQuartile();
      session.complete();
      session.pause();
      session.resume();
      session.skipped();
      session.volumeChange(0.5);
      session.playerStateChange('normal');
      session.adUserInteraction('click');
      session.destroy();
    }).not.toThrow();
  });

  // ─── Session lifecycle ────────────────────────────────────────────────────────

  it('creates AdSession and calls start() in constructor', () => {
    const { sdk, adSession } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;

    new OmidSession(makeVideo(), verifications);

    expect(sdk.AdSession).toHaveBeenCalledTimes(1);
    expect(adSession.start).toHaveBeenCalledTimes(1);
  });

  it('creates VideoEvents with the AdSession', () => {
    const { sdk, adSession } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;

    new OmidSession(makeVideo(), verifications);

    expect(sdk.VideoEvents).toHaveBeenCalledWith(expect.objectContaining(adSession));
  });

  it('creates VerificationScriptResource for each verification', () => {
    const { sdk } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;

    new OmidSession(makeVideo(), [
      { vendor: 'a.com', scriptUrl: 'https://a.com/s.js', params: '' },
      { vendor: 'b.com', scriptUrl: 'https://b.com/s.js', params: 'p=1' },
    ]);

    expect(sdk.VerificationScriptResource).toHaveBeenCalledTimes(2);
  });

  it('sets video element on context if method is available', () => {
    const { sdk } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const video = makeVideo();

    new OmidSession(video, verifications);

    // The Context instance's setVideoElement should have been called with the video
    const ctxInstance = sdk.Context.mock.results[0].value;
    expect(ctxInstance.setVideoElement).toHaveBeenCalledWith(video);
  });

  // ─── impression() ────────────────────────────────────────────────────────────

  it('impression() calls triggerSessionStart and adEvents.impressionOccurred', () => {
    const { sdk, adSession, adEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;

    const session = new OmidSession(makeVideo(), verifications);
    session.impression();

    expect(adSession.triggerSessionStart).toHaveBeenCalledTimes(1);
    expect(adEvents.impressionOccurred).toHaveBeenCalledTimes(1);
  });

  // ─── Video tracking events ────────────────────────────────────────────────────

  it('loaded() calls videoEvents.loaded with VastProperties', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;

    const session = new OmidSession(makeVideo(), verifications);
    session.loaded(true, 5, false, 'preroll');

    expect(videoEvents.loaded).toHaveBeenCalledTimes(1);
    expect(sdk.VastProperties).toHaveBeenCalledWith(true, 5, false, 'preroll');
  });

  it('start() calls videoEvents.start with duration and volume', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;

    const session = new OmidSession(makeVideo(), verifications);
    session.start(30, 0.8);

    expect(videoEvents.start).toHaveBeenCalledWith(30, 0.8);
  });

  it('firstQuartile() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.firstQuartile();
    expect(videoEvents.firstQuartile).toHaveBeenCalledTimes(1);
  });

  it('midpoint() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.midpoint();
    expect(videoEvents.midpoint).toHaveBeenCalledTimes(1);
  });

  it('thirdQuartile() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.thirdQuartile();
    expect(videoEvents.thirdQuartile).toHaveBeenCalledTimes(1);
  });

  it('complete() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.complete();
    expect(videoEvents.complete).toHaveBeenCalledTimes(1);
  });

  it('pause() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.pause();
    expect(videoEvents.pause).toHaveBeenCalledTimes(1);
  });

  it('resume() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.resume();
    expect(videoEvents.resume).toHaveBeenCalledTimes(1);
  });

  it('skipped() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.skipped();
    expect(videoEvents.skipped).toHaveBeenCalledTimes(1);
  });

  it('volumeChange() passes volume to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.volumeChange(0.4);
    expect(videoEvents.volumeChange).toHaveBeenCalledWith(0.4);
  });

  it('playerStateChange() passes state to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.playerStateChange('fullscreen');
    expect(videoEvents.playerStateChange).toHaveBeenCalledWith('fullscreen');
  });

  it('adUserInteraction() passes type to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.adUserInteraction('click');
    expect(videoEvents.adUserInteraction).toHaveBeenCalledWith('click');
  });

  // ─── destroy() ────────────────────────────────────────────────────────────────

  it('destroy() calls adSession.finish()', () => {
    const { sdk, adSession } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.destroy();
    expect(adSession.finish).toHaveBeenCalledTimes(1);
  });

  it('destroy() is idempotent', () => {
    const { sdk, adSession } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.destroy();
    session.destroy();
    expect(adSession.finish).toHaveBeenCalledTimes(1);
  });

  it('methods are no-ops after destroy()', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.destroy();
    session.start(30, 1);
    session.firstQuartile();
    session.pause();
    expect(videoEvents.start).not.toHaveBeenCalled();
    expect(videoEvents.firstQuartile).not.toHaveBeenCalled();
    expect(videoEvents.pause).not.toHaveBeenCalled();
  });

  // ─── injectVerificationScript() ──────────────────────────────────────────────

  it('injectVerificationScript() appends a script tag to head', () => {
    const initialCount = document.head.querySelectorAll('script').length;
    OmidSession.injectVerificationScript('https://example.com/verify.js', 'ctx=42');
    const scripts = document.head.querySelectorAll('script');
    expect(scripts.length).toBe(initialCount + 1);
    const last = scripts[scripts.length - 1];
    expect(last.src).toContain('example.com/verify.js');
    expect(last.getAttribute('data-omid-verification-parameters')).toBe('ctx=42');
    last.remove();
  });

  // ─── accessMode ──────────────────────────────────────────────────────────────

  it('passes limited access mode to context by default', () => {
    const { sdk } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    new OmidSession(makeVideo(), verifications); // default 'limited'
    const ctxInstance = sdk.Context.mock.results[0].value;
    expect(ctxInstance.setAccessMode).toHaveBeenCalledWith('limited');
  });

  it('passes domain access mode when specified', () => {
    const { sdk } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    new OmidSession(makeVideo(), verifications, 'domain');
    const ctxInstance = sdk.Context.mock.results[0].value;
    expect(ctxInstance.setAccessMode).toHaveBeenCalledWith('domain');
  });

  // ─── SDK constructor errors ───────────────────────────────────────────────────

  it('is a graceful no-op when SDK constructor throws', () => {
    const { sdk } = makeOmidSdk({
      AdSession: jest.fn().mockImplementation(() => {
        throw new Error('SDK init failed');
      }),
    });
    (window as any).OmidSessionClient = sdk;

    let session: OmidSession | undefined;
    expect(() => {
      session = new OmidSession(makeVideo(), verifications);
    }).not.toThrow();
    expect(() => session!.start(30, 1)).not.toThrow();
    expect(() => session!.destroy()).not.toThrow();
  });

  // ─── bufferStart / bufferFinish ───────────────────────────────────────────────

  it('bufferStart() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.bufferStart();
    expect(videoEvents.bufferStart).toHaveBeenCalledTimes(1);
  });

  it('bufferFinish() delegates to videoEvents', () => {
    const { sdk, videoEvents } = makeOmidSdk();
    (window as any).OmidSessionClient = sdk;
    const session = new OmidSession(makeVideo(), verifications);
    session.bufferFinish();
    expect(videoEvents.bufferFinish).toHaveBeenCalledTimes(1);
  });

  it('bufferStart() is a no-op when SDK absent', () => {
    delete (window as any).OmidSessionClient;
    const session = new OmidSession(makeVideo(), verifications);
    expect(() => session.bufferStart()).not.toThrow();
  });

  it('bufferFinish() is a no-op when SDK absent', () => {
    delete (window as any).OmidSessionClient;
    const session = new OmidSession(makeVideo(), verifications);
    expect(() => session.bufferFinish()).not.toThrow();
  });

  // ─── impression() adSession.start() fallback ─────────────────────────────────

  it('impression() falls back to adSession.start() when triggerSessionStart is not a function', () => {
    const startFn = jest.fn();
    const { sdk, adEvents } = makeOmidSdk({
      AdSession: jest.fn().mockImplementation(() => ({
        start: startFn,
        finish: jest.fn(),
        error: jest.fn(),
        // triggerSessionStart intentionally absent (not a function)
      })),
    });
    (window as any).OmidSessionClient = sdk;

    const session = new OmidSession(makeVideo(), verifications);
    // Clear calls made during constructor (adSession.start is called once on init)
    startFn.mockClear();

    session.impression();

    // impression() called start() via fallback (no triggerSessionStart)
    expect(startFn).toHaveBeenCalledTimes(1);
    expect(adEvents.impressionOccurred).toHaveBeenCalledTimes(1);
  });
});
