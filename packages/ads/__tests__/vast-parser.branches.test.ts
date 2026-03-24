/** @jest-environment jsdom */

import type { AdVerification, NormalizedMediaFile, PodAd, XmlNonLinearItem } from '../src/types';
import {
  buildCaptionsFromVastMediaFileRaw,
  buildParsedForNonLinearFromXml,
  collectNonLinearCreatives,
  collectNonLinearFromXml,
  collectPodAds,
  collectPodAdsFromXml,
  computeSkipAtSeconds,
  extractAdVerifications,
  extractAdsFromParsed,
  extractClosedCaptions,
  extractSimidUrl,
  extractSkipOffsetFromCreative,
  getVastXmlText,
  isXmlString,
  parseTimecodeToSeconds,
  pickBestMediaFile,
} from '../src/vast-parser';

// ─── isXmlString ─────────────────────────────────────────────────────────────

describe('isXmlString', () => {
  it('returns true for strings starting with <', () => {
    expect(isXmlString('<VAST version="3.0"/>')).toBe(true);
    expect(isXmlString('  <root/>')).toBe(true);
  });

  it('returns false for URLs and plain strings', () => {
    expect(isXmlString('https://example.com/vast.xml')).toBe(false);
    expect(isXmlString('')).toBe(false);
    expect(isXmlString('plain text')).toBe(false);
  });
});

// ─── buildParsedForNonLinearFromXml ──────────────────────────────────────────

describe('buildParsedForNonLinearFromXml', () => {
  it('parses a VAST XML string into an XMLDocument', () => {
    const xml = '<VAST version="3.0"><Ad id="1"/></VAST>';
    const doc = buildParsedForNonLinearFromXml(xml);
    expect(doc).toBeInstanceOf(Document);
    expect(doc.getElementsByTagName('Ad').length).toBe(1);
  });
});

// ─── getVastXmlText ───────────────────────────────────────────────────────────

describe('getVastXmlText', () => {
  it('returns string value directly for xml kind', async () => {
    const text = await getVastXmlText({ kind: 'xml', value: '<VAST/>' });
    expect(text).toBe('<VAST/>');
  });

  it('serializes an XMLDocument for xml kind', async () => {
    const doc = new DOMParser().parseFromString('<VAST/>', 'text/xml');
    const text = await getVastXmlText({ kind: 'xml', value: doc });
    expect(typeof text).toBe('string');
    expect(text).toContain('VAST');
  });

  it('falls back to String() when XMLSerializer throws for xml kind', async () => {
    const badDoc = { toString: () => '[FakeXML]' } as unknown as XMLDocument;
    // Override serialize to throw
    const origSerializer = window.XMLSerializer;
    const mockSerialize = jest.fn(() => {
      throw new Error('serialize error');
    });

    (window as any).XMLSerializer = function () {
      return { serializeToString: mockSerialize };
    };

    const text = await getVastXmlText({ kind: 'xml', value: badDoc });
    expect(typeof text).toBe('string');

    (window as any).XMLSerializer = origSerializer;
  });

  it('fetches URL for url kind', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<VAST/>'),
    }) as jest.Mock;

    const text = await getVastXmlText({ kind: 'url', value: 'https://example.com/vast.xml' });
    expect(text).toBe('<VAST/>');
  });

  it('throws on non-ok fetch response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as jest.Mock;

    await expect(getVastXmlText({ kind: 'url', value: 'https://example.com/vast.xml' })).rejects.toThrow(
      'VAST request failed: 404'
    );
  });
});

// ─── parseTimecodeToSeconds ───────────────────────────────────────────────────

describe('parseTimecodeToSeconds', () => {
  it('parses HH:MM:SS correctly', () => {
    expect(parseTimecodeToSeconds('00:01:30')).toBe(90);
    expect(parseTimecodeToSeconds('01:00:00')).toBe(3600);
    expect(parseTimecodeToSeconds('00:00:05.5')).toBeCloseTo(5.5);
  });

  it('returns null for non-timecode strings', () => {
    expect(parseTimecodeToSeconds('30')).toBeNull();
    expect(parseTimecodeToSeconds('')).toBeNull();
    expect(parseTimecodeToSeconds('50%')).toBeNull();
  });
});

