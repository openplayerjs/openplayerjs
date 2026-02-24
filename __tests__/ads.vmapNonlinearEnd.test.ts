/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { AdsPlugin } from '../src/plugins/ads';

describe('AdsPlugin VMAP parsing', () => {
  function makeCtx() {
    const bus = new EventBus();
    const video = document.createElement('video');
    document.body.appendChild(video);
    return {
      ctx: {
        player: { media: video, muted: false, volume: 1 } as any,
        events: bus,
        state: { current: 'ready' },
        leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as any,
      } as any,
      video,
    };
  }

  test('accepts breakType non-linear/nonlinear and maps timeOffset=end to postroll with NONLINEAR source', async () => {
    const { ctx } = makeCtx();
    const plugin: any = new AdsPlugin({ interceptPlayForPreroll: false, allowNativeControls: true });
    plugin.setup(ctx);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <VMAP xmlns="http://www.iab.net/videosuite/vmap" version="1.0">
        <AdBreak breakType="non-linear" timeOffset="end" breakId="nl-end">
          <AdSource allowMultipleAds="false" followRedirects="true" id="as1">
            <AdTagURI templateType="vast3"><![CDATA[https://example.com/nl-vast.xml]]></AdTagURI>
          </AdSource>
        </AdBreak>
      </VMAP>`;

    (globalThis as any).fetch = jest.fn(async () => ({ ok: true, text: async () => xml }));

    await plugin.loadVmapAndMerge([], 'https://example.com/vmap.xml');
    expect(Array.isArray(plugin.resolvedBreaks)).toBe(true);
    expect(plugin.resolvedBreaks.some((b: any) => b.at === 'postroll')).toBe(true);

    const post = plugin.resolvedBreaks.find((b: any) => b.at === 'postroll');
    expect(post?.source?.type).toBe('NONLINEAR');
  });
});
