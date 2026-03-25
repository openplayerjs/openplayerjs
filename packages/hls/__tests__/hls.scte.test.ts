/** @jest-environment jsdom */
/**
 * packages/hls/__tests__/hls.scte.test.ts
 *
 * Tests for SCTE-35 OUT cue detection (Gap 4: live / DVR server-side ad insertion).
 *
 * Covers:
 *  - HlsMediaEngine.onCue fires for #EXT-X-DATERANGE tags with SCTE35-OUT
 *  - Deduplication: the same cue ID is not fired more than once per session
 *  - seenCueIds is cleared on detach() so re-attach starts fresh
 *  - ServerAdsBridge resolves URL and calls ads.playAds()
 *  - ServerAdsBridge skips cues when resolveUrl returns null
 *  - ServerAdsBridge chains previously registered onCue handlers
 *  - ServerAdsBridge.destroy() restores the previous handler
 */

import { EventBus, HtmlMediaSurface, Core } from '@openplayerjs/core';
import { HlsMediaEngine, type ScteOutCue } from '../src/hls';
import { ServerAdsBridge } from '../src/server-ads-bridge';

// ─── hls.js mock ────────────────────────────────────────────────────────────

let capturedLevelUpdatedHandler: ((event: string, data: any) => void) | undefined;

jest.mock('hls.js', () => ({
  __esModule: true,
  default: class HlsMock {
    static isSupported() { return true; }
    static Events: Record<string, string> = {
      MEDIA_ATTACHED: 'MEDIA_ATTACHED',
      MANIFEST_PARSED: 'MANIFEST_PARSED',
      LEVEL_UPDATED: 'LEVEL_UPDATED',
      LEVEL_LOADED: 'LEVEL_LOADED',
      FRAG_PARSING_METADATA: 'FRAG_PARSING_METADATA',
      SUBTITLE_TRACKS_UPDATED: 'SUBTITLE_TRACKS_UPDATED',
      ERROR: 'ERROR',
    };
    on = jest.fn((event: string, handler: (...a: any[]) => void) => {
      if (event === 'LEVEL_UPDATED') capturedLevelUpdatedHandler = handler;
    });
    off = jest.fn();
    loadSource = jest.fn();
    attachMedia = jest.fn();
    detachMedia = jest.fn();
    destroy = jest.fn();
    startLoad = jest.fn();
    stopLoad = jest.fn();
    recoverMediaError = jest.fn();
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCtx() {
  const media = document.createElement('video');
  media.src = 'https://example.com/live.m3u8';
  document.body.appendChild(media);
  const events = new EventBus();
  const core = new Core(media, { plugins: [] });
  const surface = new HtmlMediaSurface(media);
  return {
    media,
    container: media.parentElement ?? media,
    events,
    core,
    surface,
    setSurface(s: any) { return s; },
    resetSurface() { return surface; },
    activeSource: { src: 'https://example.com/live.m3u8', type: 'application/x-mpegURL' },
  } as any;
}

function makeDateRange(id: string, scte35Out: string, extras: Record<string, unknown> = {}) {
  return {
    attr: { 'SCTE35-OUT': scte35Out },
    plannedDuration: 30,
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    ...extras,
  };
}

function emitLevelUpdated(dateRanges: Record<string, unknown>) {
  capturedLevelUpdatedHandler?.('LEVEL_UPDATED', { details: { dateRanges } });
}

beforeEach(() => {
  document.body.innerHTML = '';
  capturedLevelUpdatedHandler = undefined;
});

// ─── onCue callback tests ─────────────────────────────────────────────────────

describe('HlsMediaEngine — SCTE-35 OUT cue detection', () => {
  test('onCue fires when LEVEL_UPDATED contains a SCTE35-OUT dateRange', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    const cues: ScteOutCue[] = [];
    engine.onCue = (c) => cues.push(c);

    engine.attach(ctx);
    emitLevelUpdated({ 'ad-1': makeDateRange('ad-1', '0xFC302F000000000000FFFFF01401000000027EEEEEE') });

    expect(cues).toHaveLength(1);
    expect(cues[0].id).toBe('ad-1');
    expect(cues[0].scte35Out).toBe('0xFC302F000000000000FFFFF01401000000027EEEEEE');
    expect(cues[0].plannedDuration).toBe(30);
    expect(cues[0].startDate).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    engine.detach();
  });

  test('onCue is not fired for dateRanges without SCTE35-OUT', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    const cues: ScteOutCue[] = [];
    engine.onCue = (c) => cues.push(c);

    engine.attach(ctx);
    emitLevelUpdated({ 'metadata-1': { attr: { 'X-CUSTOM': 'value' }, plannedDuration: 10 } });

    expect(cues).toHaveLength(0);
    engine.detach();
  });

  test('onCue deduplicates: same cue ID is not fired twice', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    const cues: ScteOutCue[] = [];
    engine.onCue = (c) => cues.push(c);

    engine.attach(ctx);
    const range = makeDateRange('ad-2', '0xFC302F');
    emitLevelUpdated({ 'ad-2': range });
    emitLevelUpdated({ 'ad-2': range }); // same cue, second manifest refresh

    expect(cues).toHaveLength(1);
    engine.detach();
  });

  test('seenCueIds resets after detach so re-attach can fire the same ID again', () => {
    const engine = new HlsMediaEngine();
    const cues: ScteOutCue[] = [];
    engine.onCue = (c) => cues.push(c);

    const ctx1 = makeCtx();
    engine.attach(ctx1);
    emitLevelUpdated({ 'ad-3': makeDateRange('ad-3', '0xFC302F') });
    engine.detach();

    const ctx2 = makeCtx();
    engine.attach(ctx2);
    emitLevelUpdated({ 'ad-3': makeDateRange('ad-3', '0xFC302F') });
    engine.detach();

    expect(cues).toHaveLength(2); // fired once per session
  });

  test('onCue fires for each distinct cue in the same LEVEL_UPDATED', () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    const ids: string[] = [];
    engine.onCue = (c) => ids.push(c.id);

    engine.attach(ctx);
    emitLevelUpdated({
      'break-a': makeDateRange('break-a', '0xAA'),
      'break-b': makeDateRange('break-b', '0xBB'),
    });

    expect(ids).toEqual(['break-a', 'break-b']);
    engine.detach();
  });

  test('onCue is not called when no handler is registered', () => {
    const engine = new HlsMediaEngine(); // no onCue set
    const ctx = makeCtx();
    // Should not throw
    expect(() => {
      engine.attach(ctx);
      emitLevelUpdated({ 'ad-x': makeDateRange('ad-x', '0xFC') });
      engine.detach();
    }).not.toThrow();
  });
});

