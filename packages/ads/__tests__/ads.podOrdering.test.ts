/** @jest-environment jsdom */

import { AdsPlugin } from '../src/ads';

function makePlugin() {
  const ctx: any = {
    name: 'player',
    player: { media: document.createElement('video') },
    events: { emit: jest.fn() },
    leases: { acquire: jest.fn(() => true), release: jest.fn(), owner: jest.fn(() => null) },
    bus: { emit: jest.fn() },
  };
  return new AdsPlugin(ctx);
}

describe('ads pod ordering', () => {
  test('plays multiple creatives within same Ad in order', () => {
    const plugin: any = makePlugin();
    const parsed = {
      ads: [
        {
          sequence: 1,
          creatives: [
            { linear: { mediaFiles: [{ fileURL: 'https://a/bumper.mp4', mimeType: 'video/mp4' }] } },
            { linear: { mediaFiles: [{ fileURL: 'https://a/main.mp4', mimeType: 'video/mp4' }] } },
          ],
        },
      ],
    };
    const pod = plugin.collectPodAds(parsed);
    expect(pod).toHaveLength(2);
    expect(pod[0].mediaFile.fileURL).toContain('bumper');
    expect(pod[1].mediaFile.fileURL).toContain('main');
  });

  test('orders across Ads and creatives', () => {
    const plugin: any = makePlugin();
    const parsed = {
      ads: [
        {
          sequence: 1,
          creatives: [{ linear: { mediaFiles: [{ fileURL: 'https://a/ad1.mp4', mimeType: 'video/mp4' }] } }],
        },
        {
          sequence: 2,
          creatives: [
            { linear: { mediaFiles: [{ fileURL: 'https://a/bumper2.mp4', mimeType: 'video/mp4' }] } },
            { linear: { mediaFiles: [{ fileURL: 'https://a/main2.mp4', mimeType: 'video/mp4' }] } },
          ],
        },
      ],
    };
    const pod = plugin.collectPodAds(parsed);
    expect(pod.map((x: any) => x.mediaFile.fileURL)).toEqual([
      'https://a/ad1.mp4',
      'https://a/bumper2.mp4',
      'https://a/main2.mp4',
    ]);
  });
});
