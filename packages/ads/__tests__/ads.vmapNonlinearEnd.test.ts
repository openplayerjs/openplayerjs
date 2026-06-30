/** @jest-environment jsdom */

import type { Lease, PluginContext } from '@openplayerjs/core';
import { EventBus } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';

/** AdsPlugin with `resolvedBreaks` narrowed to non-undefined for test access. */
type AdsPluginInternals = AdsPlugin & { resolvedBreaks: NonNullable<AdsPlugin['resolvedBreaks']> };

const globalWithFetch = globalThis as unknown as { fetch: unknown };

describe('AdsPlugin VMAP parsing', () => {
  function makeCtx() {
    const bus = new EventBus();
    const video = document.createElement('video');
    document.body.appendChild(video);
    return {
      ctx: {
        core: { media: video, muted: false, volume: 1 },
        events: bus,
        state: { current: 'ready' },
        leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as unknown as Lease,
      } as unknown as PluginContext,
      video,
    };
  }

  test('accepts breakType non-linear/nonlinear and maps timeOffset=end to postroll with NONLINEAR source', async () => {
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      interceptPlayForPreroll: false,
      allowNativeControls: true,
    }) as unknown as AdsPluginInternals;
    plugin.setup(ctx);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <VMAP xmlns="http://www.iab.net/videosuite/vmap" version="1.0">
        <AdBreak breakType="non-linear" timeOffset="end" breakId="nl-end">
          <AdSource allowMultipleAds="false" followRedirects="true" id="as1">
            <AdTagURI templateType="vast3"><![CDATA[https://example.com/nl-vast.xml]]></AdTagURI>
          </AdSource>
        </AdBreak>
      </VMAP>`;

    globalWithFetch.fetch = jest.fn(async () => ({ ok: true, text: async () => xml }));

    await plugin.loadVmapAndMerge([], 'https://example.com/vmap.xml');
    expect(Array.isArray(plugin.resolvedBreaks)).toBe(true);
    expect(plugin.resolvedBreaks.some((b) => b.at === 'postroll')).toBe(true);

    const post = plugin.resolvedBreaks.find((b) => b.at === 'postroll');
    expect(post?.source?.type).toBe('NONLINEAR');
  });
});
