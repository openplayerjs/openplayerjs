/** @jest-environment jsdom */

import { EventBus } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';

describe('AdsPlugin HTML sanitizer', () => {
  test('setSafeHTML strips blocked tags and dangerous attributes', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const ctx: any = {
      core: { media: video, muted: false, volume: 1 },
      events: new EventBus(),
      state: { current: 'ready' },
      leases: { acquire: () => true, release: () => undefined, owner: () => undefined },
    };

    const plugin: any = new AdsPlugin({ interceptPlayForPreroll: false, allowNativeControls: true });
    plugin.setup(ctx);

    const host = document.createElement('div');
    const html = `
      <div onclick="alert(1)">
        <script>alert("x")</script>
        <img src="javascript:alert(1)" onerror="alert(2)" />
        <a href="javascript:alert(3)" target="_blank">click</a>
        <a href="vbscript:MsgBox(1)">vbs</a>
        <span style="color:red">ok</span>
      </div>
    `;

    (plugin as any).setSafeHTML(host, html);

    // script removed
    expect(host.querySelector('script')).toBeFalsy();

    const img = host.querySelector('img') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    // dangerous handlers removed and javascript: blocked
    expect(img?.getAttribute('onerror')).toBeFalsy();
    expect((img?.getAttribute('src') || '').toLowerCase()).not.toContain('javascript:');

    const links = host.querySelectorAll('a');
    // javascript: href stripped
    expect((links[0]?.getAttribute('href') || '').toLowerCase()).not.toContain('javascript:');
    // vbscript: href stripped (CodeQL: executable scheme must be explicitly denied)
    expect((links[1]?.getAttribute('href') || '').toLowerCase()).not.toContain('vbscript:');

    // onclick removed
    const div = host.querySelector('div') as HTMLDivElement | null;
    expect(div?.getAttribute('onclick')).toBeFalsy();
  });
});
