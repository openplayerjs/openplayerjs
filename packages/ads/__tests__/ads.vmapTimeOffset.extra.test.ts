/** @jest-environment jsdom */

import type { PluginContext } from '@openplayerjs/core';
import { EventBus } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';

/** AdsPlugin with `@internal` getters narrowed to non-undefined for test access. */
type AdsPluginInternals = AdsPlugin & {
  resolvedBreaks: NonNullable<AdsPlugin['resolvedBreaks']>;
  pendingPercentBreaks: NonNullable<AdsPlugin['pendingPercentBreaks']>;
};

describe('AdsPlugin VMAP timeOffset parsing extra branches', () => {
  function makeCtx() {
    const video = document.createElement('video');
    Object.defineProperty(video, 'duration', { value: 200, configurable: true, writable: true });
    document.body.appendChild(video);
    return {
      core: { media: video, muted: false, volume: 1 },
      events: new EventBus(),
      state: { current: 'ready' },
      leases: { acquire: () => true, release: () => undefined, owner: () => undefined },
    } as unknown as PluginContext;
  }

  test('parseVmapTimeOffset supports HH:MM:SS and numeric strings and invalid falls back to preroll', () => {
    const plugin = new AdsPlugin({
      interceptPlayForPreroll: false,
      allowNativeControls: true,
    }) as unknown as AdsPluginInternals;
    plugin.setup(makeCtx());

    expect(plugin.parseVmapTimeOffset('00:00:05').at).toBe(5);
    expect(plugin.parseVmapTimeOffset('12').at).toBe(12);
    expect(plugin.parseVmapTimeOffset('bad').at).toBe('preroll');
  });

  test('pending percent breaks resolve when duration becomes known', () => {
    const ctx = makeCtx();
    const plugin = new AdsPlugin({
      interceptPlayForPreroll: false,
      allowNativeControls: true,
    }) as unknown as AdsPluginInternals;
    plugin.setup(ctx);

    // simulate a pending percent midroll at 10% of 200 => 20s
    plugin.pendingPercentBreaks = [
      {
        id: 'p10',
        percent: 0.1,
        vast: { kind: 'url', value: 'https://example.com/mid.xml' },
        once: true,
        source: { type: 'VAST', src: 'https://example.com/mid.xml' },
      },
    ] as unknown as AdsPluginInternals['pendingPercentBreaks'];
    plugin.resolvedBreaks = [];

    const due = plugin.getDueMidrollBreaks(21);
    expect(due.length).toBeGreaterThan(0);
    expect(due[0].at).toBeCloseTo(20, 5);
  });
});