// ─── computeSkipAtSeconds ─────────────────────────────────────────────────────

describe('computeSkipAtSeconds', () => {
  it('returns undefined for empty or missing skipOffset', () => {
    expect(computeSkipAtSeconds(undefined, 60)).toBeUndefined();
    expect(computeSkipAtSeconds('', 60)).toBeUndefined();
    expect(computeSkipAtSeconds('   ', 60)).toBeUndefined();
  });

  it('handles percentage offsets', () => {
    expect(computeSkipAtSeconds('50%', 60)).toBe(30);
    expect(computeSkipAtSeconds('100%', 60)).toBe(60);
  });

  it('returns undefined for invalid percentage (infinite duration)', () => {
    expect(computeSkipAtSeconds('50%', 0)).toBeUndefined();
    expect(computeSkipAtSeconds('200%', 60)).toBeUndefined();
  });

  it('handles timecode format', () => {
    expect(computeSkipAtSeconds('00:00:05', 60)).toBe(5);
  });

  it('handles plain numeric string', () => {
    expect(computeSkipAtSeconds('10', 60)).toBe(10);
  });

  it('returns undefined for invalid format', () => {
    expect(computeSkipAtSeconds('invalid', 60)).toBeUndefined();
  });
});

// ─── pickBestMediaFile ────────────────────────────────────────────────────────

describe('pickBestMediaFile', () => {
  it('returns null for empty or non-array input', () => {
    expect(pickBestMediaFile([], ['video/mp4'])).toBeNull();
    expect(pickBestMediaFile([], [])).toBeNull();
  });

  it('returns null if no fileURL present', () => {
    const files = [{ mimeType: 'video/mp4', bitrate: 1000 }];
    expect(pickBestMediaFile(files, ['video/mp4'])).toBeNull();
  });

  it('picks the preferred type with highest bitrate', () => {
    const files = [
      { mimeType: 'video/mp4', fileURL: 'a.mp4', bitrate: 1000 },
      { mimeType: 'video/mp4', fileURL: 'b.mp4', bitrate: 2000 },
      { mimeType: 'video/webm', fileURL: 'c.webm', bitrate: 3000 },
    ];
    const result = pickBestMediaFile(files, ['video/mp4']) as NormalizedMediaFile;
    expect(result.fileURL).toBe('b.mp4');
    expect(result.bitrate).toBe(2000);
  });

  it('falls back to highest bitrate when no preferred type matches', () => {
    const files = [
      { mimeType: 'video/webm', fileURL: 'a.webm', bitrate: 500 },
      { mimeType: 'video/webm', fileURL: 'b.webm', bitrate: 1500 },
    ];
    const result = pickBestMediaFile(files, ['video/mp4']) as NormalizedMediaFile;
    // fallback: highest bitrate regardless of type
    expect(result.fileURL).toBe('b.webm');
    expect(result.bitrate).toBe(1500);
  });

  it('supports alternate field names (url, src, type, bitRate)', () => {
    const files = [{ type: 'video/mp4', url: 'x.mp4', bitRate: 800 }];
    const result = pickBestMediaFile(files, ['video/mp4']) as NormalizedMediaFile;
    expect(result.fileURL).toBe('x.mp4');
    expect(result.type).toBe('video/mp4');
  });
});

// ─── extractSkipOffsetFromCreative ────────────────────────────────────────────

