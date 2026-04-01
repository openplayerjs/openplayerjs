/** @jest-environment jsdom */

/**
 * Tests for the `targeting`, `userId`, and macro-substitution step of the
 * ad tag URL resolution pipeline (Stage 1).
 *
 * Verified behaviours:
 *  - {KEY} macros in VAST URLs are replaced with values from `targeting`
 *  - Keys with no matching macro are appended as ?key=value query params
 *  - Mixed macro + append in one request
 *  - `userId` as a static string substitutes {USER_ID}
 *  - `userId` as a sync factory — called per break
 *  - `userId` with no {USER_ID} macro — appended as &ppid=
 *  - `userId` as an async factory — awaited correctly
 *  - Flat top-level `targeting` field mirrors `csai.targeting`
 *  - `csai.targeting` takes precedence over flat `targeting` when both set
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { applyTargeting } from '../src/csai-utils';
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

// ─── applyTargeting unit tests (pure function) ────────────────────────────────

describe('applyTargeting()', () => {
  it('replaces a {KEY} macro in the URL', () => {
    const result = applyTargeting('https://ads.example.com/vast?cat={content_cat}', { content_cat: 'sport' });
    expect(result).toBe('https://ads.example.com/vast?cat=sport');
  });

  it('appends a key as query param when no matching macro exists', () => {
    const result = applyTargeting('https://ads.example.com/vast', { env: 'prod' });
    expect(result).toBe('https://ads.example.com/vast?env=prod');
  });

  it('handles mixed macro-hit and append in one call', () => {
    const result = applyTargeting('https://ads.example.com/vast?cat={content_cat}', {
      content_cat: 'sport',
      env: 'prod',
    });
    expect(result).toBe('https://ads.example.com/vast?cat=sport&env=prod');
  });

  it('appends using & when URL already has query params', () => {
    const result = applyTargeting('https://ads.example.com/vast?existing=1', { env: 'prod' });
    expect(result).toBe('https://ads.example.com/vast?existing=1&env=prod');
  });

  it('substitutes {USER_ID} macro', () => {
    const result = applyTargeting('https://ads.example.com/vast?uid={USER_ID}', {}, 'user-abc');
    expect(result).toBe('https://ads.example.com/vast?uid=user-abc');
  });

  it('appends &ppid= when userId is set but no {USER_ID} macro exists', () => {
    const result = applyTargeting('https://ads.example.com/vast', {}, 'user-abc');
    expect(result).toBe('https://ads.example.com/vast?ppid=user-abc');
  });

  it('URL-encodes values', () => {
    const result = applyTargeting('https://ads.example.com/vast?k={v}', { v: 'a b&c' });
    expect(result).toBe('https://ads.example.com/vast?k=a%20b%26c');
  });

  it('applies userId before targeting macros', () => {
    const result = applyTargeting('https://ads.example.com/vast', { key: 'val' }, 'uid-1');
    expect(result).toBe('https://ads.example.com/vast?ppid=uid-1&key=val');
  });
});

// ─── Integration: targeting fed through AdsPlugin ─────────────────────────────

describe('AdsPlugin: targeting config', () => {
  it('substitutes {KEY} macro in VAST URL before fetching', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: {
        targeting: { content_cat: 'sport' },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast?cat={content_cat}' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('cat=sport'));
    expect(vastGetMock).not.toHaveBeenCalledWith(expect.stringContaining('{content_cat}'));
  });

  it('appends targeting keys with no macro as query params', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: { targeting: { env: 'prod' }, resumeContent: false },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('env=prod'));
  });

  it('flat top-level targeting field is forwarded correctly', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      targeting: { segment: 'premium' },
      resumeContent: false,
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast?s={segment}' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('s=premium'));
  });

  it('csai.targeting wins over flat targeting when both are set', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      targeting: { segment: 'flat' },
      csai: { targeting: { segment: 'nested' }, resumeContent: false },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast?s={segment}' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    // csai.targeting takes precedence (spread: { ...config, ...config.csai })
    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('s=nested'));
  });
});

// ─── Integration: userId fed through AdsPlugin ────────────────────────────────

describe('AdsPlugin: userId config', () => {
  it('substitutes {USER_ID} macro with a static string', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: { userId: 'user-123', resumeContent: false },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast?uid={USER_ID}' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('uid=user-123'));
  });

  it('calls a sync factory userId and uses its return value', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const factory = jest.fn(() => 'viewer-xyz');
    const plugin = new AdsPlugin({
      csai: { userId: factory, resumeContent: false },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast?uid={USER_ID}' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('uid=viewer-xyz'));
  });

  it('appends &ppid= when no {USER_ID} macro is present', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: { userId: 'anon-456', resumeContent: false },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('ppid=anon-456'));
  });

  it('awaits an async userId factory', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx } = makeCtx();
    const asyncFactory = jest.fn(async () => 'async-viewer');
    const plugin = new AdsPlugin({
      csai: { userId: asyncFactory, resumeContent: false },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast?u={USER_ID}' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises(20);

    expect(asyncFactory).toHaveBeenCalledTimes(1);
    expect(vastGetMock).toHaveBeenCalledWith(expect.stringContaining('u=async-viewer'));
  });
});
