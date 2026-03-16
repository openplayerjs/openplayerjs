/**
 * @jest-environment jsdom
 *
 * Tests for extractSimidUrl() against real-world VAST XML structures.
 *
 * Google's SIMID sample uses <InteractiveCreativeFile apiFramework="SIMID"> inside
 * <MediaFiles>, NOT <MediaFile apiFramework="SIMID">. This test suite covers both forms.
 */
import { extractSimidUrl } from '../src/vast-parser';

function parse(xml: string): XMLDocument {
  return new DOMParser().parseFromString(xml, 'text/xml');
}

describe('extractSimidUrl — InteractiveCreativeFile (VAST 4.x / real Google sample)', () => {
  const SIMID_URL = 'https://storage.googleapis.com/interactive-media-ads/ad-tags/simid_assets/sample_simid_compiled.html';

  const XML_WITH_INTERACTIVE_CREATIVE_FILE = `<VAST version="3.0">
    <Ad id="1234567"><InLine><Creatives><Creative sequence="1">
      <Linear>
        <MediaFiles>
          <MediaFile delivery="progressive" type="video/mp4">
            https://example.com/ad.mp4
          </MediaFile>
          <InteractiveCreativeFile type="text/html" apiFramework="SIMID" variableDuration="true">
            ${SIMID_URL}
          </InteractiveCreativeFile>
        </MediaFiles>
      </Linear>
    </Creative></Creatives></InLine></Ad>
  </VAST>`;

  it('detects SIMID from <InteractiveCreativeFile apiFramework="SIMID"> in raw XML', () => {
    const doc = parse(XML_WITH_INTERACTIVE_CREATIVE_FILE);
    const url = extractSimidUrl({}, doc);
    expect(url).toBe(SIMID_URL);
  });

  it('detects SIMID from <MediaFile apiFramework="SIMID"> (legacy form) in raw XML', () => {
    const doc = parse(`<VAST><Ad><InLine><Creatives><Creative><Linear><MediaFiles>
      <MediaFile type="text/html" apiFramework="SIMID">https://example.com/simid.html</MediaFile>
    </MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>`);
    expect(extractSimidUrl({}, doc)).toBe('https://example.com/simid.html');
  });

  it('prefers InteractiveCreativeFile over regular MediaFile when both present', () => {
    const doc = parse(`<VAST><Ad><InLine><Creatives><Creative><Linear><MediaFiles>
      <MediaFile type="video/mp4">https://example.com/ad.mp4</MediaFile>
      <InteractiveCreativeFile type="text/html" apiFramework="SIMID">https://example.com/simid.html</InteractiveCreativeFile>
    </MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>`);
    // InteractiveCreativeFile is checked first
    expect(extractSimidUrl({}, doc)).toBe('https://example.com/simid.html');
  });

  it('returns undefined when no SIMID element present', () => {
    const doc = parse(`<VAST><Ad><InLine><Creatives><Creative><Linear><MediaFiles>
      <MediaFile type="video/mp4">https://example.com/ad.mp4</MediaFile>
    </MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>`);
    expect(extractSimidUrl({}, doc)).toBeUndefined();
  });

  it('returns undefined when rawDoc is null', () => {
    expect(extractSimidUrl({}, null)).toBeUndefined();
  });

  it('detects SIMID from library creative.interactiveCreativeFiles array', () => {
    const creative = {
      interactiveCreativeFiles: [
        { apiFramework: 'SIMID', fileURL: 'https://example.com/simid.html' },
      ],
    };
    expect(extractSimidUrl(creative)).toBe('https://example.com/simid.html');
  });

  it('detects SIMID from library creative.mediaFiles array (apiFramework)', () => {
    const creative = {
      mediaFiles: [
        { apiFramework: 'SIMID', fileURL: 'https://example.com/simid2.html' },
        { apiFramework: undefined, fileURL: 'https://example.com/ad.mp4' },
      ],
    };
    expect(extractSimidUrl(creative)).toBe('https://example.com/simid2.html');
  });

  it('apiFramework matching is case-insensitive', () => {
    const doc = parse(`<VAST><Ad><InLine><Creatives><Creative><Linear><MediaFiles>
      <InteractiveCreativeFile type="text/html" apiFramework="simid">https://example.com/simid.html</InteractiveCreativeFile>
    </MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>`);
    expect(extractSimidUrl({}, doc)).toBe('https://example.com/simid.html');
  });
});