describe('extractSkipOffsetFromCreative', () => {
  it('returns undefined for creative with no skip offset', () => {
    expect(extractSkipOffsetFromCreative({})).toBeUndefined();
    expect(extractSkipOffsetFromCreative(null)).toBeUndefined();
  });

  it('extracts from skipDelay number', () => {
    expect(extractSkipOffsetFromCreative({ skipDelay: 5 })).toBe('5');
  });

  it('extracts from linear.skipOffset string', () => {
    expect(extractSkipOffsetFromCreative({ linear: { skipOffset: '00:00:05' } })).toBe('00:00:05');
  });

  it('extracts from attributes.skipOffset string', () => {
    const c = { linear: { attributes: { skipOffset: '10' } } };
    expect(extractSkipOffsetFromCreative(c)).toBe('10');
  });

  it('extracts from attributes.skipOffset as object with value', () => {
    const c = { linear: { attributes: { skipOffset: { value: '15' } } } };
    expect(extractSkipOffsetFromCreative(c)).toBe('15');
  });

  it('extracts from attributes.skipOffset as object with #text', () => {
    const c = { linear: { attributes: { skipoffset: { '#text': '20' } } } };
    expect(extractSkipOffsetFromCreative(c)).toBe('20');
  });

  it('extracts from candidate with text property', () => {
    // Use a creative object where the linear has a skipOffset that is an object with `.text`
    const c = { skipOffset: { text: '00:00:08' } };
    expect(extractSkipOffsetFromCreative(c)).toBe('00:00:08');
  });

  it('skips empty string candidates', () => {
    const c = { linear: { skipOffset: '   ' } };
    expect(extractSkipOffsetFromCreative(c)).toBeUndefined();
  });
});

// ─── extractSimidUrl ──────────────────────────────────────────────────────────

