import { VASTClient, VASTTracker } from '@dailymotion/vast-client';
import VMAP from '@dailymotion/vmap';
import type { EventBus, PlayerPlugin, PluginContext } from '@openplayer/core';
import { EVENT_OPTIONS, getOverlayManager } from '@openplayer/core';

export type AdsEvent =
  | 'ads:requested'
  | 'ads:break:start'
  | 'ads:break:end'
  | 'ads:ad:start'
  | 'ads:ad:end'
  | 'ads:loaded'
  | 'ads:impression'
  | 'ads:quartile'
  | 'ads:clickthrough'
  | 'ads:error'
  | 'ads:timeupdate'
  | 'ads:duration'
  | 'ads:allAdsCompleted'
  | 'ads:skip'
  | 'ads:pause'
  | 'ads:resume'
  | 'ads:mute'
  | 'ads:unmute'
  | 'ads:volumeChange';

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

export type AdsSourceType = 'VAST' | 'VMAP' | 'NONLINEAR';

export type AdsSource = { type: AdsSourceType; src: string };

export type AdsBreakConfig = {
  id?: string;
  at: BreakAt;
  source?: AdsSource;
  sources?: AdsSource[];
  once?: boolean;
  timeOffset?: string;
};

class PluginBus<E extends string> {
  constructor(private bus: EventBus) {}

  on(event: E, cb: (...args: any[]) => void) {
    return this.bus.on(event, cb);
  }

  emit(event: E, ...data: any[]) {
    this.bus.emit(event, ...data);
  }
}

export type AdsPluginConfig = {
  sources?: AdsSource | AdsSource[];
  breaks?: AdsBreakConfig[];
  interceptPlayForPreroll?: boolean;
  autoPlayOnReady?: boolean;
  mountEl?: HTMLElement;
  mountSelector?: string;
  nonLinearContainer?: HTMLElement;
  nonLinearSelector?: string;
  companionContainer?: HTMLElement;
  companionSelector?: string;
  allowNativeControls?: boolean;
  resumeContent?: boolean;
  preferredMediaTypes?: string[];
  debug?: boolean;
  breakTolerance?: number;
  adSourcesMode?: 'waterfall' | 'playlist';
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
  creativeIndex?: number;
  ad: any;
  creative: any;
  mediaFile: NormalizedMediaFile;
  sequence?: number;
  skipOffset?: string;
  companions?: any[];
  nonLinears?: any[];
};

