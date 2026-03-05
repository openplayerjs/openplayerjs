/** @jest-environment jsdom */

import { EventBus } from '@openplayerjs/core';
import { AdsPlugin } from '../src/ads';

describe('NONLINEAR raw-XML fallback helpers', () => {
  test('attempts to load + parse raw XML for NONLINEAR sources', async () => {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const events = new EventBus();
    const ctx = {
      core: { media: video, muted: false, volume: 1 },
      events,
      state: { current: 'ready' },
      leases: { acquire: jest.fn(() => true), release: jest.fn(), owner: jest.fn(() => null) },
    };

    const plugin: any = new AdsPlugin({ interceptPlayForPreroll: false, allowNativeControls: true });
    plugin.setup(ctx);

    // Ensure parse path doesn't throw.
    plugin.vastClient = {
      get: jest.fn(async () => ({ ads: [], version: '3.0' })),
      parseVAST: jest.fn(async () => ({ ads: [], version: '3.0' })),
    };

    const getXmlSpy = jest.spyOn(plugin as any, 'getVastXmlText').mockResolvedValue('<VAST version="3.0"></VAST>');
    const buildSpy = jest
      .spyOn(plugin as any, 'buildParsedForNonLinearFromXml')
      .mockImplementation((xmlText) => new DOMParser().parseFromString(xmlText as string, 'text/xml'));

    await (plugin as any).playBreakFromVast(
      { kind: 'url', value: 'https://example.com/vast' },
      { kind: 'manual', id: 'manual', sourceType: 'NONLINEAR' }
    );

    expect(getXmlSpy).toHaveBeenCalledTimes(1);
    expect(buildSpy).toHaveBeenCalledTimes(1);
  });
});
