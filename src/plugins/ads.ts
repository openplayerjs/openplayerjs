import { VASTClient, VASTTracker } from '@dailymotion/vast-client';
import VMAP from '@dailymotion/vmap';
import { EVENT_OPTIONS } from '../core/constants';
import type { EventBus } from '../core/events';
import { getOverlayManager } from '../core/overlay';
import type { PlayerPlugin, PluginContext } from '../core/plugin';

export type AdsEvent =
  | 'ads:requested'
  | 'ads:break:start'
  | 'ads:break:end'
  | 'ads:ad:start'
  | 'ads:ad:end'
  | 'ads:impression'
  | 'ads:quartile'
  | 'ads:clickthrough'
  | 'ads:error'
  | 'ads:timeupdate'
  | 'ads:duration'
  | 'ads:allAdsCompleted'
  | 'ads:skip';

type VastInput = { kind: 'url'; value: string } | { kind: 'xml'; value: string | XMLDocument | Element };

type BreakAt = 'preroll' | 'postroll' | number;

type VastClosedCaption = {
  type?: string;
  language?: string;
  fileURL?: string;
};

type CaptionResource = {
  src: string;
  kind: 'captions' | 'subtitles';
  srclang?: string;
  label?: string;
  type?: string;
};

type AdsSource = { type: 'VAST' | 'VMAP'; src: string };

export type AdsBreakConfig = {
  id?: string;
  at: BreakAt;
  url?: string;
  xml?: string | XMLDocument | Element;
  /** If true (default), a break fires at most once per content source. */
  once?: boolean;
};

export type SimidConfig = {
  /** Enable SIMID interactive layer support (best-effort). */
  enabled?: boolean;
  /**
   * Iframe sandbox attribute; default is strict but allows scripts + same-origin for typical SIMID creatives.
   * Adjust if your creatives require more.
   */
  sandbox?: string;
  /** Optional className for the SIMID overlay container. */
  className?: string;
  /** Optional hook for debugging postMessage traffic. */
  onMessage?: (msg: any) => void;
};

class PluginBus<E extends string> {
  constructor(private bus: EventBus) {}

  on(event: E, cb: (...args: any[]) => void) {
    return this.bus.on(event as any, cb);
  }

  emit(event: E, ...data: any[]) {
    this.bus.emit(event as any, ...data);
  }
}

export type AdsPluginConfig = {
  sources?: { type: 'VAST' | 'VMAP'; src: string } | { type: 'VAST' | 'VMAP'; src: string }[];
  breaks?: AdsBreakConfig[];
  interceptPlayForPreroll?: boolean;
  autoPlayOnReady?: boolean;
  simid?: SimidConfig;
  mountEl?: HTMLElement;
  mountSelector?: string;
  allowNativeControls?: boolean;
  resumeContent?: boolean;
  preferredMediaTypes?: string[];
  debug?: boolean;
};

type NormalizedMediaFile = {
  type: string;
  fileURL: string;
  bitrate: number;
  width: number;
  height: number;
  raw: any;
};

type PodAd = {
  ad: any;
  creative: any;
  mediaFile: NormalizedMediaFile;
  sequence?: number;
  skipOffset?: string;
  companions?: any[];
  nonLinears?: any[];
};

export class AdsPlugin implements PlayerPlugin {
  name = 'ads';
  version = '1.0.0';
  capabilities = ['ads'];

  private ctx!: PluginContext;
  private bus!: PluginBus<AdsEvent>;
  private _lastCreative: any;
  private overlayId = 'ads';
  private prevActiveCaptionSig: string | null = null;
  private adEndPromise: Promise<void> | null = null;
  private adTrackEls: HTMLTrackElement[] = [];

  private cfg: Omit<Required<Omit<AdsPluginConfig, 'mountEl' | 'mountSelector' | 'simid'>>, 'sources'> &
    Pick<AdsPluginConfig, 'mountEl' | 'mountSelector' | 'simid'> & { sources: AdsSource[] };

  private overlay!: HTMLDivElement;
  private adVideo?: HTMLVideoElement;

  // Skip / companion / non-linear overlays (best-effort)
  private skipWrap?: HTMLDivElement;
  private skipBtn?: HTMLButtonElement;
  private skipOffsetRaw?: string;
  private skipAtSeconds?: number;

  private companionWrap?: HTMLDivElement;
  private nonLinearWrap?: HTMLDivElement;

  // Track current break meta for events
  private currentBreakMeta?: { kind: string; breakId: string };

  // SIMID overlay (best-effort)
  private simidOverlay?: HTMLDivElement;
  private simidFrame?: HTMLIFrameElement;

  private vastClient: any;
  private tracker?: any;

  // Keep global vs per-ad listeners separate
  private globalUnsubs: (() => void)[] = [];
  private sessionUnsubs: (() => void)[] = [];

  private active = false;
  private resumeAfter = false;

  private contentMedia?: HTMLMediaElement;
  private contentHadControls = false;

  // guards + scheduling
  private startingBreak = false;
  private playedBreaks = new Set<string>();
  private userPlayIntent = false;
  private resolvedBreaks: AdsBreakConfig[] = [];
  private pendingPercentBreaks: { id: string; percent: number; vast: VastInput; once: boolean }[] = [];

  private getSource(type: 'VAST' | 'VMAP'): AdsSource | undefined {
    return (this.cfg.sources || []).find((s) => s.type === type && typeof s.src === 'string' && s.src.trim());
  }

  private isXmlString(src: string): boolean {
    return src.trim().startsWith('<');
  }

  /**
   * Best-effort HTML sanitization for ad-provided HTML resources.
   * Removes scripts/iframes/objects and strips event-handler attributes.
   * This is not a full sanitizer, but it materially reduces XSS risk.
   */
  private setSafeHTML(el: HTMLElement, html: string) {
    const tpl = document.createElement('template');
    tpl.innerHTML = String(html || '');

    const blockedTags = new Set(['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'STYLE']);
    const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT);
    const toRemove: Element[] = [];

    while (walker.nextNode()) {
      const node = walker.currentNode as Element;
      if (blockedTags.has(node.tagName)) {
        toRemove.push(node);
        continue;
      }

      // Remove inline event handlers and javascript: URLs
      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = (attr.value || '').trim();
        if (name.startsWith('on')) {
          node.removeAttribute(attr.name);
        }
        if ((name === 'href' || name === 'src') && value.toLowerCase().startsWith('javascript:')) {
          node.removeAttribute(attr.name);
        }
      });
    }

    toRemove.forEach((n) => n.remove());

