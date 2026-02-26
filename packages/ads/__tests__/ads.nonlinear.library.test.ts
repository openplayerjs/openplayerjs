/** @jest-environment jsdom */

/**
 * Tests for non-linear and companion ad parsing via the @dailymotion/vast-client
 * library path. The library returns creative objects with:
 *   - creative.type === 'nonlinear', creative.variations = NonLinearAd[]
 *   - creative.type === 'companion', creative.variations = CompanionAd[]
 *
 * NonLinearAd shape (library):
 *   { staticResource: '<url>', nonlinearClickThroughURLTemplate: '<url>', minSuggestedDuration: 5 }
 *
 * CompanionAd shape (library):
 *   { staticResources: [{ url: '<url>', creativeType: 'image/png' }], companionClickThroughURLTemplate: '<url>' }
 */

import { AdsPlugin } from '../src/ads';

// Build a library-style parsed VAST response for a non-linear-only ad.
function makeLibraryParsed(opts: {
  nonlinearClickThrough?: string;
  companionClickThrough?: string;
  companionStaticUrl?: string;
  staticResource?: string;
  minSuggestedDuration?: number;
} = {}) {
  const nonLinearVariation: any = {
    staticResource: opts.staticResource ?? 'https://example.com/overlay.png',
    nonlinearClickThroughURLTemplate: opts.nonlinearClickThrough ?? 'https://example.com/click',
    minSuggestedDuration: opts.minSuggestedDuration ?? 5,
  };

  const companionVariation: any = {
    staticResources: [{ url: opts.companionStaticUrl ?? 'https://example.com/companion.png', creativeType: 'image/png' }],
    companionClickThroughURLTemplate: opts.companionClickThrough ?? 'https://example.com/companion-click',
    width: 300,
    height: 250,
  };

  const ad: any = {
    sequence: '1',
    creatives: [
      { type: 'nonlinear', variations: [nonLinearVariation] },
      { type: 'companion', required: 'any', variations: [companionVariation] },
    ],
  };

  return { ads: [ad] };
}

describe('non-linear library path: collectNonLinearCreatives', () => {
  test('finds non-linear items from creative.type=nonlinear + variations[]', () => {
    const plugin = new AdsPlugin({} as any);
    const parsed = makeLibraryParsed();

    const items: any[] = (plugin as any).collectNonLinearCreatives(parsed);

    expect(items).toHaveLength(1);
    expect(items[0].nonLinear.staticResource).toBe('https://example.com/overlay.png');
    expect(items[0].nonLinear.nonlinearClickThroughURLTemplate).toBe('https://example.com/click');
    expect(items[0].creative.type).toBe('nonlinear');
  });

  test('does not return companion creatives as non-linear items', () => {
    const plugin = new AdsPlugin({} as any);
    const parsed = makeLibraryParsed();

    const items: any[] = (plugin as any).collectNonLinearCreatives(parsed);

    // Only 1 item: the nonlinear variation (not the companion)
    expect(items).toHaveLength(1);
  });

  test('returns empty array when no non-linear creatives present', () => {
    const plugin = new AdsPlugin({} as any);
    const parsed = { ads: [{ sequence: '1', creatives: [{ type: 'linear', variations: [] }] }] };

    const items: any[] = (plugin as any).collectNonLinearCreatives(parsed);
    expect(items).toHaveLength(0);
  });
});

describe('non-linear library path: renderNonLinear', () => {
  test('renders staticResource URL from library NonLinearAd (plain string)', () => {
    const plugin = new AdsPlugin({} as any);
    const nl = { staticResource: 'https://example.com/overlay.png', nonlinearClickThroughURLTemplate: 'https://example.com/click' };

    const el: HTMLElement | null = (plugin as any).renderNonLinear(nl);
    expect(el).not.toBeNull();
    const img = el!.querySelector('img');
    expect(img?.src).toBe('https://example.com/overlay.png');
  });

  test('resolves click-through from nonlinearClickThroughURLTemplate (lowercase variant)', () => {
    const plugin = new AdsPlugin({} as any);
    // Simulate attaching so sessionUnsubs exists
    (plugin as any).sessionUnsubs = [];

    const nl = { staticResource: 'https://example.com/overlay.png', nonlinearClickThroughURLTemplate: 'https://example.com/click' };

    const el: HTMLElement | null = (plugin as any).renderNonLinear(nl);
    // cursor = pointer means click was detected
    expect(el?.style.cursor).toBe('pointer');
  });

  test('resolves click-through from nonLinearClickThrough (XML path fallback)', () => {
    const plugin = new AdsPlugin({} as any);
    (plugin as any).sessionUnsubs = [];

    const nl = { staticResource: { value: 'https://example.com/overlay.png' }, nonLinearClickThrough: 'https://example.com/click' };

    const el: HTMLElement | null = (plugin as any).renderNonLinear(nl);
    expect(el?.style.cursor).toBe('pointer');
  });
});

describe('non-linear library path: renderCompanion', () => {
  test('renders staticResources[0].url from library CompanionAd', () => {
    const plugin = new AdsPlugin({} as any);
    (plugin as any).sessionUnsubs = [];

    const companion = {
      staticResources: [{ url: 'https://example.com/companion.png', creativeType: 'image/png' }],
      companionClickThroughURLTemplate: 'https://example.com/companion-click',
      width: 300,
      height: 250,
    };

    const el: HTMLElement | null = (plugin as any).renderCompanion(companion);
    expect(el).not.toBeNull();
    const img = el!.querySelector('img');
    expect(img?.src).toBe('https://example.com/companion.png');
    expect(el!.style.cursor).toBe('pointer');
  });

  test('renders staticResource.value (XML path)', () => {
    const plugin = new AdsPlugin({} as any);
    (plugin as any).sessionUnsubs = [];

    const companion = {
      staticResource: { value: 'https://example.com/companion.png' },
      clickThrough: 'https://example.com/companion-click',
    };

    const el: HTMLElement | null = (plugin as any).renderCompanion(companion);
    expect(el).not.toBeNull();
    const img = el!.querySelector('img');
    expect(img?.src).toBe('https://example.com/companion.png');
    expect(el!.style.cursor).toBe('pointer');
  });

  test('returns null when no resource is provided', () => {
    const plugin = new AdsPlugin({} as any);
    (plugin as any).sessionUnsubs = [];

    const el: HTMLElement | null = (plugin as any).renderCompanion({});
    expect(el).toBeNull();
  });
});

describe('non-linear library path: mountCompanions', () => {
  test('renders companions from creative.type=companion + variations[] when container is present', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const plugin = new AdsPlugin({ companionContainer: container } as any);
    (plugin as any).sessionUnsubs = [];

    const companionCreative = {
      type: 'companion',
      variations: [
        {
          staticResources: [{ url: 'https://example.com/companion.png', creativeType: 'image/png' }],
          companionClickThroughURLTemplate: 'https://example.com/companion-click',
          width: 300,
          height: 250,
        },
      ],
    };

    (plugin as any).mountCompanions(companionCreative);

    expect(container.querySelector('img')?.src).toBe('https://example.com/companion.png');
    container.remove();
  });

  test('no-ops when no companion container is configured', () => {
    const plugin = new AdsPlugin({} as any);
    (plugin as any).sessionUnsubs = [];

    // Should not throw even without a container
    expect(() => (plugin as any).mountCompanions({ type: 'companion', variations: [{ staticResources: [] }] })).not.toThrow();
  });
});