describe('extractSimidUrl', () => {
  it('returns undefined when no SIMID media file exists', () => {
    expect(extractSimidUrl({ mediaFiles: [] })).toBeUndefined();
    expect(extractSimidUrl(null)).toBeUndefined();
  });

  it('extracts from mediaFiles with apiFramework=SIMID', () => {
    const creative = {
      mediaFiles: [{ apiFramework: 'SIMID', fileURL: 'https://example.com/simid.html', mimeType: 'text/html' }],
    };
    expect(extractSimidUrl(creative)).toBe('https://example.com/simid.html');
  });

  it('extracts from interactiveCreativeFiles', () => {
    const creative = {
      interactiveCreativeFiles: [{ apiFramework: 'SIMID', url: 'https://example.com/simid-interactive.html' }],
    };
    expect(extractSimidUrl(creative)).toBe('https://example.com/simid-interactive.html');
  });

  it('falls back to raw XML doc for InteractiveCreativeFile tag', () => {
    const xml = `<VAST>
      <InteractiveCreativeFile apiFramework="SIMID">https://example.com/simid-xml.html</InteractiveCreativeFile>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(extractSimidUrl({}, doc)).toBe('https://example.com/simid-xml.html');
  });

  it('falls back to raw XML doc MediaFile tag with SIMID', () => {
    const xml = `<VAST>
      <MediaFile apiFramework="SIMID">https://example.com/simid-media.html</MediaFile>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(extractSimidUrl({}, doc)).toBe('https://example.com/simid-media.html');
  });

  it('skips xml doc entries without SIMID framework', () => {
    const xml = `<VAST>
      <MediaFile apiFramework="VPAID">https://example.com/vpaid.js</MediaFile>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(extractSimidUrl({}, doc)).toBeUndefined();
  });
});

// ─── extractAdVerifications ───────────────────────────────────────────────────

describe('extractAdVerifications', () => {
  it('returns empty array for empty parsed', () => {
    expect(extractAdVerifications(null)).toEqual([]);
    expect(extractAdVerifications({})).toEqual([]);
  });

  it('extracts verifications from parsed ads array', () => {
    const parsed = {
      ads: [
        {
          adVerifications: [
            {
              vendor: 'test.com-omid',
              resource: [{ uri: 'https://example.com/omid.js' }],
              verificationParameters: { value: 'param=1' },
            },
          ],
        },
      ],
    };
    const result = extractAdVerifications(parsed) as AdVerification[];
    expect(result).toHaveLength(1);
    expect(result[0].vendor).toBe('test.com-omid');
    expect(result[0].scriptUrl).toBe('https://example.com/omid.js');
    expect(result[0].params).toBe('param=1');
  });

  it('extracts verifications with browserOptional.value resource shape', () => {
    const parsed = {
      ads: [
        {
          adVerifications: [
            {
              vendor: 'vendor-omid',
              resource: [{ browserOptional: { value: 'https://example.com/optional.js' } }],
            },
          ],
        },
      ],
    };
    const result = extractAdVerifications(parsed) as AdVerification[];
    expect(result[0].scriptUrl).toBe('https://example.com/optional.js');
  });

  it('skips resource entries with empty scriptUrl', () => {
    // A null/empty-string resource produces no scriptUrl and should be skipped
    const parsed = {
      ads: [
        {
          adVerifications: [
            {
              vendor: 'v',
              resource: [null, ''],
            },
          ],
        },
      ],
    };
    expect(extractAdVerifications(parsed)).toEqual([]);
  });

  it('extracts verifications from raw XML doc when parsed has none', () => {
    const xml = `<VAST>
      <Verification vendor="xml-vendor">
        <JavaScriptResource>https://example.com/verify.js</JavaScriptResource>
        <VerificationParameters>xmlparam=1</VerificationParameters>
      </Verification>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const result = extractAdVerifications({}, doc) as AdVerification[];
    expect(result).toHaveLength(1);
    expect(result[0].vendor).toBe('xml-vendor');
    expect(result[0].scriptUrl).toBe('https://example.com/verify.js');
    expect(result[0].params).toBe('xmlparam=1');
  });

  it('skips xml JavaScriptResource entries with empty textContent', () => {
    const xml = `<VAST>
      <Verification vendor="v">
        <JavaScriptResource>   </JavaScriptResource>
      </Verification>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(extractAdVerifications({}, doc)).toEqual([]);
  });

  it('falls back to getElementsByTagName when getElementsByTagNameNS throws', () => {
    // Mock a rawDoc where getElementsByTagNameNS throws but getElementsByTagName works
    const mockDoc = {
      getElementsByTagNameNS: jest.fn().mockImplementation(() => {
        throw new Error('NS not supported');
      }),
      getElementsByTagName: jest.fn().mockReturnValue([]),
    } as unknown as Document;

    const result = extractAdVerifications({}, mockDoc);
    expect(result).toEqual([]);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(mockDoc.getElementsByTagName).toHaveBeenCalledWith('Verification');
  });

  it('returns empty array when both getElementsByTagNameNS and getElementsByTagName throw', () => {
    const mockDoc = {
      getElementsByTagNameNS: jest.fn().mockImplementation(() => {
        throw new Error('NS error');
      }),
      getElementsByTagName: jest.fn().mockImplementation(() => {
        throw new Error('tag error');
      }),
    } as unknown as Document;

    const result = extractAdVerifications({}, mockDoc);
    expect(result).toEqual([]);
  });
});

// ─── extractAdsFromParsed ─────────────────────────────────────────────────────

describe('extractAdsFromParsed', () => {
  it('returns empty array for null/empty input', () => {
    expect(extractAdsFromParsed(null)).toEqual([]);
    expect(extractAdsFromParsed({})).toEqual([]);
  });

  it('returns direct ads array', () => {
    const parsed = { ads: [{ id: '1' }, { id: '2' }] };
    expect(extractAdsFromParsed(parsed)).toHaveLength(2);
  });

  it('flattens adPods', () => {
    const parsed = {
      adPods: [{ ads: [{ id: 'a' }, { id: 'b' }] }, { ads: [{ id: 'c' }] }],
    };
    const result = extractAdsFromParsed(parsed);
    expect(result).toHaveLength(3);
  });

  it('returns ads from adPods using Ads key', () => {
    const parsed = {
      adPods: [{ Ads: [{ id: 'x' }] }],
    };
    expect(extractAdsFromParsed(parsed)).toHaveLength(1);
  });

  it('returns ads from single adPod', () => {
    const parsed = { adPod: { ads: [{ id: 'single' }] } };
    expect(extractAdsFromParsed(parsed)).toHaveLength(1);
  });

  it('accesses vastResponse.adPods path', () => {
    const parsed = {
      vastResponse: {
        adPods: [{ ads: [{ id: 'nested' }] }],
      },
    };
    expect(extractAdsFromParsed(parsed)).toHaveLength(1);
  });
});

// ─── collectPodAds ────────────────────────────────────────────────────────────

describe('collectPodAds', () => {
  it('returns empty array when no ads', () => {
    expect(collectPodAds({}, ['video/mp4'])).toEqual([]);
  });

  it('skips creatives with no usable media file', () => {
    const parsed = {
      ads: [
        {
          creatives: [{ mediaFiles: [] }],
        },
      ],
    };
    expect(collectPodAds(parsed, ['video/mp4'])).toEqual([]);
  });

  it('collects pod ads with sequence ordering', () => {
    const parsed = {
      ads: [
        {
          sequence: 2,
          creatives: [{ mediaFiles: [{ mimeType: 'video/mp4', fileURL: 'b.mp4', bitrate: 1000 }] }],
        },
        {
          sequence: 1,
          creatives: [{ mediaFiles: [{ mimeType: 'video/mp4', fileURL: 'a.mp4', bitrate: 1000 }] }],
        },
      ],
    };
    const result = collectPodAds(parsed, ['video/mp4']) as PodAd[];
    expect(result[0].mediaFile.fileURL).toBe('a.mp4');
    expect(result[1].mediaFile.fileURL).toBe('b.mp4');
  });

  it('sorts by creativeIndex when sequences are equal (two creatives in same ad)', () => {
    // Two creatives in the same ad get creativeIndex 0 and 1; sequence is the same (from ad).
    // sort: as === bs → use creativeIndex to break the tie (line 380).
    const parsed = {
      ads: [
        {
          sequence: 1,
          creatives: [
            { mediaFiles: [{ mimeType: 'video/mp4', fileURL: 'first.mp4', bitrate: 500 }] },
            { mediaFiles: [{ mimeType: 'video/mp4', fileURL: 'second.mp4', bitrate: 800 }] },
          ],
        },
      ],
    };
    const result = collectPodAds(parsed, ['video/mp4']) as PodAd[];
    expect(result).toHaveLength(2);
    // creativeIndex 0 comes before creativeIndex 1
    expect(result[0].mediaFile.fileURL).toBe('first.mp4');
    expect(result[1].mediaFile.fileURL).toBe('second.mp4');
  });

  it('includes companions and nonLinears when present', () => {
    const companions = [{ width: 300, height: 250 }];
    const nonLinears = [{ width: 100, height: 50 }];
    const parsed = {
      ads: [
        {
          creatives: [
            {
              mediaFiles: [{ mimeType: 'video/mp4', fileURL: 'ad.mp4', bitrate: 500 }],
              companionAds: { companions },
              nonLinearAds: { nonLinears },
            },
          ],
        },
      ],
    };
    const result = collectPodAds(parsed, ['video/mp4']) as PodAd[];
    expect(result[0].companions).toEqual(companions);
    expect(result[0].nonLinears).toEqual(nonLinears);
  });
});

// ─── collectPodAdsFromXml ────────────────────────────────────────────────────

describe('collectPodAdsFromXml', () => {
  it('returns empty array for null doc', () => {
    expect(collectPodAdsFromXml(null as any, ['video/mp4'])).toEqual([]);
  });

  it('parses ads from XML and sorts by sequence', () => {
    const xml = `<VAST version="3.0">
      <Ad id="2" sequence="2">
        <InLine>
          <Creatives>
            <Creative>
              <Linear>
                <MediaFiles>
                  <MediaFile type="video/mp4" bitrate="500" width="640" height="360">https://b.mp4</MediaFile>
                </MediaFiles>
              </Linear>
            </Creative>
          </Creatives>
        </InLine>
      </Ad>
      <Ad id="1" sequence="1">
        <InLine>
          <Creatives>
            <Creative>
              <Linear skipoffset="00:00:05">
                <MediaFiles>
                  <MediaFile type="video/mp4" bitrate="1000" width="640" height="360">https://a.mp4</MediaFile>
                </MediaFiles>
              </Linear>
            </Creative>
          </Creatives>
        </InLine>
      </Ad>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const result = collectPodAdsFromXml(doc, ['video/mp4']) as PodAd[];
    expect(result).toHaveLength(2);
    expect(result[0].mediaFile.fileURL).toBe('https://a.mp4');
    expect(result[0].skipOffset).toBe('00:00:05');
    expect(result[1].mediaFile.fileURL).toBe('https://b.mp4');
  });

  it('skips Creative elements without a Linear child', () => {
    const xml = `<VAST>
      <Ad id="1">
        <InLine>
          <Creatives>
            <Creative>
              <NonLinear/>
            </Creative>
          </Creatives>
        </InLine>
      </Ad>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(collectPodAdsFromXml(doc, ['video/mp4'])).toEqual([]);
  });

  it('skips Creative elements without a MediaFiles child', () => {
    const xml = `<VAST>
      <Ad id="1">
        <InLine>
          <Creatives>
            <Creative>
              <Linear/>
            </Creative>
          </Creatives>
        </InLine>
      </Ad>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(collectPodAdsFromXml(doc, ['video/mp4'])).toEqual([]);
  });
});

