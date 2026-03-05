/** @jest-environment jsdom */

/**
 * Tests targeting the specific bug-fixes applied in the last session:
 *
 *  1. Lazy loadRawDocBestEffort — fetch() must NOT be called before vastClient.get() for URL inputs.
 *  2. Non-linear from parsed object — no secondary fetch when parsed already has non-linears.
 *  3. Non-linear XML fallback — fetch() IS called as a last resort when parsed is empty.
 *  4. VMAP duplicate breakId deduplication — DOM fallback fires when library under-counts <AdBreak>s.
 *  5. suppressResumeOnSuccess — cmd:play is suppressed between sequential breaks in a group.
 *  6. VASTTracker method verification — trackStart/trackFirstQuartile/trackMidpoint/trackThirdQuartile
 *     from the updated mock are wired correctly to ad video events.
 */

import VMAP from '@dailymotion/vmap';
import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { vastGetMock, vastParseMock } from './mocks/vast-client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForAdVideo(tries = 60): Promise<HTMLVideoElement | null> {
  for (let i = 0; i < tries; i++) {
    const el = document.querySelector('video.op-ads__media') as HTMLVideoElement | null;
    if (el) return el;
    await Promise.resolve();
    try {
      jest.advanceTimersByTime?.(0);
    } catch {
      /* ignore if fake timers disabled */
    }
  }
  return null;
}

async function flushPromises(n = 10) {
  for (let i = 0; i < n; i++) await Promise.resolve();
}

function makeLeases(): {
  leases: Lease;
  acquire: jest.MockedFunction<(capability: string, owner: string) => boolean>;
  release: jest.MockedFunction<(capability: string, owner: string) => void>;
  owner: jest.MockedFunction<(capability: string) => string | undefined>;
} {
  const owners = new Map<string, string>();
  const acquire = jest.fn<boolean, [string, string]>((cap, who) => {
    if (owners.has(cap)) return false;
    owners.set(cap, who);
    return true;
  }) as unknown as jest.MockedFunction<(c: string, o: string) => boolean>;
  const release = jest.fn<void, [string, string]>((cap, who) => {
    if (owners.get(cap) === who) owners.delete(cap);
  }) as unknown as jest.MockedFunction<(c: string, o: string) => void>;
  const owner = jest.fn<string | undefined, [string]>((cap) => owners.get(cap)) as unknown as jest.MockedFunction<
    (c: string) => string | undefined
  >;
  return { leases: { acquire, release, owner } as unknown as Lease, acquire, release, owner };
}

function makeCtx(media?: HTMLVideoElement) {
  const bus = new EventBus();
  const video = media ?? document.createElement('video');
  const dispose = new DisposableStore();

  bus.on('cmd:pause', video.pause);
  bus.on('cmd:play', video.play);

  const lease = makeLeases();

  const ctx: PluginContext = {
    core: { media: video } as unknown as Core,
    events: bus,
    state: new StateManager('playing'),
    leases: lease.leases,

    dispose,
    add: (d) => dispose.add(d),
    on: (event, cb) => dispose.add(bus.on(event, cb)),
    listen: (target, type, handler, options) => dispose.addEventListener(target, type, handler, options),
  };

  return { ctx, bus, video, lease };
}

// ---------------------------------------------------------------------------
// VAST fixtures
// ---------------------------------------------------------------------------

