/** @jest-environment jsdom */

/**
 * packages/ads/__tests__/ads.scte.test.ts
 *
 * Tests for AdsPlugin CSAI + SCTE-35 hybrid wiring (scteSource / resolveScteUrl).
 * Previously covered by ServerAdsBridge tests in packages/hls/__tests__/hls.scte.test.ts.
 *
 * Uses a plain duck-typed scteSource object — no HlsMediaEngine dependency.
 *
 * Covers:
 *  - playAds() called with URL returned by resolveScteUrl
 *  - Skips cue when resolveScteUrl returns null or undefined
 *  - Supports async resolveScteUrl
 *  - Chains a previously registered onCue handler
 *  - destroy() restores the previous onCue handler
 *  - No wiring when scteSource is omitted
 *  - No wiring when resolveScteUrl is omitted
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import type { ScteOutCue, ScteSource } from '../src/types';
import { vastGetMock } from './mocks/vast-client';

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

function makeCue(id = 'cue-1'): ScteOutCue {
  return { id, scte35Out: '0xFC302F', plannedDuration: 30 };
}

/** A minimal duck-typed engine stub with an onCue slot. */
function makeSource(): ScteSource & { fire(cue: ScteOutCue): void } {
  const src: ScteSource & { fire(cue: ScteOutCue): void } = {
    onCue: undefined,
    fire(cue) { src.onCue?.(cue); },
  };
  return src;
}

beforeEach(() => {
  vastGetMock.mockReset();
  document.body.innerHTML = '';
});

// ─── Core wiring behaviour ────────────────────────────────────────────────────

describe('AdsPlugin — scteSource / resolveScteUrl', () => {
  test('calls playAds() with URL returned by resolveScteUrl', async () => {
    const { ctx } = makeCtx();
    const source = makeSource();
    const plugin = new AdsPlugin({
      scteSource: source,
      resolveScteUrl: (cue) => `https://ads/vast?id=${cue.id}`,
    });
    plugin.setup(ctx);

    const spy = jest.spyOn(plugin, 'playAds').mockResolvedValue(true);

    source.fire(makeCue('c1'));
    await Promise.resolve();

    expect(spy).toHaveBeenCalledWith('https://ads/vast?id=c1');
    plugin.destroy?.();
  });

  test('does not call playAds() when resolveScteUrl returns null', async () => {
    const { ctx } = makeCtx();
    const source = makeSource();
    const plugin = new AdsPlugin({
      scteSource: source,
      resolveScteUrl: () => null,
    });
    plugin.setup(ctx);

    const spy = jest.spyOn(plugin, 'playAds').mockResolvedValue(false);

    source.fire(makeCue());
    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();
    plugin.destroy?.();
  });

  test('does not call playAds() when resolveScteUrl returns undefined', async () => {
    const { ctx } = makeCtx();
    const source = makeSource();
    const plugin = new AdsPlugin({
      scteSource: source,
      resolveScteUrl: () => undefined,
    });
    plugin.setup(ctx);

    const spy = jest.spyOn(plugin, 'playAds').mockResolvedValue(false);

    source.fire(makeCue());
    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();
    plugin.destroy?.();
  });

  test('supports async resolveScteUrl', async () => {
    const { ctx } = makeCtx();
    const source = makeSource();
    const plugin = new AdsPlugin({
      scteSource: source,
      resolveScteUrl: async (cue) => {
        await Promise.resolve();
        return `https://ads/vast?id=${cue.id}`;
      },
    });
    plugin.setup(ctx);

    const spy = jest.spyOn(plugin, 'playAds').mockResolvedValue(true);

    source.fire(makeCue('async-cue'));
    await Promise.resolve();
    await Promise.resolve(); // extra tick for the inner async

    expect(spy).toHaveBeenCalledWith('https://ads/vast?id=async-cue');
    plugin.destroy?.();
  });

  test('chains a previously registered onCue handler', async () => {
    const { ctx } = makeCtx();
    const source = makeSource();
    const prevCues: string[] = [];
    source.onCue = (c) => prevCues.push(c.id);

    const plugin = new AdsPlugin({
      scteSource: source,
      resolveScteUrl: (cue) => `https://ads/vast?id=${cue.id}`,
    });
    plugin.setup(ctx);
    jest.spyOn(plugin, 'playAds').mockResolvedValue(true);

    source.fire(makeCue('chain-cue'));
    await Promise.resolve();

    expect(prevCues).toContain('chain-cue');
    plugin.destroy?.();
  });

  test('destroy() restores the previous onCue handler', async () => {
    const { ctx } = makeCtx();
    const source = makeSource();
    const before: string[] = [];
    source.onCue = (c) => before.push(c.id);

    const plugin = new AdsPlugin({
      scteSource: source,
      resolveScteUrl: () => 'https://ads/vast',
    });
    plugin.setup(ctx);
    const spy = jest.spyOn(plugin, 'playAds').mockResolvedValue(true);
    plugin.destroy?.();

    source.fire(makeCue('post-destroy'));
    await Promise.resolve();

    expect(before).toContain('post-destroy'); // original handler still fires
    expect(spy).not.toHaveBeenCalled();        // plugin's handler is gone
  });
});

// ─── No-op when fields are absent ─────────────────────────────────────────────

describe('AdsPlugin — scteSource wiring is skipped when incomplete', () => {
  test('no error when scteSource is omitted', () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({ resolveScteUrl: () => 'https://ads/vast' });
    expect(() => { plugin.setup(ctx); plugin.destroy?.(); }).not.toThrow();
  });

  test('no error when resolveScteUrl is omitted', () => {
    const { ctx } = makeCtx();
    const source = makeSource();
    const plugin = new AdsPlugin({ scteSource: source });
    expect(() => { plugin.setup(ctx); plugin.destroy?.(); }).not.toThrow();
    // onCue should remain untouched
    expect(source.onCue).toBeUndefined();
  });
});
