/** @jest-environment jsdom */

import { EventBus } from '@openplayer/core';
import { AdsPlugin } from '../src/ads';

describe('VMAP timeOffset parsing branches', () => {
  function makePlugin() {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const events = new EventBus();
    const ctx: any = {
      core: { media: video, muted: false, volume: 1 },
      events,
      state: { current: 'ready' },
      leases: { acquire: jest.fn(() => true), release: jest.fn(), owner: jest.fn(() => null) },
    };

    const plugin: any = new AdsPlugin({ interceptPlayForPreroll: false, allowNativeControls: true });
    plugin.setup(ctx);
    return plugin;
  }

  test('parses start/end/percent/HH:MM:SS/seconds', () => {
    const plugin: any = makePlugin();

    expect((plugin as any).parseVmapTimeOffset('start').at).toBe('preroll');
    expect((plugin as any).parseVmapTimeOffset('end').at).toBe('postroll');

    const pct = (plugin as any).parseVmapTimeOffset('50%');
    expect(pct.at).toBe(0);
    expect(pct.pendingPercent).toBeCloseTo(0.5, 6);

    const hhmmss = (plugin as any).parseVmapTimeOffset('00:00:05');
    expect(hhmmss.at).toBe(5);

    const secs = (plugin as any).parseVmapTimeOffset('12');
    expect(secs.at).toBe(12);

    // Unknown formats fall back to preroll.
    expect((plugin as any).parseVmapTimeOffset('bogus').at).toBe('preroll');
  });
});
