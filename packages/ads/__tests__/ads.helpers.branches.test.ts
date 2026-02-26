/** @jest-environment jsdom */

import type { Player, PluginContext } from '@openplayer/core';
import { DisposableStore, EventBus, StateManager } from '@openplayer/core';
import { AdsPlugin } from '../src/ads';

function makeCtx() {
  const bus = new EventBus();
  const video = document.createElement('video');
  document.body.appendChild(video);

  const dispose = new DisposableStore();
  const ctx: PluginContext = {
    player: { media: video } as unknown as Player,
    events: bus as any,
    state: new StateManager('playing'),
    leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as any,

    dispose,
    add: (d) => dispose.add(d as any),
    on: (event: any, cb: any) => dispose.add(bus.on(event, cb)),
    listen: (target: any, type: any, handler: any, options?: any) =>
      dispose.addEventListener(target, type, handler, options),
  };

  return { ctx, bus, video };
}

describe('AdsPlugin helper methods - branch coverage', () => {
  test('extractVastTagUri supports string, object shapes, and rejects empty', () => {
    const p = new AdsPlugin();
    const anyP = p as any;

    expect(anyP.extractVastTagUri(' https://example.com/vast ')).toBe('https://example.com/vast');
    expect(anyP.extractVastTagUri({ uri: 'https://example.com/a' })).toBe('https://example.com/a');
    expect(anyP.extractVastTagUri({ URI: 'https://example.com/b' })).toBe('https://example.com/b');
    expect(anyP.extractVastTagUri({ value: 'https://example.com/c' })).toBe('https://example.com/c');
    expect(anyP.extractVastTagUri({ text: 'https://example.com/d' })).toBe('https://example.com/d');
    expect(anyP.extractVastTagUri({ '#text': 'https://example.com/e' })).toBe('https://example.com/e');

    expect(anyP.extractVastTagUri('   ')).toBeUndefined();
    expect(anyP.extractVastTagUri({ uri: '   ' })).toBeUndefined();
    expect(anyP.extractVastTagUri(null)).toBeUndefined();
  });

  test('normalizeVmapAdSource picks first usable entry from arrays', () => {
    const p = new AdsPlugin();
    const anyP = p as any;

    expect(anyP.normalizeVmapAdSource(undefined)).toBeUndefined();
    expect(anyP.normalizeVmapAdSource({ adTagURI: { uri: 'x' } })).toEqual({ adTagURI: { uri: 'x' } });

    const arr = [{ foo: 1 }, { adTagURI: { uri: 'good' } }, { vastAdData: '<VAST/>' }];
    expect(anyP.normalizeVmapAdSource(arr)).toEqual({ adTagURI: { uri: 'good' } });
  });

  test('parseVmapTimeOffset handles start/end, percentages, clock time, seconds, and fallback', () => {
    const p = new AdsPlugin();
    const anyP = p as any;

    expect(anyP.parseVmapTimeOffset('start')).toEqual({ at: 'preroll' });
    expect(anyP.parseVmapTimeOffset('end')).toEqual({ at: 'postroll' });
    expect(anyP.parseVmapTimeOffset('50%')).toEqual({ at: 0, pendingPercent: 0.5 });
    expect(anyP.parseVmapTimeOffset('00:00:10')).toEqual({ at: 10 });
    expect(anyP.parseVmapTimeOffset('15')).toEqual({ at: 15 });
    expect(anyP.parseVmapTimeOffset('nonsense')).toEqual({ at: 'preroll' });
  });

  test('setSafeHTML strips blocked tags and inline event handlers', () => {
    const p = new AdsPlugin();
    const anyP = p as any;
    const el = document.createElement('div');

    anyP.setSafeHTML(
      el,
      [
        '<div onclick="alert(1)">ok</div>',
        '<script>alert(1)</script>',
        '<a href="javascript:alert(1)">x</a>',
        '<img src="data:text/html;base64,Zm9v" />',
        '<img src="data:image/png;base64,Zm9v" />',
      ].join('')
    );

    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('div')?.getAttribute('onclick')).toBeNull();
    expect(el.querySelector('a')?.getAttribute('href')).toBeNull();
    // data:text/html should be removed, but data:image/* is allowed
    const imgs = Array.from(el.querySelectorAll('img'));
    expect(imgs.some((i) => (i.getAttribute('src') || '').startsWith('data:text/html'))).toBe(false);
    expect(imgs.some((i) => (i.getAttribute('src') || '').startsWith('data:image/png'))).toBe(true);
  });

  test('getVastInputFromBreak returns url vs xml inputs', () => {
    const { ctx } = makeCtx();
    const p = new AdsPlugin();
    p.setup(ctx);
    const anyP = p as any;

    expect(anyP.getVastInputFromBreak({ at: 'preroll', source: { type: 'VAST', src: ' https://x ' } })).toEqual({
      input: { kind: 'url', value: 'https://x' },
      sourceType: 'VAST',
    });

    expect(anyP.getVastInputFromBreak({ at: 'preroll', source: { type: 'VAST', src: '<VAST />' } })).toEqual({
      input: { kind: 'xml', value: '<VAST />' },
      sourceType: 'VAST',
    });

    expect(anyP.getVastInputFromBreak({ at: 'preroll' })).toEqual({ input: undefined, sourceType: undefined });
  });
});
