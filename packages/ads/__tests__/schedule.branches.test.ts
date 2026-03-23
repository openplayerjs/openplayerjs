/** @jest-environment jsdom */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import {
  AdScheduler,
  extractVastTagUriFn,
  getBreakIdFn,
  getVastInputFromBreakFn,
  normalizeVmapAdSourceFn,
  parseVmapTimeOffsetFn,
} from '../src/schedule';
import type { AdsBreakConfig, AdsSource } from '../src/types';

// ─── Standalone function tests ────────────────────────────────────────────────

describe('normalizeVmapAdSourceFn', () => {
  it('returns undefined for falsy input', () => {
    expect(normalizeVmapAdSourceFn(null)).toBeUndefined();
    expect(normalizeVmapAdSourceFn(undefined)).toBeUndefined();
  });

  it('returns non-array input directly', () => {
    const src = { adTagURI: { uri: 'https://example.com/vast.xml' } };
    expect(normalizeVmapAdSourceFn(src)).toBe(src);
  });

  it('picks the first entry with adTagURI from an array', () => {
    const arr = [
      { foo: 1 },
      { adTagURI: { uri: 'https://example.com/found.xml' } },
      { adTagURI: { uri: 'https://example.com/second.xml' } },
    ];
    const result = normalizeVmapAdSourceFn(arr);
    expect(result.adTagURI.uri).toBe('https://example.com/found.xml');
  });

  it('picks the first entry with vastAdData from an array', () => {
    const arr = [{ foo: 1 }, { vastAdData: '<VAST/>' }];
    expect(normalizeVmapAdSourceFn(arr)).toEqual({ vastAdData: '<VAST/>' });
  });

  it('falls back to first element when no entry has adTagURI/vastAdData', () => {
    const arr = [{ a: 1 }, { b: 2 }];
    expect(normalizeVmapAdSourceFn(arr)).toEqual({ a: 1 });
  });
});

describe('extractVastTagUriFn', () => {
  it('returns undefined for falsy input', () => {
    expect(extractVastTagUriFn(null)).toBeUndefined();
    expect(extractVastTagUriFn('')).toBeUndefined();
  });

  it('returns trimmed string directly', () => {
    expect(extractVastTagUriFn('  https://example.com/vast.xml  ')).toBe('https://example.com/vast.xml');
  });

  it('returns undefined for whitespace-only string', () => {
    expect(extractVastTagUriFn('   ')).toBeUndefined();
  });

  it('extracts uri from object.uri', () => {
    expect(extractVastTagUriFn({ uri: 'https://example.com/a.xml' })).toBe('https://example.com/a.xml');
  });

  it('extracts uri from object.URI', () => {
    expect(extractVastTagUriFn({ URI: 'https://example.com/b.xml' })).toBe('https://example.com/b.xml');
  });

  it('extracts uri from object.value', () => {
    expect(extractVastTagUriFn({ value: 'https://example.com/c.xml' })).toBe('https://example.com/c.xml');
  });

  it('extracts uri from object.text', () => {
    expect(extractVastTagUriFn({ text: 'https://example.com/d.xml' })).toBe('https://example.com/d.xml');
  });

  it('extracts uri from object["#text"]', () => {
    expect(extractVastTagUriFn({ '#text': 'https://example.com/e.xml' })).toBe('https://example.com/e.xml');
  });

  it('returns undefined when object has empty string values', () => {
    expect(extractVastTagUriFn({ uri: '', value: '  ' })).toBeUndefined();
  });
});

describe('parseVmapTimeOffsetFn', () => {
  it('returns preroll for empty or start', () => {
    expect(parseVmapTimeOffsetFn('')).toEqual({ at: 'preroll' });
    expect(parseVmapTimeOffsetFn('start')).toEqual({ at: 'preroll' });
    expect(parseVmapTimeOffsetFn(null)).toEqual({ at: 'preroll' });
  });

  it('returns postroll for end', () => {
    expect(parseVmapTimeOffsetFn('end')).toEqual({ at: 'postroll' });
  });

  it('parses percentage', () => {
    expect(parseVmapTimeOffsetFn('50%')).toEqual({ at: 0, pendingPercent: 0.5 });
    expect(parseVmapTimeOffsetFn('0%')).toEqual({ at: 0, pendingPercent: 0 });
    expect(parseVmapTimeOffsetFn('100%')).toEqual({ at: 0, pendingPercent: 1 });
  });

  it('parses HH:MM:SS timecode', () => {
    expect(parseVmapTimeOffsetFn('00:00:30')).toEqual({ at: 30 });
    expect(parseVmapTimeOffsetFn('00:01:00')).toEqual({ at: 60 });
    expect(parseVmapTimeOffsetFn('01:00:00')).toEqual({ at: 3600 });
    expect(parseVmapTimeOffsetFn('00:00:05.5')).toEqual({ at: 5.5 });
  });

  it('parses plain seconds number string', () => {
    expect(parseVmapTimeOffsetFn('15')).toEqual({ at: 15 });
    expect(parseVmapTimeOffsetFn('0')).toEqual({ at: 0 });
    expect(parseVmapTimeOffsetFn('300')).toEqual({ at: 300 });
  });

  it('falls back to preroll for unrecognized strings', () => {
    expect(parseVmapTimeOffsetFn('nonsense')).toEqual({ at: 'preroll' });
    expect(parseVmapTimeOffsetFn('150%')).toEqual({ at: 'preroll' }); // > 100, invalid percent
  });
});

