/** @jest-environment jsdom */

import { AdsPlugin } from '../src/ads';

describe('AdsPlugin non-linear XML fallback', () => {
  it('extracts NonLinearAds from raw VAST XML', () => {
    const p = new AdsPlugin({ debug: false });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="1">
    <InLine>
      <Creatives>
        <Creative>
          <NonLinearAds>
            <NonLinear width="480" height="70" minSuggestedDuration="00:00:05">
              <StaticResource creativeType="image/png">https://example.com/overlay.png</StaticResource>
              <NonLinearClickThrough>https://example.com/click</NonLinearClickThrough>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

    const doc = (p as any).buildParsedForNonLinearFromXml(xml);
    const items = (p as any).collectNonLinearFromXml(doc);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].nonLinear?.staticResource?.value).toContain('overlay.png');
  });
});
