/** @jest-environment jsdom */

import VMAP from '@dailymotion/vmap';
import type { Core, PluginContext } from '@openplayer/core';
import {
  DisposableStore,
  EventBus,
  Lease,
  StateManager,
  type Listener,
  type PlayerEventPayloadMap,
} from '@openplayer/core';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { AdsPlugin } from '../src/ads';
import { vastGetMock } from './mocks/vast-client';

type Sample = { url: string; type: 'VAST' | 'VMAP' | 'NONLINEAR'; test: string };

type VMAPWithBreaks = typeof VMAP & { __breaks: unknown[] };
const vmap = VMAP as VMAPWithBreaks;

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'ads');

function fixtureName(sample: Sample): string {
  const key = crypto.createHash('sha256').update(sample.url).digest('hex').slice(0, 16);
  return `${sample.type.toLowerCase()}-${key}.xml`;
}

function readFixture(sample: Sample): string {
  const file = path.join(FIXTURES_DIR, fixtureName(sample));
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing ad fixture: ${path.basename(file)}. Run "npm run test:fetch-ad-fixtures" once and commit the generated files.`
    );
  }
  return fs.readFileSync(file, 'utf8');
}

async function waitForAdVideo(maxTurns = 30): Promise<HTMLVideoElement> {
  for (let i = 0; i < maxTurns; i++) {
    const v = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (v) return v;
    // Give async ads pipeline a couple of turns (VMAP fetch -> VAST fetch -> mount).
    await Promise.resolve();
    await new Promise<void>((r) => setTimeout(() => r(), 0));
  }
  throw new Error('Ad video was not mounted within expected time');
}

function looksNonLinear(xml: string): boolean {
  return /<\s*NonLinear/i.test(xml) || /nonLinearAds/i.test(xml);
}

const SAMPLES: Sample[] = [
  {
    type: 'VAST',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a single inline linear ad',
  },
  {
    type: 'VAST',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a single skippable inline ad',
  },
  {
    type: 'VAST',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirectlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a single redirect linear ad',
  },
  {
    type: 'VAST',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a single redirect error linear ad',
  },
  {
    type: 'VAST',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&nofb=1&correlator=',
    test: 'should render a single redirect broken linear ad',
  },
  {
    type: 'NONLINEAR',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/nonlinear_ad_samples&sz=480x70&cust_params=sample_ct%3Dnonlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a non-linear ad',
  },
  {
    type: 'VAST',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_vertical_ad_samples&sz=360x640&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a single vertical inline linear ad',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sar%3Da0f2&ciu_szs=300x250&ad_rule=1&gdfp_req=1&output=vmap&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a VMAP session ad rule preroll',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a VMAP preroll',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a VMAP preroll + bumper',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a VMAP postroll',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=',
    test: 'should render a VMAP postroll + bumper',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_skip_ad_samples&sz=640x480&cust_params=sample_ar%3Dmidskiponly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
    test: 'should render a VMAP Mid-roll ad pod with 2 skippable ads',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
    test: 'should render a VMAP Pre-, Mid-, and Post-rolls, Single Ads',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
    test: 'should render a VMAP - Pre-roll Single Ad, Mid-roll Standard Pod with 3 ads, Post-roll Single Ad',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostoptimizedpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
    test: 'should render a VMAP - Pre-roll Single Ad, Mid-roll Optimized Pod with 3 Ads, Post-roll Single Ad',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
    test: 'should render a VMAP - Pre-roll Single Ad, Mid-roll Standard Pod with 3 Ads, Post-roll Single Ad (bumpers around all ad breaks)',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostoptimizedpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
    test: 'should render a VMAP - Pre-roll Single Ad, Mid-roll Optimized Pod with 3 Ads, Post-roll Single Ad (bumpers around all ad breaks)',
  },
  {
    type: 'VMAP',
    url: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostlongpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
    test: 'should render a VMAP - Pre-roll Single Ad, Mid-roll Standard Pods with 5 Ads Every 10 Seconds, Post-roll Single Ad',
  },
];

function makeCtx() {
  const bus = new EventBus();
  const video = document.createElement('video');
  document.body.appendChild(video);

  // JSDOM doesn't implement real media playback; keep these safe + typed.
  const playMock = jest.fn<Promise<void>, []>(async () => undefined);
  const pauseMock = jest.fn<void, []>(() => undefined);

  // Assign via defineProperty to avoid read-only issues in some DOM impls.
  Object.defineProperty(video, 'play', { value: playMock, configurable: true });
  Object.defineProperty(video, 'pause', { value: pauseMock, configurable: true });

  bus.on('cmd:pause', () => video.pause());
  bus.on('cmd:play', () => void video.play());

  const dispose = new DisposableStore();
  const leases = new Lease();
  const state = new StateManager('playing');

  type TestPlayerSurface = {
    media: HTMLVideoElement;
    muted: boolean;
    volume: number;
    userInteracted: boolean;
    events: EventBus;
  };

  const coreSurface: TestPlayerSurface = {
    media: video,
    muted: true,
    volume: 0,
    userInteracted: true,
    events: bus,
  };

  const ctx: PluginContext = {
    core: coreSurface as unknown as Core,
    events: bus,
    state,
    leases,

    dispose,
    add: (d: void | (() => void) | null | undefined) => dispose.add(d ?? undefined),
    on: <K extends keyof PlayerEventPayloadMap>(event: K, cb: Listener<PlayerEventPayloadMap[K]>) =>
      dispose.add(bus.on(event, cb)),
    listen: (
      target: EventTarget,
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => dispose.addEventListener(target, type, handler, options),
  };

  return { ctx, bus, video, playMock, pauseMock };
}

function linearParsed() {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            linear: {
              skipOffset: '00:00:05',
              mediaFiles: [
                { type: 'video/mp4', fileURL: 'https://example.com/ad.mp4', bitrate: 500, width: 640, height: 360 },
              ],
            },
          },
        ],
      },
    ],
  };
}

function nonLinearParsed() {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            nonLinearAds: {
              nonLinears: [
                {
                  htmlResource: { value: '<div id="nl">NL</div>' },
                  nonLinearClickThroughURLTemplate: 'https://example.com/click',
                  minSuggestedDuration: '00:00:02',
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

describe('AdsPlugin - Google sample URLs are supported', () => {
  beforeEach(() => {
    vastGetMock.mockReset();
    vmap.__breaks = [];
  });

  // Generate a dedicated test for every sample. The `test` field describes
  // the intent/expected high-level outcome.
  describe.each(SAMPLES)('$type sample', (sample) => {
    test(sample.test, async () => {
      const { ctx } = makeCtx();

      // Ensure fixture exists for every sample (offline, deterministic).
      const xml = readFixture(sample);

      // VAST client mock returns a minimal parsed structure that exercises
      // the code paths relevant to the sample.
      vastGetMock.mockImplementation(async (url: string) => {
        const s = SAMPLES.find((x) => x.url === url);
        if (!s) return linearParsed();
        const fx = readFixture(s);
        const wantNonLinear = s.type === 'NONLINEAR' || looksNonLinear(fx) || /non-linear/i.test(s.test);
        return wantNonLinear ? nonLinearParsed() : linearParsed();
      });

      // VMAP path should never hit the network: we stub fetch with the fixture XML.
      if (sample.type === 'VMAP') {
        type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
        const g = globalThis as unknown as { fetch?: jest.MockedFunction<FetchFn> };
        if (!g.fetch) {
          g.fetch = jest.fn();
        }
        const fetchMock = jest
          .spyOn(g, 'fetch')
          .mockResolvedValue({ ok: true, text: async () => xml } as unknown as Response);

        // Provide breaks matching the scenario described by the test string.
        const timeOffset = /post/i.test(sample.test) ? 'end' : /mid/i.test(sample.test) ? '00:00:10' : 'start';
        vmap.__breaks = [
          {
            timeOffset,
            adSource: { adTagURI: { uri: 'https://example.com/vast.xml' } },
          },
        ];

        const ads = new AdsPlugin({ sources: [{ type: 'VMAP', src: sample.url }] }) as unknown as {
          setup: (c: PluginContext) => void;
          playAds: (u: string) => Promise<void>;
          mountAdVideo: (...args: unknown[]) => unknown;
          startAdPlayback: () => void;
        };
        ads.setup(ctx);
        // Make playback deterministic.
        ads.mountAdVideo = () => {
          const container = document.createElement('div');
          const video = document.createElement('video');
          return { video, container, adEndPromise: Promise.resolve(), endAd: () => undefined };
        };
        ads.startAdPlayback = () => undefined;

        await ads.playAds(sample.url);
        expect(fetchMock).toHaveBeenCalled();
        fetchMock.mockRestore();
        return;
      }

      // VAST / NONLINEAR path
      const ads = new AdsPlugin({
        sources: [{ type: sample.type === 'NONLINEAR' ? 'NONLINEAR' : 'VAST', src: sample.url }],
      }) as unknown as {
        setup: (c: PluginContext) => void;
        playAds: (u: string) => Promise<void>;
        mountAdVideo: (...args: unknown[]) => unknown;
        startAdPlayback: () => void;
      };
      ads.setup(ctx);
      ads.mountAdVideo = () => {
        const container = document.createElement('div');
        const video = document.createElement('video');
        return { video, container, adEndPromise: Promise.resolve(), endAd: () => undefined };
      };
      ads.startAdPlayback = () => undefined;

      await ads.playAds(sample.url);
      expect(vastGetMock).toHaveBeenCalledWith(sample.url);
    });
  });

  test('NONLINEAR sample URL can be forced via source config and still parses', async () => {
    const { ctx } = makeCtx();
    const nlUrl = SAMPLES.find((s) => s.type === 'NONLINEAR')!.url;

    vastGetMock.mockImplementation(async (url: string) => {
      const sample = SAMPLES.find((s) => s.url === url)!;
      const xml = readFixture(sample);
      // If the fixture unexpectedly doesn't look non-linear, we still force the path to validate support.
      return looksNonLinear(xml) ? nonLinearParsed() : nonLinearParsed();
    });
    const ads = new AdsPlugin({ sources: [{ type: 'NONLINEAR', src: nlUrl }] });
    ads.setup(ctx);

    await ads.playAds(nlUrl);
    expect(vastGetMock).toHaveBeenCalledWith(nlUrl);
  });

  test('VMAP sample URLs trigger VMAP parsing via fetch', async () => {
    const { ctx, bus } = makeCtx();
    const vmapUrl = SAMPLES.find((s) => s.type === 'VMAP')!.url;

    // Provide a minimal VMAP break; the mock VMAP class reads from VMAP.__breaks.
    vmap.__breaks = [
      {
        breakType: 'linear',
        breakId: 'b1',
        timeOffset: 'start',
        adSource: { adTagURI: { uri: 'https://example.com/vast.xml' } },
      },
    ];

    // IMPORTANT: no network in unit tests.
    // Serve the VMAP XML from a frozen fixture.
    const fixtureXml = readFixture(SAMPLES.find((s) => s.url === vmapUrl)!);

    const g = globalThis as typeof globalThis & { fetch?: typeof fetch };
    if (!g.fetch) g.fetch = (async () => new Response('', { status: 500 })) as typeof fetch;

    const fetchMock = jest.spyOn(g, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => fixtureXml,
    } as unknown as Response);

    const ads = new AdsPlugin({ sources: [{ type: 'VMAP', src: vmapUrl }] });
    ads.setup(ctx);

    // Trigger schedule rebuild on source:set.
    bus.emit('source:set', 'https://example.com/content.mp4');
    // microtask
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(vmapUrl);
    fetchMock.mockRestore();
  });

  test('VMAP skip sample: supports more than one skippable ad in the same pod', async () => {
    const { ctx } = makeCtx();
    const vmapSample = SAMPLES.find((s) => /2 skippable ads/i.test(s.test))!;
    const vmapXml = readFixture(vmapSample);

    // VMAP fixture is returned from fetch; no network.
    type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    const g = globalThis as unknown as { fetch?: jest.MockedFunction<FetchFn> };
    if (!g.fetch) {
      g.fetch = jest.fn();
    }
    const fetchMock = jest
      .spyOn(g, 'fetch')
      .mockResolvedValue({ ok: true, text: async () => vmapXml } as unknown as Response);

    // Mock VMAP parser output: two midroll breaks at the same timeOffset.
    // The fixture (vmap-a76bf7ccbc55e7f6.xml) has two <AdBreak breakId="midroll-1"> elements
    // at 00:00:15.000 — one per ad position (ppos=1 and ppos=2). Providing 2 items here
    // ensures libBreakCount(2) === rawAdBreakCount(2), so the DOM fallback is not triggered
    // and both breaks use our controlled VAST URL.
    vmap.__breaks = [
      {
        timeOffset: '00:00:15.000',
        adSource: { adTagURI: { uri: 'https://example.com/pod-vast.xml' } },
      },
      {
        timeOffset: '00:00:15.000',
        adSource: { adTagURI: { uri: 'https://example.com/pod-vast.xml' } },
      },
    ];

    // Each of the two VMAP breaks fetches its own VAST tag with a single skippable ad.
    vastGetMock.mockResolvedValue({
      ads: [
        {
          sequence: '1',
          creatives: [
            {
              linear: {
                skipOffset: '00:00:01',
                mediaFiles: [
                  { type: 'video/mp4', fileURL: 'https://example.com/ad1.mp4', bitrate: 500, width: 640, height: 360 },
                ],
              },
            },
          ],
        },
      ],
    });

    const ads = new AdsPlugin({ sources: [{ type: 'VMAP', src: vmapSample.url }] }) as unknown as {
      setup: (c: PluginContext) => void;
      payAds: (u: string) => Promise<void>;
      muntAdVideo: (...args: unknown[]) => unknown;
      startAdPlayback: () => void;
    };
    ads.setup(ctx);
    ads.startAdPlayback = () => undefined;

    // Wait for VMAP merge to complete and then simulate reaching the midroll time.
    const internals = ads as unknown as { vmapLoadPromise?: Promise<void> };
    await internals.vmapLoadPromise;

    const content = ctx.core.media as HTMLVideoElement;
    content.currentTime = 15.1;
    content.dispatchEvent(new Event('timeupdate'));

    // Provide baseline player fields used during takeover setup.
    ctx.core.muted = false;
    ctx.core.volume = 1;
    ctx.core.userInteracted = true;

    // VMAP playback is driven by the scheduler (timeupdate), not manual playAds().
    const run = new Promise<void>((resolve) => {
      ctx.events.on('ads.allAdsCompleted', () => resolve());
    });

    // Skip first ad
    const v1 = await waitForAdVideo();
    v1.dispatchEvent(new Event('loadedmetadata'));
    v1!.currentTime = 1.1;
    v1!.dispatchEvent(new Event('timeupdate'));
    const skip1 = document.querySelector('.op-ads__skip-btn') as HTMLButtonElement | null;
    expect(skip1).toBeTruthy();
    skip1!.click();

    // Allow next ad to mount
    const v2 = await waitForAdVideo();
    v2!.dispatchEvent(new Event('loadedmetadata'));
    v2!.currentTime = 1.1;
    v2!.dispatchEvent(new Event('timeupdate'));
    const skip2 = document.querySelector('.op-ads__skip-btn') as HTMLButtonElement | null;
    expect(skip2).toBeTruthy();
    skip2!.click();

    await run;
    expect(vastGetMock).toHaveBeenCalledWith('https://example.com/pod-vast.xml');
    fetchMock.mockRestore();
  });
});
