import type { PluginContext } from '@openplayerjs/core';

import type { AdLifecycleEvent, AdSessionStrategy, AdsPluginConfig } from '../types';
import { decodeSplice } from './scte35';

type SsaiBreak = {
  id: string;
  startTimeSec: number;
  durationSec: number | null;
  firedQuartiles: Set<number>;
};

/**
 * Server-side ad insertion strategy.
 *
 * Responsibilities:
 *  - Discover hls.js metadata TextTrack objects created by
 *    `enableDateRangeMetadataCues` / `enableID3MetadataCues`.
 *  - Subscribe to DOM `cuechange` events; parse SCTE-35 splice commands
 *    from active cues (DataCue ArrayBuffer path for ID3, or custom attributes
 *    for EXT-X-DATERANGE).
 *  - Track active ad breaks and emit IAB quartile events via `timeupdate`.
 *  - Report all lifecycle events through the configured `AdEventSink`.
 *
 * What this strategy does NOT do:
 *  - Fetch VAST/VMAP (no outbound ad-tagged network requests — ad-blocker-proof).
 *  - Render an ad <video> element (the content stream IS the ad stream).
 *  - Acquire a playback lease (the stream is continuous).
 */
export class SsaiAdStrategy implements AdSessionStrategy {
  readonly mode = 'ssai' as const;

  private ctx!: PluginContext;
  private sink: (e: AdLifecycleEvent) => void = () => undefined;

  private boundTracks = new Set<TextTrack>();
  private activeBreaks = new Map<string, SsaiBreak>();
  private cleanups: (() => void)[] = [];

  init(ctx: PluginContext, config: AdsPluginConfig): void {
    this.ctx = ctx;
    this.sink = config.ssai?.eventSink ?? config.eventSink ?? (() => undefined);

    const { media } = ctx.core;

    // Scan tracks already present (e.g. when hls.js loaded before setup()).
    this.scanTracks(media);

    // Watch for future metadata tracks (added as hls.js parses the manifest).
    const onAddTrack = (e: Event) => {
      const track = (e as TrackEvent).track;
      if (track?.kind === 'metadata') this.bindTrack(track);
    };
    media.textTracks.addEventListener('addtrack', onAddTrack);
    this.cleanups.push(() => media.textTracks.removeEventListener('addtrack', onAddTrack));

    // Belt-and-suspenders: also react to the bus event fired by HlsMediaEngine
    // after subtitle/metadata track list changes.
    const unsubListChange = ctx.on('texttrack:listchange' as any, () => this.scanTracks(media));
    this.cleanups.push(unsubListChange);

    // Quartile tracking via timeupdate.
    const onTimeUpdate = () => this.checkQuartiles(media.currentTime);
    media.addEventListener('timeupdate', onTimeUpdate);
    this.cleanups.push(() => media.removeEventListener('timeupdate', onTimeUpdate));
  }

  destroy(): void {
    for (const off of this.cleanups) off();
    this.cleanups = [];
    this.boundTracks.clear();
    this.activeBreaks.clear();
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private scanTracks(media: HTMLMediaElement): void {
    for (const t of media.textTracks) {
      if (t.kind === 'metadata') this.bindTrack(t);
    }
  }

  private bindTrack(track: TextTrack): void {
    if (this.boundTracks.has(track)) return;
    this.boundTracks.add(track);
    // 'hidden' activates cue timing without rendering anything.
    track.mode = 'hidden';

    const onCueChange = () => this.handleActiveCues(track);
    track.addEventListener('cuechange', onCueChange);
    this.cleanups.push(() => track.removeEventListener('cuechange', onCueChange));
  }

  private handleActiveCues(track: TextTrack): void {
    const cues = track.activeCues;
    if (!cues) return;
    for (const cue of cues) this.processCue(cue);
  }

  private processCue(cue: TextTrackCue): void {
    const raw = cue as any;
    const id = cue.id || String(cue.startTime);

    // ── ID3 / DataCue path (enableID3MetadataCues) ───────────────────────────
    if (raw.data instanceof ArrayBuffer) {
      const cmd = decodeSplice(raw.data);
      if (!cmd || cmd.type !== 'splice_insert') return;
      if (cmd.outOfNetwork) {
        this.startBreak(id, cmd.durationSecs, cue.startTime);
      } else {
        this.endBreak(id);
      }
      return;
    }

    // ── EXT-X-DATERANGE / VTTCue path (enableDateRangeMetadataCues) ─────────
    // hls.js exposes splice direction on the cue as `scte35Out` / `scte35In`,
    // or inside an `attr` object for older builds.
    const hasSpliceOut = raw.scte35Out != null || raw.attr?.['SCTE35-OUT'] != null;

    const hasSpliceIn = raw.scte35In != null || raw.attr?.['SCTE35-IN'] != null;

    if (hasSpliceOut) {
      const dur = isFinite(cue.endTime) && cue.endTime > cue.startTime ? cue.endTime - cue.startTime : null;
      this.startBreak(id, dur, cue.startTime);
    } else if (hasSpliceIn) {
      this.endBreak(id);
    }
  }

  private startBreak(id: string, durationSec: number | null, startTimeSec: number): void {
    if (this.activeBreaks.has(id)) return;

    const brk: SsaiBreak = { id, startTimeSec, durationSec, firedQuartiles: new Set() };
    this.activeBreaks.set(id, brk);

    this.ctx.events.emit('ads:break:start' as any, { id, kind: 'ssai' });
    this.sink({ type: 'impression', breakId: id, contentSrc: this.ctx.core.media?.src });
  }

  private endBreak(id: string): void {
    const brk = this.activeBreaks.get(id);
    if (!brk) return;

    this.activeBreaks.delete(id);
    this.ctx.events.emit('ads:break:end' as any, { id, kind: 'ssai' });
    this.sink({ type: 'complete', breakId: id });
  }

  private checkQuartiles(currentTime: number): void {
    for (const brk of this.activeBreaks.values()) {
      if (brk.durationSec === null || brk.durationSec <= 0) continue;

      const elapsed = currentTime - brk.startTimeSec;
      const pct = (elapsed / brk.durationSec) * 100;

      for (const q of [25, 50, 75, 100] as const) {
        if (pct >= q && !brk.firedQuartiles.has(q)) {
          brk.firedQuartiles.add(q);
          this.ctx.events.emit('ads:quartile' as any, { breakId: brk.id, quartile: q });
          this.sink({ type: 'quartile', breakId: brk.id, elapsedSec: elapsed, metadata: { quartile: q } });
        }
      }

      if (pct >= 100) this.endBreak(brk.id);
    }
  }
}