// ─── collectNonLinearCreatives ────────────────────────────────────────────────

describe('collectNonLinearCreatives', () => {
  it('returns empty for parsed with no ads', () => {
    expect(collectNonLinearCreatives({})).toEqual([]);
  });

  it('skips creatives of non-nonlinear type', () => {
    const parsed = {
      ads: [
        {
          creatives: [{ type: 'linear', variations: [{ width: 100 }] }],
        },
      ],
    };
    expect(collectNonLinearCreatives(parsed)).toEqual([]);
  });

  it('collects non-linear creatives from nonLinearAds.nonLinears', () => {
    const parsed = {
      ads: [
        {
          creatives: [
            {
              type: 'nonlinear',
              nonLinearAds: { nonLinears: [{ width: 300, height: 250 }] },
            },
          ],
        },
      ],
    };
    const result = collectNonLinearCreatives(parsed);
    expect(result).toHaveLength(1);
    expect(result[0].nonLinear.width).toBe(300);
  });

  it('wraps single non-linear object in array', () => {
    const parsed = {
      ads: [
        {
          creatives: [
            {
              nonLinearAds: { nonLinear: { width: 100 } },
            },
          ],
        },
      ],
    };
    const result = collectNonLinearCreatives(parsed);
    expect(result).toHaveLength(1);
  });

  it('sorts by sequence - nulls last', () => {
    const parsed = {
      ads: [
        {
          sequence: 2,
          creatives: [{ nonLinearAds: { nonLinears: [{ id: 'b' }] } }],
        },
        {
          creatives: [{ nonLinearAds: { nonLinears: [{ id: 'no-seq' }] } }],
        },
        {
          sequence: 1,
          creatives: [{ nonLinearAds: { nonLinears: [{ id: 'a' }] } }],
        },
      ],
    };
    const result = collectNonLinearCreatives(parsed);
    expect(result[0].sequence).toBe(1);
    expect(result[1].sequence).toBe(2);
    expect(result[2].sequence).toBeUndefined();
  });
});

