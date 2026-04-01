/** @jest-environment jsdom */

/**
 * Tests for the `adBlockerFallback` config option.
 *
 * The fallback is triggered only by genuine network-level failures (TypeError
 * from the Fetch API, or when `adTagResolver` returns an empty value).
 * VAST parse errors and "no ads found" do NOT trigger it.
 *
 * Modes tested:
 *  - `'skip'`   — silently resume content; no ads.error event for the failure
 *  - `'custom'` — break schedule replaced; house ad VAST URL is fetched
 *  - `'ssai'`   — ads.adblocker.ssai_fallback event emitted
 *
 * Also verified:
 *  - A VAST parse error (non-network) does NOT trigger the fallback
 *  - Without adBlockerFallback, original behavior (ads.error event) is preserved
 *  - adTagResolver returning '' triggers the skip path
 */

import type { Core, Lease, PluginContext } from '@openplayerjs/core';
import { DisposableStore, EventBus, StateManager } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import { isAdBlockerError } from '../src/csai-utils';
import { vastGetMock } from './mocks/vast-client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx() {
  const bus = new EventBus();
  const video = document.createElement('video');
  // jsdom's textTracks doesn't have addEventListener; patch it for SSAI strategy
  Object.defineProperty(video, 'textTracks', {
    configurable: true,
    value: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      length: 0,
      [Symbol.iterator]: function* () {
        // empty iterator
      },
    },
  });
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

async function flushPromises(n = 25) {
  for (let i = 0; i < n; i++) await Promise.resolve();
}

beforeEach(() => {
  vastGetMock.mockReset();
  document.body.innerHTML = '';
});

// ─── isAdBlockerError unit tests ──────────────────────────────────────────────

describe('isAdBlockerError()', () => {
  it('returns true for TypeError (fetch network failure)', () => {
    expect(isAdBlockerError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('returns true for an error with _skipSignal flag', () => {
    const err = Object.assign(new Error('skip'), { _skipSignal: true });
    expect(isAdBlockerError(err)).toBe(true);
  });

  it('returns true for a generic network request failed message', () => {
    expect(isAdBlockerError(new Error('network request failed'))).toBe(true);
  });

  it('returns false for a plain Error (e.g. VAST parse error)', () => {
    expect(isAdBlockerError(new Error('No playable ads found in VAST response'))).toBe(false);
  });

  it('returns false for a non-Error value', () => {
    expect(isAdBlockerError('string error')).toBe(false);
    expect(isAdBlockerError(null)).toBe(false);
  });
});

// ─── adBlockerFallback: mode 'skip' ──────────────────────────────────────────

describe('AdsPlugin: adBlockerFallback mode "skip"', () => {
  it('silently skips the break; ads.error is NOT emitted', async () => {
    vastGetMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { ctx, bus } = makeCtx();
    const errors: unknown[] = [];
    bus.on('ads.error', (e) => errors.push(e));

    const plugin = new AdsPlugin({
      csai: {
        adBlockerFallback: { mode: 'skip' },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(vastGetMock).toHaveBeenCalledTimes(1);
    expect(errors).toHaveLength(0);
  });

  it('resumes content after skipping (cmd:play re-emitted)', async () => {
    vastGetMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { ctx, bus } = makeCtx();
    const playCommands: unknown[] = [];
    // The preroll intercepts cmd:play; after skip, another cmd:play is re-emitted
    let intercepted = false;
    bus.on('cmd:play', () => {
      if (intercepted) playCommands.push(true);
      intercepted = true;
    });

    const plugin = new AdsPlugin({
      csai: {
        adBlockerFallback: { mode: 'skip' },
        resumeContent: true,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(playCommands.length).toBeGreaterThan(0);
  });
});

// ─── adBlockerFallback: mode 'custom' ────────────────────────────────────────

describe('AdsPlugin: adBlockerFallback mode "custom"', () => {
  it('fetches the house-ad VAST URL from the custom breaks list on block', async () => {
    // First call (original) is blocked; second call (house ad) succeeds
    vastGetMock.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValue(linearVast());

    const { ctx } = makeCtx();
    const plugin = new AdsPlugin({
      csai: {
        adBlockerFallback: {
          mode: 'custom',
          breaks: [
            {
              at: 'preroll',
              source: { type: 'VAST', src: 'https://cdn.example.com/house-ad.xml' },
            },
          ],
        },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(vastGetMock).toHaveBeenCalledWith('https://cdn.example.com/house-ad.xml');
  });
});

// ─── adBlockerFallback: mode 'ssai' ──────────────────────────────────────────

describe('AdsPlugin: adBlockerFallback mode "ssai"', () => {
  it('emits ads.adblocker.ssai_fallback on network failure', async () => {
    vastGetMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { ctx, bus } = makeCtx();
    const ssaiFallbacks: unknown[] = [];
    bus.on('ads.adblocker.ssai_fallback', () => ssaiFallbacks.push(true));

    const plugin = new AdsPlugin({
      csai: {
        adBlockerFallback: { mode: 'ssai' },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(ssaiFallbacks).toHaveLength(1);
  });
});

// ─── Non-network errors do NOT trigger fallback ───────────────────────────────

describe('AdsPlugin: adBlockerFallback — non-network errors are not intercepted', () => {
  it('emits ads.error for a "no ads found" response (not a network error)', async () => {
    vastGetMock.mockResolvedValue({ ads: [] }); // VAST parse succeeds but yields no ads
    const { ctx, bus } = makeCtx();
    const errors: unknown[] = [];
    bus.on('ads.error', (e) => errors.push(e));

    const plugin = new AdsPlugin({
      csai: {
        adBlockerFallback: { mode: 'skip' },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    // "No playable ads" is not a network error — regular error path is taken
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ─── Without adBlockerFallback, original behavior is preserved ────────────────

describe('AdsPlugin: without adBlockerFallback', () => {
  it('emits ads.error on network failure when no fallback is configured', async () => {
    vastGetMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { ctx, bus } = makeCtx();
    const errors: unknown[] = [];
    bus.on('ads.error', (e) => errors.push(e));

    const plugin = new AdsPlugin({
      csai: { resumeContent: false },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(errors).toHaveLength(1);
  });
});

// ─── adTagResolver '' triggers skip path ─────────────────────────────────────

describe('AdsPlugin: adTagResolver returning empty string', () => {
  it('skips the break silently when adBlockerFallback mode is "skip"', async () => {
    vastGetMock.mockResolvedValue(linearVast());
    const { ctx, bus } = makeCtx();
    const errors: unknown[] = [];
    bus.on('ads.error', (e) => errors.push(e));

    const plugin = new AdsPlugin({
      csai: {
        adTagResolver: () => '',
        adBlockerFallback: { mode: 'skip' },
        resumeContent: false,
      },
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    plugin.setup(ctx);
    ctx.events.emit('cmd:play');
    await flushPromises();

    expect(vastGetMock).not.toHaveBeenCalled();
    expect(errors).toHaveLength(0);
  });
});
