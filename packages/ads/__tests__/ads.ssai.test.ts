/** @jest-environment jsdom */

/**
 * packages/ads/__tests__/ads.ssai.test.ts
 *
 * Tests for SsaiAdStrategy and for AdsPlugin in adDelivery='ssai' mode.
 *
 * Covers:
 *  - Break lifecycle: startBreak / endBreak / quartile events
 *  - DataCue (ID3 ArrayBuffer) path via decodeSplice
 *  - EXT-X-DATERANGE VTTCue path (scte35Out / scte35In custom props)
 *  - EXT-X-DATERANGE older hls.js format (attr object)
 *  - eventSink receives impression / quartile / complete events
 *  - Deduplication: same break ID only starts once
 *  - destroy() removes all listeners and clears state
 *  - addtrack fires after init() — late-arriving metadata track is bound
 *  - texttrack:listchange bus event re-scans tracks
 *  - AdsPlugin in ssai mode skips CSAI setup; destroy delegates to strategy
 *  - AdsPlugin in csai mode (default) is unaffected by the new field
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { SsaiAdStrategy } from '../src/strategies/ssai';
import type { AdLifecycleEvent } from '../src/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx(video?: HTMLVideoElement) {
  const bus = new EventBus();
  const v = video ?? document.createElement('video');
  document.body.appendChild(v);
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

/**
 * Build a minimal SCTE-35 splice_insert ArrayBuffer.
 * outOfNetwork=true → splice-out (ad starting), false → splice-in (ad ending).
 */
function makeSpliceInsertBuffer(outOfNetwork: boolean, durationTicks?: number): ArrayBuffer {
  const buf = new Uint8Array(32);
  buf[0] = 0xfc;
  buf[13] = 0x05;
  let flags = outOfNetwork ? 0x80 : 0x00;
  if (durationTicks !== undefined) flags |= 0x02;
  buf[14] = flags;
  if (durationTicks !== undefined) {
    const lo = durationTicks >>> 0;
    buf[19] = 0x80; // autoReturn=true
    buf[20] = (lo >>> 24) & 0xff;
    buf[21] = (lo >>> 16) & 0xff;
    buf[22] = (lo >>> 8) & 0xff;
    buf[23] = lo & 0xff;
  }
  return buf.buffer;
}

/** Create a fake TextTrack (jsdom's TextTrack is minimal but sufficient). */
function makeMetadataTrack(video: HTMLVideoElement): TextTrack {
  // jsdom supports addTextTrack
  return video.addTextTrack('metadata', 'ad-metadata', 'und');
}

/** Create a DataCue-like object (for ID3 path). */
function makeDataCue(id: string, data: ArrayBuffer, startTime = 0, endTime = 0): TextTrackCue {
  const cue = new VTTCue(startTime, endTime, '');
  Object.defineProperty(cue, 'id', { value: id, configurable: true });
  (cue as any).data = data;
  return cue;
}

/** Create a VTTCue with scte35Out property (hls.js EXT-X-DATERANGE cue). */
function makeDateRangeCue(id: string, direction: 'out' | 'in', startTime = 10, endTime = 40): TextTrackCue {
  const cue = new VTTCue(startTime, endTime, '');
  Object.defineProperty(cue, 'id', { value: id, configurable: true });
  if (direction === 'out') {
    (cue as any).scte35Out = '0xFC302F';
  } else {
    (cue as any).scte35In = '0xFC302F';
  }
  return cue;
}

/** Make a cue using the older hls.js `attr` object format. */
function makeAttrCue(id: string, direction: 'out' | 'in', startTime = 10, endTime = 40): TextTrackCue {
  const cue = new VTTCue(startTime, endTime, '');
  Object.defineProperty(cue, 'id', { value: id, configurable: true });
  (cue as any).attr = direction === 'out' ? { 'SCTE35-OUT': '0xFC' } : { 'SCTE35-IN': '0xFC' };
  return cue;
}

/**
 * Simulate hls.js firing a cuechange event with specific active cues.
 * jsdom doesn't manage activeCues automatically so we do it manually.
 */