    // Replace children rather than assigning innerHTML directly.
    el.replaceChildren(tpl.content.cloneNode(true));
  }

  private log(...args: any[]) {
    // eslint-disable-next-line no-console
    if (this.cfg?.debug) console.debug('[OpenPlayer][ads]', ...args);
  }

  private warn(...args: any[]) {
    // eslint-disable-next-line no-console
    if (this.cfg?.debug) console.warn('[OpenPlayer][ads]', ...args);
  }

  constructor(config: AdsPluginConfig = {}) {
    const normalizeSources = (cfg: AdsPluginConfig): AdsSource[] => {
      const list: AdsSource[] = [];
      const raw = cfg.sources ? (Array.isArray(cfg.sources) ? cfg.sources : [cfg.sources]) : [];

      raw.forEach((s) => {
        if (s && (s.type === 'VAST' || s.type === 'VMAP') && typeof s.src === 'string' && s.src.trim()) {
          list.push({ type: s.type, src: s.src });
        }
      });

      return list;
    };

    const sources = normalizeSources(config);
    const breaks = config.breaks || [];
    const hasExplicitPreroll = breaks.some((b) => b.at === 'preroll' && (b.url || b.xml));
    this.cfg = {
      allowNativeControls: config.allowNativeControls ?? config.allowNativeControls ?? false,
      resumeContent: config.resumeContent ?? true,
      preferredMediaTypes: config.preferredMediaTypes || [
        'video/mp4',
        'video/webm',
        'application/vnd.apple.mpegurl',
        'application/x-mpegURL',
      ],
      debug: config.debug ?? false,
      sources,
      breaks,
      interceptPlayForPreroll: config.interceptPlayForPreroll ?? Boolean(hasExplicitPreroll),
      autoPlayOnReady: config.autoPlayOnReady || false,
      simid: config.simid,
      mountEl: config.mountEl,
      mountSelector: config.mountSelector,
    };
  }

  setup(ctx: PluginContext) {
    this.ctx = ctx;
    this.bus = new PluginBus<AdsEvent>(ctx.events);
    this.vastClient = new VASTClient();

    this.overlay = document.createElement('div');
    this.overlay.className = 'op-ads';
    this.overlay.style.display = 'none';

    // Reset state on new content
    this.globalUnsubs.push(
      ctx.events.on('source:set' as any, () => {
        this.playedBreaks.clear();
        this.startingBreak = false;
        // New content should reset any active ad session and clean up takeover DOM.
        this.clearSession();
        this.userPlayIntent = false;
        this.pendingPercentBreaks = [];
        this.rebuildSchedule();
      })
    );

    // Also build once at setup time
    this.rebuildSchedule();

    this.bindBreakScheduler();

    // Intercept first play for preroll (custom + native)
    if (this.cfg.interceptPlayForPreroll) {
      this.bindPrerollInterceptors();
    }
  }

  async playAds(vastUrl: string) {
    return this.playBreakFromVast({ kind: 'url', value: vastUrl }, { kind: 'manual', id: 'manual' });
  }

  async playAdsFromXml(vastXml: string) {
    return this.playBreakFromVast({ kind: 'xml', value: vastXml }, { kind: 'manual', id: 'manual' });
  }

  destroy() {
    this.finish({ resume: false });
    for (const off of this.globalUnsubs) off();
    this.globalUnsubs = [];
    this.overlay?.remove();
  }

  // ----------------- scheduling -----------------

  private rebuildSchedule() {
    const combined: AdsBreakConfig[] = [...(this.cfg.breaks || [])];

    // Back-compat preroll: VAST source => preroll if no explicit breaks.
    // `src` may be URL or XML string.
    const vast = this.getSource('VAST');
    if (combined.length === 0 && vast?.src) {
      if (this.isXmlString(vast.src)) combined.push({ at: 'preroll', xml: vast.src, once: true });
      else combined.push({ at: 'preroll', url: vast.src, once: true });
    }

    // VMAP breaks (if configured) added on each source:set.
    const vmap = this.getSource('VMAP');
    if (vmap?.src) {
      void this.loadVmapAndMerge(combined, vmap.src);
    }

    this.resolvedBreaks = combined;
  }

  private async loadVmapAndMerge(existing: AdsBreakConfig[], vmapSrc?: string) {
    try {
      const src = (vmapSrc || this.getSource('VMAP')?.src || '').trim();
      if (!src) return;
      const xmlText = this.isXmlString(src) ? src : await fetch(src).then((r) => r.text());
      const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
      const vmap = new VMAP(xmlDoc);

      const vmapBreaks: AdsBreakConfig[] = [];
      const breaks = vmap.adBreaks || [];

      for (let i = 0; i < breaks.length; i++) {
        const b = breaks[i];
        const breakType = String(b?.breakType || '').toLowerCase();
        // Allow both linear and non-linear VMAP breaks (non-linear will be rendered as overlay while content continues).
        if (breakType && breakType !== 'linear' && breakType !== 'nonlinear' && breakType !== 'non-linear') continue;

        const id = b?.breakId || `vmap:${i}`;
        const { at, pendingPercent } = this.parseVmapTimeOffset(b?.timeOffset);

        const adSource = b?.adSource;
        const vastInline = adSource?.vastAdData;
        const vastTag = adSource?.adTagURI;

        let url: string | undefined;
        let xml: string | undefined;

        if (typeof vastTag === 'string' && vastTag) url = vastTag;

        if (vastInline) {
          if (typeof vastInline === 'string') xml = vastInline;
          else if (vastInline?.nodeType) xml = new XMLSerializer().serializeToString(vastInline);
        }

        if (!url && !xml) continue;

        if (pendingPercent != null) {
          // Resolve % once duration is known
          this.pendingPercentBreaks.push({
            id,
            percent: pendingPercent,
            vast: url ? { kind: 'url', value: url } : { kind: 'xml', value: xml! },
            once: true,
          });
          continue;
        }

        vmapBreaks.push({ id, at, url, xml, once: true });
      }

      this.resolvedBreaks = [...existing, ...vmapBreaks];
    } catch (err) {
      this.bus.emit('ads:error', { reason: 'vmap_parse_failed', error: err });
      this.ctx.events.emit('ads.error', { reason: 'vmap_parse_failed', error: err });
    }
  }

  private resolveMount(): HTMLElement {
    if (this.cfg.mountEl) return this.cfg.mountEl as HTMLElement;
    if (this.cfg.mountSelector) {
      const el = document.querySelector(this.cfg.mountSelector) as HTMLElement | null;
      if (el) return el;
    }

    const media = this.ctx.player.media;
    return media.closest('.op-player') || media.parentElement || document.body;
  }

  private parseVmapTimeOffset(timeOffset: any): { at: BreakAt; pendingPercent?: number | null } {
    const s = String(timeOffset || '').trim();
    if (!s || s === 'start') return { at: 'preroll' };
    if (s === 'end') return { at: 'postroll' };

    if (s.endsWith('%')) {
      const p = Number(s.slice(0, -1));
      if (Number.isFinite(p) && p >= 0 && p <= 100) return { at: 0, pendingPercent: p / 100 };
    }

    const m = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(s);
    if (m) {
      const hh = Number(m[1]);
      const mm = Number(m[2]);
      const ss = Number(m[3]);
      if ([hh, mm, ss].every((x) => Number.isFinite(x))) {
        return { at: hh * 3600 + mm * 60 + ss };
      }
    }

    const n = Number(s);
    if (Number.isFinite(n) && n >= 0) return { at: n };

    return { at: 'preroll' };
  }

  private getPostrollBreak(): AdsBreakConfig | undefined {
    return this.resolvedBreaks.find((b) => b.at === 'postroll' && (b.url || b.xml));
  }

  private getDueMidrollBreak(currentTime: number): AdsBreakConfig | undefined {
    const media = this.ctx.player.media;
    if (Number.isFinite(media.duration) && media.duration > 0 && this.pendingPercentBreaks.length) {
      const duration = media.duration;
      const toAdd: AdsBreakConfig[] = [];

      for (const pb of this.pendingPercentBreaks) {
        const atSec = duration * pb.percent;
        toAdd.push({
          id: pb.id,
          at: atSec,
          url: pb.vast.kind === 'url' ? pb.vast.value : undefined,
          xml: pb.vast.kind === 'xml' ? pb.vast.value : undefined,
          once: pb.once,
        });
      }

      this.pendingPercentBreaks = [];
      this.resolvedBreaks.push(...toAdd);
    }

    for (const b of this.resolvedBreaks) {
      if (typeof b.at !== 'number') continue;
      if (!b.url && !b.xml) continue;
      const id = this.getBreakId(b);
      // Default to "once" unless explicitly set to false.
      const once = b.once !== false;
      if (once && this.playedBreaks.has(id)) continue;
      if (currentTime >= b.at) return b;
    }
    return undefined;
  }

  private getBreakId(b: AdsBreakConfig) {
    return b.id || `${String(b.at)}:${b.url || 'xml'}`;
  }

  private getPrerollBreak() {
    const b = this.cfg.breaks.find((x) => x.at === 'preroll' && (x.url || x.xml));
    if (b) return b;
    const vast = this.getSource('VAST');
    if (vast?.src) {
      return this.isXmlString(vast.src)
        ? ({ at: 'preroll' as const, xml: vast.src, once: true } as AdsBreakConfig)
        : ({ at: 'preroll' as const, url: vast.src, once: true } as AdsBreakConfig);
    }
    return undefined;
  }

  private shouldInterceptPreroll() {
    const pre = this.getPrerollBreak();
    if (!pre) return false;
    if (this.active || this.startingBreak) return false;
    const s = this.ctx.state.current;
    return s === 'idle' || s === 'ready' || s === 'loading';
  }

  private bindPrerollInterceptors() {
    const { events, player } = this.ctx;
    const media = player.media;

    this.globalUnsubs.push(
      events.on('playback:play', () => {
        if (!this.shouldInterceptPreroll()) return;
        const pre = this.getPrerollBreak();
        if (pre) {
          this.userPlayIntent = true;
          this.startBreak(pre, 'preroll');
        }
      })
    );

    const onNativePlayCapture = () => {
      if (!this.shouldInterceptPreroll()) return;
      this.userPlayIntent = true;
      try {
        media.pause();
      } catch {
        //
      }
      const pre = this.getPrerollBreak();
      if (pre) void this.startBreak(pre, 'preroll');
    };

    media.addEventListener('play', onNativePlayCapture, { capture: true });
    this.globalUnsubs.push(() => media.removeEventListener('play', onNativePlayCapture, { capture: true }));
  }

  private bindBreakScheduler() {
    const content = this.ctx.player.media;
    if (!content) return;

    const onTime = () => {
      if (this.active || this.startingBreak) return;
      const t = content.currentTime || 0;
      const due = this.getDueMidrollBreak(t);
      if (due) void this.startBreak(due, 'midroll');
    };
    content.addEventListener('timeupdate', onTime);
    this.globalUnsubs.push(() => content.removeEventListener('timeupdate', onTime));

    const onEnded = () => {
      if (this.active || this.startingBreak) return;
      const post = this.getPostrollBreak();
      if (post) {
        this.ctx.events.emit('ads.mediaended' as any, {
          break: { kind: 'postroll', id: this.getBreakId(post) },
          at: post.at,
        });
        this.startBreak(post, 'postroll');
      }
    };
    content.addEventListener('ended', onEnded);
    this.globalUnsubs.push(() => content.removeEventListener('ended', onEnded));
  }

  private async startBreak(b: AdsBreakConfig, kind: 'preroll' | 'midroll' | 'postroll' | 'auto') {
    if (this.active || this.startingBreak) return;
    if (!b.url && !b.xml) return;

    const id = this.getBreakId(b);
    const once = b.once !== false;
    if (once && this.playedBreaks.has(id)) return;

    this.startingBreak = true;
    this.bus.emit('ads:break:start', { id, kind, at: b.at });

    try {
      await this.playBreakFromVast(b.url ? { kind: 'url', value: b.url } : { kind: 'xml', value: b.xml! }, {
        kind,
        id,
      });
      this.playedBreaks.add(id);
    } finally {
      this.startingBreak = false;
      this.bus.emit('ads:break:end', { id, kind, at: b.at });
    }
  }

  // ----------------- VAST parsing + AdPod -----------------

  private collectPodAds(parsed: any): PodAd[] {
    const ads = parsed?.ads || parsed?.vastResponse?.ads || [];
    const out: PodAd[] = [];

    for (const ad of ads) {
      const creatives = ad?.creatives || [];
      for (const creative of creatives) {
        const mediaFiles = creative?.mediaFiles || creative?.linear?.mediaFiles || [];
        const mf = this.pickBestMediaFile(mediaFiles);
        if (!mf) continue;

        const seqRaw = ad?.sequence || ad?.attributes?.sequence || undefined;
        const seq = seqRaw != null ? Number(seqRaw) : undefined;

        const skipOffset = this.extractSkipOffsetFromCreative(creative);
        const companions = creative?.companionAds?.companions || creative?.companions || undefined;
        const nonLinears = creative?.nonLinearAds?.nonLinears || creative?.nonLinears || undefined;
        out.push({
          ad,
          creative,
          mediaFile: mf,
          sequence: Number.isFinite(seq) ? seq : undefined,
          skipOffset,
          companions: Array.isArray(companions) ? companions : undefined,
          nonLinears: Array.isArray(nonLinears) ? nonLinears : undefined,
        });
        break;
      }
    }

    return out.sort((a, b) => {
      const as = a.sequence;
      const bs = b.sequence;
      if (as == null && bs == null) return 0;
      if (as == null) return 1;
      if (bs == null) return -1;
      return as - bs;
    });
  }

  private clearAdTracks() {
    for (const el of this.adTrackEls) el.remove();
    this.adTrackEls = [];
  }

  private buildCaptionsFromVastMediaFileRaw(mediaFileRaw: any): CaptionResource[] {
    const ccFiles = this.extractClosedCaptions(mediaFileRaw);

    // Native <track> is reliable for WebVTT. Keep other types in the list if you want,
    // but only VTT will be attached below unless you add conversion.
    return ccFiles
      .map((f, i) => {
        const lang = f.language ? String(f.language) : '';
        const type = f.type ? String(f.type) : '';

        return {
          src: String(f.fileURL),
          kind: 'captions', // VAST ClosedCaptionFiles -> captions
          srclang: lang || undefined,
          label: lang ? lang.toUpperCase() : `CC ${i + 1}`,
          type: type || undefined,
        } satisfies CaptionResource;
      })
      .filter((x) => !!x.src);
  }

  private ensureRawCaptions(mediaFileRaw: any): CaptionResource[] {
    if (!mediaFileRaw) return [];
    if (Array.isArray(mediaFileRaw.captions)) return mediaFileRaw.captions as CaptionResource[];

    const captions = this.buildCaptionsFromVastMediaFileRaw(mediaFileRaw);
    mediaFileRaw.captions = captions;
    return captions;
  }

  private attachAdCaptionTracks(adVideo: HTMLVideoElement, mediaFileRaw: any): HTMLTrackElement[] {
    const captions = this.ensureRawCaptions(mediaFileRaw);

    // Attach only WebVTT to native <track> (unless you add conversion for SRT/TTML).
    const vtt = captions.filter(
      (c) => (c.type || '').toLowerCase().includes('vtt') || c.src.toLowerCase().endsWith('.vtt')
    );

    const created: HTMLTrackElement[] = [];
    for (const c of vtt) {
      const t = document.createElement('track');
      t.kind = c.kind; // 'captions'
      t.src = c.src;

      if (c.srclang) t.srclang = c.srclang;
      if (c.label) t.label = c.label;

      // Do not set default; user chooses via menu
      t.default = false;

      adVideo.appendChild(t);
      created.push(t);
    }

    return created;
  }
  private captionsSignature(t: any): string {
    const kind = String(t?.kind ?? '');
    const lang = String((t?.language ?? t?.srclang ?? '') || '');
    const label = String((t?.label ?? '') || '');
    return `${kind}|${lang}|${label}`;
  }

  private listCaptionTracks(media: any): any[] {
    const list = media?.textTracks;
    if (!list || typeof list.length !== 'number') return [];
    const out: any[] = [];
    // TextTrackList is array-like but not reliably iterable in jsdom.
    // Use index-based access to support both real browsers and mocked lists.
    for (let i = 0; i < Number(list.length); i++) {
      const t = (list as any)[i] ?? (typeof (list as any).item === 'function' ? (list as any).item(i) : null);
      if (!t) continue;
      const kind = String(t.kind || '');
      if (kind !== 'captions' && kind !== 'subtitles') continue;
      out.push(t);
    }
    return out;
  }

  private captureActiveCaptionTrack(media: any) {
    if (this.prevActiveCaptionSig) return;
    const tracks = this.listCaptionTracks(media);
    const active = tracks.find((t) => String(t.mode) === 'showing');
    if (active) this.prevActiveCaptionSig = this.captionsSignature(active);
  }

  private restoreActiveTextTrack() {
    const sig = this.prevActiveCaptionSig;
    this.prevActiveCaptionSig = null;
    if (!sig) return;

    const media = this.ctx?.player?.media as any;
    if (!media) return;

    const tracks = this.listCaptionTracks(media);
    if (!tracks.length) return;

    // Default: disable all, then re-enable the previously active one if it still exists.
    for (const t of tracks) t.mode = 'disabled';

    const match = tracks.find((t) => this.captionsSignature(t) === sig);
    if (match) match.mode = 'showing';
  }

  private extractClosedCaptions(mediaFileRaw: any): VastClosedCaption[] {
    if (!mediaFileRaw) return [];

    const cc =
      mediaFileRaw.closedCaptionFiles ??
      mediaFileRaw.ClosedCaptionFiles ??
      mediaFileRaw.closedCaptionFile ??
      mediaFileRaw.ClosedCaptionFile ??
      null;

    const arr: any[] = Array.isArray(cc)
      ? cc
      : Array.isArray(cc?.closedCaptionFiles)
        ? cc.closedCaptionFiles
        : Array.isArray(cc?.ClosedCaptionFile)
          ? cc.ClosedCaptionFile
          : Array.isArray(cc?.closedCaptionFile)
            ? cc.closedCaptionFile
            : [];

    return arr
      .map((x) => ({
        type: x?.type ?? x?.mimeType ?? x?.mime_type,
        language: x?.language ?? x?.lang,
        fileURL: x?.fileURL ?? x?.url ?? x?.src,
      }))
      .filter((x) => typeof x.fileURL === 'string' && x.fileURL.length > 0);
  }
  private removeAdCaptions() {
    for (const el of this.adTrackEls) {
      try {
        el.remove();
      } catch {
        //
      }
    }

    this.adTrackEls = [];
  }

  private pickBestMediaFile(mediaFiles: any[]): NormalizedMediaFile | null {
    if (!Array.isArray(mediaFiles) || mediaFiles.length === 0) return null;

    const normalized = mediaFiles
      .map((m) => ({
        type: String(m?.mimeType || m?.type || ''),
        fileURL: String(m?.fileURL || m?.url || m?.src || ''),
        bitrate: Number(m?.bitrate || m?.bitRate || 0),
        width: Number(m?.width || 0),
        height: Number(m?.height || 0),
        raw: m,
      }))
      .filter((m) => Boolean(m.fileURL));

    if (normalized.length === 0) return null;

    for (const t of this.cfg.preferredMediaTypes) {
      const candidates = normalized.filter((m) => (m.type || '').toLowerCase() === t.toLowerCase());
      if (candidates.length) {
        return candidates.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      }
    }

    return normalized.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
  }

  // ----------------- skip / companions / non-linear (best-effort) -----------------

  private extractSkipOffsetFromCreative(creative: any): string | undefined {
    // vast-client-js represents skippable linear via `skipDelay: number|null` on CreativeLinear
    // (which comes from VAST <Linear skipoffset="...">).
    const linear = creative?.linear || creative?.Linear || creative;

    const skipDelay = linear?.skipDelay ?? linear?.skipdelay;
    if (typeof skipDelay === 'number' && Number.isFinite(skipDelay) && skipDelay >= 0) {
      // Represent as seconds string for downstream parsing.
      return String(skipDelay);
    }

    const raw =
      linear?.skipOffset ??
      linear?.skipoffset ??
      linear?.attributes?.skipOffset ??
      linear?.attributes?.skipoffset ??
      undefined;

    return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
  }

  private parseTimecodeToSeconds(s: string): number | null {
    const m = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(String(s).trim());
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const ss = Number(m[3]);
    if (![hh, mm, ss].every((x) => Number.isFinite(x))) return null;
    return hh * 3600 + mm * 60 + ss;
  }

  /** Compute skip seconds from VAST skipOffset (timecode, seconds, or percent). */
  private computeSkipAtSeconds(skipOffset: string | undefined, duration: number): number | undefined {
    if (!skipOffset) return undefined;
    const s = skipOffset.trim();
    if (!s) return undefined;

    if (s.endsWith('%')) {
      const p = Number(s.slice(0, -1));
      if (Number.isFinite(p) && p >= 0 && p <= 100 && Number.isFinite(duration) && duration > 0) {
        return (p / 100) * duration;
      }
      return undefined;
    }

    const tc = this.parseTimecodeToSeconds(s);
    if (tc != null) return tc;

    const n = Number(s);
    if (Number.isFinite(n) && n >= 0) return n;

    return undefined;
  }

  private ensureSkipDom() {
    if (this.skipWrap && this.skipBtn) return;

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__skip';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'op-ads__skip-btn';
    btn.textContent = 'Skip Ad';

    wrap.appendChild(btn);
    this.overlay.appendChild(wrap);

    const onClick = (e: PointerEvent) => {
      this.requestSkip('button');
      e.preventDefault();
      e.stopPropagation();
    };
    btn.addEventListener('click', onClick, EVENT_OPTIONS);

    this.skipWrap = wrap;
    this.skipBtn = btn;

    this.sessionUnsubs.push(() => btn.removeEventListener('click', onClick));
    this.sessionUnsubs.push(() => wrap.remove());
  }

  private hideSkipUi() {
    if (this.skipWrap) this.skipWrap.style.display = 'none';
    this.skipOffsetRaw = undefined;
    this.skipAtSeconds = undefined;
  }

  private setupSkipUIForCreative(creative: any) {
    this.hideSkipUi();
    const v = this.adVideo;
    if (!v) return;

    const skipOffset = this.extractSkipOffsetFromCreative(creative);
    if (!skipOffset) {
      this.log('creative not skippable (no skipOffset/skipDelay)');
      return;
    }
    this.log('creative skippable', skipOffset);

    this.skipOffsetRaw = skipOffset;
    this.ensureSkipDom();

    const update = () => {
      const dur = v.duration;
      // `skipOffset` may be a timecode/seconds (does not require duration) or percent (requires duration).
      const skipAt = this.computeSkipAtSeconds(skipOffset, dur);
      if (skipAt == null) return;
      this.skipAtSeconds = skipAt;

      const cur = v.currentTime || 0;
      const remaining = Math.max(0, skipAt - cur);
      if (this.skipWrap) this.skipWrap.style.display = 'block';
      if (this.skipBtn) {
        this.skipBtn.textContent = remaining <= 0.05 ? 'Skip Ad' : Math.ceil(remaining).toString();
      }
    };

    v.addEventListener('timeupdate', update);
    v.addEventListener('loadedmetadata', update);
    update();

    this.sessionUnsubs.push(() => v.removeEventListener('timeupdate', update));
    this.sessionUnsubs.push(() => v.removeEventListener('loadedmetadata', update));
  }

  private requestSkip(reason: 'button' | 'close' | 'api' = 'api') {
    // Skip gating for linear: if skip offset exists and we know skipAt, require it.
    if (this.skipOffsetRaw && this.skipAtSeconds != null && this.adVideo) {
      const cur = this.adVideo.currentTime || 0;
      if (cur + 0.01 < this.skipAtSeconds) {
        this.log('skip requested too early', { cur, skipAt: this.skipAtSeconds, reason });
        return;
      }
    }

    try {
      this.tracker?.trackSkip?.();
    } catch {
      //
    }

    const brk = this.currentBreakMeta ? { kind: this.currentBreakMeta.kind, id: this.currentBreakMeta.breakId } : null;
    this.bus.emit('ads:skip', { break: brk, reason });

    // Player-facing aliases
    this.ctx.events.emit('ads.skipped' as any, { break: brk, reason });
    this.ctx.events.emit('adsskipped' as any, { break: brk, reason });

    // End linear ad playback best-effort
    const v = this.adVideo;
    if (v) {
      try {
        if (Number.isFinite(v.duration) && v.duration > 0) v.currentTime = Math.max(0, v.duration - 0.001);
        v.dispatchEvent(new Event('ended'));
      } catch {
        //
      }
    }
  }

  private clearAdOverlays() {
    this.hideSkipUi();
    this.companionWrap?.remove();
    this.nonLinearWrap?.remove();
    this.companionWrap = undefined;
    this.nonLinearWrap = undefined;
  }

  private mountCompanions(creative: any) {
    const companions = creative?.companionAds?.companions || creative?.companions;
    if (!Array.isArray(companions) || companions.length === 0) return;

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__companions';
    wrap.style.position = 'absolute';
    wrap.style.right = '12px';
    wrap.style.bottom = '12px';
    wrap.style.zIndex = '2';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '8px';
    wrap.style.maxWidth = '40%';
    wrap.style.pointerEvents = 'auto';

    for (const c of companions) {
      const el = this.renderCompanion(c);
      if (el) wrap.appendChild(el);
    }

    if (!wrap.childElementCount) return;
    this.overlay.appendChild(wrap);
    this.companionWrap = wrap;

    this.sessionUnsubs.push(() => wrap.remove());
  }

  private renderCompanion(companion: any): HTMLElement | null {
    const click =
      companion?.companionClickThroughURLTemplate ||
      companion?.clickThroughURLTemplate ||
      companion?.companionClickThrough;

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__companion';
    wrap.style.position = 'relative';
    wrap.style.cursor = click ? 'pointer' : 'default';

    // VAST parsers vary: some expose singular *Resource, others expose plural *Resources arrays.
    const staticRes =
      companion?.staticResource ||
      companion?.StaticResource ||
      companion?.staticResources?.[0] ||
      companion?.StaticResources?.[0];
    const iframeRes =
      companion?.iFrameResource ||
      companion?.IFrameResource ||
      companion?.iFrameResources?.[0] ||
      companion?.IFrameResources?.[0];
    const htmlRes =
      companion?.htmlResource ||
      companion?.HTMLResource ||
      companion?.htmlResources?.[0] ||
      companion?.HTMLResources?.[0];

    let node: HTMLElement | null = null;

    if (staticRes) {
      const img = document.createElement('img');
      img.src = String(staticRes?.uri || staticRes?.value || staticRes);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      node = img;
    } else if (iframeRes) {
      const ifr = document.createElement('iframe');
      ifr.src = String(iframeRes?.uri || iframeRes?.value || iframeRes);
      ifr.style.border = '0';
      ifr.style.width = '100%';
      ifr.style.height = '100%';
      node = ifr;
    } else if (htmlRes) {
      const div = document.createElement('div');
      this.setSafeHTML(div, String(htmlRes?.value || htmlRes));
      node = div;
    }

    if (!node) return null;
    wrap.appendChild(node);

    if (click) {
      const onClick = (e: PointerEvent) => {
        try {
          const url = typeof click === 'string' ? click : click.url;
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
          //
        }
        try {
          this.tracker?.trackClick?.();
          this.tracker?.trackClickThrough?.();
        } catch {
          //
        }
        e.preventDefault();
        e.stopPropagation();
      };
      wrap.addEventListener('click', onClick);
      this.sessionUnsubs.push(() => wrap.removeEventListener('click', onClick));
    }

    return wrap;
  }

  private collectNonLinearCreatives(parsed: any): { ad: any; creative: any; nonLinear: any; sequence?: number }[] {
    const ads = parsed?.ads || parsed?.vastResponse?.ads || [];
    const out: { ad: any; creative: any; nonLinear: any; sequence?: number }[] = [];

    for (const ad of ads) {
      const creatives = ad?.creatives || [];
      for (const creative of creatives) {
        const nonLinears = creative?.nonLinearAds?.nonLinears || creative?.nonLinears;
        if (!Array.isArray(nonLinears) || nonLinears.length === 0) continue;

        const seqRaw = ad?.sequence || ad?.attributes?.sequence || undefined;
        const seq = seqRaw != null ? Number(seqRaw) : undefined;

        for (const nl of nonLinears) {
          out.push({ ad, creative, nonLinear: nl, sequence: Number.isFinite(seq) ? seq : undefined });
        }
      }
    }

    return out.sort((a, b) => {
      const as = a.sequence;
      const bs = b.sequence;
      if (as == null && bs == null) return 0;
      if (as == null) return 1;
      if (bs == null) return -1;
      return as - bs;
    });
  }

  private ensureNonLinearDom() {
    if (this.nonLinearWrap) return;

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__nonlinear';
    wrap.style.position = 'absolute';
    wrap.style.left = '12px';
    wrap.style.right = '12px';
    wrap.style.bottom = '12px';
    wrap.style.zIndex = '2';
    wrap.style.display = 'flex';
    wrap.style.justifyContent = 'center';
    wrap.style.pointerEvents = 'auto';

    this.overlay.appendChild(wrap);
    this.nonLinearWrap = wrap;

    this.sessionUnsubs.push(() => wrap.remove());
  }

  private renderNonLinear(nl: any): HTMLElement | null {
    const click =
      nl?.nonLinearClickThroughURLTemplate ||
      nl?.clickThroughURLTemplate ||
      nl?.nonLinearClickThrough ||
      nl?.clickThrough;

    const container = document.createElement('div');
    container.className = 'op-ads__nonlinear-item';
    container.style.position = 'relative';
    container.style.maxWidth = '100%';
    container.style.cursor = click ? 'pointer' : 'default';

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'x';
    close.setAttribute('aria-label', 'Close ad');
    close.style.position = 'absolute';
    close.style.right = '0';
    close.style.top = '0';
    close.style.zIndex = '3';
    close.style.cursor = 'pointer';

    const onClose = (e: PointerEvent) => {
      container.remove();
      this.requestSkip('close');
      e.preventDefault();
      e.stopPropagation();
    };
    close.addEventListener('click', onClose);

    container.appendChild(close);
    this.sessionUnsubs.push(() => close.removeEventListener('click', onClose));

    // VAST parsers vary: some expose singular *Resource, others expose plural *Resources arrays.
    const staticRes = nl?.staticResource || nl?.StaticResource || nl?.staticResources?.[0] || nl?.StaticResources?.[0];
    const iframeRes = nl?.iFrameResource || nl?.IFrameResource || nl?.iFrameResources?.[0] || nl?.IFrameResources?.[0];
    const htmlRes = nl?.htmlResource || nl?.HTMLResource || nl?.htmlResources?.[0] || nl?.HTMLResources?.[0];

    let node: HTMLElement | null = null;

    if (staticRes) {
      const img = document.createElement('img');
      img.src = String(staticRes?.uri || staticRes?.value || staticRes);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      node = img;
    } else if (iframeRes) {
      const ifr = document.createElement('iframe');
      ifr.src = String(iframeRes?.uri || iframeRes?.value || iframeRes);
      ifr.style.border = '0';
      ifr.style.width = '100%';
      ifr.style.height = '100%';
      node = ifr;
    } else if (htmlRes) {
      const div = document.createElement('div');
      this.setSafeHTML(div, String(htmlRes?.value || htmlRes));
      node = div;
    }

    if (!node) return null;
    container.appendChild(node);

    if (click) {
      const onClick = (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        try {
          const url = typeof click === 'string' ? click : click.url;
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
          //
        }
        try {
          this.tracker?.trackClick?.();
          this.tracker?.trackClickThrough?.();
        } catch {
          //
        }
        e.preventDefault();
        e.stopPropagation();
      };
      container.addEventListener('click', onClick);
      this.sessionUnsubs.push(() => container.removeEventListener('click', onClick));
    }

    return container;
  }

  private mountNonLinear(creative: any) {
    const nonLinears = creative?.nonLinearAds?.nonLinears || creative?.nonLinears;
    if (!Array.isArray(nonLinears) || nonLinears.length === 0) return;

    this.ensureNonLinearDom();
    for (const nl of nonLinears) {
      const el = this.renderNonLinear(nl);
      if (el) this.nonLinearWrap!.appendChild(el);
    }
  }

  private nonLinearSuggestedDurationSeconds(nl: any): number {
    const raw =
      nl?.minSuggestedDuration ?? nl?.minSuggestedDurationSeconds ?? nl?.attributes?.minSuggestedDuration ?? undefined;
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (typeof raw === 'string') {
      const tc = this.parseTimecodeToSeconds(raw);
      if (tc != null && tc > 0) return tc;
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 10;
  }

  private async playNonLinearOnlyBreak(
    parsed: any,
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string }
  ) {
    // Render non-linear creatives as overlays while content continues.
    this.ensureOverlayMounted();
    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';

    // Do NOT pause content or acquire playback lease.
    this.active = true;

    const items = this.collectNonLinearCreatives(parsed);
    if (!items.length) return;

    let maxDuration = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      try {
        this.tracker = new VASTTracker(this.vastClient, item.ad, item.creative);
      } catch {
        this.tracker = undefined;
      }
      this._lastCreative = item.creative;

      // Mount overlays (non-linear + companions)
      this.mountCompanions(item.creative);
      this.ensureNonLinearDom();
      const el = this.renderNonLinear(item.nonLinear);
      if (el) this.nonLinearWrap!.appendChild(el);

      // Fire impression + start (best-effort)
      try {
        this.tracker?.trackImpression?.();
        this.tracker?.trackCreativeView?.();
      } catch {
        //
      }
      this.bus.emit('ads:impression', { break: meta, index: i });
      this.bus.emit('ads:ad:start', { break: meta, index: i, sequence: item.sequence });

      maxDuration = Math.max(maxDuration, this.nonLinearSuggestedDurationSeconds(item.nonLinear));
    }

    // Auto-clear after max duration or when user closes all non-linear units.
    // Important: do NOT block the caller waiting for the auto-dismiss timer.
    // The linear-ads path awaits playback completion, but non-linear-only overlays
    // are "fire-and-forget" and content should continue immediately.
    const start = Date.now();
    const dismiss = async () => {
      // NOTE: Avoid requestAnimationFrame; in jsdom/Jest it can stall and hang tests.
      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = (Date.now() - start) / 1000;
          const anyLeft = !!this.nonLinearWrap?.querySelector('.op-ads__nonlinear-item');
          if (!anyLeft || elapsed >= maxDuration) {
            resolve();
            return;
          }
          setTimeout(tick, 50);
        };
        tick();
      });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        this.bus.emit('ads:ad:end', { break: meta, index: i, sequence: item.sequence });
      }

      // Cleanup overlays only; do not affect content playback state.
      this.clearSession();
      this.overlay.style.display = 'none';
      this.overlay.replaceChildren();
      this.active = false;
      this.currentBreakMeta = undefined;
    };

    void dismiss();
  }
  // ----------------- playback + tracking -----------------
  private mountAdVideo(contentMedia: HTMLMediaElement, mediaFile: NormalizedMediaFile) {
    this.ensureOverlayMounted();
    const root = this.overlay.parentElement as HTMLElement;

    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';

    this.contentMedia = contentMedia;
    this.captureActiveCaptionTrack(contentMedia);

    const v = document.createElement('video');
    v.className = 'op-ads__media';
    v.playsInline = true;
    v.preload = 'none';
    v.controls = this.cfg.allowNativeControls;
    v.style.width = '100%';
    v.style.height = '100%';
    v.src = mediaFile.fileURL;

    this.adEndPromise = new Promise((resolve) => {
      const done = () => resolve();

      const cleanupTakeover = () => {
        // Only clean up if this is still the active ad video
        if (this.adVideo === v) {
          try {
            v.pause();
          } catch {
            /* noop */
          }
          v.remove();
          this.adVideo = undefined;
        } else {
          // Still remove the DOM node defensively
          v.remove();
        }
      };

      const onEnded = () => {
        this.ctx.events.emit('playback:ended');
        cleanupTakeover();
        done();
      };

      const onError = () => {
        cleanupTakeover();
        done();
      };

      v.addEventListener('ended', onEnded, { once: true });
      v.addEventListener('error', onError, { once: true });

      this.sessionUnsubs.push(() => v.removeEventListener('ended', onEnded));
      this.sessionUnsubs.push(() => v.removeEventListener('error', onError));
    });

    this.overlay.appendChild(v);
    this.adVideo = v;

    this.clearAdTracks();
    this.adTrackEls = this.attachAdCaptionTracks(v, mediaFile.raw);
    this.sessionUnsubs.push(() => this.clearAdTracks());

    const overlayMgr = getOverlayManager(this.ctx.player);
    overlayMgr.activate({
      id: 'ads',
      priority: 100,
      mode: 'countdown',
      canSeek: false,
      duration: 0,
      value: 0,
      label: 'Ad',
      fullscreenEl: root,
      fullscreenVideoEl: v,
    });

    const updateOverlay = () => {
      const dur = v.duration;
      const cur = v.currentTime;
      if (!Number.isFinite(dur) || dur <= 0 || !Number.isFinite(cur)) return;

      overlayMgr.update(this.overlayId, {
        duration: dur,
        value: Math.max(0, dur - cur),
        mode: 'countdown',
        canSeek: false,
        fullscreenEl: root,
        fullscreenVideoEl: v,
      });
    };

    v.addEventListener('loadedmetadata', updateOverlay);
    v.addEventListener('timeupdate', updateOverlay);
    updateOverlay();

    this.sessionUnsubs.push(() => v.removeEventListener('loadedmetadata', updateOverlay));
    this.sessionUnsubs.push(() => v.removeEventListener('timeupdate', updateOverlay));
  }

  private bindAdSurfaceCommands() {
    const { events } = this.ctx;
    const v = () => this.adVideo;

    this.sessionUnsubs.push(
      events.on('playback:play', () =>
        v()
          ?.play()
          .catch(() => {
            //
          })
      )
    );
    this.sessionUnsubs.push(events.on('playback:pause', () => v()?.pause()));
    this.sessionUnsubs.push(
      events.on('media:volume', (x: any) => {
        const vol = Number(x);
        if (Number.isFinite(vol) && v()) v()!.volume = vol;
      })
    );
    this.sessionUnsubs.push(
      events.on('media:muted', (x: any) => {
        if (v()) v()!.muted = Boolean(x);
      })
    );
  }

  private bindTrackerAndTelemetry(meta: { kind: string; breakId: string }) {
    this.currentBreakMeta = meta;
    const v = this.adVideo!;
    let started = false;
    let lastMuted = v.muted || v.volume === 0;
    let lastVol = Number.isFinite(v.volume) ? v.volume : 1;
    let lastPaused = v.paused;

    const emitDuration = () => {
      const dur = v.duration;
      if (Number.isFinite(dur) && dur > 0) {
        this.bus.emit('ads:duration', { break: meta, duration: dur });
        this.ctx.events.emit('ads.durationChange', { duration: dur, break: meta });
      }
    };

    let q25 = false,
      q50 = false,
      q75 = false,
      q100 = false;

    const emitQuartile = (quartile: 0 | 25 | 50 | 75 | 100) => {
      this.bus.emit('ads:quartile', { break: meta, quartile });
      if (quartile === 25) this.ctx.events.emit('ads.firstQuartile', { break: meta });
      if (quartile === 50) this.ctx.events.emit('ads.midpoint', { break: meta });
      if (quartile === 75) this.ctx.events.emit('ads.thirdQuartile', { break: meta });
      if (quartile === 100) this.ctx.events.emit('ads.complete', { break: meta });
    };

    const onPlaying = () => {
      if (!started) {
        started = true;
        this.tracker?.trackStart?.();
        this.ctx.events.emit('playback:play');
        this.ctx.events.emit('ads.start', { break: meta });
        emitQuartile(0);
        emitDuration();
      } else if (lastPaused) {
        this.tracker?.trackResume?.();
      }
      this.ctx.events.emit('playback:playing');
      lastPaused = false;
    };

    const onPause = () => {
      if (started) this.tracker?.trackPause?.();
      lastPaused = true;
      this.ctx.events.emit('playback:pause');
      this.ctx.events.emit('ads.pause', { break: meta });
    };

    const onTime = () => {
      const dur = v.duration;
      const cur = v.currentTime;
      if (!Number.isFinite(dur) || dur <= 0 || !Number.isFinite(cur)) return;

      emitDuration();

      const remaining = Math.max(0, dur - cur);
      this.bus.emit('ads:timeupdate', {
        break: meta,
        currentTime: cur,
        remainingTime: remaining,
        duration: dur,
      });

      this.ctx.events.emit('ads.adProgress', { currentTime: cur, duration: dur, break: meta });
      this.tracker?.setDuration?.(dur);
      this.tracker?.setProgress?.(cur);

      const pct = cur / dur;
      if (!q25 && pct >= 0.25) {
        q25 = true;
        this.tracker?.trackFirstQuartile?.();
        emitQuartile(25);
      }
      if (!q50 && pct >= 0.5) {
        q50 = true;
        this.tracker?.trackMidpoint?.();
        emitQuartile(50);
      }
      if (!q75 && pct >= 0.75) {
        q75 = true;
        this.tracker?.trackThirdQuartile?.();
        emitQuartile(75);
      }
      if (!q100 && pct >= 0.999) {
        q100 = true;
        this.tracker?.trackComplete?.();
        emitQuartile(100);
      }
    };

    const onVolume = () => {
      const vol = v.volume;
      if (Number.isFinite(vol) && vol !== lastVol) {
        lastVol = vol;
        // Bridge ad volume to core UI controls
        this.ctx.events.emit('media:volume', vol);
      }
      this.ctx.events.emit('ads.volumeChange', { volume: vol, muted: lastMuted, break: meta });

      const muted = v.muted || v.volume === 0;
      if (muted !== lastMuted) {
        lastMuted = muted;
        this.ctx.events.emit('media:muted', muted);
        if (muted) this.tracker?.trackMute?.();
        else this.tracker?.trackUnmute?.();

        this.ctx.events.emit('ads.mute' as any, { muted, break: meta });
        this.ctx.events.emit('ads.volumeChange' as any, { volume: lastVol, muted, break: meta });
      }
    };

    const onClick = (ev: PointerEvent) => {
      if (ev.defaultPrevented) return;
      const click = this.getClickThroughUrl();
      if (!click) return;
      try {
        const url = typeof click === 'string' ? click : click.url;
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        //
      }
      this.tracker?.trackClick?.();
      this.tracker?.trackClickThrough?.();
      this.bus.emit('ads:clickthrough', { break: meta, url: click });
      this.ctx.events.emit('ads.click' as any, { break: meta, url: click });
    };

    v.addEventListener('playing', onPlaying);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('volumechange', onVolume);
    v.addEventListener('click', onClick);
    v.addEventListener('loadedmetadata', emitDuration);

    this.sessionUnsubs.push(() => v.removeEventListener('playing', onPlaying));
    this.sessionUnsubs.push(() => v.removeEventListener('pause', onPause));
    this.sessionUnsubs.push(() => v.removeEventListener('timeupdate', onTime));
    this.sessionUnsubs.push(() => v.removeEventListener('volumechange', onVolume));
    this.sessionUnsubs.push(() => v.removeEventListener('click', onClick));
    this.sessionUnsubs.push(() => v.removeEventListener('loadedmetadata', emitDuration));
  }

  private getClickThroughUrl(): string | { id: string; url: string } | undefined {
    const c = this._lastCreative;
    return (
      c?.videoClickThroughURLTemplate ||
      c?.videoClicks?.clickThrough ||
      c?.videoClicks?.clickThroughURLTemplate ||
      undefined
    );
  }

  private ensureOverlayMounted() {
    const mount = this.resolveMount();
    if (this.overlay.parentElement !== mount) mount.appendChild(this.overlay);
  }

  // ----------------- SIMID (best-effort) -----------------

  private tryMountSimidLayer(creative: any) {
    if (!this.cfg.simid?.enabled) return;

    const url = this.findSimidUrl(creative);
    if (!url) return;

    const wrap = document.createElement('div');
    wrap.className = this.cfg.simid.className || 'op-ads__simid';
    wrap.style.position = 'absolute';
    wrap.style.inset = '0';
    wrap.style.zIndex = '2';

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow = 'autoplay; fullscreen';
    iframe.style.border = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.sandbox = this.cfg.simid.sandbox || 'allow-scripts allow-same-origin allow-popups allow-forms';

    wrap.appendChild(iframe);
    this.overlay.appendChild(wrap);

    this.simidOverlay = wrap;
    this.simidFrame = iframe;

    const onMsg = (ev: MessageEvent) => {
      if (ev.source !== iframe.contentWindow) return;
      this.cfg.simid?.onMessage?.(ev.data);
    };

    window.addEventListener('message', onMsg);
    this.sessionUnsubs.push(() => window.removeEventListener('message', onMsg));
  }

  private findSimidUrl(creative: any): string | undefined {
    const seen = new Set<any>();

    const isUrl = (x: any) => typeof x === 'string' && /^https?:\/\//.test(x);

    const walk = (node: any, hintSimid: boolean): string | undefined => {
      if (!node || typeof node !== 'object') return undefined;
      if (seen.has(node)) return undefined;
      seen.add(node);

      for (const [k, v] of Object.entries(node)) {
        const key = k.toLowerCase();
        const nextHint =
          hintSimid ||
          key.includes('simid') ||
          key === 'apiframework' ||
          key.includes('interactive') ||
          key.includes('adparameters');

        if (typeof v === 'string') {
          const vLower = v.toLowerCase();
          const simidMention = vLower === 'simid' || vLower.includes('simid');
          if (simidMention) continue;

          if (isUrl(v) && nextHint) return v;
          if (isUrl(v) && (hintSimid || key.includes('resource') || key.includes('uri') || key.includes('url')))
            return v;
        } else if (Array.isArray(v)) {
          for (const item of v) {
            const found = walk(item, nextHint);
            if (found) return found;
          }
        } else if (typeof v === 'object' && v) {
          const found = walk(v, nextHint);
          if (found) return found;
        }
      }
      return undefined;
    };

    if (String(creative?.apiFramework || '').toLowerCase() === 'simid') {
      const found = walk(creative, true);
      if (found) return found;
    }

    return walk(creative, false);
  }

  // ----------------- break runner -----------------

  private async playBreakFromVast(
    input: VastInput,
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string }
  ) {
    if (this.active) return;

    const {
      events,
      state,
      leases,
      player: { media },
    } = this.ctx;

    const requestPayload = input.kind === 'url' ? input.value : '[xml]';
    this.bus.emit('ads:requested', requestPayload);
    this.log('requested', requestPayload, meta);

    // Parse first; for non-linear-only breaks we do NOT pause content or acquire playback lease.
    this.resumeAfter = this.cfg.resumeContent && (state.current === 'playing' || this.userPlayIntent);

    const pauseAndAcquireLease = () => {
      events.emit('playback:pause');

      if (!leases.acquire('playback', this.name)) {
        this.bus.emit('ads:error', {
          reason: 'playback lease already owned',
          owner: leases.owner('playback'),
        });
        this.ctx.events.emit('ads.error', {
          reason: 'playback lease already owned',
          owner: leases.owner('playback'),
        });
        return false;
      }
      return true;
    };

    function toXmlDocument(v: unknown): XMLDocument {
      if (v && typeof v === 'object') {
        // Already an XMLDocument
        if ((v as XMLDocument).nodeType === 9) return v as XMLDocument;
        // Element -> serialize then parse
        if ((v as XMLDocument).nodeType === 1) {
          const s = new XMLSerializer().serializeToString(v as XMLDocument);
          return new DOMParser().parseFromString(s, 'text/xml');
        }
      }

      const xmlStr = String(v ?? '');
      const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');

      // Optional but helpful: detect parse errors
      if (doc.getElementsByTagName('parsererror').length) {
        throw new Error('VAST XML parse error (parsererror)');
      }

      return doc;
    }

    try {
      const parsed =
        input.kind === 'url'
          ? await this.vastClient.get(input.value)
          : await this.vastClient.parseVAST(toXmlDocument(input.value));

      this.log('vast parsed', { ads: parsed?.ads?.length ?? 0, version: parsed?.version });
      const pod = this.collectPodAds(parsed);
      this.log('linear pod items', pod.length);
      if (!pod.length) {
        // Non-linear-only VAST: render overlays while content continues (no pause / no playback lease).
        const nonLinearItems = this.collectNonLinearCreatives(parsed);
        if (nonLinearItems.length) {
          this.ctx.events.emit('ads.loaded', { break: meta, count: nonLinearItems.length });
          await this.playNonLinearOnlyBreak(parsed, meta);
          return;
        }
        this.warn('no playable ads found in VAST response');
        throw new Error('No playable ads found in VAST response');
      }

      this.ctx.events.emit('ads.loaded' as any, { break: meta, count: pod.length });
      // Linear break: pause content and acquire playback lease, then start ad video takeover.
      if (!pauseAndAcquireLease()) return;
      this.active = true;

      for (let i = 0; i < pod.length; i++) {
        const item = pod[i];
        this.bus.emit('ads:ad:start', { break: meta, index: i, sequence: item.sequence });

        // fresh session listeners per ad
        this.clearSession();

        this.tracker = new VASTTracker(this.vastClient, item.ad, item.creative);
        this._lastCreative = item.creative;

        this.log('mount ad video', {
          url: item.mediaFile?.fileURL,
          type: item.mediaFile?.type,
          skipOffset: item.skipOffset,
        });
        this.mountAdVideo(media, item.mediaFile);
        // Attach ended/error listeners immediately after mounting the takeover surface.
        // Some test environments (and some user interactions) may dispatch `ended` very soon,
        // and we don't want to miss it and leak the takeover element.
        const endPromise = this.waitForAdEnd();

        // Skip button + companion + non-linear creatives (best-effort)
        this.setupSkipUIForCreative(item.creative);
        this.log('skip ui', { raw: this.skipOffsetRaw, at: this.skipAtSeconds });
        this.mountCompanions(item.creative);
        this.mountNonLinear(item.creative);

        if (!this.cfg.allowNativeControls) this.bindAdSurfaceCommands();

        // SIMID overlay (best-effort; no-op if not found)
        this.tryMountSimidLayer(item.creative);

        // Tracking + clickthrough + quartiles
        this.tracker?.trackImpression?.();
        this.bus.emit('ads:impression', { break: meta, index: i });

        this.bindTrackerAndTelemetry({ kind: meta.kind, breakId: meta.id });

        // Start playing this ad and wait for it to end
        this.startAdPlayback();
        await endPromise;

        this.bus.emit('ads:ad:end', { break: meta, index: i, sequence: item.sequence });
      }

      // Finished the whole pod => cleanup + resume behavior
      this.bus.emit('ads:allAdsCompleted', { break: meta });
      this.ctx.events.emit('ads.allAdsCompleted' as any, { break: meta });
      this.finish({ resume: meta.kind !== 'postroll' && (this.userPlayIntent || this.resumeAfter) });
    } catch (err) {
      this.bus.emit('ads:error', err);
      this.ctx.events.emit('ads.error', { err });
      this.finish({ resume: meta.kind !== 'postroll' && (this.userPlayIntent || this.resumeAfter) });
    }
  }

  private waitForAdEnd(): Promise<void> {
    return this.adEndPromise || Promise.resolve();
  }

  private startAdPlayback() {
    const v = this.adVideo;
    this.ctx.events.emit('playback:play');
    if (!v) return;
    // In jsdom/Jest, HTMLMediaElement.play() may throw synchronously (not implemented)
    // or return a non-Promise value. Guard both cases so ads sessions don't immediately
    // abort and clean up DOM before tests can observe the takeover surface.
    try {
      const maybePromise: any = (v as any).play?.();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {
          // Autoplay may be blocked; user can hit play (custom or native controls)
        });
      }
    } catch {
      // Ignore autoplay failures in non-browser test environments.
    }
  }

  private clearSession() {
    for (const off of this.sessionUnsubs) off();
    this.sessionUnsubs = [];
    this.tracker = undefined;

    this.clearAdOverlays();
    this.removeAdCaptions();

    if (this.simidFrame) {
      try {
        this.simidFrame.src = 'about:blank';
      } catch {
        //
      }
    }
    this.simidFrame?.remove();
    this.simidOverlay?.remove();
    this.simidFrame = undefined;
    this.simidOverlay = undefined;

    if (this.adVideo) {
      try {
        this.adVideo.pause();
      } catch {
        //
      }
      this.adVideo.remove();
      this.adVideo = undefined;
    }

    // Defensive cleanup for environments like jsdom where .remove() can be flaky in tests
    try {
      document
        .querySelectorAll('video.op-ads__media')
        .forEach((n) => (n as any)?.parentNode?.removeChild?.(n) ?? (n as any).remove?.());
    } catch {
      // ignore
    }

    this.adEndPromise = null;

    // Keep overlay visible across a pod; the next ad will remount.
    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';
  }

  private finish(opts: { resume: boolean }) {
    const { events, leases } = this.ctx;

    this.clearSession();

    // Restore content native controls if we disabled them
    if (this.contentMedia && this.contentHadControls) {
      this.contentMedia.setAttribute('controls', '');
    }
    this.contentMedia = undefined;
    this.contentHadControls = false;

    // Hide overlay
    this.overlay.style.display = 'none';
    this.overlay.replaceChildren();

    // Release lease
    leases.release('playback', this.name);

    this.active = false;
    const shouldResume = !!(opts.resume || this.userPlayIntent || this.resumeAfter);
    this.userPlayIntent = false;
    this.restoreActiveTextTrack();
    getOverlayManager(this.ctx.player).deactivate(this.overlayId);

    if (shouldResume) {
      events.emit('playback:play');
    } else {
      events.emit('playback:pause');
    }
  }
}

/**
 * Optional prototype-level install for UMD bundles.
 * This keeps core generic while allowing opt-in convenience accessors.
 *
 * NOTE: Instance-level `extendAds()` is preferred and does not require prototype mutation.
 */
export function installAds(PlayerCtor: any) {
  if (!PlayerCtor || !PlayerCtor.prototype) return;

  // Idempotent define (do not overwrite if already defined)
  const desc = Object.getOwnPropertyDescriptor(PlayerCtor.prototype, 'ads');
  if (desc) return;

  Object.defineProperty(PlayerCtor.prototype, 'ads', {
    configurable: true,
    enumerable: false,
    get() {
      return (this as any).getPlugin?.('ads');
    },
  });
}

/** Instance-level API extension. */
export function extendAds(player: any, plugin: AdsPlugin) {
  if (!player) return;
  if (typeof player.extend === 'function') {
    player.extend({ ads: plugin });
  } else if ((player as any).ads === undefined) {
    (player as any).ads = plugin;
  }
}