describe('getVastInputFromBreakFn', () => {
  it('returns undefined input when break has no source', () => {
    const b: AdsBreakConfig = { at: 'preroll' };
    expect(getVastInputFromBreakFn(b)).toEqual({ input: undefined, sourceType: undefined });
  });

  it('returns url input from b.source', () => {
    const b: AdsBreakConfig = { at: 'preroll', source: { type: 'VAST', src: 'https://example.com/vast.xml' } };
    expect(getVastInputFromBreakFn(b)).toEqual({
      input: { kind: 'url', value: 'https://example.com/vast.xml' },
      sourceType: 'VAST',
    });
  });

  it('returns xml input from b.source when src looks like XML', () => {
    const b: AdsBreakConfig = { at: 'preroll', source: { type: 'VAST', src: '<VAST version="3.0"/>' } };
    expect(getVastInputFromBreakFn(b)).toEqual({
      input: { kind: 'xml', value: '<VAST version="3.0"/>' },
      sourceType: 'VAST',
    });
  });

  it('falls back to first entry in b.sources array', () => {
    const b: AdsBreakConfig = {
      at: 'preroll',
      sources: [
        { type: 'VAST', src: 'https://example.com/first.xml' },
        { type: 'VAST', src: 'https://example.com/second.xml' },
      ],
    };
    expect(getVastInputFromBreakFn(b)).toEqual({
      input: { kind: 'url', value: 'https://example.com/first.xml' },
      sourceType: 'VAST',
    });
  });

  it('returns xml input from b.sources when first entry looks like XML', () => {
    const b: AdsBreakConfig = {
      at: 'preroll',
      sources: [{ type: 'VAST', src: '<VAST/>' }],
    };
    expect(getVastInputFromBreakFn(b)).toEqual({
      input: { kind: 'xml', value: '<VAST/>' },
      sourceType: 'VAST',
    });
  });
});

describe('getBreakIdFn', () => {
  it('uses break id when provided', () => {
    const b: AdsBreakConfig = {
      id: 'preroll-main',
      at: 'preroll',
      source: { type: 'VAST', src: 'https://x.com/vast.xml' },
    };
    expect(getBreakIdFn(b)).toBe('preroll-main');
  });

  it('generates an id from at:sourceType:url when no id provided', () => {
    const b: AdsBreakConfig = { at: 'preroll', source: { type: 'VAST', src: 'https://example.com/vast.xml' } };
    const id = getBreakIdFn(b);
    expect(id).toBe('preroll:VAST:https://example.com/vast.xml');
  });

  it('uses xml as key when source is inline XML', () => {
    const b: AdsBreakConfig = { at: 'preroll', source: { type: 'VAST', src: '<VAST/>' } };
    const id = getBreakIdFn(b);
    expect(id).toBe('preroll:VAST:xml');
  });

  it('defaults sourceType to VAST when break has no source', () => {
    const b: AdsBreakConfig = { at: 'preroll' };
    const id = getBreakIdFn(b);
    expect(id).toBe('preroll:VAST:xml');
  });
});

// ─── AdScheduler class tests ──────────────────────────────────────────────────

function makeSchedulerCtx(media?: HTMLMediaElement) {
  const bus = new EventBus();
  const video = media ?? document.createElement('video');
  if (!media) document.body.appendChild(video);

  const dispose = new DisposableStore();
  const ctx: PluginContext = {
    core: { media: video } as unknown as Core,
    events: bus,
    state: new StateManager('ready'),
    leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as unknown as Lease,
    dispose,
    add: (d) => dispose.add(d),
    on: (event, cb) => dispose.add(bus.on(event, cb)),
    listen: (target, type, handler, options) => dispose.addEventListener(target, type, handler, options),
  };
  return { ctx, video };
}

