/** @jest-environment jsdom */

/**
 * Tests for the `adTagResolver` hook (Stage 2 of the ad tag URL pipeline).
 *
 * The resolver is intentionally delivery-agnostic — it can wrap Prebid.js,
 * Amazon TAM, Index Exchange, a private ad-server auction, or any other
 * header-bidding wrapper.  These tests verify:
 *
 *  - Resolver receives the correct AdTagResolverContext
 *  - Resolver's returned URL is passed to vastClient.get()
 *  - Empty-string return skips the break (vastClient never called)
 *  - Async resolver is awaited before the fetch
 *  - Resolver runs AFTER targeting substitution (context.url has macros resolved)
 *  - requestInterceptor runs AFTER the resolver (sees the resolver's output URL)
 *  - With no resolver, requestInterceptor still runs on the targeting-resolved URL
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import type { AdTagResolverContext } from '../src/ads';
import { vastGetMock } from './mocks/vast-client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx() {
  const bus = new EventBus();
  const video = document.createElement('video');
  document.body.appendChild(video);
  const dispose = new DisposableStore();
  const ctx: PluginContext = {
    core: { media: video, muted: false, volume: 1, userInteracted: false } as unknown as Core,
    events: bus,
    state: new StateManager('ready'),
    leases: { acquire: () => true, release: () => undefined, owner: () => undefined } as unknown as Lease,
    dispose,
    add: (d) => dispose.add(d),
    on: (event, cb) => dispose.add(bus.on(event, cb)),
    listen: (target, type, handler, options) => dispose.addEventListener(target, type, handler, options),
  };
  return { ctx, bus, video };
}

function linearVast() {
  return {
    ads: [
      {
        sequence: 1,
        creatives: [
          {
            type: 'linear',
            mediaFiles: [
              { type: 'video/mp4', fileURL: 'https://example.com/ad.mp4', bitrate: 500, width: 640, height: 360 },
            ],
          },
        ],
      },
    ],
  };
}

async function flushPromises(n = 20) {
  for (let i = 0; i < n; i++) await Promise.resolve();
}

beforeEach(() => {
  vastGetMock.mockReset();
  document.body.innerHTML = '';
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AdsPlugin: adTagResolver hook', () => {
  it('is called with the correct AdTagResolverContext', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const capturedCtx: AdTagResolverContext[] = [];
    const plugin = new AdsPlugin({
      csai: {
        adTagResolver: (resolverCtx) => {
          capturedCtx.push(resolverCtx);
          return resolverCtx.url;
        },
        resumeContent: false,
      },
      breaks: [{ id: 'break-1', at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(capturedCtx).toHaveLength(1);
    expect(capturedCtx[0].url).toBe('https://ads.example.com/vast');
    expect(capturedCtx[0].breakId).toBe('break-1');
    expect(capturedCtx[0].at).toBe('preroll');
    expect(capturedCtx[0].adType).toBe('VAST');
  });

  it('fetches the URL returned by the resolver, not the original', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: {
        adTagResolver: () => 'https://resolver.example.com/resolved-vast',
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/original' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(vastGetMock).toHaveBeenCalledWith('https://resolver.example.com/resolved-vast');
    expect(vastGetMock).not.toHaveBeenCalledWith('https://ads.example.com/original');
  });

  it('skips the break (does not call vastClient) when resolver returns empty string', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: {
        adTagResolver: () => '',
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(vastGetMock).not.toHaveBeenCalled();
  });

  it('awaits an async resolver before calling vastClient', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    let resolveAuction!: (url: string) => void;
    const auctionPromise = new Promise<string>((res) => {
      resolveAuction = res;
    });
    const plugin = new AdsPlugin({
      csai: {
        adTagResolver: () => auctionPromise,
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(5);

    // Not yet called — waiting for the auction promise
    expect(vastGetMock).not.toHaveBeenCalled();

    resolveAuction('https://winner.example.com/vast');
    await flushPromises(20);

    expect(vastGetMock).toHaveBeenCalledWith('https://winner.example.com/vast');
  });

  it('receives a URL with macros already resolved (runs after targeting)', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const capturedUrls: string[] = [];
    const plugin = new AdsPlugin({
      csai: {
        targeting: { tier: 'gold' },
        adTagResolver: (resolverCtx) => {
          capturedUrls.push(resolverCtx.url);
          return resolverCtx.url;
        },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast?t={tier}' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(capturedUrls[0]).toContain('t=gold');
    expect(capturedUrls[0]).not.toContain('{tier}');
  });

  it('requestInterceptor receives the resolver output URL (runs after resolver)', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const interceptedUrls: string[] = [];
    const plugin = new AdsPlugin({
      csai: {
        adTagResolver: () => 'https://resolved.example.com/vast',
        requestInterceptor: (req) => {
          interceptedUrls.push(req.url);
          return req;
        },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://original.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(interceptedUrls[0]).toBe('https://resolved.example.com/vast');
  });

  it('requestInterceptor runs (and mutates URL) even without a resolver', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: {
        requestInterceptor: (req) => ({ ...req, url: req.url + '&token=secret' }),
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(vastGetMock).toHaveBeenCalledWith('https://ads.example.com/vast&token=secret');
  });

  it('returning null from requestInterceptor skips the break', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: {
        requestInterceptor: () => null,
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(vastGetMock).not.toHaveBeenCalled();
  });
});
