import VMAP from '@dailymotion/vmap';
import type { PluginContext } from '@openplayerjs/core';
import type { AdsBreakConfig, AdsPluginConfig, AdsSource, AdsSourceType, VastInput } from './types';

// ─── Standalone utility exports (no class state needed) ───────────────────────

export function normalizeVmapAdSourceFn(adSource: any): any | undefined {
  if (!adSource) return undefined;
  if (Array.isArray(adSource)) {
    return adSource.find((s) => s?.adTagURI || s?.vastAdData) || adSource[0];
  }
  return adSource;
}

export function extractVastTagUriFn(adTagURI: any): string | undefined {
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

export function parseVmapTimeOffsetFn(timeOffset: any): {
  at: 'preroll' | 'postroll' | number;
  pendingPercent?: number | null;
} {
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
    if ([hh, mm, ss].every((x) => Number.isFinite(x))) return { at: hh * 3600 + mm * 60 + ss };
  }

  const n = Number(s);
  if (Number.isFinite(n) && n >= 0) return { at: n };

  return { at: 'preroll' };
}

export function getVastInputFromBreakFn(b: AdsBreakConfig): { input?: VastInput; sourceType?: AdsSourceType } {
  const isXml = (src: string) => src.trim().startsWith('<');
  if (b.source && typeof b.source.src === 'string' && b.source.src.trim()) {
    const src = b.source.src.trim();
    const t = b.source.type as AdsSourceType;
    return isXml(src)
      ? { input: { kind: 'xml', value: src }, sourceType: t }
      : { input: { kind: 'url', value: src }, sourceType: t };
  }
  const firstSource = Array.isArray(b.sources) ? b.sources[0] : undefined;
  if (firstSource && typeof firstSource.src === 'string' && firstSource.src.trim()) {
    const src = firstSource.src.trim();
    const t = firstSource.type as AdsSourceType;
    return isXml(src)
      ? { input: { kind: 'xml', value: src }, sourceType: t }
      : { input: { kind: 'url', value: src }, sourceType: t };
  }
  return { input: undefined, sourceType: undefined };
}

export function getBreakIdFn(b: AdsBreakConfig): string {
  if (b.id) return b.id;
  const { input, sourceType } = getVastInputFromBreakFn(b);
  const key = input?.kind === 'url' ? input.value : 'xml';
  return `${String(b.at)}:${sourceType || 'VAST'}:${key}`;
}

type PendingPercentBreak = {
  id: string;
  percent: number;
  once: boolean;
  source: AdsSource;
};

export class AdScheduler {
  resolvedBreaks: AdsBreakConfig[] = [];
  pendingPercentBreaks: PendingPercentBreak[] = [];
  playedBreaks = new Set<string>();
  vmapPending = false;
  vmapLoadPromise: Promise<void> | null = null;
  pendingVmapSrc?: string;

  constructor(
    private cfg: Pick<
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
      'sources' | 'breaks' | 'adSourcesMode' | 'breakTolerance' | 'debug'
    > & { sources: AdsSource[] },
    private ctx: PluginContext,
    private warn: (...args: any[]) => void,
    private onVmapError: (err: unknown) => void
  ) {}

  isXmlString(src: string): boolean {
    return src.trim().startsWith('<');
  }

  getSource(type: AdsSourceType): AdsSource | undefined {
    return (this.cfg.sources || []).find((s) => s.type === type && typeof s.src === 'string' && s.src.trim());
  }

  getPrimaryVastLikeSource(): AdsSource | undefined {
    return this.getSource('VAST') || this.getSource('NONLINEAR');
  }

  inferSourceTypeForUrl(url: string): 'NONLINEAR' | undefined {
    const sources = this.cfg.sources || [];
    const exact = sources.find((s) => s.src === url);
    if (exact?.type === 'NONLINEAR') return 'NONLINEAR';
    if (sources.length > 0 && sources.every((s) => s.type === 'NONLINEAR')) return 'NONLINEAR';
    return undefined;
  }

  getVastInputFromBreak(b: AdsBreakConfig): { input?: VastInput; sourceType?: AdsSourceType } {
    if (b.source && typeof b.source.src === 'string' && b.source.src.trim()) {
      const src = b.source.src.trim();
      const t = b.source.type as AdsSourceType;
      return this.isXmlString(src)
        ? { input: { kind: 'xml', value: src }, sourceType: t }
        : { input: { kind: 'url', value: src }, sourceType: t };
    }

    const firstSource = Array.isArray(b.sources) ? b.sources[0] : undefined;
    if (firstSource && typeof firstSource.src === 'string' && firstSource.src.trim()) {
      const src = firstSource.src.trim();
      const t = firstSource.type as AdsSourceType;
      return this.isXmlString(src)
        ? { input: { kind: 'xml', value: src }, sourceType: t }
        : { input: { kind: 'url', value: src }, sourceType: t };
    }

    return { input: undefined, sourceType: undefined };
  }

  getBreakId(b: AdsBreakConfig): string {
    if (b.id) return b.id;
    const { input, sourceType } = this.getVastInputFromBreak(b);
    const key = input?.kind === 'url' ? input.value : 'xml';
    return `${String(b.at)}:${sourceType || 'VAST'}:${key}`;
  }