// ─── collectNonLinearFromXml ──────────────────────────────────────────────────

describe('collectNonLinearFromXml', () => {
  it('parses NonLinear from XML with StaticResource', () => {
    const xml = `<VAST>
      <NonLinear width="300" height="50">
        <StaticResource>https://example.com/banner.jpg</StaticResource>
        <NonLinearClickThrough>https://example.com/click</NonLinearClickThrough>
      </NonLinear>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const result = collectNonLinearFromXml(doc) as XmlNonLinearItem[];
    expect(result).toHaveLength(1);
    expect(result[0].nonLinear.staticResource?.value).toBe('https://example.com/banner.jpg');
    expect(result[0].nonLinear.nonLinearClickThrough).toBe('https://example.com/click');
    expect(result[0].nonLinear.width).toBe(300);
    expect(result[0].nonLinear.height).toBe(50);
  });

  it('parses NonLinear with IFrameResource', () => {
    const xml = `<VAST>
      <NonLinear width="300" height="250">
        <IFrameResource>https://example.com/iframe.html</IFrameResource>
      </NonLinear>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const result = collectNonLinearFromXml(doc) as XmlNonLinearItem[];
    expect(result[0].nonLinear.iFrameResource?.value).toBe('https://example.com/iframe.html');
  });

  it('parses NonLinear with HTMLResource', () => {
    const xml = `<VAST>
      <NonLinear>
        <HTMLResource>&lt;div&gt;Ad&lt;/div&gt;</HTMLResource>
      </NonLinear>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const result = collectNonLinearFromXml(doc) as XmlNonLinearItem[];
    expect(result[0].nonLinear.htmlResource?.value).toContain('div');
  });

  it('parses Companion ads alongside NonLinear', () => {
    const xml = `<VAST>
      <NonLinear>
        <StaticResource>https://example.com/nl.jpg</StaticResource>
      </NonLinear>
      <Companion width="300" height="250">
        <StaticResource>https://example.com/comp.jpg</StaticResource>
        <CompanionClickThrough>https://example.com/comp-click</CompanionClickThrough>
      </Companion>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const result = collectNonLinearFromXml(doc) as XmlNonLinearItem[];
    expect(result[0].companions).toHaveLength(1);
    expect(result[0].companions![0].staticResource.value).toBe('https://example.com/comp.jpg');
    expect(result[0].companions![0].clickThrough).toBe('https://example.com/comp-click');
  });

  it('skips Companion entries with no StaticResource', () => {
    const xml = `<VAST>
      <NonLinear>
        <StaticResource>https://example.com/nl.jpg</StaticResource>
      </NonLinear>
      <Companion width="300" height="250">
      </Companion>
    </VAST>`;
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const result = collectNonLinearFromXml(doc) as XmlNonLinearItem[];
    expect(result[0].companions).toBeUndefined();
  });

  it('returns empty array for doc with no NonLinear elements', () => {
    const doc = new DOMParser().parseFromString('<VAST/>', 'text/xml');
    expect(collectNonLinearFromXml(doc)).toEqual([]);
  });
});