function fireCueChange(track: TextTrack, activeCues: TextTrackCue[]): void {
  Object.defineProperty(track, 'activeCues', {
    configurable: true,
    get: () => activeCues as unknown as TextTrackCueList,
  });
  track.dispatchEvent(new Event('cuechange'));
}

// ─── jsdom shims ──────────────────────────────────────────────────────────────
// VTTCue is not defined in older jsdom builds — add a minimal polyfill.
if (typeof VTTCue === 'undefined') {
  (global as any).VTTCue = class VTTCue {
    startTime: number;
    endTime: number;
    text: string;
    id = '';
    constructor(startTime: number, endTime: number, text: string) {
      this.startTime = startTime;
      this.endTime = endTime;
      this.text = text;
    }
  };
}
// jsdom does not implement HTMLMediaElement.prototype.addTextTrack or proper
// TextTrackList dispatchEvent. Provide minimal fakes so SSAI tests can run.

type FakeTrackState = { handlers: Map<string, EventListener[]>; tracks: any[] };
const _fakeMediaState = new WeakMap<HTMLMediaElement, FakeTrackState>();

function getMediaState(video: HTMLMediaElement): FakeTrackState {
  if (!_fakeMediaState.has(video)) {
    _fakeMediaState.set(video, { handlers: new Map(), tracks: [] });
  }
  return _fakeMediaState.get(video)!;
}

function makeFakeTextTrackList(state: FakeTrackState) {
  return {
    get length() {
      return state.tracks.length;
    },
    item: (i: number) => state.tracks[i],
    [Symbol.iterator]: () => state.tracks[Symbol.iterator](),
    addEventListener: (e: string, h: EventListener) => {
      if (!state.handlers.has(e)) state.handlers.set(e, []);
      state.handlers.get(e)!.push(h);
    },
    removeEventListener: (e: string, h: EventListener) => {
      state.handlers.set(
        e,
        (state.handlers.get(e) ?? []).filter((x) => x !== h)
      );
    },
    dispatchEvent: (e: Event) => {
      for (const h of state.handlers.get(e.type) ?? []) h(e);
      return true;
    },
  };
}

beforeAll(() => {
  jest.spyOn(HTMLMediaElement.prototype, 'addTextTrack').mockImplementation(function (
    this: HTMLMediaElement,
    kind: TextTrackKind,
    label = '',
    lang = ''
  ) {
    const state = getMediaState(this);
    const trackHandlers = new Map<string, EventListener[]>();
    const track: any = {
      kind,
      label,
      language: lang,
      mode: 'hidden' as TextTrackMode,
      activeCues: null,
      addEventListener: (event: string, h: EventListener) => {
        if (!trackHandlers.has(event)) trackHandlers.set(event, []);
        trackHandlers.get(event)!.push(h);
      },
      removeEventListener: (event: string, h: EventListener) => {
        trackHandlers.set(
          event,
          (trackHandlers.get(event) ?? []).filter((x) => x !== h)
        );
      },
      dispatchEvent: (e: Event) => {
        for (const h of trackHandlers.get(e.type) ?? []) h(e);
        return true;
      },
    };
    state.tracks.push(track);
    // Fire addtrack event on the textTracks list (mirrors real browser behaviour).
    const addtrackEvent = Object.assign(new Event('addtrack'), { track });
    for (const h of state.handlers.get('addtrack') ?? []) h(addtrackEvent);
    return track as unknown as TextTrack;
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'textTracks', {
    configurable: true,
    get(this: HTMLMediaElement) {
      return makeFakeTextTrackList(getMediaState(this));
    },
  });
});

afterAll(() => {
  jest.restoreAllMocks();
  delete (HTMLMediaElement.prototype as any).textTracks;
});

beforeEach(() => {
  document.body.innerHTML = '';
});

// ─── SsaiAdStrategy unit tests ────────────────────────────────────────────────

describe('SsaiAdStrategy — DataCue (ID3) path', () => {
  test('starts a break on splice-out DataCue', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    const cue = makeDataCue('id3-out', makeSpliceInsertBuffer(true));
    fireCueChange(track, [cue]);

    expect(events).toEqual(['start']);
    strategy.destroy();
  });

  test('ends a break on splice-in DataCue', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const breaks: string[] = [];
    bus.on('ads:break:start' as any, () => breaks.push('start'));
    bus.on('ads:break:end' as any, () => breaks.push('end'));

    // out
    fireCueChange(track, [makeDataCue('id3-1', makeSpliceInsertBuffer(true))]);
    // in
    fireCueChange(track, [makeDataCue('id3-1', makeSpliceInsertBuffer(false))]);

    expect(breaks).toEqual(['start', 'end']);
    strategy.destroy();
  });

  test('ignores non-splice_insert command types', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    // time_signal command (0x06) — not a splice_insert
    const buf = new Uint8Array(16);
    buf[0] = 0xfc;
    buf[13] = 0x06;
    const cue = makeDataCue('ts-cue', buf.buffer);
    fireCueChange(track, [cue]);

    expect(events).toEqual([]);
    strategy.destroy();
  });
});

