/** @jest-environment jsdom */

import { Core, DefaultMediaEngine, EventBus, HtmlMediaSurface } from '@openplayerjs/core';
import type { MediaEngineContext, MediaSurface } from '@openplayerjs/core';
import Hls from 'hls.js';
import { HlsMediaEngine } from '../src/hls';

// Ensure our Hls.js stub provides the methods HlsMediaEngine expects (attach/detach/destroy etc.)
jest.mock('hls.js', () => {
  return {
    __esModule: true,
    default: class HlsMock {
      static isSupported() {
        return true;
      }
      static Events: Record<string, string> = {
        MEDIA_ATTACHED: 'MEDIA_ATTACHED',
        MANIFEST_PARSED: 'MANIFEST_PARSED',
        ERROR: 'ERROR',
      };
      on = jest.fn();
      off = jest.fn();
      loadSource = jest.fn();
      attachMedia = jest.fn();
      detachMedia = jest.fn();
      destroy = jest.fn();
      startLoad = jest.fn();
      stopLoad = jest.fn();
      recoverMediaError = jest.fn();
    },
  };
});

function makeCtx() {
  const media = document.createElement('video');
  media.src = 'https://example.com/video.mp4';
  // jsdom: define duration as writable for tests
  Object.defineProperty(media, 'duration', { value: 10, writable: true, configurable: true });
  const events = new EventBus();
  const core = new Core(media, { plugins: [] });
  const surface = new HtmlMediaSurface(media);
  return {
    media,
    container: media.parentElement ?? media,
    events,
    core,
    surface,
    setSurface(s: MediaSurface) {
      return s;
    },
    resetSurface() {
      return surface;
    },
  };
}

describe('Media engines', () => {
  test('BaseMediaEngine binds media events and commands (seek/volume/rate/play/pause)', () => {
    const engine = new DefaultMediaEngine();
    const ctx = makeCtx();
    const { media, events } = ctx;
    const seen: string[] = [];
    events.on('loadedmetadata', () => seen.push('ready'));
    events.on('timeupdate', () => seen.push('time'));
    events.on('durationchange', () => seen.push('dur'));

    engine.attach({ ...ctx, activeSource: { src: 'x.mp4', type: 'video/mp4' } } as unknown as MediaEngineContext);

    media.currentTime = 1;
    media.dispatchEvent(new Event('timeupdate'));
    media.dispatchEvent(new Event('loadedmetadata'));
    media.dispatchEvent(new Event('durationchange'));
    expect(seen).toContain('ready');
    expect(seen).toContain('time');
    expect(seen).toContain('dur');

    // command bindings
    events.emit('cmd:seek', 5);
    expect(media.currentTime).toBe(5);

    events.emit('cmd:setVolume', 0.5);
    expect(media.volume).toBe(0.5);

    events.emit('cmd:setMuted', true);
    expect(media.muted).toBe(true);

    events.emit('cmd:setRate', 1.25);
    expect(media.playbackRate).toBe(1.25);

    const playSpy = jest.spyOn(media, 'play').mockResolvedValue(undefined);
    const pauseSpy = jest.spyOn(media, 'pause').mockImplementation(() => {
      //
    });
    events.emit('cmd:play');
    events.emit('cmd:pause');
    expect(playSpy).toHaveBeenCalled();
    expect(pauseSpy).toHaveBeenCalled();

    engine.detach();
  });

  test('BaseMediaEngine respects playback lease owner (cannot handle when owned by another)', () => {
    const engine = new DefaultMediaEngine();

    const ctx = makeCtx();
    const { media, events } = ctx;
    engine.attach({ ...ctx, activeSource: { src: 'x.mp4', type: 'video/mp4' } } as unknown as MediaEngineContext);

    // someone else owns playback -> seek/rate commands should no-op
    ctx.core.leases.acquire('playback', 'other');
    events.emit('cmd:seek', 7);
    expect(media.currentTime).not.toBe(7);

    engine.detach();
  });

  test('DefaultMediaEngine canPlay uses canPlayType', () => {
    const engine = new DefaultMediaEngine();
    const source = { src: 'x.mp4', type: 'video/mp4' };
    expect(engine.canPlay(source)).toBe(true);
  });

  test('HlsMediaEngine passes enableDateRangeMetadataCues and enableID3MetadataCues defaults', () => {
    // Capture the config passed to the HlsMock constructor.
    let capturedConfig: Record<string, unknown> | undefined;
    const OrigCtor = Hls;

    const ctorSpy = jest.fn().mockImplementation(function (this: Hls, cfg: ConstructorParameters<typeof Hls>[0]) {
      capturedConfig = cfg;
      Object.assign(this, new OrigCtor(cfg));
    });
    // Copy static members (Events, isSupported, etc.) so HlsMediaEngine can read HlsClass.Events.
    Object.assign(ctorSpy, OrigCtor);
    // Patch the HlsClass reference on a fresh engine instance via config.
    const engine = new HlsMediaEngine({ hlsClass: ctorSpy as unknown as typeof Hls });
    const ctx = makeCtx();
    engine.attach({
      ...ctx,
      activeSource: { src: 'y.m3u8', type: 'application/x-mpegURL' },
    } as unknown as MediaEngineContext);

    // Contract: these flags make hls.js surface EXT-X-DATERANGE and ID3 timed
    // metadata as native metadata-TextTrack cues, so consumers read them via the
    // standard DOM `cuechange` event (no custom player event needed). Do not remove.
    expect(capturedConfig?.renderTextTracksNatively).toBe(true);
    expect(capturedConfig?.enableDateRangeMetadataCues).toBe(true);
    expect(capturedConfig?.enableID3MetadataCues).toBe(true);

    engine.detach();
  });

  test('HlsMediaEngine attachMedia creates a separate hls instance and disposes it', () => {
    const OrigCtor = Hls;

    const ctorSpy = jest.fn().mockImplementation(function (this: Hls, cfg: ConstructorParameters<typeof Hls>[0]) {
      Object.assign(this, new OrigCtor(cfg));
    });
    Object.assign(ctorSpy, OrigCtor);

    const engine = new HlsMediaEngine({ hlsClass: ctorSpy as unknown as typeof Hls });
    const video = document.createElement('video');

    const dispose = engine.attachMedia(video, 'https://example.com/ad.m3u8');

    const instance = ctorSpy.mock.instances[0] as unknown as Record<string, jest.Mock>;
    expect(instance.loadSource).toHaveBeenCalledWith('https://example.com/ad.m3u8');
    expect(instance.attachMedia).toHaveBeenCalledWith(video);

    // HlsMock has no stopLoad — dispose() hits the catch branch then calls detachMedia + destroy.
    expect(() => dispose()).not.toThrow();
    expect(instance.detachMedia).toHaveBeenCalled();
    expect(instance.destroy).toHaveBeenCalled();
  });

  test('HlsMediaEngine canPlay and attaches adapter', async () => {
    const engine = new HlsMediaEngine({ debug: true });
    const { media, events, core } = makeCtx();
    const src = { src: 'https://x/y.m3u8', type: 'application/x-mpegURL' };
    expect(engine.canPlay(src)).toBe(true);

    const { surface, container, setSurface, resetSurface } = makeCtx();
    engine.attach({ media, events, core, activeSource: src, surface, container, setSurface, resetSurface });
    // Trigger play command to cover cmd:play command listener
    const playSpy = jest.spyOn(media, 'play').mockResolvedValue(undefined);
    events.emit('cmd:play');
    // playback handlers in HlsMediaEngine schedule work in microtasks
    await Promise.resolve();
    expect(playSpy).toHaveBeenCalled();

    engine.detach();
  });
});