function makeScheduler(
  sources: AdsSource[],
  breaks: AdsBreakConfig[] = [],
  opts: { adSourcesMode?: 'waterfall' | 'playlist'; media?: HTMLMediaElement } = {}
): AdScheduler {
  const { ctx } = makeSchedulerCtx(opts.media);
  return new AdScheduler(
    {
      sources,
      breaks,
      adSourcesMode: opts.adSourcesMode ?? 'waterfall',
      breakTolerance: 0.25,
      debug: false,
    },
    ctx,
    jest.fn(),
    jest.fn()
  );
}

describe('AdScheduler.getVastInputFromBreak', () => {
  it('picks from b.sources when b.source is absent', () => {
    const sched = makeScheduler([]);
    const b: AdsBreakConfig = {
      at: 'preroll',
      sources: [{ type: 'VAST', src: 'https://example.com/waterfall.xml' }],
    };
    const { input, sourceType } = sched.getVastInputFromBreak(b);
    expect(input).toEqual({ kind: 'url', value: 'https://example.com/waterfall.xml' });
    expect(sourceType).toBe('VAST');
  });

  it('picks XML from b.sources first entry when it looks like XML', () => {
    const sched = makeScheduler([]);
    const b: AdsBreakConfig = {
      at: 'preroll',
      sources: [{ type: 'VAST', src: '<VAST version="3.0"/>' }],
    };
    const { input } = sched.getVastInputFromBreak(b);
    expect(input).toEqual({ kind: 'xml', value: '<VAST version="3.0"/>' });
  });
});

describe('AdScheduler.getPrerollBreak', () => {
  it('returns break from cfg.breaks when resolvedBreaks is empty', () => {
    const breakCfg: AdsBreakConfig = {
      at: 'preroll',
      source: { type: 'VAST', src: 'https://example.com/preroll.xml' },
    };
    const sched = makeScheduler([], [breakCfg]);
    const result = sched.getPrerollBreak();
    expect(result?.at).toBe('preroll');
    expect(result?.source?.src).toBe('https://example.com/preroll.xml');
  });

  it('skips already-played breaks', () => {
    const breakCfg: AdsBreakConfig = {
      id: 'preroll-1',
      at: 'preroll',
      source: { type: 'VAST', src: 'https://example.com/preroll.xml' },
    };
    const sched = makeScheduler([], [breakCfg]);
    sched.playedBreaks.add('preroll-1');
    expect(sched.getPrerollBreak()).toBeUndefined();
  });

  it('returns synthetic break from primary VAST source when no explicit prerolls', () => {
    const sched = makeScheduler([{ type: 'VAST', src: 'https://example.com/primary.xml' }]);
    sched.rebuild();
    sched.resolvedBreaks = []; // clear resolved
    const result = sched.getPrerollBreak();
    expect(result?.source?.src).toBe('https://example.com/primary.xml');
  });
});

describe('AdScheduler.normalizeVmapAdSource (class method)', () => {
  it('returns the array item with adTagURI when given array', () => {
    const sched = makeScheduler([]);
    const result = sched.normalizeVmapAdSource([{ x: 1 }, { adTagURI: { uri: 'https://a.com/vast.xml' } }]);
    expect(result.adTagURI.uri).toBe('https://a.com/vast.xml');
  });

  it('returns undefined for falsy', () => {
    const sched = makeScheduler([]);
    expect(sched.normalizeVmapAdSource(null)).toBeUndefined();
  });
});

describe('AdScheduler.getDueMidrollBreaks', () => {
  it('returns midrolls at or before the current time + tolerance', () => {
    const sched = makeScheduler([]);
    sched.resolvedBreaks = [
      { id: 'm1', at: 10, source: { type: 'VAST', src: 'https://example.com/m1.xml' } },
      { id: 'm2', at: 30, source: { type: 'VAST', src: 'https://example.com/m2.xml' } },
    ];
    const due = sched.getDueMidrollBreaks(10);
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe('m1');
  });

  it('resolves percent-based breaks when media has finite duration', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);
    Object.defineProperty(video, 'duration', { value: 100, configurable: true });

    const sched = makeScheduler([], [], { media: video });
    sched.pendingPercentBreaks = [
      { id: 'pct-50', percent: 0.5, once: true, source: { type: 'VAST', src: 'https://example.com/mid.xml' } },
    ];
    sched.getDueMidrollBreaks(50);
    // After resolution, pendingPercentBreaks should be empty
    expect(sched.pendingPercentBreaks).toHaveLength(0);
    // And the 50s break should now be in resolvedBreaks
    expect(sched.resolvedBreaks.some((b) => b.at === 50)).toBe(true);
  });
});