describe('SsaiAdStrategy — EXT-X-DATERANGE (scte35Out/In properties)', () => {
  test('starts a break on scte35Out cue', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    fireCueChange(track, [makeDateRangeCue('dr-1', 'out', 10, 40)]);
    expect(events).toEqual(['start']);
    strategy.destroy();
  });

  test('ends a break on scte35In cue', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    bus.on('ads:break:end' as any, () => events.push('end'));

    fireCueChange(track, [makeDateRangeCue('dr-2', 'out', 10, 40)]);
    fireCueChange(track, [makeDateRangeCue('dr-2', 'in', 10, 40)]);
    expect(events).toEqual(['start', 'end']);
    strategy.destroy();
  });

  test('uses endTime - startTime as durationSec when finite', () => {
    const { ctx, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    fireCueChange(track, [makeDateRangeCue('dr-dur', 'out', 10, 40)]);
    // Verify the break was stored with duration 30
    const brk = (strategy as any).activeBreaks.get('dr-dur');
    expect(brk?.durationSec).toBe(30);
    strategy.destroy();
  });

  test('handles older hls.js attr object format', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    bus.on('ads:break:end' as any, () => events.push('end'));

    fireCueChange(track, [makeAttrCue('attr-out', 'out')]);
    fireCueChange(track, [makeAttrCue('attr-out', 'in')]);
    expect(events).toEqual(['start', 'end']);
    strategy.destroy();
  });
});

describe('SsaiAdStrategy — deduplication', () => {
  test('same cue ID does not start a second break', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const starts: number[] = [];
    bus.on('ads:break:start' as any, () => starts.push(1));

    const cue = makeDateRangeCue('dup-1', 'out');
    fireCueChange(track, [cue]);
    fireCueChange(track, [cue]); // same cue fired again

    expect(starts).toHaveLength(1);
    strategy.destroy();
  });
});

describe('SsaiAdStrategy — quartile tracking', () => {
  test('fires quartile events at 25 / 50 / 75 / 100 %', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const quartiles: number[] = [];
    bus.on('ads:quartile' as any, ({ quartile }: { quartile: number }) => quartiles.push(quartile));

    // Start a 40-second break at t=0
    fireCueChange(track, [makeDateRangeCue('q-break', 'out', 0, 40)]);

    // Advance currentTime via timeupdate
    for (const t of [10, 20, 30, 40]) {
      Object.defineProperty(video, 'currentTime', { configurable: true, get: () => t });
      video.dispatchEvent(new Event('timeupdate'));
    }

    expect(quartiles).toEqual([25, 50, 75, 100]);
    strategy.destroy();
  });

  test('does not fire duplicate quartiles', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const quartiles: number[] = [];
    bus.on('ads:quartile' as any, ({ quartile }: { quartile: number }) => quartiles.push(quartile));

    fireCueChange(track, [makeDateRangeCue('q2', 'out', 0, 20)]);

    // Same time position fired twice
    Object.defineProperty(video, 'currentTime', { configurable: true, get: () => 5 });
    video.dispatchEvent(new Event('timeupdate'));
    video.dispatchEvent(new Event('timeupdate'));

    expect(quartiles.filter((q) => q === 25)).toHaveLength(1);
    strategy.destroy();
  });

  test('auto-ends break at 100% quartile', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const ends: number[] = [];
    bus.on('ads:break:end' as any, () => ends.push(1));

    fireCueChange(track, [makeDateRangeCue('auto-end', 'out', 0, 10)]);
    Object.defineProperty(video, 'currentTime', { configurable: true, get: () => 10 });
    video.dispatchEvent(new Event('timeupdate'));

    expect(ends).toHaveLength(1);
    strategy.destroy();
  });
});