  getPrerollBreak(): AdsBreakConfig | undefined {
    for (const b of this.resolvedBreaks) {
      if (b.at !== 'preroll') continue;
      if (!this.getVastInputFromBreak(b).input) continue;
      const id = this.getBreakId(b);
      if (b.once !== false && this.playedBreaks.has(id)) continue;
      return b;
    }

    for (const b of this.cfg.breaks) {
      if (b.at !== 'preroll') continue;
      if (!this.getVastInputFromBreak(b).input) continue;
      const id = this.getBreakId(b);
      if (b.once !== false && this.playedBreaks.has(id)) continue;
      return b;
    }

    const hasExplicitPrerolls = this.cfg.breaks.some((b) => b.at === 'preroll');
    if (!hasExplicitPrerolls) {
      const primary = this.getPrimaryVastLikeSource();
      if (primary?.src) {
        const b: AdsBreakConfig = { at: 'preroll', source: { type: primary.type, src: primary.src }, once: true };
        const id = this.getBreakId(b);
        if (!this.playedBreaks.has(id)) return b;
      }
    }
    return undefined;
  }

  getPostrollBreak(): AdsBreakConfig | undefined {
    for (const b of this.resolvedBreaks) {
      if (b.at !== 'postroll') continue;
      if (!this.getVastInputFromBreak(b).input) continue;
      const id = this.getBreakId(b);
      if (b.once !== false && this.playedBreaks.has(id)) continue;
      return b;
    }
    return undefined;
  }

  getDueMidrollBreaks(currentTime: number): AdsBreakConfig[] {
    const media = this.ctx.core.media;
    if (Number.isFinite(media.duration) && media.duration > 0 && this.pendingPercentBreaks.length) {
      const duration = media.duration;
      const toAdd: AdsBreakConfig[] = [];
      for (const pb of this.pendingPercentBreaks) {
        const atSec = duration * pb.percent;
        toAdd.push({ id: pb.id, at: atSec, once: pb.once, source: pb.source });
      }
      this.pendingPercentBreaks = [];
      this.resolvedBreaks.push(...toAdd);
    }

    const due: AdsBreakConfig[] = [];
    for (const b of this.resolvedBreaks) {
      if (typeof b.at !== 'number') continue;
      if (!this.getVastInputFromBreak(b).input) continue;
      const id = this.getBreakId(b);
      if (b.once !== false && this.playedBreaks.has(id)) continue;
      if (currentTime + (this.cfg.breakTolerance ?? 0.25) >= b.at) due.push(b);
    }
    due.sort((a, b) => (a.at as number) - (b.at as number));
    return due;
  }

  getDueMidrollBreak(currentTime: number): AdsBreakConfig | undefined {
    return this.getDueMidrollBreaks(currentTime)[0];
  }

  rebuild() {
    const combined: AdsBreakConfig[] = [...(this.cfg.breaks || [])];

    if (combined.length === 0) {
      const vastLikeSources = this.cfg.sources.filter(
        (s) => (s.type === 'VAST' || s.type === 'NONLINEAR') && s.src?.trim()
      );

      if (vastLikeSources.length > 0) {
        if (this.cfg.adSourcesMode === 'playlist') {
          for (const src of vastLikeSources) {
            combined.push({ at: 'preroll', source: { type: src.type, src: src.src }, once: true });
          }
        } else if (vastLikeSources.length > 1) {
          combined.push({ at: 'preroll', source: vastLikeSources[0], sources: vastLikeSources, once: true });
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
        this.pendingVmapSrc = vmap.src;
      } else {
        this.vmapPending = true;
        this.vmapLoadPromise = this.loadVmapAndMerge(combined, vmap.src);
      }
    }

    this.resolvedBreaks = combined;
  }

  normalizeVmapAdSource(adSource: any): any | undefined {
    if (!adSource) return undefined;
    if (Array.isArray(adSource)) {
      return adSource.find((s) => s?.adTagURI || s?.vastAdData) || adSource[0];
    }
    return adSource;
  }

  extractVastTagUri(adTagURI: any): string | undefined {
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

  parseVmapTimeOffset(timeOffset: any): { at: 'preroll' | 'postroll' | number; pendingPercent?: number | null } {
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
      if ([hh, mm, ss].every((x) => Number.isFinite(x))) return { at: hh * 3600 + mm * 60 + ss };
    }

    const n = Number(s);
    if (Number.isFinite(n) && n >= 0) return { at: n };

    return { at: 'preroll' };
  }

  async loadVmapAndMerge(existing: AdsBreakConfig[], vmapSrc?: string) {
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
      const prevPendingCount = this.pendingPercentBreaks.length;

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

      const libBreakCount = vmapBreaks.length + (this.pendingPercentBreaks.length - prevPendingCount);
      const libraryUnderCounted = rawAdBreakCount > 0 && libBreakCount < rawAdBreakCount;
      if (libraryUnderCounted) {
        vmapBreaks.length = 0;
        this.pendingPercentBreaks.splice(prevPendingCount);
      }

      if (vmapBreaks.length === 0 && this.pendingPercentBreaks.length === prevPendingCount) {
        this.parseVmapFallback(xmlDoc, vmapBreaks, prevPendingCount);
      }

      this.resolvedBreaks = [...existing, ...vmapBreaks];
    } catch (err) {
      this.warn('VMAP load/parse failed', err);
      this.onVmapError(err);
    } finally {
      this.vmapPending = false;
    }
  }

  private parseVmapFallback(xmlDoc: XMLDocument, vmapBreaks: AdsBreakConfig[], _prevPendingCount: number) {
    const byTag = (root: ParentNode, localName: string): Element[] => {
      try {
        const ns = (root as any).getElementsByTagNameNS?.('*', localName) as HTMLCollectionOf<Element> | undefined;
        if (ns && ns.length) return Array.from(ns);
      } catch {
        /* ignore */
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

  reset() {
    this.playedBreaks.clear();
    this.vmapLoadPromise = null;
    this.vmapPending = false;
    this.pendingVmapSrc = undefined;
    this.pendingPercentBreaks = [];
    this.resolvedBreaks = [];
  }
}
