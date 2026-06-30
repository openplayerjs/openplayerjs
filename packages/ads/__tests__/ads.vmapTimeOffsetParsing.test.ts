/** @jest-environment jsdom */

import type { PluginContext } from '@openplayerjs/core';
import { EventBus } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';

describe('VMAP timeOffset parsing branches', () => {
  function makePlugin() {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const events = new EventBus();
    const ctx = {
      core: { media: video, muted: false, volume: 1 },
      events,
      state: { current: 'ready' },
      leases: { acquire: jest.fn(() => true), release: jest.fn(), owner: jest.fn(() => null) },
    } as unknown as PluginContext;

    const plugin = new AdsPlugin({ interceptPlayForPreroll: false, allowNativeControls: true });
    plugin.setup(ctx);
    return plugin;
  }

  test('parses start/end/percent/HH:MM:SS/seconds', () => {
    const plugin = makePlugin();

    expect(plugin.parseVmapTimeOffset('start').at).toBe('preroll');
    expect(plugin.parseVmapTimeOffset('end').at).toBe('postroll');

    const pct = plugin.parseVmapTimeOffset('50%');
    expect(pct.at).toBe(0);
    expect(pct.pendingPercent).toBeCloseTo(0.5, 6);

    const hhmmss = plugin.parseVmapTimeOffset('00:00:05');
    expect(hhmmss.at).toBe(5);

    const secs = plugin.parseVmapTimeOffset('12');
    expect(secs.at).toBe(12);

    // Unknown formats fall back to preroll.
    expect(plugin.parseVmapTimeOffset('bogus').at).toBe('preroll');
  });
});