function linearParsed() {
  return {
    ads: [
      {
        sequence: '1',
        creatives: [
          {
            linear: {
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
                  minSuggestedDuration: '00:00:03',
                  staticResources: [{ creativeType: 'image/png', value: 'https://example.com/nl.png' }],
                  nonLinearClickThroughURLTemplate: 'https://example.com/nl-click',
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

const nonLinearVastXml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="nl1">
    <InLine>
      <Creatives>
        <Creative>
          <NonLinearAds>
            <NonLinear width="300" height="50" minSuggestedDuration="00:00:03">
              <StaticResource creativeType="image/png">https://example.com/nl-xml.png</StaticResource>
              <NonLinearClickThrough>https://example.com/nl-xml-click</NonLinearClickThrough>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

// ---------------------------------------------------------------------------
// Suite 1 — Lazy fetch guard
// ---------------------------------------------------------------------------

describe('AdsPlugin lazy fetch guard', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as any).fetch = undefined;
  });

  test('fetch() is NOT called when vastClient.get() succeeds for a linear URL input', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed());

    const fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();

    adVideo!.dispatchEvent(new Event('ended'));
    await playP;

    // fetch() should never be called: vastClient.get() handled the request,
    // and a successful linear response does not need a raw-XML fallback.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('fetch() is NOT called when parsed VAST already contains non-linear creatives', async () => {
    // The VAST response contains non-linears directly; no raw XML fetch needed.
    vastGetMock.mockResolvedValueOnce(nonLinearParsed());

    const fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const play = p.playAds('https://example.com/nonlinear.xml');
    await flushPromises(5);

    // Non-linear overlay should appear without a secondary fetch.
    expect(document.querySelector('.op-ads__nonlinear')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();

    // Auto-dismiss after minSuggestedDuration
    jest.advanceTimersByTime(4000);
    await play;
  });

  test('fetch() IS called as a last resort when parsed returns empty and raw XML has non-linears', async () => {
    // Library returns no ads at all.
    vastGetMock.mockResolvedValueOnce({ ads: [] });

    // Raw XML has non-linear creatives.
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue(nonLinearVastXml) });
    (globalThis as any).fetch = fetchMock;

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const play = p.playAds('https://example.com/nonlinear.xml');
    await flushPromises(10);

    // Fetch should have been used as a last resort.
    expect(fetchMock).toHaveBeenCalled();

    // Non-linear DOM should be present after the XML fallback.
    expect(document.querySelector('.op-ads__nonlinear')).toBeTruthy();

    jest.advanceTimersByTime(4000);
    await play;
  });

  test('fetch() IS called to get raw XML when vastClient.get() itself throws', async () => {
    // Primary fetch fails.
    vastGetMock.mockRejectedValueOnce(new Error('network error'));
    // Raw XML fetch succeeds with a valid linear.
    const linearXml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="1">
    <InLine>
      <Creatives>
        <Creative sequence="1">
          <Linear>
            <MediaFiles>
              <MediaFile delivery="progressive" width="640" height="360" type="video/mp4" bitrate="500">
                <![CDATA[https://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
    // vastClient.parseVAST is called on the fetched XML doc
    vastParseMock.mockResolvedValueOnce(linearParsed());

    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue(linearXml) });
    (globalThis as any).fetch = fetchMock;

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();

    adVideo!.dispatchEvent(new Event('ended'));
    await playP;

    // fetch() must have been called to recover from the vastClient.get() failure.
    expect(fetchMock).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — VMAP duplicate breakId deduplication
// ---------------------------------------------------------------------------

describe('AdsPlugin VMAP duplicate breakId deduplication', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as any).fetch = undefined;
  });

  test('two <AdBreak> elements sharing the same breakId are both scheduled via DOM fallback', async () => {
    // Simulate the VMAP library deduplicating two identical breakIds into one entry.
    (VMAP as any).__breaks = [
      {
        breakType: 'linear',
        breakId: 'midroll-1',
        timeOffset: '00:00:15',
        adSource: { adTagURI: { value: 'https://example.com/mid1.xml' } },
      },
      // Library would normally emit only one entry for duplicate breakIds — simulate this by
      // having the second AdBreak present in XML but not in the library output.
    ];

    // XML has TWO <AdBreak> elements with the same breakId.
    const vmapXml = `<?xml version="1.0"?>
<VMAP xmlns="http://www.iab.net/videosuite/vmap" version="1.0">
  <AdBreak breakType="linear" timeOffset="00:00:15" breakId="midroll-1">
    <AdSource allowMultipleAds="true" followRedirects="true">
      <AdTagURI><![CDATA[https://example.com/mid1.xml]]></AdTagURI>
    </AdSource>
  </AdBreak>
  <AdBreak breakType="linear" timeOffset="00:00:15" breakId="midroll-1">
    <AdSource allowMultipleAds="true" followRedirects="true">
      <AdTagURI><![CDATA[https://example.com/mid2.xml]]></AdTagURI>
    </AdSource>
  </AdBreak>
</VMAP>`;

    (globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue(vmapXml) });

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false }) as any;
    p.setup(ctx);

    await p.loadVmapAndMerge([], 'https://example.com/vmap.xml');

    const resolvedBreaks = p.resolvedBreaks as any[];

    // Both midroll breaks must be scheduled (DOM fallback generates unique IDs via loop index).
    const midrolls = resolvedBreaks.filter((b) => typeof b.at === 'number' && b.at === 15);
    expect(midrolls.length).toBe(2);

    // Each must have a unique ID even though the breakId attribute is the same.
    const ids = midrolls.map((b) => b.id);
    expect(new Set(ids).size).toBe(2);
  });

  test('VMAP with unique breakIds still resolves correctly (no false deduplication trigger)', async () => {
    (VMAP as any).__breaks = [
      {
        breakType: 'linear',
        breakId: 'pre',
        timeOffset: 'start',
        adSource: { adTagURI: { value: 'https://example.com/pre.xml' } },
      },
      {
        breakType: 'linear',
        breakId: 'mid',
        timeOffset: '00:00:30',
        adSource: { adTagURI: { value: 'https://example.com/mid.xml' } },
      },
    ];

    // XML also has exactly 2 AdBreaks — library count matches raw count → no DOM fallback needed.
    const vmapXml = `<?xml version="1.0"?>
<VMAP xmlns="http://www.iab.net/videosuite/vmap" version="1.0">
  <AdBreak breakType="linear" timeOffset="start" breakId="pre">
    <AdSource><AdTagURI><![CDATA[https://example.com/pre.xml]]></AdTagURI></AdSource>
  </AdBreak>
  <AdBreak breakType="linear" timeOffset="00:00:30" breakId="mid">
    <AdSource><AdTagURI><![CDATA[https://example.com/mid.xml]]></AdTagURI></AdSource>
  </AdBreak>
</VMAP>`;

    (globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue(vmapXml) });

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false });
    p.setup(ctx);

    await (p as any).loadVmapAndMerge([], 'https://example.com/vmap.xml');

    const resolvedBreaks = (p as any).resolvedBreaks as any[];
    expect(resolvedBreaks.some((b) => b.at === 'preroll')).toBe(true);
    expect(resolvedBreaks.some((b) => b.at === 30)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — suppressResumeOnSuccess in startBreakGroup
// ---------------------------------------------------------------------------

describe('AdsPlugin startBreakGroup suppressResumeOnSuccess', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as any).fetch = undefined;
  });

  test('cmd:play is NOT emitted between two consecutive breaks, but IS emitted after the last', async () => {
    // Two separate VAST responses for the two breaks.
    vastGetMock.mockResolvedValueOnce(linearParsed()); // first break
    vastGetMock.mockResolvedValueOnce(linearParsed()); // second break

    const { ctx, bus } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: true });
    p.setup(ctx);

    const cmdPlays: number[] = [];
    bus.on('cmd:play' as any, () => cmdPlays.push(Date.now()));

    const breaks = [
      { id: 'grp-1', at: 'preroll' as const, source: { type: 'VAST' as const, src: 'https://example.com/ad1.xml' } },
      { id: 'grp-2', at: 'preroll' as const, source: { type: 'VAST' as const, src: 'https://example.com/ad2.xml' } },
    ];

    const groupP = (p as any).startBreakGroup(breaks, 'preroll');

    // ---- First ad ----
    const adVideo1 = await waitForAdVideo();
    expect(adVideo1).toBeTruthy();
    Object.defineProperty(adVideo1!, 'duration', { value: 5, configurable: true });
    adVideo1!.dispatchEvent(new Event('loadedmetadata'));

    const cmdPlayCountBeforeFirstEnd = cmdPlays.length;
    adVideo1!.dispatchEvent(new Event('ended'));

    // Let finish() + next startBreak() setup settle.
    await flushPromises(15);

    // suppressResume=true for non-last break: no cmd:play should have fired yet.
    expect(cmdPlays.length).toBe(cmdPlayCountBeforeFirstEnd);

    // ---- Second ad ----
    const adVideo2 = await waitForAdVideo();
    expect(adVideo2).toBeTruthy();
    Object.defineProperty(adVideo2!, 'duration', { value: 5, configurable: true });
    adVideo2!.dispatchEvent(new Event('loadedmetadata'));
    adVideo2!.dispatchEvent(new Event('ended'));

    await groupP;

    // After the last break, cmd:play should be emitted (resumeContent: true).
    expect(cmdPlays.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — VASTTracker method verification
// ---------------------------------------------------------------------------

describe('AdsPlugin VASTTracker method calls', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as any).fetch = undefined;
  });

  test('trackStart is called when ad video fires playing event', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed());

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();

    Object.defineProperty(adVideo!, 'duration', { value: 20, configurable: true });
    adVideo!.dispatchEvent(new Event('loadedmetadata'));

    const tracker = (p as any).tracker;
    expect(tracker).toBeTruthy();

    adVideo!.dispatchEvent(new Event('playing'));
    expect(tracker.trackStart).toHaveBeenCalledTimes(1);

    // A second playing event (after pause/resume) should call trackResume, not trackStart again.
    adVideo!.dispatchEvent(new Event('pause'));
    adVideo!.dispatchEvent(new Event('playing'));
    expect(tracker.trackStart).toHaveBeenCalledTimes(1); // still only once
    expect(tracker.trackResume).toHaveBeenCalledTimes(1);

    adVideo!.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('trackFirstQuartile, trackMidpoint, trackThirdQuartile, trackComplete called at right percentages', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed());

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();

    Object.defineProperty(adVideo!, 'duration', { value: 40, configurable: true });
    adVideo!.dispatchEvent(new Event('loadedmetadata'));

    const tracker = (p as any).tracker;
    expect(tracker).toBeTruthy();

    // 0% (playing event emits quartile 0)
    adVideo!.dispatchEvent(new Event('playing'));

    // 25%
    adVideo!.currentTime = 10;
    adVideo!.dispatchEvent(new Event('timeupdate'));
    expect(tracker.trackFirstQuartile).toHaveBeenCalledTimes(1);
    expect(tracker.trackMidpoint).not.toHaveBeenCalled();

    // 50%
    adVideo!.currentTime = 20;
    adVideo!.dispatchEvent(new Event('timeupdate'));
    expect(tracker.trackMidpoint).toHaveBeenCalledTimes(1);
    expect(tracker.trackThirdQuartile).not.toHaveBeenCalled();

    // 75%
    adVideo!.currentTime = 30;
    adVideo!.dispatchEvent(new Event('timeupdate'));
    expect(tracker.trackThirdQuartile).toHaveBeenCalledTimes(1);
    expect(tracker.trackComplete).not.toHaveBeenCalled();

    // 100%
    adVideo!.currentTime = 39.99;
    adVideo!.dispatchEvent(new Event('timeupdate'));
    expect(tracker.trackComplete).toHaveBeenCalledTimes(1);

    // Quartile calls are guarded: further timeupdates must NOT repeat them.
    adVideo!.currentTime = 39.99;
    adVideo!.dispatchEvent(new Event('timeupdate'));
    expect(tracker.trackFirstQuartile).toHaveBeenCalledTimes(1);
    expect(tracker.trackMidpoint).toHaveBeenCalledTimes(1);
    expect(tracker.trackThirdQuartile).toHaveBeenCalledTimes(1);
    expect(tracker.trackComplete).toHaveBeenCalledTimes(1);

    adVideo!.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('setDuration and setProgress called during timeupdate', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed());

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();

    Object.defineProperty(adVideo!, 'duration', { value: 30, configurable: true });
    adVideo!.dispatchEvent(new Event('loadedmetadata'));

    const tracker = (p as any).tracker;
    expect(tracker).toBeTruthy();

    adVideo!.currentTime = 5;
    adVideo!.dispatchEvent(new Event('timeupdate'));

    expect(tracker.setDuration).toHaveBeenCalledWith(30);
    expect(tracker.setProgress).toHaveBeenCalledWith(5);

    adVideo!.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('trackMute and trackUnmute called on volumechange events', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed());

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    const adVideo = await waitForAdVideo();
    expect(adVideo).toBeTruthy();

    Object.defineProperty(adVideo!, 'duration', { value: 20, configurable: true });
    adVideo!.dispatchEvent(new Event('loadedmetadata'));

    const tracker = (p as any).tracker;
    expect(tracker).toBeTruthy();

    // Mute: was unmuted (muted=false, volume>0), now mute
    adVideo!.muted = true;
    adVideo!.dispatchEvent(new Event('volumechange'));
    expect(tracker.trackMute).toHaveBeenCalledTimes(1);
    expect(tracker.trackUnmute).not.toHaveBeenCalled();

    // Unmute
    adVideo!.muted = false;
    adVideo!.volume = 0.8;
    adVideo!.dispatchEvent(new Event('volumechange'));
    expect(tracker.trackUnmute).toHaveBeenCalledTimes(1);

    // Muting again
    adVideo!.muted = true;
    adVideo!.dispatchEvent(new Event('volumechange'));
    expect(tracker.trackMute).toHaveBeenCalledTimes(2);

    adVideo!.dispatchEvent(new Event('ended'));
    await playP;
  });

  test('trackImpression is called immediately when ad starts', async () => {
    vastGetMock.mockResolvedValueOnce(linearParsed());

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const playP = p.playAds('https://example.com/vast.xml');
    await waitForAdVideo(); // ensures ad is mounted
    const adVideo = document.querySelector('video.op-ads__media') as HTMLVideoElement;
    expect(adVideo).toBeTruthy();

    // trackImpression must be called synchronously after ad mount (before any events fire).
    const tracker = (p as any).tracker;
    expect(tracker).toBeTruthy();
    expect(tracker.trackImpression).toHaveBeenCalledTimes(1);

    adVideo.dispatchEvent(new Event('ended'));
    await playP;
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — NONLINEAR sourceType path
// ---------------------------------------------------------------------------

describe('AdsPlugin NONLINEAR sourceType path', () => {
  beforeEach(() => {
    (VMAP as any).__breaks = [];
    vastGetMock.mockReset();
    vastParseMock.mockReset();
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as any).fetch = undefined;
  });

  test('NONLINEAR sourceType: non-linear overlay rendered, no playback lease acquired', async () => {
    vastGetMock.mockResolvedValueOnce(nonLinearParsed());

    const fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;

    const { ctx, lease } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    // Use playBreakFromVast directly with NONLINEAR sourceType
    const play = (p as any).playBreakFromVast(
      { kind: 'url', value: 'https://example.com/nonlinear.xml' },
      { kind: 'preroll', id: 'nl-test', sourceType: 'NONLINEAR' }
    );

    await flushPromises(5);

    // Non-linear overlay should be mounted
    expect(document.querySelector('.op-ads__nonlinear')).toBeTruthy();

    // No playback lease should be acquired for non-linear ads
    expect(lease.acquire).not.toHaveBeenCalled();

    // No secondary fetch needed (parsed already has non-linears)
    expect(fetchMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4000);
    await play;
  });

  test('NONLINEAR sourceType: XML fallback when parsed empty, fetch called', async () => {
    // Library returns empty for this URL
    vastGetMock.mockResolvedValueOnce({ ads: [] });

    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue(nonLinearVastXml) });
    (globalThis as any).fetch = fetchMock;

    const { ctx } = makeCtx();
    const p = new AdsPlugin({ allowNativeControls: false, resumeContent: false });
    p.setup(ctx);

    const play = (p as any).playBreakFromVast(
      { kind: 'url', value: 'https://example.com/nonlinear.xml' },
      { kind: 'preroll', id: 'nl-xml', sourceType: 'NONLINEAR' }
    );

    await flushPromises(10);

    // fetch() was called as fallback
    expect(fetchMock).toHaveBeenCalled();

    // Non-linear from XML should appear
    expect(document.querySelector('.op-ads__nonlinear')).toBeTruthy();

    jest.advanceTimersByTime(4000);
    await play;
  });
});
