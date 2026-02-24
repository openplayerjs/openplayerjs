/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { AdsPlugin } from '../src/plugins/ads';

describe('midroll scheduler grouping', () => {
  test('groups same-time breaks', () => {
    const video = document.createElement('video');
    const events = new EventBus();

    const ctx: any = {
      player: { media: video },
      events,
      state: { current: 'ready' },
      leases: { acquire: jest.fn(() => true), release: jest.fn(), owner: jest.fn(() => null) },
    };

    const plugin: any = new AdsPlugin({ breakTolerance: 0.25, interceptPlayForPreroll: false });
    plugin.setup(ctx);

    plugin.resolvedBreaks = [
      { at: 15, source: { type: 'VAST', src: 'https://a/vast1' } },
      { at: 15, source: { type: 'VAST', src: 'https://a/vast2' } },
      { at: 30, source: { type: 'VAST', src: 'https://a/vast3' } },
    ];

    // Pretend breaks have inputs.
    plugin.getVastInputFromBreak = (b: any) => ({ input: { kind: 'url', value: b.source.src }, sourceType: 'VAST' });

    const due = plugin.getDueMidrollBreaks(15);
    expect(due.length).toBe(2);
  });
});