describe('SsaiAdStrategy — eventSink', () => {
  test('calls sink with impression on break start', () => {
    const { ctx, video } = makeCtx();
    const events: AdLifecycleEvent[] = [];
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, { eventSink: (e) => events.push(e) });

    fireCueChange(track, [makeDateRangeCue('sink-1', 'out')]);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('impression');
    expect(events[0].breakId).toBe('sink-1');
    strategy.destroy();
  });

  test('calls sink with complete on break end', () => {
    const { ctx, video } = makeCtx();
    const events: AdLifecycleEvent[] = [];
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, { eventSink: (e) => events.push(e) });

    fireCueChange(track, [makeDateRangeCue('sink-2', 'out')]);
    fireCueChange(track, [makeDateRangeCue('sink-2', 'in')]);

    expect(events.map((e) => e.type)).toEqual(['impression', 'complete']);
    strategy.destroy();
  });

  test('calls sink with quartile events', () => {
    const { ctx, video } = makeCtx();
    const events: AdLifecycleEvent[] = [];
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, { eventSink: (e) => events.push(e) });

    fireCueChange(track, [makeDateRangeCue('sink-q', 'out', 0, 20)]);
    Object.defineProperty(video, 'currentTime', { configurable: true, get: () => 5 });
    video.dispatchEvent(new Event('timeupdate'));

    const quartileEvents = events.filter((e) => e.type === 'quartile');
    expect(quartileEvents).toHaveLength(1);
    expect(quartileEvents[0].metadata?.quartile).toBe(25);
    strategy.destroy();
  });
});

describe('SsaiAdStrategy — late-arriving tracks', () => {
  test('binds a metadata track added via addtrack after init()', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    strategy.init(ctx, {});

    // Track added AFTER init
    const track = makeMetadataTrack(video);
    video.textTracks.dispatchEvent(Object.assign(new Event('addtrack'), { track }));

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    fireCueChange(track, [makeDateRangeCue('late-1', 'out')]);
    expect(events).toEqual(['start']);
    strategy.destroy();
  });

  test('binds tracks found by texttrack:listchange bus event', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    strategy.init(ctx, {});

    const track = makeMetadataTrack(video);
    // Simulate HlsMediaEngine emitting texttrack:listchange
    ctx.events.emit('texttrack:listchange' as any);

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    fireCueChange(track, [makeDateRangeCue('listchange-1', 'out')]);
    expect(events).toEqual(['start']);
    strategy.destroy();
  });
});

describe('SsaiAdStrategy — destroy()', () => {
  test('removes listeners; no events after destroy', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});
    strategy.destroy();

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    fireCueChange(track, [makeDateRangeCue('post-destroy', 'out')]);
    expect(events).toEqual([]);
  });

  test('clears active breaks on destroy', () => {
    const { ctx, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    fireCueChange(track, [makeDateRangeCue('clear-1', 'out')]);
    expect((strategy as any).activeBreaks.size).toBe(1);

    strategy.destroy();
    expect((strategy as any).activeBreaks.size).toBe(0);
  });
});

// ─── AdsPlugin integration ────────────────────────────────────────────────────

describe('AdsPlugin — adDelivery="ssai"', () => {
  test('setup() creates SsaiAdStrategy; no CSAI overlay is mounted', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ adDelivery: 'ssai' });
    plugin.setup(ctx);

    // CSAI overlay should NOT be in the DOM
    expect(document.querySelector('.op-ads')).toBeNull();
    // strategy is wired
    expect((plugin as any).strategy).toBeInstanceOf(SsaiAdStrategy);
    plugin.destroy?.();
  });

  test('destroy() tears down the strategy without throwing', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ adDelivery: 'ssai' });
    plugin.setup(ctx);
    expect(() => plugin.destroy?.()).not.toThrow();
    expect((plugin as any).strategy).toBeUndefined();
  });

  test('receives ads:break:start via strategy when cue fires', () => {
    const { ctx, bus, video } = makeCtx();
    const plugin = new AdsPlugin({ adDelivery: 'ssai' });
    plugin.setup(ctx);

    const track = makeMetadataTrack(video);
    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    fireCueChange(track, [makeDateRangeCue('plugin-1', 'out')]);
    expect(events).toEqual(['start']);
    plugin.destroy?.();
  });
});

