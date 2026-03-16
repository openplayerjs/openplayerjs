/** @jest-environment jsdom */

import type { CaptionResource } from '../src/types';
import { CaptionManager } from '../src/caption-manager';

function makeVideoWithTracks(tracks: Array<{ kind: string; language: string; label: string; mode: string }>) {
  const video = document.createElement('video');

  // Build a fake TextTrackList
  const trackObjects = tracks.map((t) => ({ ...t }));
  const textTracks = {
    length: trackObjects.length,
    item: (i: number) => trackObjects[i] ?? null,
    // Allow indexing
    ...trackObjects.reduce((acc: Record<number, (typeof trackObjects)[number]>, t, i) => { acc[i] = t; return acc; }, {}),
  };

  Object.defineProperty(video, 'textTracks', {
    value: textTracks,
    writable: false,
    configurable: true,
  });

  return { video, trackObjects };
}

describe('CaptionManager', () => {
  describe('captionsSignature', () => {
    it('produces a stable string from track fields', () => {
      const cm = new CaptionManager();
      const sig = cm.captionsSignature({ kind: 'captions', language: 'en', label: 'English' });
      expect(sig).toBe('captions|en|English');
    });

    it('handles missing fields gracefully', () => {
      const cm = new CaptionManager();
      const sig = cm.captionsSignature({});
      expect(sig).toBe('||');
    });

    it('uses srclang as fallback for language', () => {
      const cm = new CaptionManager();
      const sig = cm.captionsSignature({ kind: 'subtitles', srclang: 'fr', label: 'French' });
      expect(sig).toBe('subtitles|fr|French');
    });
  });

  describe('listCaptionTracks', () => {
    it('returns empty array when media has no textTracks', () => {
      const cm = new CaptionManager();
      expect(cm.listCaptionTracks(null)).toEqual([]);
      expect(cm.listCaptionTracks({})).toEqual([]);
    });

    it('filters to only captions and subtitles tracks', () => {
      const cm = new CaptionManager();
      const { video } = makeVideoWithTracks([
        { kind: 'captions', language: 'en', label: 'English', mode: 'disabled' },
        { kind: 'chapters', language: '', label: '', mode: 'disabled' },
        { kind: 'subtitles', language: 'fr', label: 'French', mode: 'showing' },
      ]);
      const result = cm.listCaptionTracks(video);
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.kind === 'captions' || t.kind === 'subtitles')).toBe(true);
    });
  });

  describe('captureActiveCaptionTrack', () => {
    it('captures the showing track signature', () => {
      const cm = new CaptionManager();
      const { video } = makeVideoWithTracks([
        { kind: 'captions', language: 'en', label: 'English', mode: 'showing' },
      ]);
      cm.captureActiveCaptionTrack(video);
      // Internal state captured — restore should work
      const videoForRestore = document.createElement('video');
      const trackForRestore = { kind: 'captions', language: 'en', label: 'English', mode: 'disabled' as TextTrackMode };
      const textTracks = { length: 1, item: () => trackForRestore, 0: trackForRestore };
      Object.defineProperty(videoForRestore, 'textTracks', { value: textTracks });

      cm.restoreActiveTextTrack(videoForRestore as HTMLMediaElement);
      expect(trackForRestore.mode).toBe('showing');
    });

    it('does not overwrite already-captured signature', () => {
      const cm = new CaptionManager();
      const { video: v1 } = makeVideoWithTracks([
        { kind: 'captions', language: 'en', label: 'English', mode: 'showing' },
      ]);
      cm.captureActiveCaptionTrack(v1);

      // Second call should be no-op
      const { video: v2 } = makeVideoWithTracks([
        { kind: 'subtitles', language: 'fr', label: 'French', mode: 'showing' },
      ]);
      cm.captureActiveCaptionTrack(v2);

      // Verify the captured sig is still the first one (en, not fr)
      // We test this indirectly: create a restore target with both tracks
      const en = { kind: 'captions', language: 'en', label: 'English', mode: 'disabled' as TextTrackMode };
      const fr = { kind: 'subtitles', language: 'fr', label: 'French', mode: 'disabled' as TextTrackMode };
      const videoForRestore = document.createElement('video');
      const textTracks = { length: 2, item: (i: number) => [en, fr][i] ?? null, 0: en, 1: fr };
      Object.defineProperty(videoForRestore, 'textTracks', { value: textTracks });

      cm.restoreActiveTextTrack(videoForRestore as HTMLMediaElement);
      expect(en.mode).toBe('showing');
      expect(fr.mode).toBe('disabled');
    });
  });

  describe('restoreActiveTextTrack', () => {
    it('is a no-op when no signature was captured', () => {
      const cm = new CaptionManager();
      const video = document.createElement('video');
      // Should not throw
      cm.restoreActiveTextTrack(video as HTMLMediaElement);
    });

    it('is a no-op when media is undefined', () => {
      const cm = new CaptionManager();
      const { video } = makeVideoWithTracks([
        { kind: 'captions', language: 'en', label: 'English', mode: 'showing' },
      ]);
      cm.captureActiveCaptionTrack(video);
      // Should not throw
      cm.restoreActiveTextTrack(undefined);
    });

    it('disables all tracks then re-enables matching one', () => {
      const cm = new CaptionManager();
      const { video: captureVideo } = makeVideoWithTracks([
        { kind: 'captions', language: 'en', label: 'English', mode: 'showing' },
      ]);
      cm.captureActiveCaptionTrack(captureVideo);

      const en = { kind: 'captions', language: 'en', label: 'English', mode: 'disabled' as TextTrackMode };
      const es = { kind: 'subtitles', language: 'es', label: 'Spanish', mode: 'showing' as TextTrackMode };
      const restoreVideo = document.createElement('video');
      const tl = { length: 2, item: (i: number) => [en, es][i] ?? null, 0: en, 1: es };
      Object.defineProperty(restoreVideo, 'textTracks', { value: tl });

      cm.restoreActiveTextTrack(restoreVideo as HTMLMediaElement);
      expect(en.mode).toBe('showing');
      expect(es.mode).toBe('disabled');
    });

    it('leaves all disabled when no matching track found', () => {
      const cm = new CaptionManager();
      const { video: captureVideo } = makeVideoWithTracks([
        { kind: 'captions', language: 'en', label: 'English', mode: 'showing' },
      ]);
      cm.captureActiveCaptionTrack(captureVideo);

      const fr = { kind: 'subtitles', language: 'fr', label: 'French', mode: 'showing' as TextTrackMode };
      const restoreVideo = document.createElement('video');
      const tl = { length: 1, item: () => fr, 0: fr };
      Object.defineProperty(restoreVideo, 'textTracks', { value: tl });

      cm.restoreActiveTextTrack(restoreVideo as HTMLMediaElement);
      // No match → all disabled (fr was showing → now disabled)
      expect(fr.mode).toBe('disabled');
    });
  });

  describe('ensureRawCaptions', () => {
    it('returns cached captions from mediaFileRaw.captions', () => {
      const cm = new CaptionManager();
      const cached: CaptionResource[] = [{ src: 'en.vtt', kind: 'captions' }];
      const raw = { captions: cached };
      expect(cm.ensureRawCaptions(raw)).toBe(cached);
    });

    it('extracts from creative closedCaptionFiles', () => {
      const cm = new CaptionManager();
      const creative = {
        linear: {
          closedCaptionFiles: [
            { fileURL: 'https://example.com/en.vtt', language: 'en', fileLanguage: 'en', fileType: 'text/vtt' },
            { fileURL: 'https://example.com/es.vtt', language: 'es', fileLanguage: 'es', fileType: 'text/vtt' },
          ],
        },
      };
      const result = cm.ensureRawCaptions(undefined, creative);
      expect(result).toHaveLength(2);
      expect(result[0].src).toBe('https://example.com/en.vtt');
      expect(result[0].srclang).toBe('en');
      expect(result[0].kind).toBe('captions');
    });

    it('filters creative closedCaptionFiles with no src', () => {
      const cm = new CaptionManager();
      const creative = {
        linear: {
          closedCaptionFiles: [
            { fileURL: '', language: 'en' },
            { fileURL: 'ok.vtt', language: 'fr' },
          ],
        },
      };
      const result = cm.ensureRawCaptions(undefined, creative);
      expect(result).toHaveLength(1);
      expect(result[0].src).toBe('ok.vtt');
    });

    it('uses creative.Linear as fallback', () => {
      const cm = new CaptionManager();
      const creative = {
        Linear: {
          closedCaptionFiles: [
            { fileURL: 'a.vtt', language: 'de' },
          ],
        },
      };
      const result = cm.ensureRawCaptions(undefined, creative);
      expect(result).toHaveLength(1);
    });

    it('returns empty array when no mediaFileRaw and no captions in creative', () => {
      const cm = new CaptionManager();
      expect(cm.ensureRawCaptions(undefined, {})).toEqual([]);
    });

    it('builds captions from mediaFileRaw via vast-parser and caches them', () => {
      const cm = new CaptionManager();
      const raw = {
        closedCaptionFiles: [{ type: 'text/vtt', language: 'en', fileURL: 'en.vtt' }],
      };
      const result = cm.ensureRawCaptions(raw);
      expect(result).toHaveLength(1);
      // Should be cached now
      expect((raw as Record<string, unknown>).captions).toBe(result);
    });
  });

  describe('attachAdCaptionTracks', () => {
    it('appends only VTT tracks to the ad video element', () => {
      const cm = new CaptionManager();
      const adVideo = document.createElement('video');
      const raw = {
        closedCaptionFiles: [
          { type: 'text/vtt', language: 'en', fileURL: 'en.vtt' },
          { type: 'text/srt', language: 'fr', fileURL: 'fr.srt' }, // not VTT
        ],
      };
      const tracks = cm.attachAdCaptionTracks(adVideo, raw);
      expect(tracks).toHaveLength(1);
      expect(tracks[0].src).toContain('en.vtt');
      expect(adVideo.querySelectorAll('track')).toHaveLength(1);
    });

    it('sets srclang and label on the track element', () => {
      const cm = new CaptionManager();
      const adVideo = document.createElement('video');
      const raw = {
        closedCaptionFiles: [
          { type: 'text/vtt', language: 'en', fileURL: 'en.vtt' },
        ],
      };
      const [track] = cm.attachAdCaptionTracks(adVideo, raw);
      expect(track.srclang).toBe('en');
      expect(track.label).toBe('EN');
    });

    it('returns empty array when no VTT captions', () => {
      const cm = new CaptionManager();
      const adVideo = document.createElement('video');
      const tracks = cm.attachAdCaptionTracks(adVideo, {});
      expect(tracks).toHaveLength(0);
    });
  });

  describe('clearAdTracks', () => {
    it('removes all ad track elements and clears internal list', () => {
      const cm = new CaptionManager();
      const adVideo = document.createElement('video');
      document.body.appendChild(adVideo);

      const raw = {
        closedCaptionFiles: [
          { type: 'text/vtt', language: 'en', fileURL: 'en.vtt' },
        ],
      };
      cm.attachAdCaptionTracks(adVideo, raw);
      expect(adVideo.querySelectorAll('track')).toHaveLength(1);

      cm.clearAdTracks();
      expect(adVideo.querySelectorAll('track')).toHaveLength(0);

      // Second call is a no-op (no errors)
      expect(() => cm.clearAdTracks()).not.toThrow();
    });
  });

  describe('removeAdCaptions', () => {
    it('removes tracks using try/catch per element', () => {
      const cm = new CaptionManager();
      const adVideo = document.createElement('video');
      document.body.appendChild(adVideo);

      const raw = {
        closedCaptionFiles: [
          { type: 'text/vtt', language: 'en', fileURL: 'en.vtt' },
        ],
      };
      cm.attachAdCaptionTracks(adVideo, raw);
      expect(adVideo.querySelectorAll('track')).toHaveLength(1);

      cm.removeAdCaptions();
      expect(adVideo.querySelectorAll('track')).toHaveLength(0);
    });

    it('swallows errors thrown by el.remove()', () => {
      const cm = new CaptionManager();
      // Inject a fake track element whose remove() throws
      const fakeTrack = {
        remove: () => { throw new Error('DOM error'); },
      } as unknown as HTMLTrackElement;

      // Access private field via type cast to inject
      (cm as unknown as { adTrackEls: HTMLTrackElement[] }).adTrackEls = [fakeTrack];

      expect(() => cm.removeAdCaptions()).not.toThrow();
    });
  });
});
