/** @jest-environment jsdom */

/**
 * Unit tests for packages/ads/src/csai-utils.ts
 *
 * All functions in csai-utils are pure (no DOM, no class state) so they can be
 * tested in complete isolation.
 */

import { applyTargeting, isAdBlockerError, normalizeCsaiConfig, normalizeSources } from '../src/csai-utils';

// ─── normalizeSources ─────────────────────────────────────────────────────────

describe('normalizeSources()', () => {
  it('returns empty array when config has no sources', () => {
    expect(normalizeSources({})).toEqual([]);
  });

  it('wraps a single AdsSource object in an array', () => {
    const result = normalizeSources({ sources: { type: 'VAST', src: 'https://ads.example.com/vast' } });
    expect(result).toEqual([{ type: 'VAST', src: 'https://ads.example.com/vast' }]);
  });

  it('accepts an array of sources', () => {
    const result = normalizeSources({
      sources: [
        { type: 'VAST', src: 'https://ads.example.com/vast' },
        { type: 'VMAP', src: 'https://ads.example.com/vmap' },
      ],
    });
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('VAST');
    expect(result[1].type).toBe('VMAP');
  });

  it('filters out sources with empty or blank src', () => {
    const result = normalizeSources({
      sources: [
        { type: 'VAST', src: '' },
        { type: 'VAST', src: '   ' },
        { type: 'VAST', src: 'https://ads.example.com/valid' },
      ],
    });
    expect(result).toHaveLength(1);
    expect(result[0].src).toBe('https://ads.example.com/valid');
  });

  it('filters out null/undefined sources', () => {
    const result = normalizeSources({
      sources: [null as any, undefined as any, { type: 'VAST', src: 'https://ads.example.com/valid' }],
    });
    expect(result).toHaveLength(1);
  });

  it('only accepts VAST, VMAP, NONLINEAR types', () => {
    const result = normalizeSources({
      sources: [
        { type: 'VAST', src: 'https://ads.example.com/vast' },
        { type: 'VMAP', src: 'https://ads.example.com/vmap' },
        { type: 'NONLINEAR', src: 'https://ads.example.com/nl' },
        { type: 'OTHER' as any, src: 'https://ads.example.com/other' },
      ],
    });
    expect(result).toHaveLength(3);
  });
});

// ─── normalizeCsaiConfig ──────────────────────────────────────────────────────