type XmlNonLinearItem = {
  nonLinear: any;
  companions?: any[];
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

  // NOTE: We keep the container/selector options optional. They are intentionally
  // not forced required, because they may be omitted by integrators.
  private cfg: Omit<
    Required<
      Omit<
        AdsPluginConfig,
        | 'mountEl'
        | 'mountSelector'
        | 'nonLinearContainer'
        | 'nonLinearSelector'
        | 'companionContainer'
        | 'companionSelector'
      >
    >,
    'sources'
  > &
    Pick<
      AdsPluginConfig,
      | 'mountEl'
      | 'mountSelector'
      | 'nonLinearContainer'
      | 'nonLinearSelector'
      | 'companionContainer'
      | 'companionSelector'
    > & { sources: AdsSource[] };

  private overlay!: HTMLDivElement;
  private adVideo?: HTMLVideoElement;

  private skipWrap?: HTMLDivElement;
  private skipBtn?: HTMLButtonElement;
  private skipOffsetRaw?: string;
  private skipAtSeconds?: number;

  private companionWrap?: HTMLDivElement;
  private nonLinearWrap?: HTMLDivElement;

  private resolvedNonLinearContainer?: HTMLElement;
  private resolvedCompanionContainer?: HTMLElement;

  private currentBreakMeta?: { kind: string; breakId: string };

  private vastClient: any;
  private tracker?: any;

  private globalUnsubs: (() => void)[] = [];
  private sessionUnsubs: (() => void)[] = [];

  private active = false;
  private resumeAfter = false;

  private contentMedia?: HTMLMediaElement;
  private contentHadControls = false;

  private startingBreak = false;
  private playedBreaks = new Set<string>();
  private userPlayIntent = false;
  private forcedMuteUntilInteraction = false;
  private resolvedBreaks: AdsBreakConfig[] = [];
  private pendingPercentBreaks: { id: string; percent: number; vast: VastInput; once: boolean; source: AdsSource }[] =
    [];
  private syncingVolume = false;
  private vmapLoadPromise: Promise<void> | null = null;
  private vmapPending = false;
  private pendingVmapSrc?: string;

  constructor(config: AdsPluginConfig = {}) {
    const normalizeSources = (cfg: AdsPluginConfig): AdsSource[] => {
      const list: AdsSource[] = [];
      const raw = cfg.sources ? (Array.isArray(cfg.sources) ? cfg.sources : [cfg.sources]) : [];

      raw.forEach((s) => {
        if (!s || typeof s.src !== 'string') return;
        const src = s.src.trim();
        const type = s.type as AdsSourceType;
        if (!src) return;
        if (type === 'VAST' || type === 'VMAP' || type === 'NONLINEAR') {
          list.push({ type, src });
        }
      });

      return list;
    };

    const sources = normalizeSources(config);
    const breaks = config.breaks || [];
    const hasExplicitPreroll = breaks.some((b) => b.at === 'preroll' && b.source?.src);
    const hasSourceVastOrVmap = sources.some((s) => s.type === 'VAST' || s.type === 'VMAP' || s.type === 'NONLINEAR');

    this.cfg = {
      allowNativeControls: config.allowNativeControls ?? false,
      resumeContent: config.resumeContent ?? true,
      preferredMediaTypes: config.preferredMediaTypes || [
        'video/mp4',
        'video/webm',
        'application/vnd.apple.mpegurl',
        'application/x-mpegURL',
      ],
      debug: config.debug ?? false,
      breakTolerance: config.breakTolerance ?? 0.25,
      sources,
      breaks,
      interceptPlayForPreroll: config.interceptPlayForPreroll ?? (Boolean(hasExplicitPreroll) || hasSourceVastOrVmap),
      autoPlayOnReady: config.autoPlayOnReady || false,
      mountEl: config.mountEl,
      mountSelector: config.mountSelector,
      nonLinearContainer: config.nonLinearContainer,
      nonLinearSelector: config.nonLinearSelector,
      companionContainer: config.companionContainer,
      companionSelector: config.companionSelector,
      adSourcesMode: config.adSourcesMode ?? 'waterfall',
    };
  }

  setup(ctx: PluginContext) {
    this.ctx = ctx;
    this.bus = new PluginBus<AdsEvent>(ctx.events);
    this.vastClient = new VASTClient();

    this.overlay = document.createElement('div');
    this.overlay.className = 'op-ads';
    this.overlay.style.display = 'none';

    this.globalUnsubs.push(
      ctx.events.on('source:set', () => {
        this.playedBreaks.clear();
        this.startingBreak = false;
        this.clearSession();
        // Reset ad-session state so the next play attempt starts fresh.
        // Without these resets, shouldInterceptPreroll() stays blocked if
        // a source switch happened while an ad was playing (active remains true).
        this.active = false;
        this.contentMedia = undefined;
        this.contentHadControls = false;
        this.overlay.style.display = 'none';
        this.ctx.leases.release('playback', this.name);
        try {
          getOverlayManager(this.ctx.core).deactivate(this.overlayId);
        } catch {
          /* ignore */
        }
        this.userPlayIntent = false;
        this.pendingPercentBreaks = [];
        this.vmapLoadPromise = null;
        this.vmapPending = false;
        this.pendingVmapSrc = undefined;
        this.rebuildSchedule();
      })
    );

    this.rebuildSchedule();
    this.bindBreakScheduler();

    if (this.cfg.interceptPlayForPreroll) {
      this.bindPrerollInterceptors();
    }

    this.globalUnsubs.push(
      ctx.events.on('player:interacted', () => {
        this.forcedMuteUntilInteraction = false;
        if (this.active && this.adVideo) {
          try {
            this.adVideo.muted = ctx.core.muted;
            this.adVideo.volume = ctx.core.volume;
          } catch {
            // ignore
          }
        }
      })
    );
  }

  async playAds(vastUrl: string) {
    const sourceType = this.inferSourceTypeForUrl(vastUrl);
    return this.playBreakFromVast({ kind: 'url', value: vastUrl }, { kind: 'manual', id: 'manual', sourceType });
  }

  async playAdsFromXml(vastXml: string) {
    return this.playBreakFromVast({ kind: 'xml', value: vastXml }, { kind: 'manual', id: 'manual' });
  }

  getDueMidrollBreaks(currentTime: number): AdsBreakConfig[] {
    const media = this.ctx.core.media;
    if (Number.isFinite(media.duration) && media.duration > 0 && this.pendingPercentBreaks.length) {
      const duration = media.duration;
      const toAdd: AdsBreakConfig[] = [];
      for (const pb of this.pendingPercentBreaks) {
        const atSec = duration * pb.percent;
        toAdd.push({
          id: pb.id,
          at: atSec,
          once: pb.once,
          source: pb.source,
        });
      }
      this.pendingPercentBreaks = [];
      this.resolvedBreaks.push(...toAdd);
    }

    const due: AdsBreakConfig[] = [];
    for (const b of this.resolvedBreaks) {
      if (typeof b.at !== 'number') continue;
      if (!this.getVastInputFromBreak(b).input) continue;

      const id = this.getBreakId(b);
      const once = b.once !== false;
      if (once && this.playedBreaks.has(id)) continue;

      if (currentTime + (this.cfg.breakTolerance ?? 0.25) >= b.at) {
        due.push(b);
      }
    }
    due.sort((a, b) => (a.at as number) - (b.at as number));
    return due;
  }

  /** Returns the earliest due midroll break, if any. (Convenience for tests/debugging.) */
  getDueMidrollBreak(currentTime: number): AdsBreakConfig | undefined {
    return this.getDueMidrollBreaks(currentTime)[0];
  }

  destroy() {
    this.finish({ resume: false });
    for (const off of this.globalUnsubs) off();
    this.globalUnsubs = [];
    this.overlay?.remove();
  }

  private inferSourceTypeForUrl(url: string): 'NONLINEAR' | undefined {
    const sources = this.cfg.sources || [];
    const exact = sources.find((s) => s.src === url);
    if (exact?.type === 'NONLINEAR') return 'NONLINEAR';
    if (sources.length > 0 && sources.every((s) => s.type === 'NONLINEAR')) return 'NONLINEAR';
    return undefined;
  }

  private resolveContainer(el?: HTMLElement, selector?: string): HTMLElement | undefined {
    if (el && el.nodeType === 1) return el;
    if (selector) {
      const found = document.querySelector(selector);
      if (found instanceof HTMLElement) return found;
    }
    return undefined;
  }

  private getNonLinearContainer(): HTMLElement | undefined {
    if (this.resolvedNonLinearContainer) return this.resolvedNonLinearContainer;
    this.resolvedNonLinearContainer = this.resolveContainer(this.cfg.nonLinearContainer, this.cfg.nonLinearSelector);
    return this.resolvedNonLinearContainer;
  }

  private getCompanionContainer(): HTMLElement | undefined {
    if (this.resolvedCompanionContainer) return this.resolvedCompanionContainer;
    this.resolvedCompanionContainer = this.resolveContainer(this.cfg.companionContainer, this.cfg.companionSelector);
    return this.resolvedCompanionContainer;
  }

  private getSource(type: AdsSourceType): AdsSource | undefined {
    return (this.cfg.sources || []).find((s) => s.type === type && typeof s.src === 'string' && s.src.trim());
  }

  private getPrimaryVastLikeSource(): AdsSource | undefined {
    return this.getSource('VAST') || this.getSource('NONLINEAR');
  }

  private isXmlString(src: string): boolean {
    return src.trim().startsWith('<');
  }

  private async getVastXmlText(input: VastInput): Promise<string> {
    if (input.kind === 'xml') {
      if (typeof input.value === 'string') return input.value;
      try {
        return new XMLSerializer().serializeToString(input.value);
      } catch {
        return String(input.value);
      }
    }
    const res = await fetch(input.value);
    if (!res.ok) throw new Error(`VAST request failed: ${res.status}`);
    return await res.text();
  }

  private buildParsedForNonLinearFromXml(xmlText: string): XMLDocument {
    return this.toXmlDocument(xmlText);
  }

  private setSafeHTML(el: HTMLElement, html: string) {
    const tpl = document.createElement('template');
    tpl.innerHTML = String(html || '');

    // NOTE: Companion ads may include HTML. Keep the surface small and defensive.
    // Block active/content-injection tags, plus SVG/MathML which have a long history of XSS vectors.
    const blockedTags = new Set([
      'SCRIPT',
      'IFRAME',
      'OBJECT',
      'EMBED',
      'LINK',
      'STYLE',
      'SVG',
      'MATH',
      'FORM',
      'INPUT',
      'TEXTAREA',
      'SELECT',
      'OPTION',
      'META',
      'BASE',
    ]);
    const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT);
    const toRemove: Element[] = [];

    while (walker.nextNode()) {
      const node = walker.currentNode as Element;
      if (blockedTags.has(node.tagName)) {
        toRemove.push(node);
        continue;
      }

      Array.from(node.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = (attr.value || '').trim();
        if (name.startsWith('on')) {
          node.removeAttribute(attr.name);
        }
        // Block javascript: URLs and other risky protocols.
        if (name === 'href' || name === 'src' || name === 'xlink:href') {
          const v = value.toLowerCase();
          const isJs = v.startsWith('javascript:');
          const isData = v.startsWith('data:');
          const isHttp = v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/') || v.startsWith('./');

          // Allow data:image/* only (common in companions). Everything else must be http(s) or relative.
          const isSafeDataImage = isData && /^data:image\/(png|gif|jpe?g|webp|svg\+xml);/i.test(value);

          if (isJs || (!isHttp && !isSafeDataImage)) node.removeAttribute(attr.name);
        }

        // Disallow inline HTML injection attributes.
        if (name === 'srcdoc') node.removeAttribute(attr.name);
      });
    }

    toRemove.forEach((n) => n.remove());
    el.replaceChildren(tpl.content.cloneNode(true));
  }

  private log(...args: any[]) {
    // eslint-disable-next-line no-console
    if (this.cfg?.debug) console.debug('[player][ads]', ...args);
  }

  private warn(...args: any[]) {
    // eslint-disable-next-line no-console
    if (this.cfg?.debug) console.warn('[player][ads]', ...args);
  }

  private rebuildSchedule() {
    const combined: AdsBreakConfig[] = [...(this.cfg.breaks || [])];

    if (combined.length === 0) {
      const vastLikeSources = this.cfg.sources.filter(
        (s) => (s.type === 'VAST' || s.type === 'NONLINEAR') && s.src?.trim()
      );

      if (vastLikeSources.length > 0) {
        if (this.cfg.adSourcesMode === 'playlist') {
          // Playlist: one independent preroll break per source played sequentially.
          for (const src of vastLikeSources) {
            combined.push({ at: 'preroll', source: { type: src.type, src: src.src }, once: true });
          }
        } else if (vastLikeSources.length > 1) {
          // Waterfall (default): single break carries all sources as fallbacks.
          // startBreak() will iterate them and play the first that returns ads.
          combined.push({
            at: 'preroll',
            source: vastLikeSources[0],
            sources: vastLikeSources,
            once: true,
          });
        } else {
          combined.push({ at: 'preroll', source: vastLikeSources[0], once: true });
        }
      }
    }

    const vmap = this.getSource('VMAP');
    if (vmap?.src) {
      const media = this.ctx?.core?.media;
      const preload = media ? (media.getAttribute('preload') || media.preload || '').toLowerCase() : '';
      if (preload === 'none') {
        // preload="none": defer the network fetch until the user actually initiates playback.
        // bindPrerollInterceptors() will start the fetch on the first play intent.
        this.pendingVmapSrc = vmap.src;
      } else {
        // preload="metadata" / "auto" / autoplay: fetch eagerly so the schedule is ready.
        this.vmapPending = true;
        this.vmapLoadPromise = this.loadVmapAndMerge(combined, vmap.src);
      }
    }

    this.resolvedBreaks = combined;
  }

  private normalizeVmapAdSource(adSource: any): any | undefined {
    if (!adSource) return undefined;
    if (Array.isArray(adSource)) {
      return adSource.find((s) => s?.adTagURI || s?.vastAdData) || adSource[0];
    }
    return adSource;
  }

  private extractVastTagUri(adTagURI: any): string | undefined {
    if (!adTagURI) return undefined;
    if (typeof adTagURI === 'string') return adTagURI.trim() || undefined;
    if (typeof adTagURI === 'object') {
      const uri = (adTagURI.uri || adTagURI.URI || adTagURI.value || adTagURI.text || adTagURI['#text']) as
        | string
        | undefined;
      if (typeof uri === 'string' && uri.trim()) return uri.trim();
    }
    return undefined;
  }

  private async loadVmapAndMerge(existing: AdsBreakConfig[], vmapSrc?: string) {
    try {
      const src = (vmapSrc || this.getSource('VMAP')?.src || '').trim();

      if (!src) return;
      const xmlText = this.isXmlString(src)
        ? src
        : await fetch(src).then((r) => {
            if (!r.ok) throw new Error(`VMAP request failed: ${r.status}`);
            return r.text();
          });
      const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
      const vmap = new VMAP(xmlDoc);

      const vmapBreaks: AdsBreakConfig[] = [];
      const breaks = vmap.adBreaks || [];
      // Snapshot pending count before the library loop so we can roll back if needed.
      const prevPendingCount = this.pendingPercentBreaks.length;
      // Count the raw AdBreak elements in the XML. Some VMAP parsers deduplicate entries
      // that share the same breakId (which is technically invalid per spec but happens in
      // the wild). If the library returns fewer breaks than the XML declares, we discard
      // the library result and re-parse via the DOM fallback below so no break is lost.
      const rawAdBreakCount = (() => {
        try {
          const ns = xmlDoc.getElementsByTagNameNS('*', 'AdBreak');
          if (ns && ns.length) return ns.length;
        } catch {
          /* ignore */
        }
        try {
          return xmlDoc.getElementsByTagName('AdBreak').length;
        } catch {
          return 0;
        }
      })();

      for (let i = 0; i < breaks.length; i++) {
        const b = breaks[i];
        const breakType = String(b?.breakType || '').toLowerCase();
        if (breakType && breakType !== 'linear' && breakType !== 'nonlinear' && breakType !== 'non-linear') continue;

        const rawOffset = String(b?.timeOffset || '').trim();
        const id = `${b?.breakId || 'vmap'}:${rawOffset || 'start'}:${i}`;
        const { at, pendingPercent } = this.parseVmapTimeOffset(rawOffset);

        const adSource = this.normalizeVmapAdSource(b?.adSource);
        const vastInline = adSource?.vastAdData;
        const vastTag = adSource?.adTagURI;

        const url = this.extractVastTagUri(vastTag);
        let xml: string | undefined;

        if (vastInline) {
          if (typeof vastInline === 'string') xml = vastInline;
          else if (vastInline?.nodeType) xml = new XMLSerializer().serializeToString(vastInline);
        }

        if (!url && !xml) continue;
        const isNonLinearBreak = breakType === 'nonlinear' || breakType === 'non-linear';
        const source: AdsSource = { type: isNonLinearBreak ? 'NONLINEAR' : 'VAST', src: url ? url : xml! };

        if (pendingPercent != null) {
          this.pendingPercentBreaks.push({
            id,
            percent: pendingPercent,
            vast: url ? { kind: 'url', value: url } : { kind: 'xml', value: xml! },
            once: true,
            source,
          });
          continue;
        }

        vmapBreaks.push({
          id,
          at,
          once: true,
          timeOffset: rawOffset || (at === 'postroll' ? 'end' : 'start'),
          source,
        });
      }

      // DOM fallback: runs when the VMAP library returned no breaks (e.g. namespaced XML it
      // can't parse) OR when it returned fewer breaks than the XML declares — which happens
      // when the library deduplicates AdBreak entries that share the same breakId (valid
      // real-world VMAP that represents an ad pod via repeated breakIds at the same offset).
      // In either case, roll back any partial library results and re-parse from the raw XML.
      const libBreakCount = vmapBreaks.length + (this.pendingPercentBreaks.length - prevPendingCount);
      const libraryUnderCounted = rawAdBreakCount > 0 && libBreakCount < rawAdBreakCount;
      if (libraryUnderCounted) {
        vmapBreaks.length = 0;
        this.pendingPercentBreaks.splice(prevPendingCount);
      }
      if (vmapBreaks.length === 0 && this.pendingPercentBreaks.length === prevPendingCount) {
        const byTag = (root: ParentNode, localName: string): Element[] => {
          try {
            const ns = (root as any).getElementsByTagNameNS?.('*', localName) as HTMLCollectionOf<Element> | undefined;
            if (ns && ns.length) return Array.from(ns);
          } catch {
            // ignore
          }
          try {
            return Array.from((root as any).getElementsByTagName(localName) as HTMLCollectionOf<Element>);
          } catch {
            return [];
          }
        };

        const adBreakEls = byTag(xmlDoc, 'AdBreak');
        for (let i = 0; i < adBreakEls.length; i++) {
          const el = adBreakEls[i];
          const breakType = String(el.getAttribute('breakType') || '').toLowerCase();
          if (breakType && breakType !== 'linear' && breakType !== 'nonlinear' && breakType !== 'non-linear') continue;

          const rawOffset = String(el.getAttribute('timeOffset') || '').trim();
          const breakId = el.getAttribute('breakId') || el.getAttribute('id') || 'vmap-fb';
          const id = `${breakId}:${rawOffset || 'start'}:${i}`;
          const { at, pendingPercent } = this.parseVmapTimeOffset(rawOffset);

          const adSourceEls = byTag(el, 'AdSource');
          const adSrc = adSourceEls[0];

          let url: string | undefined;
          let xml: string | undefined;

          if (adSrc) {
            const uriEls = byTag(adSrc, 'AdTagURI');
            if (uriEls.length) url = (uriEls[0].textContent || '').trim() || undefined;
            if (!url) {
              const dataEls = byTag(adSrc, 'VASTAdData');
              if (dataEls.length) xml = (dataEls[0].textContent || '').trim() || undefined;
            }
          }

          if (!url && !xml) continue;

          const isNonLinearBreak = breakType === 'nonlinear' || breakType === 'non-linear';
          const source: AdsSource = { type: isNonLinearBreak ? 'NONLINEAR' : 'VAST', src: url ? url : xml! };

          if (pendingPercent != null) {
            this.pendingPercentBreaks.push({
              id,
              percent: pendingPercent,
              vast: url ? { kind: 'url', value: url } : { kind: 'xml', value: xml! },
              once: true,
              source,
            });
            continue;
          }

          vmapBreaks.push({
            id,
            at,
            once: true,
            timeOffset: rawOffset || (at === 'postroll' ? 'end' : 'start'),
            source,
          });
        }
      }

      this.resolvedBreaks = [...existing, ...vmapBreaks];
    } catch (err) {
      this.warn('VMAP load/parse failed', err);
      this.bus.emit('ads:error', { reason: 'vmap_parse_failed', error: err });
      this.ctx.events.emit('ads.error', { reason: 'vmap_parse_failed', error: err });
    } finally {
      this.vmapPending = false;
    }
  }

  private resolveMount(): HTMLElement {
    if (this.cfg.mountEl) return this.cfg.mountEl as HTMLElement;
    if (this.cfg.mountSelector) {
      const el = document.querySelector(this.cfg.mountSelector) as HTMLElement | null;
      if (el) return el;
    }

    const media = this.ctx.core.media;
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

  private getVastInputFromBreak(b: AdsBreakConfig): { input?: VastInput; sourceType?: AdsSourceType } {
    if (b.source && typeof b.source.src === 'string' && b.source.src.trim()) {
      const src = b.source.src.trim();
      const t = b.source.type as AdsSourceType;
      return this.isXmlString(src)
        ? { input: { kind: 'xml', value: src }, sourceType: t }
        : { input: { kind: 'url', value: src }, sourceType: t };
    }

    return { input: undefined, sourceType: undefined };
  }

  private getPostrollBreak(): AdsBreakConfig | undefined {
    for (const b of this.resolvedBreaks) {
      if (b.at !== 'postroll') continue;
      if (!this.getVastInputFromBreak(b).input) continue;

      const id = this.getBreakId(b);
      const once = b.once !== false;
      if (once && this.playedBreaks.has(id)) continue;
      return b;
    }

    return undefined;
  }

  private toXmlDocument(xml: string): XMLDocument {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(xml || ''), 'text/xml');
    return doc;
  }

  private getBreakId(b: AdsBreakConfig) {
    if (b.id) return b.id;
    const { input, sourceType } = this.getVastInputFromBreak(b);
    const key = input?.kind === 'url' ? input.value : 'xml';
    return `${String(b.at)}:${sourceType || 'VAST'}:${key}`;
  }

  private getPrerollBreak(): AdsBreakConfig | undefined {
    for (const b of this.resolvedBreaks) {
      if (b.at !== 'preroll') continue;
      if (!this.getVastInputFromBreak(b).input) continue;

      const id = this.getBreakId(b);
      const once = b.once !== false;
      if (once && this.playedBreaks.has(id)) continue;
      return b;
    }

    for (const b of this.cfg.breaks) {
      if (b.at !== 'preroll') continue;
      if (!this.getVastInputFromBreak(b).input) continue;

      const id = this.getBreakId(b);
      const once = b.once !== false;
      if (once && this.playedBreaks.has(id)) continue;
      return b;
    }

    // Only fall back to the primary source when no explicit preroll breaks are configured.
    // When cfg.breaks has explicit prerolls, those govern what plays; the primary source
    // should not be treated as an additional implicit preroll.
    const hasExplicitPrerolls = this.cfg.breaks.some((b) => b.at === 'preroll');
    if (!hasExplicitPrerolls) {
      const primary = this.getPrimaryVastLikeSource();
      if (primary?.src) {
        const b: AdsBreakConfig = {
          at: 'preroll' as BreakAt,
          source: { type: primary.type, src: primary.src },
          once: true,
        };
        const id = this.getBreakId(b);
        if (!this.playedBreaks.has(id)) return b;
      }
    }
    return undefined;
  }

  private shouldInterceptPreroll() {
    const pre = this.getPrerollBreak();
    if (!pre) return false;
    if (this.active || this.startingBreak) return false;

    const media = this.ctx.core.media;
    const t = media?.currentTime ?? 0;
    if (t > 0.25) return false;

    const id = this.getBreakId(pre);
    const once = pre.once !== false;
    if (once && this.playedBreaks.has(id)) return false;

    const s = this.ctx.state.current;
    if (s === 'ended') return false;
    return true;
  }

  private bindPrerollInterceptors() {
    const { events, core } = this.ctx;
    const media = core.media;

    /** Starts the deferred VMAP fetch (preload="none" path) on the first play intent.
     *  Must be called synchronously so vmapPending is true before we read it below. */
    const maybeStartDeferredVmap = () => {
      if (this.pendingVmapSrc && !this.vmapLoadPromise) {
        this.vmapPending = true;
        const src = this.pendingVmapSrc;
        this.pendingVmapSrc = undefined;
        this.vmapLoadPromise = this.loadVmapAndMerge([...this.resolvedBreaks], src);
      }
    };

    this.globalUnsubs.push(
      events.on('cmd:play', () => {
        // For preload="none": start the deferred VMAP fetch now, before capturing vmapPending,
        // so the eager-pause logic below sees vmapPending=true and halts content immediately.
        maybeStartDeferredVmap();

        // Capture flags synchronously before any async work.
        const vmapWasPending = this.vmapPending;
        const shouldInterceptNow = this.shouldInterceptPreroll();

        // Synchronous early pause:
        // - Known preroll: pause immediately.
        // - VMAP still loading (eager or deferred): pause so content doesn't advance while
        //   we wait; resume below if the VMAP turns out to have no preroll.
        if (shouldInterceptNow || (vmapWasPending && !this.active && !this.startingBreak)) {
          try {
            media.pause();
          } catch {
            // ignore
          }
        }
        void (async () => {
          if (this.vmapLoadPromise) await this.vmapLoadPromise.catch(() => undefined);
          if (!this.shouldInterceptPreroll()) {
            // Eagerly paused for VMAP but no preroll found — resume content.
            if (vmapWasPending && !shouldInterceptNow && !this.active && !this.startingBreak) {
              events.emit('cmd:play');
            }
            return;
          }
          this.userPlayIntent = !!core.userInteracted;
          let guard = 0;
          while (guard++ < 10) {
            const pre = this.getPrerollBreak();
            if (!pre) break;
            await this.startBreak(pre, 'preroll');
          }
        })();
      })
    );

    const onNativePlayCapture = () => {
      // Same deferred-VMAP trigger as the cmd:play handler (handles autoplay path where
      // the native play event fires without going through the EventBus cmd:play first).
      maybeStartDeferredVmap();

      // Capture flags synchronously before any async work.
      const vmapWasPending = this.vmapPending;
      const shouldInterceptNow = this.shouldInterceptPreroll();

      // Synchronous early pause inside the capture phase so that the browser's play
      // request is halted before any non-capture handlers run (important for autoplay).
      if (shouldInterceptNow || (vmapWasPending && !this.active && !this.startingBreak)) {
        try {
          media.pause();
        } catch {
          // ignore
        }
      }
      void (async () => {
        if (this.vmapLoadPromise) await this.vmapLoadPromise.catch(() => undefined);
        if (!this.shouldInterceptPreroll()) {
          // Eagerly paused for VMAP but no preroll found — resume content.
          if (vmapWasPending && !shouldInterceptNow && !this.active && !this.startingBreak) {
            events.emit('cmd:play');
          }
          return;
        }
        this.userPlayIntent = !!core.userInteracted;
        let guard = 0;
        while (guard++ < 10) {
          const pre = this.getPrerollBreak();
          if (!pre) break;
          await this.startBreak(pre, 'preroll');
        }
      })();
    };

    media.addEventListener('play', onNativePlayCapture, { capture: true });
    this.globalUnsubs.push(() => media.removeEventListener('play', onNativePlayCapture, { capture: true }));
  }

  private bindBreakScheduler() {
    const content = this.ctx.core.media;
    if (!content) return;

    const onTime = () => {
      if (this.active || this.startingBreak) return;
      const t = content.currentTime || 0;
      const due = this.getDueMidrollBreaks(t);
      if (!due.length) return;
      const earliestBreak = due[0];
      const earliestAt = earliestBreak.at as number;

      const vmapOffset = earliestBreak.timeOffset;
      const tol = this.cfg.breakTolerance ?? 0.25;

      const group = vmapOffset
        ? this.resolvedBreaks.filter(
            (b) =>
              typeof b.at === 'number' &&
              !this.playedBreaks.has(this.getBreakId(b)) &&
              b.timeOffset === vmapOffset &&
              Math.abs((b.at as number) - earliestAt) <= Math.max(1.0, tol)
          )
        : due.filter((b) => Math.abs((b.at as number) - earliestAt) <= tol);

      if (!group.length) return;

      if (group.length === 1) void this.startBreak(group[0], 'midroll');
      else void this.startBreakGroup(group, 'midroll');
    };
    content.addEventListener('timeupdate', onTime);
    this.globalUnsubs.push(() => content.removeEventListener('timeupdate', onTime));

    const onEnded = () => {
      if (this.active || this.startingBreak) return;
      void (async () => {
        if (this.vmapLoadPromise) await this.vmapLoadPromise.catch(() => undefined);

        while (!this.active && !this.startingBreak) {
          const post = this.getPostrollBreak();
          if (!post) break;

          this.ctx.events.emit('ads.mediaended', {
            break: { kind: 'postroll', id: this.getBreakId(post) },
            at: post.at,
          });

          await this.startBreak(post, 'postroll');
        }
      })();
    };
    content.addEventListener('ended', onEnded);
    this.globalUnsubs.push(() => content.removeEventListener('ended', onEnded));
  }

  private async startBreak(
    b: AdsBreakConfig,
    kind: 'preroll' | 'midroll' | 'postroll' | 'auto',
    opts?: { suppressResume?: boolean }
  ) {
    if (this.active || this.startingBreak) return;

    const id = this.getBreakId(b);
    const once = b.once !== false;
    if (once && this.playedBreaks.has(id)) return;

    // Waterfall: multiple sources configured — try each in order, stop on first success.
    const waterfallSources = b.sources;
    if (waterfallSources && waterfallSources.length > 1) {
      this.startingBreak = true;
      this.bus.emit('ads:break:start', { id, kind, at: b.at });
      try {
        for (let i = 0; i < waterfallSources.length; i++) {
          const src = waterfallSources[i];
          const isLastWaterfall = i === waterfallSources.length - 1;
          const input: VastInput = this.isXmlString(src.src)
            ? { kind: 'xml', value: src.src }
            : { kind: 'url', value: src.src };
          const success = await this.playBreakFromVast(
            input,
            { kind, id, sourceType: src.type as AdsSourceType },
            {
              suppressResumeOnError: !isLastWaterfall,
              suppressResumeOnSuccess: opts?.suppressResume,
            }
          );
          if (success) break; // first valid source played — stop
        }
        // Always mark as attempted to prevent infinite retry loops on broken sources.
        this.playedBreaks.add(id);
      } finally {
        this.startingBreak = false;
        this.bus.emit('ads:break:end', { id, kind, at: b.at });
      }
      return;
    }

    // Single source (or no explicit sources list): original behavior.
    const { input, sourceType } = this.getVastInputFromBreak(b);
    if (!input) return;

    this.startingBreak = true;
    this.bus.emit('ads:break:start', { id, kind, at: b.at });

    try {
      await this.playBreakFromVast(input, { kind, id, sourceType }, { suppressResumeOnSuccess: opts?.suppressResume });
      // Always mark as attempted to prevent infinite retry loops on broken sources.
      this.playedBreaks.add(id);
    } finally {
      this.startingBreak = false;
      this.bus.emit('ads:break:end', { id, kind, at: b.at });
    }
  }

  private async startBreakGroup(breaks: AdsBreakConfig[], kind: 'preroll' | 'midroll' | 'postroll' | 'auto') {
    // Filter out post-bumpers for midroll groups (bumpers that follow the main ad are skipped).
    let startedMain = false;
    const playable: AdsBreakConfig[] = [];
    for (const b of breaks) {
      if (kind === 'midroll') {
        const { input } = this.getVastInputFromBreak(b);
        const url = input?.kind === 'url' ? input.value : '';
        const isBumper = /bumper/i.test(url) || /bumper/i.test(b.id || '');

        if (isBumper && startedMain) {
          // Post-bumper: already played the main ad — mark played and skip.
          this.playedBreaks.add(this.getBreakId(b));
          continue;
        }
        if (!isBumper) startedMain = true;
      }
      playable.push(b);
    }

    // Play each break in sequence. For all but the last, suppress the content-resume so
    // we don't get a brief flash of the video player between consecutive ad breaks.
    for (let i = 0; i < playable.length; i++) {
      const isLast = i === playable.length - 1;
      await this.startBreak(playable[i], kind, { suppressResume: !isLast });
    }
  }

  private extractAdsFromParsed(parsed: any): any[] {
    const direct = parsed?.ads || parsed?.vastResponse?.ads;
    if (Array.isArray(direct) && direct.length) return direct;

    const adPods = parsed?.adPods || parsed?.vastResponse?.adPods || parsed?.vastResponse?.adpods;
    if (Array.isArray(adPods) && adPods.length) {
      const flattened: any[] = [];
      for (const pod of adPods) {
        const ads = pod?.ads || pod?.Ads;
        if (Array.isArray(ads)) flattened.push(...ads);
      }
      if (flattened.length) return flattened;
    }

    const singlePod = parsed?.adPod || parsed?.vastResponse?.adPod || parsed?.vastResponse?.adpod;
    const singleAds = singlePod?.ads || singlePod?.Ads;
    if (Array.isArray(singleAds) && singleAds.length) return singleAds;

    return [];
  }

  private collectPodAds(parsed: any): PodAd[] {
    const ads = this.extractAdsFromParsed(parsed);
    const out: PodAd[] = [];

    for (const ad of ads) {
      const creatives = ad?.creatives || ad?.Creatives || [];
      const seqRaw = ad?.sequence || ad?.attributes?.sequence || undefined;
      const seq = seqRaw != null ? Number(seqRaw) : undefined;

      for (let cidx = 0; cidx < creatives.length; cidx++) {
        const creative = creatives[cidx];

        const mediaFiles =
          creative?.mediaFiles ||
          creative?.MediaFiles ||
          creative?.linear?.mediaFiles ||
          creative?.Linear?.mediaFiles ||
          creative?.linear?.MediaFiles ||
          creative?.linear?.mediafiles ||
          [];
        const mf = this.pickBestMediaFile(mediaFiles);
        if (!mf) continue;

        const skipOffset = this.extractSkipOffsetFromCreative(creative);
        const companions = creative?.companionAds?.companions || creative?.companions || undefined;
        const nonLinears = creative?.nonLinearAds?.nonLinears || creative?.nonLinears || undefined;

        out.push({
          ad,
          creative,
          mediaFile: mf,
          sequence: Number.isFinite(seq) ? seq : undefined,
          creativeIndex: cidx,
          skipOffset,
          companions: Array.isArray(companions) ? companions : undefined,
          nonLinears: Array.isArray(nonLinears) ? nonLinears : undefined,
        });
      }
    }

    return out.sort((a, b) => {
      const as = a.sequence ?? Number.MAX_SAFE_INTEGER;
      const bs = b.sequence ?? Number.MAX_SAFE_INTEGER;
      if (as !== bs) return as - bs;
      const ac = a.creativeIndex ?? 0;
      const bc = b.creativeIndex ?? 0;
      return ac - bc;
    });
  }

  private collectPodAdsFromXml(doc: XMLDocument): PodAd[] {
    if (!doc) return [];
    const ads = Array.from(doc.getElementsByTagName('Ad'));
    const out: PodAd[] = [];

    for (const adEl of ads) {
      const seqAttr = adEl.getAttribute('sequence');
      const seq = seqAttr != null ? Number(seqAttr) : undefined;

      // Find first Inline Creative Linear per ad (best-effort).
      const creatives = Array.from(adEl.getElementsByTagName('Creative'));
      for (let cidx = 0; cidx < creatives.length; cidx++) {
        const cEl = creatives[cidx];
        const linearEl = cEl.getElementsByTagName('Linear')?.[0];
        if (!linearEl) continue;

        const skipOffset = linearEl.getAttribute('skipoffset') || linearEl.getAttribute('skipOffset') || undefined;

        const mediaFilesEl = linearEl.getElementsByTagName('MediaFiles')?.[0];
        if (!mediaFilesEl) continue;

        const mediaEls = Array.from(mediaFilesEl.getElementsByTagName('MediaFile'));
        const mediaFiles = mediaEls.map((m) => ({
          type: m.getAttribute('type') || '',
          mimeType: m.getAttribute('type') || '',
          bitrate: Number(m.getAttribute('bitrate') || 0),
          bitRate: Number(m.getAttribute('bitRate') || 0),
          width: Number(m.getAttribute('width') || 0),
          height: Number(m.getAttribute('height') || 0),
          fileURL: (m.textContent || '').trim(),
          url: (m.textContent || '').trim(),
          rawEl: m,
        }));

        const mf = this.pickBestMediaFile(mediaFiles);
        if (!mf) continue;

        out.push({
          ad: { id: adEl.getAttribute('id') || undefined },
          creative: { linear: { MediaFiles: mediaFiles } },
          mediaFile: mf,
          sequence: Number.isFinite(seq) ? seq : undefined,
          creativeIndex: cidx,
          skipOffset: skipOffset || undefined,
        });
      }
    }

    return out.sort((a, b) => {
      const as = a.sequence ?? Number.MAX_SAFE_INTEGER;
      const bs = b.sequence ?? Number.MAX_SAFE_INTEGER;
      if (as !== bs) return as - bs;
      const ac = a.creativeIndex ?? 0;
      const bc = b.creativeIndex ?? 0;
      return ac - bc;
    });
  }

  private clearAdTracks() {
    for (const el of this.adTrackEls) el.remove();
    this.adTrackEls = [];
  }

  private buildCaptionsFromVastMediaFileRaw(mediaFileRaw: any): CaptionResource[] {
    const ccFiles = this.extractClosedCaptions(mediaFileRaw);

    return ccFiles
      .map((f, i) => {
        const lang = f.language ? String(f.language) : '';
        const type = f.type ? String(f.type) : '';

        return {
          src: String(f.fileURL),
          kind: 'captions',
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

    const media = this.ctx?.core?.media;
    if (!media) return;

    const tracks = this.listCaptionTracks(media);
    if (!tracks.length) return;

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

  private extractSkipOffsetFromCreative(creative: any): string | undefined {
    const linear = creative?.linear || creative?.Linear || creative;

    // Some parsers expose numeric skipDelay instead of a timecode skipOffset.
    const skipDelay = linear?.skipDelay ?? linear?.skipdelay;
    if (typeof skipDelay === 'number' && Number.isFinite(skipDelay) && skipDelay >= 0) {
      return String(skipDelay);
    }

    // Best-effort: different parsers map VAST attributes differently.
    // We try common locations first, then fall back to a shallow key scan.
    const candidates: unknown[] = [
      linear?.skipOffset,
      linear?.skipoffset,
      linear?.attributes?.skipOffset,
      linear?.attributes?.skipoffset,
      linear?.attributes?.skipOffset?.value,
      linear?.attributes?.skipoffset?.value,
      linear?.attributes?.skipOffset?.['#text'],
      linear?.attributes?.skipoffset?.['#text'],
    ];

    // Shallow scan for skipOffset-like keys.
    if (linear && typeof linear === 'object') {
      for (const k of ['skipOffset', 'skipoffset', 'skipDelay', 'skipdelay']) {
        candidates.push((linear as any)[k]);

        candidates.push((linear as any)?.attributes?.[k]);
      }
    }

    const normalize = (raw: unknown): string | undefined => {
      if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return String(raw);
      if (typeof raw === 'string') {
        const s = raw.trim();
        return s ? s : undefined;
      }
      if (raw && typeof raw === 'object') {
        const obj = raw as { value?: unknown; '#text'?: unknown; text?: unknown };
        const v = obj.value ?? obj['#text'] ?? obj.text;
        if (typeof v === 'string') {
          const s = v.trim();
          return s ? s : undefined;
        }
      }
      return undefined;
    };

    for (const c of candidates) {
      const v = normalize(c);
      if (v) return v;
    }

    return undefined;
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
      this.onSkip?.();
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

  private setupSkipUIForPodItem(item: PodAd) {
    this.hideSkipUi();
    const v = this.adVideo;
    if (!v) return;

    const skipOffset = item.skipOffset ?? this.extractSkipOffsetFromCreative(item.creative);
    if (!skipOffset) {
      this.log('creative not skippable (no skipOffset/skipDelay)', { sequence: item.sequence });
      return;
    }
    this.log('creative skippable', skipOffset);

    this.skipOffsetRaw = skipOffset;
    this.ensureSkipDom();

    const update = () => {
      const dur = v.duration;
      const skipAt = this.computeSkipAtSeconds(skipOffset, dur);
      if (skipAt == null) return;
      this.skipAtSeconds = skipAt;

      const cur = v.currentTime || 0;
      const remaining = Math.max(0, skipAt - cur);
      if (this.skipWrap) this.skipWrap.style.display = 'block';
      if (this.skipBtn) {
        this.skipBtn.textContent = remaining <= 0.05 ? 'Skip Ad' : Math.ceil(remaining).toString();
        this.skipBtn.style.pointerEvents = remaining <= 0.05 ? 'auto' : 'none';
      }
    };

    v.addEventListener('timeupdate', update);
    v.addEventListener('loadedmetadata', update);
    update();

    this.sessionUnsubs.push(() => v.removeEventListener('timeupdate', update));
    this.sessionUnsubs.push(() => v.removeEventListener('loadedmetadata', update));
  }

  private onSkip() {
    this.requestSkip('button');
  }

  private requestSkip(reason: 'button' | 'close' | 'api' = 'api') {
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

    this.ctx.events.emit('ads.skipped', { break: brk, reason });
    this.ctx.events.emit('adsskipped', { break: brk, reason });

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
    this.skipWrap?.remove();
    this.skipWrap = undefined;
    this.skipBtn = undefined;
    this.companionWrap?.remove();
    this.nonLinearWrap?.remove();
    this.companionWrap = undefined;
    this.nonLinearWrap = undefined;
  }

  private mountCompanions(creative: any) {
    // Companion ads must render outside the player. If no container is provided,
    // do not render companions.
    const container = this.getCompanionContainer();
    if (!container) return;

    const companions =
      (creative?.type === 'companion' ? creative?.variations : undefined) || // @dailymotion/vast-client library path
      creative?.companionAds?.companions ||
      creative?.companions;
    if (!Array.isArray(companions) || companions.length === 0) return;

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__companions';
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
    container.appendChild(wrap);
    this.companionWrap = wrap;

    this.sessionUnsubs.push(() => wrap.remove());
  }

  private renderCompanion(companion: any): HTMLElement | null {
    const click =
      companion?.companionClickThroughURLTemplate ||
      companion?.clickThroughURLTemplate ||
      companion?.companionClickThrough ||
      companion?.clickThrough; // XML fallback path

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__companion';
    wrap.style.position = 'relative';
    wrap.style.cursor = click ? 'pointer' : 'default';

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
      img.src = String(staticRes?.url || staticRes?.uri || staticRes?.value || staticRes);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      node = img;
    } else if (iframeRes) {
      const ifr = document.createElement('iframe');
      ifr.src = String(iframeRes?.url || iframeRes?.uri || iframeRes?.value || iframeRes);
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
        const url = typeof click === 'string' ? click : click.url;
        this.safeWindowOpen(url);
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
    const ads = this.extractAdsFromParsed(parsed);
    const out: { ad: any; creative: any; nonLinear: any; sequence?: number }[] = [];

    for (const ad of ads) {
      const creatives = ad?.creatives || ad?.Creatives || [];
      for (const creative of creatives) {
        const raw =
          creative?.variations ?? // @dailymotion/vast-client: creative.type='nonlinear', items in variations[]
          creative?.nonLinearAds?.nonLinears ??
          creative?.nonLinearAds?.nonLinear ??
          creative?.NonLinearAds?.NonLinear ??
          creative?.nonLinears ??
          creative?.NonLinears ??
          undefined;

        // Library creative.type='nonlinear' keeps all non-linear items in variations[].
        // Don't pick up companion variations (type='companion') by mistake.
        if (raw === creative?.variations && creative?.type !== 'nonlinear') continue;

        const nonLinears = Array.isArray(raw) ? raw : raw ? [raw] : [];
        if (nonLinears.length === 0) continue;

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

  private collectNonLinearFromXml(doc: XMLDocument): XmlNonLinearItem[] {
    const out: XmlNonLinearItem[] = [];
    const pickText = (el: Element | null) => (el?.textContent || '').trim();

    // Namespace-agnostic helpers: many VAST/VMAP docs use namespaces/prefixes.
    const byLocalName = (root: ParentNode, localName: string): Element[] => {
      try {
        if ((root as any).getElementsByTagNameNS) {
          const els = (root as any).getElementsByTagNameNS('*', localName) as HTMLCollectionOf<Element>;
          const arr = Array.from(els);
          if (arr.length) return arr;
        }
      } catch {
        // ignore
      }

      try {
        return Array.from((root as any).getElementsByTagName(localName) as HTMLCollectionOf<Element>);
      } catch {
        return [];
      }
    };

    const firstChildText = (root: Element, localName: string): string => {
      const els = byLocalName(root, localName);
      return pickText(els[0] ?? null);
    };

    const companions: any[] = [];
    try {
      const compEls = byLocalName(doc, 'Companion');
      for (const c of compEls) {
        const w = Number(c.getAttribute('width') || 0);
        const h = Number(c.getAttribute('height') || 0);
        const staticRes = firstChildText(c, 'StaticResource');
        const click = firstChildText(c, 'CompanionClickThrough');
        if (!staticRes) continue;
        companions.push({
          width: w || undefined,
          height: h || undefined,
          staticResource: { value: staticRes },
          clickThrough: click || undefined,
        });
      }
    } catch {
      // ignore
    }

    const nlEls = byLocalName(doc, 'NonLinear');
    for (const nl of nlEls) {
      const w = Number(nl.getAttribute('width') || 0);
      const h = Number(nl.getAttribute('height') || 0);
      const minSuggestedDuration = nl.getAttribute('minSuggestedDuration') || undefined;
      const staticRes = firstChildText(nl, 'StaticResource');
      const iframeRes = firstChildText(nl, 'IFrameResource');
      const htmlRes = firstChildText(nl, 'HTMLResource');

      const click = firstChildText(nl, 'NonLinearClickThrough');

      const nonLinear: any = {
        width: w || undefined,
        height: h || undefined,
        minSuggestedDuration,
        staticResource: staticRes ? { value: staticRes } : undefined,
        iFrameResource: iframeRes ? { value: iframeRes } : undefined,
        htmlResource: htmlRes ? { value: htmlRes } : undefined,
        nonLinearClickThrough: click || undefined,
      };

      out.push({ nonLinear, companions: companions.length ? companions : undefined });
    }

    return out;
  }

  private async playNonLinearOnlyBreakFromXml(
    items: XmlNonLinearItem[],
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string }
  ) {
    this.ensureOverlayMounted();
    this.clearAdOverlays();
    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';
    this.active = true;

    let maxDuration = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.companions?.length) {
        this.mountCompanions({ companions: it.companions, companionAds: { companions: it.companions } });
      }

      this.ensureNonLinearDom();
      const el = this.renderNonLinear(it.nonLinear);
      if (el) this.nonLinearWrap!.appendChild(el);

      maxDuration = Math.max(maxDuration, this.nonLinearSuggestedDurationSeconds(it.nonLinear));

      this.bus.emit('ads:impression', { break: meta, index: i });
      this.bus.emit('ads:ad:start', { break: meta, index: i });
    }

    const start = Date.now();
    const dismiss = async () => {
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

      for (let i = 0; i < items.length; i++) this.bus.emit('ads:ad:end', { break: meta, index: i });

      this.clearSession();
      this.overlay.style.display = 'none';
      this.overlay.replaceChildren();
      this.active = false;
      this.currentBreakMeta = undefined;
    };

    void dismiss();
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

    // Allow non-linear ads to be mounted into a dedicated container. If not set,
    // default to the in-player ad media container (or the overlay).
    const parent = this.getNonLinearContainer() || this.adVideo?.parentElement || this.overlay;
    parent.appendChild(wrap);
    this.nonLinearWrap = wrap;

    this.sessionUnsubs.push(() => wrap.remove());
  }

  private renderNonLinear(nl: any): HTMLElement | null {
    const click =
      nl?.nonlinearClickThroughURLTemplate || // @dailymotion/vast-client uses lowercase 'nonlinear'
      nl?.nonLinearClickThroughURLTemplate ||
      nl?.clickThroughURLTemplate ||
      nl?.nonLinearClickThrough ||
      nl?.clickThrough;

    const container = document.createElement('div');
    container.className = 'op-ads__nonlinear-item';
    container.style.position = 'relative';
    container.style.maxWidth = '100%';
    container.style.cursor = click ? 'pointer' : 'default';

    const pickFirst = (v: any) => (Array.isArray(v) ? v[0] : v);
    const staticRes = pickFirst(nl?.staticResource ?? nl?.StaticResource ?? nl?.staticResources ?? nl?.StaticResources);
    const iframeRes = pickFirst(nl?.iFrameResource ?? nl?.IFrameResource ?? nl?.iFrameResources ?? nl?.IFrameResources);
    const htmlRes = pickFirst(nl?.htmlResource ?? nl?.HTMLResource ?? nl?.htmlResources ?? nl?.HTMLResources);

    let node: HTMLElement | null = null;

    if (staticRes) {
      const img = document.createElement('img');
      img.src = String(staticRes?.url || staticRes?.uri || staticRes?.value || staticRes);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      node = img;
    } else if (iframeRes) {
      const ifr = document.createElement('iframe');
      ifr.src = String(iframeRes?.url || iframeRes?.uri || iframeRes?.value || iframeRes);
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
        const url = typeof click === 'string' ? click : click.url;
        this.safeWindowOpen(url);
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
    const raw =
      (creative?.type === 'nonlinear' ? creative?.variations : undefined) ??
      creative?.nonLinearAds?.nonLinears ??
      creative?.nonLinearAds?.nonLinear ??
      creative?.NonLinearAds?.NonLinear ??
      creative?.nonLinears ??
      creative?.NonLinears ??
      undefined;
    const nonLinears = Array.isArray(raw) ? raw : raw ? [raw] : [];
    if (nonLinears.length === 0) return;

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
    this.ensureOverlayMounted();
    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';

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

      // Companions may live in a sibling creative (type='companion') within the same ad.
      const companionCreative =
        (item.ad?.creatives as any[] | undefined)?.find((c: any) => c?.type === 'companion') ?? item.creative;
      this.mountCompanions(companionCreative);
      this.ensureNonLinearDom();
      const el = this.renderNonLinear(item.nonLinear);
      if (el) this.nonLinearWrap!.appendChild(el);

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

      this.clearSession();
      this.overlay.style.display = 'none';
      this.overlay.replaceChildren();
      this.active = false;
      this.currentBreakMeta = undefined;
    };

    void dismiss();
  }

  private async mountAdVideo(contentMedia: HTMLMediaElement, mediaFile: NormalizedMediaFile) {
    this.ensureOverlayMounted();
    const root = this.overlay.parentElement as HTMLElement;

    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';

    this.contentMedia = contentMedia;
    this.captureActiveCaptionTrack(contentMedia);

    const v = document.createElement('video');
    v.className = 'op-ads__media';
    v.playsInline = true;
    const contentPreload = (contentMedia.getAttribute('preload') || contentMedia.preload || '').toLowerCase();
    const isAutoplayPath = !!contentMedia.autoplay || contentPreload === 'auto';

    // Always force-mute ads on the autoplay path until the user has explicitly interacted.
    // Using cached autoplay-support results here is unreliable: the probe runs against the
    // *content* element (which may carry MEI / prior-session permissions), but a freshly
    // created ad <video> must respect the same muted-until-interaction policy regardless.
    // Once the user unmutes (player:interacted + player.muted = false) the ad will follow.
    const forceMutedForPolicy = isAutoplayPath && !this.ctx.core.userInteracted;

    v.preload = contentPreload === 'none' ? 'metadata' : 'auto';
    v.controls = this.cfg.allowNativeControls;
    v.style.width = '100%';
    v.style.height = '100%';
    v.src = mediaFile.fileURL;

    try {
      v.load();
    } catch {
      // ignore
    }

    const desiredMuted = forceMutedForPolicy ? true : this.ctx.core.muted;
    const desiredVolume = forceMutedForPolicy ? 0 : this.ctx.core.volume;
    v.muted = desiredMuted;
    v.defaultMuted = desiredMuted;
    if (Number.isFinite(desiredVolume)) v.volume = Math.max(0, Math.min(1, desiredVolume));

    this.adEndPromise = new Promise((resolve) => {
      const done = () => resolve();

      const cleanupTakeover = () => {
        if (this.adVideo === v) {
          try {
            v.pause();
          } catch {
            // ignore
          }
          v.remove();
          this.adVideo = undefined;
        } else {
          v.remove();
        }
      };

      const onEnded = () => {
        this.ctx.events.emit('ended');
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

    // Browsers may pause media in background tabs; attempt to resume the active ad when returning to the tab.
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const cur = this.adVideo;
      if (!cur) return;
      if (!cur.paused || cur.ended) return;
      try {
        const p = cur.play?.();
        if (p && typeof p.catch === 'function') p.catch(() => undefined);
      } catch {
        // ignore
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    this.sessionUnsubs.push(() => document.removeEventListener('visibilitychange', onVisibility));

    this.clearAdTracks();
    this.adTrackEls = this.attachAdCaptionTracks(v, mediaFile.raw);
    this.sessionUnsubs.push(() => this.clearAdTracks());

    let overlayMgr: ReturnType<typeof getOverlayManager> | null = null;
    try {
      overlayMgr = getOverlayManager(this.ctx.core);
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
    } catch {
      /* Overlay manager unavailable – ad playback continues without UI overlay state. */
    }

    const updateOverlay = () => {
      if (!overlayMgr) return;
      const dur = v.duration;
      const cur = v.currentTime;
      if (!Number.isFinite(dur) || dur <= 0 || !Number.isFinite(cur)) return;

      overlayMgr.update(this.overlayId, {
        duration: dur,
        value: Math.max(0, dur - cur) + 1,
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
      events.on('cmd:play', () => {
        const wantsAutoplayPath = Boolean(this.contentMedia?.autoplay || this.contentMedia?.preload === 'auto');
        // Same reasoning as mountAdVideo: force-mute until first user interaction when on
        // the autoplay path, regardless of cached autoplay-support results.
        const shouldForceMute = !this.userPlayIntent && wantsAutoplayPath && !this.ctx.core.userInteracted;

        if (shouldForceMute) {
          this.forcedMuteUntilInteraction = true;
          try {
            if (v()) {
              v()!.muted = true;
              v()!.volume = 0;
            }
          } catch {
            // ignore
          }
        } else {
          this.forcedMuteUntilInteraction = false;
          try {
            if (v()) {
              v()!.muted = this.ctx.core.muted;
              v()!.volume = this.ctx.core.volume;
            }
          } catch {
            // ignore
          }
        }

        v()
          ?.play()
          .catch(() => {
            //
          });
      })
    );
    this.sessionUnsubs.push(events.on('cmd:pause', () => v()?.pause()));
    this.sessionUnsubs.push(
      events.on('cmd:setVolume', (x: any) => {
        const vol = Number(x);
        if (!Number.isFinite(vol) || !v()) return;
        if (this.syncingVolume) return;
        if (this.forcedMuteUntilInteraction) return;
        v()!.volume = vol;
      })
    );
    this.sessionUnsubs.push(
      events.on('cmd:setMuted', (x: any) => {
        if (!v()) return;
        if (this.syncingVolume) return;
        if (this.forcedMuteUntilInteraction && !this.ctx.core.userInteracted) {
          // Keep muted until interaction.
          v()!.muted = true;
          v()!.volume = 0;
          return;
        }
        v()!.muted = Boolean(x);
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
        this.ctx.events.emit('play');
        this.ctx.events.emit('ads.start', { break: meta });
        emitQuartile(0);
        emitDuration();
      } else if (lastPaused) {
        this.tracker?.trackResume?.();
        this.bus.emit('ads:resume', { break: meta });
        this.ctx.events.emit('ads.resume', { break: meta });
      }
      this.ctx.events.emit('playing');
      lastPaused = false;
    };

    const onPause = () => {
      if (started) this.tracker?.trackPause?.();
      lastPaused = true;
      this.bus.emit('ads:pause', { break: meta });
      this.ctx.events.emit('pause');
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
      if (Number.isFinite(vol) && vol !== lastVol) lastVol = vol;

      const muted = v.muted || v.volume === 0;
      this.bus.emit('ads:volumeChange', { break: meta, volume: vol, muted });
      this.ctx.events.emit('ads.volumeChange', { volume: vol, muted, break: meta });

      if (muted !== lastMuted) {
        lastMuted = muted;
        if (muted) {
          this.tracker?.trackMute?.();
          this.bus.emit('ads:mute', { break: meta });
        } else {
          this.tracker?.trackUnmute?.();
          this.bus.emit('ads:unmute', { break: meta });
        }
      }

      // If the user changed volume/mute using native controls during ads,
      // propagate that preference back to the main player so content + future breaks stay in sync.
      if (this.forcedMuteUntilInteraction && !this.ctx.core.userInteracted) return;
      if (this.syncingVolume) return;

      try {
        this.syncingVolume = true;
        this.ctx.core.muted = muted;
        if (Number.isFinite(vol)) this.ctx.core.volume = Math.max(0, Math.min(1, vol));
      } catch {
        // ignore
      } finally {
        this.syncingVolume = false;
      }
    };

    const onClick = (ev: PointerEvent) => {
      if (ev.defaultPrevented) return;
      const click = this.getClickThroughUrl();
      if (!click) return;
      const url = typeof click === 'string' ? click : click.url;
      this.safeWindowOpen(url);
      this.tracker?.trackClick?.();
      this.tracker?.trackClickThrough?.();
      this.bus.emit('ads:clickthrough', { break: meta, url: click });
      this.ctx.events.emit('ads.click', { break: meta, url: click });
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

  private safeWindowOpen(rawUrl: string) {
    try {
      const url = new URL(rawUrl, window.location.href);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      // ignore
    }
  }

  private ensureOverlayMounted() {
    const mount = this.resolveMount();

    if (mount instanceof HTMLElement) {
      const cs = window.getComputedStyle(mount);
      if (!cs.position || cs.position === 'static') {
        mount.style.position = 'relative';
      }
    }

    this.overlay.style.position = 'absolute';
    this.overlay.style.inset = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.zIndex = this.overlay.style.zIndex || '3';
    this.overlay.style.pointerEvents = 'auto';

    if (this.overlay.parentElement !== mount) mount.appendChild(this.overlay);
  }

  /**
   * Best-effort SIMID mounting helper.
   * Some ad servers provide multiple SIMID iframe URLs; we mount all of them.
   * This is intentionally permissive and does not block playback if the creative doesn't contain SIMID data.
   */
  tryMountSimidLayer(creative: any): void {
    const simid = creative?.simid ?? creative?.SIMID ?? creative?.simidLayer;
    const urlsRaw =
      simid?.urls ?? simid?.url ?? simid?.resources ?? simid?.iframeResources ?? creative?.simidUrls ?? null;

    const urls: string[] = Array.isArray(urlsRaw)
      ? urlsRaw.map((u) => String(u)).filter((u) => u.trim())
      : typeof urlsRaw === 'string'
        ? [urlsRaw].filter((u) => u.trim())
        : [];

    if (!urls.length) return;

    // Ensure overlay exists in the DOM before mounting.
    this.ensureOverlayMounted();

    let wrap = this.overlay.querySelector('.op-ads__simid') as HTMLDivElement | null;
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'op-ads__simid';
      wrap.style.position = 'absolute';
      wrap.style.inset = '0';
      wrap.style.pointerEvents = 'auto';
      this.overlay.appendChild(wrap);
    } else {
      wrap.innerHTML = '';
    }

    for (const url of urls) {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.setAttribute('title', 'SIMID');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      // Restrictive sandbox by default; allow-scripts for SIMID, and same-origin for common SIMID patterns.
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      wrap.appendChild(iframe);
    }
  }

  private async playBreakFromVast(
    input: VastInput,
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string; sourceType?: AdsSourceType },
    opts?: { suppressResumeOnError?: boolean; suppressResumeOnSuccess?: boolean }
  ): Promise<boolean> {
    if (this.active) return false;

    this.ensureOverlayMounted();

    const {
      events,
      leases,
      core: { media },
    } = this.ctx;

    const requestPayload = input.kind === 'url' ? input.value : '[xml]';
    this.bus.emit('ads:requested', requestPayload);
    this.log('requested', requestPayload, meta);
    this.resumeAfter = this.cfg.resumeContent && meta.kind !== 'postroll';

    const pauseAndAcquireLease = () => {
      // Pause the underlying media element as well as emitting the logical event.
      // Some integrations/tests rely on the element being paused immediately.
      try {
        media.pause();
      } catch {
        // ignore
      }

      events.emit('cmd:pause');

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

    let rawDoc: XMLDocument | null = null;

    // Lazy helper: fetch the raw VAST XML and build an XMLDocument for fallback use.
    // For URL inputs this MUST be called lazily (never before vastClient.get()) because
    // ad servers like GAM track impression opportunities by correlator: a pre-fetch would
    // consume the impression slot so the subsequent vastClient.get() sees an empty response.
    const loadRawDocBestEffort = async () => {
      if (rawDoc) return; // already loaded (e.g. from XML input path)
      try {
        const xmlText = await this.getVastXmlText(input);
        rawDoc = this.buildParsedForNonLinearFromXml(xmlText);
      } catch {
        rawDoc = null;
      }
    };

    try {
      let parsed: any;
      if (input.kind === 'url') {
        try {
          parsed = await this.vastClient.get(input.value);
        } catch (e) {
          // Primary fetch failed — try fetching the raw XML ourselves then parse it.
          await loadRawDocBestEffort();
          if (rawDoc) {
            parsed = await this.vastClient.parseVAST(rawDoc);
          } else {
            throw e;
          }
        }
      } else {
        // XML input: derive the raw doc from the value (no extra network call needed).
        const doc =
          typeof input.value === 'string'
            ? this.toXmlDocument(input.value)
            : input.value instanceof XMLDocument
              ? input.value
              : this.toXmlDocument(new XMLSerializer().serializeToString(input.value));
        rawDoc = doc;
        parsed = await this.vastClient.parseVAST(doc);
      }

      this.log('vast parsed', { ads: parsed?.ads?.length ?? 0, version: parsed?.version });

      const emitLoaded = (count: number) => {
        this.bus.emit('ads:loaded', { break: meta, count });
        this.ctx.events.emit('ads.loaded', { break: meta, count });
      };

      if (meta.sourceType === 'NONLINEAR') {
        const nonLinearItems = this.collectNonLinearCreatives(parsed);
        if (nonLinearItems.length) {
          emitLoaded(nonLinearItems.length);
          await this.playNonLinearOnlyBreak(parsed, meta);
          return true;
        }

        await loadRawDocBestEffort();
        if (rawDoc) {
          const xmlItems = this.collectNonLinearFromXml(rawDoc);
          if (xmlItems.length) {
            emitLoaded(xmlItems.length);
            await this.playNonLinearOnlyBreakFromXml(xmlItems, meta);
            return true;
          }
        }
      }

      let pod = this.collectPodAds(parsed);
      this.log('linear pod items', pod.length);

      if (!pod.length) {
        // Before touching the network, check whether the parsed response contains
        // non-linear creatives (overlay ads that play alongside content).
        // This avoids a second HTTP request for any non-linear VAST URL.
        const nonLinearItems = this.collectNonLinearCreatives(parsed);
        if (nonLinearItems.length) {
          emitLoaded(nonLinearItems.length);
          await this.playNonLinearOnlyBreak(parsed, meta);
          return true;
        }

        // Parsed gave nothing. Fetch the raw XML as a last resort: some GAM samples
        // return incomplete creative/media mappings via the library but valid XML.
        await loadRawDocBestEffort();
        if (rawDoc) {
          pod = this.collectPodAdsFromXml(rawDoc);
          this.log('linear pod items (xml fallback)', pod.length);

          if (!pod.length) {
            const xmlItems = this.collectNonLinearFromXml(rawDoc);
            if (xmlItems.length) {
              emitLoaded(xmlItems.length);
              await this.playNonLinearOnlyBreakFromXml(xmlItems, meta);
              return true;
            }
          }
        }
      }

      if (!pod.length) {
        this.warn('no playable ads found in VAST response');
        throw new Error('No playable ads found in VAST response');
      }

      emitLoaded(pod.length);
      if (!pauseAndAcquireLease()) return false;
      this.active = true;

      for (let i = 0; i < pod.length; i++) {
        const item = pod[i];
        this.bus.emit('ads:ad:start', { break: meta, index: i, sequence: item.sequence });
        this.clearSession();

        this.tracker = new VASTTracker(this.vastClient, item.ad, item.creative);
        this._lastCreative = item.creative;

        this.log('mount ad video', {
          url: item.mediaFile?.fileURL,
          type: item.mediaFile?.type,
          skipOffset: item.skipOffset,
        });
        this.mountAdVideo(media, item.mediaFile);
        const endPromise = this.waitForAdEnd();

        // Important: some VMAP pod samples contain more than one skippable ad.
        // Skip UI needs to be recomputed for each pod item.
        this.setupSkipUIForPodItem(item);
        this.log('skip ui', { raw: this.skipOffsetRaw, at: this.skipAtSeconds });
        this.mountCompanions(item.creative);
        this.mountNonLinear(item.creative);

        if (!this.cfg.allowNativeControls) this.bindAdSurfaceCommands();

        this.tracker?.trackImpression?.();
        this.bus.emit('ads:impression', { break: meta, index: i });

        this.bindTrackerAndTelemetry({ kind: meta.kind, breakId: meta.id });
        this.startAdPlayback();
        await endPromise;

        this.bus.emit('ads:ad:end', { break: meta, index: i, sequence: item.sequence });
      }

      this.bus.emit('ads:allAdsCompleted', { break: meta });
      this.ctx.events.emit('ads.allAdsCompleted', { break: meta });
      this.finish({
        resume: meta.kind !== 'postroll' && (this.userPlayIntent || this.resumeAfter),
        suppressResume: opts?.suppressResumeOnSuccess,
      });
      return true;
    } catch (err) {
      this.bus.emit('ads:error', err);
      this.ctx.events.emit('ads.error', { err });
      this.finish({
        resume: meta.kind !== 'postroll' && (this.userPlayIntent || this.resumeAfter),
        suppressResume: opts?.suppressResumeOnError,
      });
      return false;
    }
  }

  private waitForAdEnd(): Promise<void> {
    return this.adEndPromise || Promise.resolve();
  }

  private startAdPlayback() {
    const v = this.adVideo;
    this.ctx.events.emit('play');
    if (!v) return;

    // The ad video's muted state was set to the desired value in mountAdVideo.
    // In browsers, calling play() on an unmuted video requires a current user gesture.
    // Because we arrive here after one or more async hops (VAST fetch), the original
    // gesture may have expired. If unmuted play() is rejected by the browser, we fall
    // back to muted autoplay (universally allowed) so the ad is never silently dropped.
    const tryPlay = (muted: boolean): Promise<void> | undefined => {
      try {
        if (muted) {
          v.muted = true;
          v.volume = 0;
          this.forcedMuteUntilInteraction = true;
        }
        const p = v.play?.();
        return p && typeof p.then === 'function' ? (p as Promise<void>) : undefined;
      } catch {
        return undefined;
      }
    };

    const p = tryPlay(false);
    if (p) {
      p.catch(() => {
        // Unmuted play failed (autoplay policy). Retry muted so the ad isn't skipped.
        const p2 = tryPlay(true);
        if (p2) {
          p2.catch(() => {
            /* both failed – user must interact to play */
          });
        }
      });
    }
  }

  private clearSession() {
    for (const off of this.sessionUnsubs) off();
    this.sessionUnsubs = [];
    this.tracker = undefined;

    this.clearAdOverlays();
    this.removeAdCaptions();

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
      document.querySelectorAll('video.op-ads__media').forEach((n) => n?.parentNode?.removeChild?.(n) ?? n.remove?.());
    } catch {
      // ignore
    }

    this.adEndPromise = null;
    this.overlay.replaceChildren();
  }

  private finish(opts: { resume: boolean; suppressResume?: boolean }) {
    const { events, leases } = this.ctx;

    this.clearSession();
    if (this.contentMedia && this.contentHadControls) {
      this.contentMedia.setAttribute('controls', '');
    }
    this.contentMedia = undefined;
    this.contentHadControls = false;
    this.overlay.style.display = 'none';
    this.overlay.replaceChildren();

    leases.release('playback', this.name);

    this.active = false;
    const shouldResume = !!(opts.resume || this.userPlayIntent || this.resumeAfter);
    this.userPlayIntent = false;
    this.restoreActiveTextTrack();
    try {
      getOverlayManager(this.ctx.core).deactivate(this.overlayId);
    } catch {
      /* ignore – overlay manager may be unavailable in UMD setups */
    }

    if (!opts.suppressResume) {
      if (shouldResume) {
        events.emit('cmd:play');
      } else {
        events.emit('cmd:pause');
      }
    }
  }
}

export function installAds(PlayerCtor: any) {
  if (!PlayerCtor || !PlayerCtor.prototype) return;

  // Add `player.ads` getter (if not already installed)
  const adsDesc = Object.getOwnPropertyDescriptor(PlayerCtor.prototype, 'ads');
  if (!adsDesc) {
    Object.defineProperty(PlayerCtor.prototype, 'ads', {
      configurable: true,
      enumerable: false,
      get() {
        return this.getPlugin?.('ads');
      },
    });
  }

  // Add `player.playAds(input)` helper (URL or VAST XML string)
  if (typeof PlayerCtor.prototype.playAds !== 'function') {
    Object.defineProperty(PlayerCtor.prototype, 'playAds', {
      configurable: true,
      enumerable: false,
      value: function playAds(input: string) {
        const plugin = (this.getPlugin?.('ads') || this.ads) as AdsPlugin;
        if (!plugin) {
          throw new Error('Ads plugin not installed; cannot playAds()');
        }

        const s = String(input ?? '').trim();
        if (!s) throw new Error('playAds(input) requires a non-empty URL or VAST XML string');

        // Heuristic: XML strings usually start with "<"
        if (s.startsWith('<')) {
          if (typeof plugin.playAdsFromXml !== 'function') {
            throw new Error('Ads plugin does not support XML input (playAdsFromXml missing)');
          }
          return plugin.playAdsFromXml(s);
        }

        return plugin.playAds(s);
      },
    });
  }
}

export function extendAds(player: any, plugin: AdsPlugin) {
  if (!player) return;
  if (typeof player.extend === 'function') {
    player.extend({ ads: plugin });
  } else if (player.ads === undefined) {
    player.ads = plugin;
  }
}
