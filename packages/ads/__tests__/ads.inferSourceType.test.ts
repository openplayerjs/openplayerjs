/** @jest-environment jsdom */

import { EventBus } from '@openplayer/core';
import type { AdsSourceType } from '../src/ads';
import { AdsPlugin } from '../src/ads';

type AdMeta = { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string; sourceType?: AdsSourceType };

describe('AdsPlugin manual-play sourceType inference', () => {
  function makeCtx() {
    const video = document.createElement('video');
    document.body.appendChild(video);
    return {
      player: { media: video, muted: false, volume: 1 },
      events: new EventBus(),
      state: { current: 'ready' },
      leases: { acquire: () => true, release: () => undefined, owner: () => undefined },
    };
  }

  test('infers NONLINEAR when only a NONLINEAR source is configured', async () => {
    const ctx = makeCtx();
    const plugin: any = new AdsPlugin({
      sources: [{ type: 'NONLINEAR', src: 'https://example.com/nl.xml' }],
      interceptPlayForPreroll: false,
      allowNativeControls: true,
    });
    plugin.setup(ctx);

    const spy = jest.spyOn(plugin, 'playBreakFromVast').mockResolvedValue(undefined);

    await plugin.playAds('https://example.com/anything.xml');
    expect(spy).toHaveBeenCalled();
    expect((spy.mock.calls[0][1] as AdMeta).sourceType).toBe('NONLINEAR');
  });

  test('infers NONLINEAR when the manual URL matches the configured NONLINEAR source exactly', async () => {
    const ctx = makeCtx();
    const plugin: any = new AdsPlugin({
      sources: [
        { type: 'VAST', src: 'https://example.com/vast.xml' },
        { type: 'NONLINEAR', src: 'https://example.com/nl.xml' },
      ],
      interceptPlayForPreroll: false,
      allowNativeControls: true,
    });
    plugin.setup(ctx);

    const spy = jest.spyOn(plugin, 'playBreakFromVast').mockResolvedValue(undefined);

    await plugin.playAds('https://example.com/nl.xml');
    expect(spy).toHaveBeenCalled();
    expect((spy.mock.calls[0][1] as AdMeta).sourceType).toBe('NONLINEAR');
  });
});