describe('normalizeCsaiConfig()', () => {
  it('applies default values when nothing is configured', () => {
    const result = normalizeCsaiConfig({});
    expect(result.resumeContent).toBe(true);
    expect(result.allowNativeControls).toBe(false);
    expect(result.debug).toBe(false);
    expect(result.breakTolerance).toBe(0.25);
    expect(result.adSourcesMode).toBe('waterfall');
    expect(result.interceptPlayForPreroll).toBe(false);
    expect(result.autoPlayOnReady).toBe(false);
    expect(result.preferredMediaTypes).toContain('video/mp4');
    expect(result.omid).toEqual({});
    expect(result.labels).toEqual({});
  });

  it('merges flat top-level fields with csai sub-config (csai wins)', () => {
    const result = normalizeCsaiConfig({
      resumeContent: false,
      csai: { resumeContent: true },
    });
    expect(result.resumeContent).toBe(true);
  });

  it('sets interceptPlayForPreroll=true when breaks include a preroll with a source', () => {
    const result = normalizeCsaiConfig({
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    expect(result.interceptPlayForPreroll).toBe(true);
  });

  it('sets interceptPlayForPreroll=true when VAST/VMAP source is provided at top level', () => {
    const result = normalizeCsaiConfig({ sources: { type: 'VMAP', src: 'https://ads.example.com/vmap' } });
    expect(result.interceptPlayForPreroll).toBe(true);
  });

  it('keeps interceptPlayForPreroll=false when only midroll breaks are configured', () => {
    const result = normalizeCsaiConfig({
      breaks: [{ at: 20, source: { type: 'VAST', src: 'https://ads.example.com/vast' } }],
    });
    expect(result.interceptPlayForPreroll).toBe(false);
  });

  it('forwards targeting and userId from csai sub-config', () => {
    const result = normalizeCsaiConfig({
      csai: { targeting: { cat: 'sport' }, userId: 'uid-1' },
    });
    expect(result.targeting).toEqual({ cat: 'sport' });
    expect(result.userId).toBe('uid-1');
  });

  it('forwards adDelivery from top-level config', () => {
    const result = normalizeCsaiConfig({ adDelivery: 'ssai' });
    expect(result.adDelivery).toBe('ssai');
  });

  it('defaults adDelivery to csai', () => {
    const result = normalizeCsaiConfig({});
    expect(result.adDelivery).toBe('csai');
  });
});

// ─── applyTargeting — see also ads.targeting.test.ts for integration tests ────

describe('applyTargeting()', () => {
  it('returns URL unchanged when no targeting and no userId', () => {
    const url = 'https://ads.example.com/vast?foo=bar';
    expect(applyTargeting(url, {})).toBe(url);
  });

  it('replaces multiple {KEY} macros in a single URL', () => {
    const result = applyTargeting('https://ads.example.com/vast?a={A}&b={B}', { A: '1', B: '2' });
    expect(result).toBe('https://ads.example.com/vast?a=1&b=2');
  });

  it('replaces a macro that appears more than once', () => {
    const result = applyTargeting('https://ads.example.com/vast?a={K}&b={K}', { K: 'x' });
    expect(result).toBe('https://ads.example.com/vast?a=x&b=x');
  });

  it('appends when no macro exists for a key', () => {
    const result = applyTargeting('https://ads.example.com/vast', { env: 'prod' });
    expect(result).toContain('env=prod');
  });

  it('handles multiple appended keys', () => {
    const result = applyTargeting('https://ads.example.com/vast', { a: '1', b: '2' });
    expect(result).toContain('a=1');
    expect(result).toContain('b=2');
  });

  it('substitutes {USER_ID} before targeting macros', () => {
    const result = applyTargeting('https://ads.example.com/vast?u={USER_ID}&k={k}', { k: 'v' }, 'user-1');
    expect(result).toBe('https://ads.example.com/vast?u=user-1&k=v');
  });

  it('URL-encodes special characters in values', () => {
    const result = applyTargeting('https://ads.example.com/vast?k={v}', { v: 'a b=c' });
    expect(result).toBe('https://ads.example.com/vast?k=a%20b%3Dc');
  });
});

// ─── isAdBlockerError — see also ads.adBlockerFallback.test.ts ───────────────

describe('isAdBlockerError()', () => {
  it('returns true for TypeError (fetch network failure)', () => {
    expect(isAdBlockerError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('returns true for any TypeError regardless of message', () => {
    expect(isAdBlockerError(new TypeError('network error'))).toBe(true);
  });

  it('returns true for an Error with _skipSignal flag', () => {
    const err = Object.assign(new Error('skip'), { _skipSignal: true });
    expect(isAdBlockerError(err)).toBe(true);
  });

  it('returns true for "network request failed" in message', () => {
    expect(isAdBlockerError(new Error('network request failed'))).toBe(true);
  });

  it('returns true for case-insensitive "Failed to fetch" in message', () => {
    expect(isAdBlockerError(new Error('Failed to fetch something'))).toBe(true);
  });

  it('returns false for a plain Error (e.g. VAST parse error)', () => {
    expect(isAdBlockerError(new Error('No playable ads found'))).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isAdBlockerError('string error')).toBe(false);
    expect(isAdBlockerError(null)).toBe(false);
    expect(isAdBlockerError(42)).toBe(false);
    expect(isAdBlockerError({})).toBe(false);
  });
});
