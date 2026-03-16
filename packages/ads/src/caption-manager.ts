import type { CaptionResource } from './types';
import { buildCaptionsFromVastMediaFileRaw } from './vast-parser';

export class CaptionManager {
  private adTrackEls: HTMLTrackElement[] = [];
  private prevActiveCaptionSig: string | null = null;

  captionsSignature(t: any): string {
    const kind = String(t?.kind ?? '');
    const lang = String((t?.language ?? t?.srclang ?? '') || '');
    const label = String((t?.label ?? '') || '');
    return `${kind}|${lang}|${label}`;
  }

  listCaptionTracks(media: any): any[] {
    const list = media?.textTracks;
    if (!list || typeof list.length !== 'number') return [];
    const out = [];
    for (let i = 0; i < Number(list.length); i++) {
      const t = list[i] ?? (typeof list.item === 'function' ? list.item(i) : null);
      if (!t) continue;
      const kind = String(t.kind || '');
      if (kind !== 'captions' && kind !== 'subtitles') continue;
      out.push(t);
    }
    return out;
  }

  captureActiveCaptionTrack(media: any) {
    if (this.prevActiveCaptionSig) return;
    const tracks = this.listCaptionTracks(media);
    const active = tracks.find((t) => String(t.mode) === 'showing');
    if (active) this.prevActiveCaptionSig = this.captionsSignature(active);
  }

  restoreActiveTextTrack(media: HTMLMediaElement | undefined) {
    const sig = this.prevActiveCaptionSig;
    this.prevActiveCaptionSig = null;
    if (!sig || !media) return;

    const tracks = this.listCaptionTracks(media);
    if (!tracks.length) return;

    for (const t of tracks) t.mode = 'disabled';
    const match = tracks.find((t) => this.captionsSignature(t) === sig);
    if (match) match.mode = 'showing';
  }

  ensureRawCaptions(mediaFileRaw: any, creative?: any): CaptionResource[] {
    if (mediaFileRaw && Array.isArray(mediaFileRaw.captions)) return mediaFileRaw.captions as CaptionResource[];
    if (creative) {
      const linear = creative?.linear || creative?.Linear || creative;
      const ccFiles = linear?.closedCaptionFiles || linear?.ClosedCaptionFiles;
      if (Array.isArray(ccFiles) && ccFiles.length > 0) {
        return ccFiles
          .map((f: any) => ({
            src: f.fileURL || f.url || '',
            kind: 'captions' as const,
            srclang: f.language || f.fileLanguage || '',
            label: f.fileLanguage || f.language || '',
            type: f.fileType || '',
          }))
          .filter((x: CaptionResource) => !!x.src);
      }
    }
    if (!mediaFileRaw) return [];
    const captions = buildCaptionsFromVastMediaFileRaw(mediaFileRaw);
    mediaFileRaw.captions = captions;
    return captions;
  }

  attachAdCaptionTracks(adVideo: HTMLVideoElement, mediaFileRaw: any, creative?: any): HTMLTrackElement[] {
    const captions = this.ensureRawCaptions(mediaFileRaw, creative);
    const vtt = captions.filter(
      (c) => (c.type || '').toLowerCase().includes('vtt') || c.src.toLowerCase().endsWith('.vtt')
    );

    const created: HTMLTrackElement[] = [];
    for (const c of vtt) {
      const t = document.createElement('track');
      t.kind = c.kind;
      t.src = c.src;
      if (c.srclang) t.srclang = c.srclang;
      if (c.label) t.label = c.label;
      t.default = false;
      adVideo.appendChild(t);
      if (t.track) t.track.mode = 'hidden';
      created.push(t);
    }
    this.adTrackEls = created;
    return created;
  }

  clearAdTracks() {
    for (const el of this.adTrackEls) el.remove();
    this.adTrackEls = [];
  }

  removeAdCaptions() {
    for (const el of this.adTrackEls) {
      try {
        el.remove();
      } catch {
        /* ignore */
      }
    }
    this.adTrackEls = [];
  }
}