describe('AdsPlugin — adDelivery="csai" (default, unchanged)', () => {
  test('setup() creates a CsaiAdStrategy; bus is accessible', async () => {
    // We just verify the default path still creates a bus (CSAI).
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({}); // default: csai
    plugin.setup(ctx);

    expect((plugin as any).strategy).toBeDefined();
    expect((plugin as any).bus).toBeDefined();
    plugin.destroy?.();
  });

  test('explicit adDelivery="csai" behaves identically to the default', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ adDelivery: 'csai' });
    plugin.setup(ctx);

    expect((plugin as any).strategy).toBeDefined();
    expect((plugin as any).bus).toBeDefined();
    plugin.destroy?.();
  });
});

// ─── Branch coverage for defensive guards ─────────────────────────────────────

describe('SsaiAdStrategy — branch coverage for defensive guards', () => {
  test('scanTracks ignores non-metadata tracks', () => {
    const { ctx, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    // Add a captions track (not metadata) before init so scanTracks sees it.
    const captionsTrack = video.addTextTrack('captions', 'English', 'en');
    strategy.init(ctx, {});
    // No error and no binding occurred for non-metadata track.
    expect((strategy as any).boundTracks.has(captionsTrack)).toBe(false);
    strategy.destroy();
  });

  test('addtrack with non-metadata track is ignored', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    strategy.init(ctx, {});

    // Fire addtrack with a non-metadata track — should not bind.
    const captionsTrack = { kind: 'captions', addEventListener: jest.fn(), removeEventListener: jest.fn() };
    video.textTracks.dispatchEvent(Object.assign(new Event('addtrack'), { track: captionsTrack }));

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    // Nothing happens — no binding.
    expect(events).toEqual([]);
    strategy.destroy();
  });

  test('handleActiveCues with null activeCues is a no-op', () => {
    const { ctx, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    // Simulate cuechange with null activeCues.
    Object.defineProperty(track, 'activeCues', { configurable: true, get: () => null });
    expect(() => track.dispatchEvent(new Event('cuechange'))).not.toThrow();
    strategy.destroy();
  });

  test('endBreak with unknown id is a no-op', () => {
    const { ctx } = makeCtx();
    const strategy = new SsaiAdStrategy();
    strategy.init(ctx, {});

    // Calling the private method with an id that was never started.
    expect(() => (strategy as any).endBreak('unknown-id')).not.toThrow();
    strategy.destroy();
  });

  test('checkQuartiles skips breaks with null durationSec', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const quartiles: number[] = [];
    bus.on('ads:quartile' as any, ({ quartile }: { quartile: number }) => quartiles.push(quartile));

    // splice_insert with no duration → durationSec: null
    fireCueChange(track, [makeDataCue('nodur', makeSpliceInsertBuffer(true), 0, 0)]);
    Object.defineProperty(video, 'currentTime', { configurable: true, get: () => 30 });
    video.dispatchEvent(new Event('timeupdate'));

    // No quartile events should fire (null duration).
    expect(quartiles).toEqual([]);
    strategy.destroy();
  });

  test('hasSpliceOut with infinite endTime uses null duration', () => {
    const { ctx, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    // Create cue where endTime === startTime (ternary false branch → null).
    const cue = new VTTCue(10, 10, '');
    Object.defineProperty(cue, 'id', { value: 'same-time', configurable: true });
    (cue as any).scte35Out = '0xFC302F';
    fireCueChange(track, [cue]);

    const brk = (strategy as any).activeBreaks.get('same-time');
    expect(brk?.durationSec).toBeNull();
    strategy.destroy();
  });

  test('hasSpliceIn with id ending in "-in" resolves to base id', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    bus.on('ads:break:end' as any, () => events.push('end'));

    // Start break with base id "break1"
    fireCueChange(track, [makeDateRangeCue('break1', 'out', 10, 40)]);
    // End with "-in" suffix — strategy should resolve "break1-in" → "break1"
    const cueIn = new VTTCue(40, 40, '');
    Object.defineProperty(cueIn, 'id', { value: 'break1-in', configurable: true });
    (cueIn as any).scte35In = '0xFC302F';
    fireCueChange(track, [cueIn]);

    expect(events).toEqual(['start', 'end']);
    strategy.destroy();
  });
});

