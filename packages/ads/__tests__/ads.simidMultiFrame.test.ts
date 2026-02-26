/** @jest-environment jsdom */

import { EventBus } from '@openplayer/core';
import { AdsPlugin } from '../src/ads';

describe('SIMID multi-frame', () => {
  test('mounts multiple SIMID iframes when multiple urls present', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const events = new EventBus();
    const ctx: any = {
      player: { media: video, muted: false, volume: 1 },
      events,
      state: { current: 'ready' },
      leases: { acquire: jest.fn(() => true), release: jest.fn(), owner: jest.fn(() => null) },
    };

    const plugin: any = new AdsPlugin({ interceptPlayForPreroll: false, allowNativeControls: true });
    plugin.setup(ctx);

    const creative = {
      simid: {
        urls: ['https://example.com/simid1', 'https://example.com/simid2'],
      },
    };

    plugin.tryMountSimidLayer(creative);

    const iframes = plugin.overlay.querySelectorAll('iframe');
    expect(iframes.length).toBe(2);
    expect(iframes[0].getAttribute('src')).toContain('simid1');
    expect(iframes[1].getAttribute('src')).toContain('simid2');
  });
});