describe('AdScheduler.inferSourceTypeForUrl', () => {
  it('returns NONLINEAR when the exact url is a NONLINEAR source', () => {
    const sched = makeScheduler([{ type: 'NONLINEAR', src: 'https://example.com/nl.xml' }]);
    expect(sched.inferSourceTypeForUrl('https://example.com/nl.xml')).toBe('NONLINEAR');
  });

  it('returns NONLINEAR when all sources are NONLINEAR', () => {
    const sched = makeScheduler([
      { type: 'NONLINEAR', src: 'https://example.com/nl1.xml' },
      { type: 'NONLINEAR', src: 'https://example.com/nl2.xml' },
    ]);
    expect(sched.inferSourceTypeForUrl('https://example.com/other.xml')).toBe('NONLINEAR');
  });

  it('returns undefined when sources include non-NONLINEAR types', () => {
    const sched = makeScheduler([
      { type: 'VAST', src: 'https://example.com/vast.xml' },
      { type: 'NONLINEAR', src: 'https://example.com/nl.xml' },
    ]);
    expect(sched.inferSourceTypeForUrl('https://example.com/other.xml')).toBeUndefined();
  });
});

describe('AdScheduler.getVastInputFromBreak: fallback return', () => {
  it('returns undefined input when sources array has empty-src entry', () => {
    const sched = makeScheduler([]);
    // No b.source and b.sources[0].src is empty → falls through to fallback
    const b: AdsBreakConfig = { at: 'preroll', sources: [{ type: 'VAST', src: '   ' }] };
    const { input, sourceType } = sched.getVastInputFromBreak(b);
    expect(input).toBeUndefined();
    expect(sourceType).toBeUndefined();
  });

  it('returns undefined input when no source or sources field', () => {
    const sched = makeScheduler([]);
    const b: AdsBreakConfig = { at: 'preroll' };
    expect(sched.getVastInputFromBreak(b)).toEqual({ input: undefined, sourceType: undefined });
  });
});

describe('AdScheduler.parseVmapTimeOffset: numeric seconds via class method', () => {
  it('parses plain numeric string as seconds', () => {
    const sched = makeScheduler([]);
    expect(sched.parseVmapTimeOffset('30')).toEqual({ at: 30 });
    expect(sched.parseVmapTimeOffset('0')).toEqual({ at: 0 });
  });

  it('falls back to preroll for unrecognised offset', () => {
    const sched = makeScheduler([]);
    expect(sched.parseVmapTimeOffset('invalid-offset')).toEqual({ at: 'preroll' });
  });
});

describe('AdScheduler.extractVastTagUri: returns undefined for object with no valid uri', () => {
  it('returns undefined when object properties are all falsy', () => {
    const sched = makeScheduler([]);
    expect(sched.extractVastTagUri({ uri: '', value: '  ' })).toBeUndefined();
    expect(sched.extractVastTagUri({})).toBeUndefined();
  });
});

describe('AdScheduler.rebuild', () => {
  it('builds a single preroll break from VAST source', () => {
    const sched = makeScheduler([{ type: 'VAST', src: 'https://example.com/preroll.xml' }]);
    sched.rebuild();
    expect(sched.resolvedBreaks).toHaveLength(1);
    expect(sched.resolvedBreaks[0].at).toBe('preroll');
  });

  it('builds playlist breaks when adSourcesMode is playlist', () => {
    const sched = makeScheduler(
      [
        { type: 'VAST', src: 'https://example.com/vast1.xml' },
        { type: 'VAST', src: 'https://example.com/vast2.xml' },
      ],
      [],
      { adSourcesMode: 'playlist' }
    );
    sched.rebuild();
    expect(sched.resolvedBreaks).toHaveLength(2);
  });

  it('defers VMAP loading when preload=none', () => {
    const video = document.createElement('video');
    video.setAttribute('preload', 'none');
    document.body.appendChild(video);

    const sched = makeScheduler([{ type: 'VMAP', src: 'https://example.com/vmap.xml' }], [], { media: video });
    sched.rebuild();
    expect(sched.pendingVmapSrc).toBe('https://example.com/vmap.xml');
    expect(sched.vmapPending).toBe(false);
  });
});