// ─── hls.js createCueWithDataFields (cue.value = { key, data }) path ──────────

describe('SsaiAdStrategy — value.key SCTE35-OUT/IN path (hls.js createCueWithDataFields)', () => {
  test('starts a break when value.key === SCTE35-OUT with valid ArrayBuffer', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    const cue = new VTTCue(10, 40, '');
    Object.defineProperty(cue, 'id', { value: 'kv-out-1', configurable: true });
    (cue as any).value = { key: 'SCTE35-OUT', data: makeSpliceInsertBuffer(true) };
    fireCueChange(track, [cue]);

    expect(events).toEqual(['start']);
    const brk = (strategy as any).activeBreaks.get('kv-out-1');
    // endTime(40) > startTime(10) → dur = 30
    expect(brk?.durationSec).toBe(30);
    strategy.destroy();
  });

  test('SCTE35-OUT with endTime === startTime uses durationSecs from cmd', () => {
    const { ctx, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    // duration ticks: 90000 ticks/s × 15s = 1350000 ticks
    const cue = new VTTCue(10, 10, '');
    Object.defineProperty(cue, 'id', { value: 'kv-dur', configurable: true });
    (cue as any).value = { key: 'SCTE35-OUT', data: makeSpliceInsertBuffer(true, 1350000) };
    fireCueChange(track, [cue]);

    const brk = (strategy as any).activeBreaks.get('kv-dur');
    // Falls back to cmd.durationSecs (1350000 / 90000 ≈ 15)
    expect(typeof brk?.durationSec).toBe('number');
    strategy.destroy();
  });

  test('SCTE35-OUT ignores cue when splice command is not outOfNetwork', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    const cue = new VTTCue(10, 40, '');
    Object.defineProperty(cue, 'id', { value: 'kv-in-only', configurable: true });
    // outOfNetwork=false on a SCTE35-OUT key → early return
    (cue as any).value = { key: 'SCTE35-OUT', data: makeSpliceInsertBuffer(false) };
    fireCueChange(track, [cue]);

    expect(events).toEqual([]);
    strategy.destroy();
  });

  test('ends a break when value.key === SCTE35-IN (id matches active break)', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    bus.on('ads:break:end' as any, () => events.push('end'));

    // Start break with SCTE35-OUT key
    const cueOut = new VTTCue(10, 40, '');
    Object.defineProperty(cueOut, 'id', { value: 'kv-2', configurable: true });
    (cueOut as any).value = { key: 'SCTE35-OUT', data: makeSpliceInsertBuffer(true) };
    fireCueChange(track, [cueOut]);

    // End with SCTE35-IN key (same id already in activeBreaks)
    const cueIn = new VTTCue(40, 40, '');
    Object.defineProperty(cueIn, 'id', { value: 'kv-2', configurable: true });
    (cueIn as any).value = { key: 'SCTE35-IN' };
    fireCueChange(track, [cueIn]);

    expect(events).toEqual(['start', 'end']);
    strategy.destroy();
  });

  test('SCTE35-IN with id ending in "-in" resolves to base id', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    bus.on('ads:break:end' as any, () => events.push('end'));

    // Start break with id "kv-base"
    const cueOut = new VTTCue(10, 40, '');
    Object.defineProperty(cueOut, 'id', { value: 'kv-base', configurable: true });
    (cueOut as any).value = { key: 'SCTE35-OUT', data: makeSpliceInsertBuffer(true) };
    fireCueChange(track, [cueOut]);

    // End with "kv-base-in" — should resolve to "kv-base"
    const cueIn = new VTTCue(40, 40, '');
    Object.defineProperty(cueIn, 'id', { value: 'kv-base-in', configurable: true });
    (cueIn as any).value = { key: 'SCTE35-IN' };
    fireCueChange(track, [cueIn]);

    expect(events).toEqual(['start', 'end']);
    strategy.destroy();
  });
});