// ─── ServerAdsBridge tests ────────────────────────────────────────────────────

describe('ServerAdsBridge', () => {
  function makeAds() {
    return { playAds: jest.fn().mockResolvedValue(true) };
  }

  test('calls ads.playAds with the URL returned by resolveUrl', async () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    engine.attach(ctx);

    const ads = makeAds();
    new ServerAdsBridge(engine, ads, {
      resolveUrl: (cue) => `https://ad-server/vast?id=${cue.id}`,
    });

    emitLevelUpdated({ 'scte-1': makeDateRange('scte-1', '0xFC') });
    await Promise.resolve(); // flush microtasks

    expect(ads.playAds).toHaveBeenCalledWith('https://ad-server/vast?id=scte-1');
    engine.detach();
  });

  test('skips cue when resolveUrl returns null', async () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    engine.attach(ctx);

    const ads = makeAds();
    new ServerAdsBridge(engine, ads, { resolveUrl: () => null });

    emitLevelUpdated({ 'scte-skip': makeDateRange('scte-skip', '0xFC') });
    await Promise.resolve();

    expect(ads.playAds).not.toHaveBeenCalled();
    engine.detach();
  });

  test('skips cue when resolveUrl returns undefined', async () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    engine.attach(ctx);

    const ads = makeAds();
    new ServerAdsBridge(engine, ads, { resolveUrl: () => undefined });

    emitLevelUpdated({ 'scte-undef': makeDateRange('scte-undef', '0xFC') });
    await Promise.resolve();

    expect(ads.playAds).not.toHaveBeenCalled();
    engine.detach();
  });

  test('supports async resolveUrl', async () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    engine.attach(ctx);

    const ads = makeAds();
    new ServerAdsBridge(engine, ads, {
      resolveUrl: async (cue) => {
        await Promise.resolve(); // simulate async lookup
        return `https://ads/vast?id=${cue.id}`;
      },
    });

    emitLevelUpdated({ 'async-cue': makeDateRange('async-cue', '0xFC') });
    await Promise.resolve();
    await Promise.resolve(); // extra tick for the inner async

    expect(ads.playAds).toHaveBeenCalledWith('https://ads/vast?id=async-cue');
    engine.detach();
  });

  test('chains a previously registered onCue handler', async () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    engine.attach(ctx);

    const prevCues: string[] = [];
    engine.onCue = (c) => prevCues.push(c.id);

    const ads = makeAds();
    new ServerAdsBridge(engine, ads, {
      resolveUrl: (cue) => `https://ads/vast?id=${cue.id}`,
    });

    emitLevelUpdated({ 'chain-cue': makeDateRange('chain-cue', '0xFC') });
    await Promise.resolve();

    expect(prevCues).toContain('chain-cue'); // previous handler still fired
    expect(ads.playAds).toHaveBeenCalled();
    engine.detach();
  });

  test('destroy() restores the previous onCue handler', async () => {
    const engine = new HlsMediaEngine();
    const ctx = makeCtx();
    engine.attach(ctx);

    const before: string[] = [];
    engine.onCue = (c) => before.push(c.id);

    const ads = makeAds();
    const bridge = new ServerAdsBridge(engine, ads, { resolveUrl: () => 'https://ads/vast' });
    bridge.destroy(engine);

    // After destroy, the original handler should be restored
    emitLevelUpdated({ 'post-destroy': makeDateRange('post-destroy', '0xFC') });
    await Promise.resolve();

    expect(before).toContain('post-destroy');
    expect(ads.playAds).not.toHaveBeenCalled();
    engine.detach();
  });
});
