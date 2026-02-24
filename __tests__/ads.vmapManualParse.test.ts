/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { AdsPlugin } from '../src/plugins/ads';

describe('AdsPlugin VMAP DOM fallback parser', () => {
  test('parses namespaced VMAP XML directly when VMAP lib returns no breaks', async () => {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const ctx: any = {
      player: { media: video, muted: false, volume: 1 },
      events: new EventBus(),
      state: { current: 'ready' },
      leases: { acquire: () => true, release: () => undefined, owner: () => undefined },
    };

    const plugin: any = new AdsPlugin({ interceptPlayForPreroll: false, allowNativeControls: true });
    plugin.setup(ctx);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <VMAP xmlns="http://www.iab.net/videosuite/vmap" version="1.0">
        <AdBreak breakType="linear" timeOffset="start" breakId="pre">
          <AdSource><AdTagURI><![CDATA[https://example.com/pre.xml]]></AdTagURI></AdSource>
        </AdBreak>
        <AdBreak breakType="linear" timeOffset="50%" breakId="mid">
          <AdSource><VASTAdData><![CDATA[<VAST version="3.0"></VAST>]]></VASTAdData></AdSource>
        </AdBreak>
        <AdBreak breakType="nonlinear" timeOffset="end" breakId="post">
          <AdSource><AdTagURI><![CDATA[https://example.com/post.xml]]></AdTagURI></AdSource>
        </AdBreak>
      </VMAP>`;

    (globalThis as any).fetch = jest.fn(async () => ({ ok: true, text: async () => xml }));

    await plugin.loadVmapAndMerge([], 'https://example.com/vmap.xml');

    // preroll and postroll are resolved immediately; percent midroll becomes pending until duration known
    expect(plugin.resolvedBreaks.some((b: any) => b.at === 'preroll')).toBe(true);
    expect(plugin.resolvedBreaks.some((b: any) => b.at === 'postroll')).toBe(true);
    const post = plugin.resolvedBreaks.find((b: any) => b.at === 'postroll');
    expect(post?.source?.type).toBe('NONLINEAR');

    // pending percent stored
    expect((plugin as any).pendingPercentBreaks?.length).toBeGreaterThan(0);

    Object.defineProperty(video, 'duration', { configurable: true, value: 200 });
    const due = plugin.getDueMidrollBreaks(101);
    expect(due.some((b: any) => b.id?.includes('mid'))).toBe(true);
  });
});
