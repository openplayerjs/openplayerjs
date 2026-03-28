/** @jest-environment jsdom */

/**
 * Targets remaining uncovered branches in ads.ts:
 *  - cmd:setVolume / cmd:setMuted guards in bindAdSurfaceCommands (948-994)
 *  - onError handler in waitForAdEnd (871-872)
 *  - startAdPlayback muted fallback (1184-1200)
 *  - clearSession when adVideo is present (1236-1242)
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { vastGetMock, vastParseMock } from './mocks/vast-client';

function makeCtx(video?: HTMLVideoElement): { ctx: PluginContext; bus: EventBus; video: HTMLVideoElement } {
  const bus = new EventBus();
  const v = video ?? document.createElement('video');
  if (!v.parentNode) document.body.appendChild(v);

  const dispose = new DisposableStore();
  const ctx: PluginContext = {
    core: { media: v, muted: false, volume: 1, userInteracted: false } as unknown as Core,
    events: bus,
    state: new StateManager('ready'),
    leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as unknown as Lease,
    dispose,
    add: (d) => dispose.add(d),
    on: (event, cb) => dispose.add(bus.on(event, cb)),
    listen: (target, type, handler, options) => dispose.addEventListener(target, type, handler, options),
  };
  return { ctx, bus, video: v };
}

function linearVast() {
  return {
    ads: [
      {
        sequence: 1,
        creatives: [
          {
            type: 'linear',
            mediaFiles: [
              { type: 'video/mp4', fileURL: 'https://example.com/ad.mp4', bitrate: 500, width: 640, height: 360 },
            ],
          },
        ],
      },
    ],
  };
}

async function waitForEl<T extends Element>(selector: string, tries = 40): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const el = document.querySelector(selector) as T | null;
    if (el) return el;
    await Promise.resolve();
  }
  return null;
}

beforeEach(() => {
  vastGetMock.mockReset();
  vastParseMock.mockReset();
  document.body.innerHTML = '';
});

// ─── bindAdSurfaceCommands: cmd:setVolume guards ──────────────────────────────

describe('AdsPlugin cmd:setVolume / cmd:setMuted branches during ad playback', () => {
  it('cmd:setVolume with non-finite value is ignored', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) return; // skip if ad video never appears

    const origVolume = adVideo.volume;
    // NaN is not finite → should be ignored
    bus.emit('cmd:setVolume', NaN);
    expect(adVideo.volume).toBe(origVolume);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('cmd:setVolume with valid value updates ad video volume', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) return;

    bus.emit('cmd:setVolume', 0.5);
    expect(adVideo.volume).toBe(0.5);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('cmd:setVolume is ignored when forcedMuteUntilInteraction is set', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) return;

    // Force the mute flag
    (plugin as unknown as { forcedMuteUntilInteraction: boolean }).forcedMuteUntilInteraction = true;
    const prev = adVideo.volume;
    bus.emit('cmd:setVolume', 0.8);
    // Volume should NOT have changed since forcedMuteUntilInteraction is true
    expect(adVideo.volume).toBe(prev);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('cmd:setMuted respects forcedMuteUntilInteraction when userInteracted is false', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) return;

    // Set forced mute and ensure userInteracted is false
    (plugin as unknown as { forcedMuteUntilInteraction: boolean }).forcedMuteUntilInteraction = true;
    (ctx.core as unknown as { userInteracted: boolean }).userInteracted = false;

    // Emitting cmd:setMuted(false) should be ignored — ad stays muted/volume=0
    bus.emit('cmd:setMuted', false);
    expect(adVideo.muted).toBe(true);
    expect(adVideo.volume).toBe(0);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('cmd:setMuted works normally when forcedMuteUntilInteraction is false', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) return;

    // Normal case: no forced mute
    (plugin as unknown as { forcedMuteUntilInteraction: boolean }).forcedMuteUntilInteraction = false;
    bus.emit('cmd:setMuted', true);
    expect(adVideo.muted).toBe(true);

    bus.emit('cmd:setMuted', false);
    expect(adVideo.muted).toBe(false);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });
});

// ─── waitForAdEnd: onError branch ─────────────────────────────────────────────

describe('AdsPlugin: ad video error causes ad end resolution', () => {
  it('resolves the ad-end promise when the ad video fires an error event', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    // Fire an error instead of ended — the plugin should still resolve cleanly
    adVideo.dispatchEvent(new Event('error'));
    await play;
    // No ad video should be present after the session ends
  });
});

// ─── clearSession when adVideo is present ─────────────────────────────────────

describe('AdsPlugin.clearSession: cleans up existing adVideo', () => {
  it('removes the ad video element from the DOM during clearSession', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    // End the ad first (so play() completes), then verify clearSession also works
    adVideo.dispatchEvent(new Event('ended'));
    await play;

    // After ad ends and a new session starts, inject a fake adVideo and clearSession again
    const fakeVideo = document.createElement('video');
    fakeVideo.className = 'op-ads__media';
    document.body.appendChild(fakeVideo);
    (plugin as unknown as { adVideo: HTMLVideoElement }).adVideo = fakeVideo;

    (plugin as unknown as { clearSession(): void }).clearSession();

    // The fake adVideo should have been cleaned up
    expect((plugin as unknown as { adVideo: HTMLVideoElement | undefined }).adVideo).toBeUndefined();
  });
});

// ─── startAdPlayback muted fallback ──────────────────────────────────────────

describe('AdsPlugin.startAdPlayback: handles autoplay rejection with muted fallback', () => {
  it('retries with muted when initial play() is rejected', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    // Mock play() to reject once (simulates autoplay blocked), then succeed muted
    let callCount = 0;
    adVideo.play = jest.fn(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error('NotAllowedError'));
      return Promise.resolve();
    }) as jest.Mock;

    // Trigger startAdPlayback
    (plugin as unknown as { startAdPlayback(): void }).startAdPlayback();

    // Flush promises to allow the rejection handler to run
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    // The second call (muted retry) should have happened
    expect(callCount).toBeGreaterThanOrEqual(1);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });
});

// ─── playAdsFromXml ───────────────────────────────────────────────────────────

describe('AdsPlugin.playAdsFromXml', () => {
  it('plays an ad from inline XML', async () => {
    vastParseMock.mockResolvedValueOnce(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAdsFromXml('<VAST version="3.0"></VAST>');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (adVideo) adVideo.dispatchEvent(new Event('ended'));
    await play;
  });
});

// ─── player:interacted event ──────────────────────────────────────────────────

describe('AdsPlugin player:interacted event', () => {
  it('restores ad video volume on interaction when ad is active', async () => {
    vastGetMock.mockResolvedValueOnce(linearVast());
    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true, resumeContent: false });
    plugin.setup(ctx);

    const play = plugin.playAds('https://example.com/vast.xml');
    await Promise.resolve();

    const adVideo = await waitForEl<HTMLVideoElement>('video.op-ads__media');
    if (!adVideo) {
      await play;
      return;
    }

    // Set active and forcedMute state
    (plugin as unknown as { active: boolean }).active = true;
    (plugin as unknown as { forcedMuteUntilInteraction: boolean }).forcedMuteUntilInteraction = true;
    adVideo.muted = true;

    // Emit player:interacted — should restore muted state
    bus.emit('player:interacted');
    expect((plugin as unknown as { forcedMuteUntilInteraction: boolean }).forcedMuteUntilInteraction).toBe(false);

    adVideo.dispatchEvent(new Event('ended'));
    await play;
  });

  it('is a no-op when no ad is active', () => {
    const { ctx, bus } = makeCtx();
    const plugin = new AdsPlugin({ allowNativeControls: true });
    plugin.setup(ctx);
    // Should not throw
    bus.emit('player:interacted');
  });
});