// ─── extractClosedCaptions ────────────────────────────────────────────────────

describe('extractClosedCaptions', () => {
  it('returns empty array for null/undefined input', () => {
    expect(extractClosedCaptions(null)).toEqual([]);
    expect(extractClosedCaptions(undefined)).toEqual([]);
  });

  it('returns empty array when no closedCaptionFiles field', () => {
    expect(extractClosedCaptions({})).toEqual([]);
  });

  it('extracts from closedCaptionFiles array', () => {
    const raw = {
      closedCaptionFiles: [
        { type: 'text/vtt', language: 'en', fileURL: 'en.vtt' },
        { type: 'text/vtt', language: 'es', fileURL: 'es.vtt' },
      ],
    };
    const result = extractClosedCaptions(raw);
    expect(result).toHaveLength(2);
    expect(result[0].language).toBe('en');
  });

  it('filters entries with no fileURL', () => {
    const raw = {
      closedCaptionFiles: [
        { type: 'text/vtt', fileURL: '' },
        { type: 'text/vtt', fileURL: 'ok.vtt' },
      ],
    };
    expect(extractClosedCaptions(raw)).toHaveLength(1);
  });

  it('supports closedCaptionFile singular and ClosedCaptionFiles', () => {
    const raw1 = { closedCaptionFile: [{ type: 'text/vtt', fileURL: 'a.vtt' }] };
    expect(extractClosedCaptions(raw1)).toHaveLength(1);

    const raw2 = { ClosedCaptionFiles: [{ type: 'text/vtt', fileURL: 'b.vtt' }] };
    expect(extractClosedCaptions(raw2)).toHaveLength(1);
  });

  it('supports nested closedCaptionFiles inside a wrapper object', () => {
    const raw = { closedCaptionFiles: { closedCaptionFiles: [{ fileURL: 'c.vtt' }] } };
    expect(extractClosedCaptions(raw)).toHaveLength(1);
  });
});

// ─── buildCaptionsFromVastMediaFileRaw ────────────────────────────────────────

describe('buildCaptionsFromVastMediaFileRaw', () => {
  it('returns empty array for input with no captions', () => {
    expect(buildCaptionsFromVastMediaFileRaw({})).toEqual([]);
  });

  it('converts VTT closed captions to CaptionResource format', () => {
    const raw = {
      closedCaptionFiles: [
        { type: 'text/vtt', language: 'en', fileURL: 'en.vtt' },
        { type: 'text/vtt', fileURL: 'nolang.vtt' },
      ],
    };
    const result = buildCaptionsFromVastMediaFileRaw(raw);
    expect(result).toHaveLength(2);
    expect(result[0].srclang).toBe('en');
    expect(result[0].label).toBe('EN');
    expect(result[0].kind).toBe('captions');
    // No language: label should be "CC 2"
    expect(result[1].label).toBe('CC 2');
    expect(result[1].srclang).toBeUndefined();
  });
});