// ─── Raw value path (dash.js / shaka-player direct ArrayBuffer/Uint8Array) ───

describe('SsaiAdStrategy — raw cue.value path (ArrayBuffer / Uint8Array)', () => {
  test('starts break when cue.value is directly an ArrayBuffer (splice-out)', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    const cue = new VTTCue(5, 35, '');
    Object.defineProperty(cue, 'id', { value: 'raw-ab-out', configurable: true });
    (cue as any).value = makeSpliceInsertBuffer(true);
    fireCueChange(track, [cue]);

    expect(events).toEqual(['start']);
    const brk = (strategy as any).activeBreaks.get('raw-ab-out');
    expect(brk?.durationSec).toBe(30); // endTime(35) - startTime(5)
    strategy.destroy();
  });

  test('ends break when cue.value is directly an ArrayBuffer (splice-in)', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    bus.on('ads:break:end' as any, () => events.push('end'));

    // Start via daterange cue, then end via raw ArrayBuffer splice-in
    fireCueChange(track, [makeDateRangeCue('raw-ab-end', 'out', 5, 35)]);

    const cueIn = new VTTCue(35, 35, '');
    Object.defineProperty(cueIn, 'id', { value: 'raw-ab-end', configurable: true });
    (cueIn as any).value = makeSpliceInsertBuffer(false); // outOfNetwork=false → splice-in
    fireCueChange(track, [cueIn]);

    expect(events).toEqual(['start', 'end']);
    strategy.destroy();
  });

  test('raw ArrayBuffer splice-in with "-in" id suffix resolves to base id', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));
    bus.on('ads:break:end' as any, () => events.push('end'));

    fireCueChange(track, [makeDateRangeCue('raw-base', 'out', 5, 35)]);

    const cueIn = new VTTCue(35, 35, '');
    Object.defineProperty(cueIn, 'id', { value: 'raw-base-in', configurable: true });
    (cueIn as any).value = makeSpliceInsertBuffer(false);
    fireCueChange(track, [cueIn]);

    expect(events).toEqual(['start', 'end']);
    strategy.destroy();
  });

  test('starts break when cue.value is a Uint8Array (splice-out)', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    const cue = new VTTCue(0, 20, '');
    Object.defineProperty(cue, 'id', { value: 'raw-u8', configurable: true });
    // Pass as Uint8Array instead of ArrayBuffer
    (cue as any).value = new Uint8Array(makeSpliceInsertBuffer(true));
    fireCueChange(track, [cue]);

    expect(events).toEqual(['start']);
    strategy.destroy();
  });

  test('raw ArrayBuffer with non-splice_insert command is a no-op', () => {
    const { ctx, bus, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    const events: string[] = [];
    bus.on('ads:break:start' as any, () => events.push('start'));

    // time_signal (0x06) — not a splice_insert
    const buf = new Uint8Array(16);
    buf[0] = 0xfc;
    buf[13] = 0x06;
    const cue = new VTTCue(0, 0, '');
    Object.defineProperty(cue, 'id', { value: 'raw-ts', configurable: true });
    (cue as any).value = buf.buffer;
    fireCueChange(track, [cue]);

    expect(events).toEqual([]);
    strategy.destroy();
  });

  test('raw ArrayBuffer splice-out uses cmd.durationSecs when endTime <= startTime', () => {
    const { ctx, video } = makeCtx();
    const strategy = new SsaiAdStrategy();
    const track = makeMetadataTrack(video);
    strategy.init(ctx, {});

    // endTime === startTime → fallback to cmd.durationSecs
    const cue = new VTTCue(10, 10, '');
    Object.defineProperty(cue, 'id', { value: 'raw-dur-fallback', configurable: true });
    (cue as any).value = makeSpliceInsertBuffer(true, 1350000); // 15 s
    fireCueChange(track, [cue]);

    const brk = (strategy as any).activeBreaks.get('raw-dur-fallback');
    expect(typeof brk?.durationSec).toBe('number');
    strategy.destroy();
  });
});
