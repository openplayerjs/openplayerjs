/** @jest-environment jsdom */

import type { PluginContext } from '@openplayerjs/core';
import { EventBus } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';
import type { AdsBreakConfig } from '../src/types';

/** AdsPlugin with `resolvedBreaks` narrowed to non-undefined for test access. */
type AdsPluginInternals = AdsPlugin & { resolvedBreaks: NonNullable<AdsPlugin['resolvedBreaks']> };

describe('midroll scheduler grouping', () => {
  test('groups same-time breaks', () => {
    const video = document.createElement('video');
    const events = new EventBus();

    const ctx = {
      core: { media: video },
      events,
      state: { current: 'ready' },
      leases: { acquire: jest.fn(() => true), release: jest.fn(), owner: jest.fn(() => null) },
    } as unknown as PluginContext;

    const plugin = new AdsPlugin({
      breakTolerance: 0.25,
      interceptPlayForPreroll: false,
    }) as unknown as AdsPluginInternals;
    plugin.setup(ctx);

    plugin.resolvedBreaks = [
      { at: 15, source: { type: 'VAST', src: 'https://a/vast1' } },
      { at: 15, source: { type: 'VAST', src: 'https://a/vast2' } },
      { at: 30, source: { type: 'VAST', src: 'https://a/vast3' } },
    ];

    // Pretend breaks have inputs.
    plugin.getVastInputFromBreak = (b: AdsBreakConfig) => ({
      input: { kind: 'url', value: b.source!.src },
      sourceType: 'VAST',
    });

    const due = plugin.getDueMidrollBreaks(15);
    expect(due.length).toBe(2);
  });
});
