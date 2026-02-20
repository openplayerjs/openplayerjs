/** @jest-environment jsdom */

import VMAP from '@dailymotion/vmap';
import { EventBus } from '../src/core/events';
import type { Player } from '../src/core/player';
import type { PluginContext } from '../src/core/plugin';
import { StateManager } from '../src/core/state';
import { AdsPlugin } from '../src/plugins/ads';
import { vastGetMock, vastParseMock } from './mocks/vast-client';

function makeCtx() {
  const bus = new EventBus();
  const video = document.createElement('video');
  document.body.appendChild(video);

  const ctx: PluginContext = {
    player: { media: video } as unknown as Player,
    events: bus,
    // Preroll interception is only enabled in idle/ready/loading.
    state: new StateManager('ready'),
    leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as any,
  };
  return { ctx, bus, video };
}

async function flushPromises(times = 1) {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
  }
}

function linearParsed(timeOffset = '00:00:00') {
  const parsed = {
    ads: [
      {
        sequence: 1,
        creatives: [
          {
            type: 'linear',
            duration: 5,
            skipDelay: null,
            mediaFiles: [
              { type: 'video/mp4', fileURL: 'https://example.com/ad.mp4', bitrate: 10, width: 640, height: 360 },
            ],
            closedCaptionFiles: [],
            trackingEvents: {},
            clickThroughURLTemplate: null,
            clickTrackingURLTemplates: [],
          },
        ],
      },
    ],
    errorURLTemplates: [],
    version: '3.0',
    extensions: [],
    impressions: [],
    adPods: [],
    xml: null,
    // VMAP uses this for determining break start; we attach on the break config in plugin anyway.
    timeOffset,
  } as any;

  // When AdsPlugin is given a URL source, it uses VASTClient.get(), which in the
  // @dailymotion/vast-client library resolves to a parsed VAST response object.
  // Our mocks should match that shape.
  return parsed;
}

describe('AdsPlugin scheduling', () => {
  beforeEach(() => {
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    // Reset VMAP mock breaks between tests.
    (VMAP as any).__breaks = [];
    // @ts-expect-error - test shim
    global.fetch = undefined;
  });

  test('implicit preroll: VAST source with no explicit breaks intercepts play and starts a preroll session', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      sources: [{ type: 'VAST', src: 'https://example.com/vast.xml' }],
      breaks: [{ at: 'preroll', url: 'https://example.com/preroll.xml' }],
    });
    plugin.setup(ctx);

    ctx.events.emit('source:set' as any);
    ctx.events.emit('playback:play' as any);

    await flushPromises(10);
    expect(vastGetMock).toHaveBeenCalledTimes(1);
    let ad = null as HTMLVideoElement | null;
    for (let i = 0; i < 25; i++) {
      ad = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
      if (ad) break;
      await Promise.resolve();
    }
    expect(ad).toBeTruthy();
  });

  test('VMAP percent-offset: stores a pending percent break and resolves it once duration is known', async () => {
    const { ctx, video } = makeCtx();
    Object.defineProperty(video, 'duration', { value: 200, configurable: true });

    // VMAP mock provides one percent-offset break.
    (VMAP as any).__breaks = [
      {
        breakId: 'mid-50',
        timeOffset: '50%',
        adSource: { adTagURI: 'https://example.com/mid.xml' },
      },
    ];

    const plugin = new AdsPlugin({ sources: [{ type: 'VMAP', src: '<vmap />' }], breaks: [] });
    plugin.setup(ctx);

    ctx.events.emit('source:set' as any);
    await flushPromises(5);

    // Pending break should be queued.
    expect((plugin as any).pendingPercentBreaks?.length).toBe(1);

    // Resolve due break at ~100s (50% of 200).
    const due = (plugin as any).getDueMidrollBreak(101);
    expect(due).toBeTruthy();
    expect(due.at).toBeCloseTo(100, 3);
    expect(due.url).toBe('https://example.com/mid.xml');
  });

  test('playedBreaks are reset on source:set so preroll can play again for new content', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));
    vastGetMock.mockResolvedValueOnce(linearParsed('00:00:00'));

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      sources: [{ type: 'VAST', src: 'https://example.com/vast.xml' }],
      breaks: [{ at: 'preroll', url: 'https://example.com/preroll.xml' }],
    });
    plugin.setup(ctx);

    // First content source
    ctx.events.emit('source:set' as any);
    ctx.events.emit('playback:play' as any);
    await flushPromises(10);
    let ad = null as HTMLVideoElement | null;
    for (let i = 0; i < 25; i++) {
      ad = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
      if (ad) break;
      await Promise.resolve();
    }
    expect(ad).toBeTruthy();

    // End the ad to cleanly exit session
    const adVideo1 = document.querySelector('video.op-ads__media') as HTMLVideoElement;
    Object.defineProperty(adVideo1, 'duration', { value: 5, configurable: true });
    adVideo1.dispatchEvent(new Event('loadedmetadata'));
    // Give the plugin a tick to attach ended listeners before we end the ad.
    await Promise.resolve();
    adVideo1.dispatchEvent(new Event('ended'));
    // Allow finish() cleanup to run
    for (let i = 0; i < 25; i++) {
      await Promise.resolve();
      if (!document.querySelector('video.op-ads__media')) break;
    }
    expect(document.querySelector('video.op-ads__media')).toBeFalsy();

    // New content source -> should allow preroll again
    ctx.events.emit('source:set' as any);
    ctx.events.emit('playback:play' as any);
    await flushPromises(10);
    expect(document.querySelectorAll('video.op-ads__media').length).toBe(1);
  });
});
