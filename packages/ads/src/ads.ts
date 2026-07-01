import type { PlayerPlugin, PluginContext } from '@openplayerjs/core';
import { AdDomManager, setSafeHTMLFn } from './ad-dom';
import {
  extractVastTagUriFn,
  getBreakIdFn,
  getVastInputFromBreakFn,
  normalizeVmapAdSourceFn,
  parseVmapTimeOffsetFn,
} from './schedule';
import { CsaiAdStrategy } from './strategies/csai';
import { HybridAdStrategy } from './strategies/hybrid';
import { SsaiAdStrategy } from './strategies/ssai';
import type {
  AdSessionStrategy,
  AdsBreakConfig,
  AdsEvent,
  AdsPluginConfig,
  AdsSource,
  AdsSourceType,
  ScteOutCue,
  ScteSource,
  VastInput,
  VastParsed,
} from './types';
import {
  collectNonLinearCreatives,
  collectNonLinearFromXml,
  collectPodAds,
  computeSkipAtSeconds,
  getVastXmlText,
  toXmlDocument,
} from './vast-parser';

export type { AdsBreakConfig, AdsEvent, AdsPluginConfig, AdsSource, AdsSourceType };

/**
 * `AdsPlugin` — thin dispatcher for ad delivery strategies.
 *
 * Selects an `AdSessionStrategy` based on `config.adDelivery` and delegates
 * all lifecycle calls to it. Strategy selection:
 *
 * | `adDelivery` value | Strategy | Description |
 * |--------------------|----------|-------------|
 * | `'csai'` (default) | `CsaiAdStrategy` | Client-side insertion — fetches VAST/VMAP, renders an ad `<video>` |
 * | `'ssai'` | `SsaiAdStrategy` | Server-side stitching — detects boundaries via SCTE-35 TextTrack cues |
 * | `'hybrid'` | `HybridAdStrategy` | CSAI triggered by SCTE-35 OUT cues from the HLS engine |
 *
 * Auto-selection: if `scteSource` or `hybrid.scteSource` is provided without
 * an explicit `adDelivery`, the mode defaults to `'hybrid'`.
 *
 * @example CSAI with preroll
 * ```ts
 * new AdsPlugin({
 *   breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://example.com/vast.xml' } }],
 * });
 * ```
 *
 * @example SSAI with event sink
 * ```ts
 * new AdsPlugin({
 *   adDelivery: 'ssai',
 *   ssai: { eventSink: (e) => console.log(e.type, e.breakId) },
 * });
 * ```
 *
 * @example Hybrid CSAI + SCTE-35
 * ```ts
 * new AdsPlugin({
 *   adDelivery: 'hybrid',
 *   hybrid: {
 *     scteSource: hlsEngine,
 *     resolveScteUrl: (cue) => `https://ads.example.com/vast?id=${cue.id}`,
 *   },
 * });
 * ```
 */
export class AdsPlugin implements PlayerPlugin {
  name = 'ads';
  version = '1.0.0';
  capabilities = ['ads'];

  private readonly rawConfig: AdsPluginConfig;
  private strategy?: AdSessionStrategy;
  private scteUnsub?: () => void;

  constructor(config: AdsPluginConfig = {}) {
    this.rawConfig = config;
  }

  setup(ctx: PluginContext): void {
    const cfg = this.rawConfig;
    const hasScteSource = !!(cfg.hybrid?.scteSource ?? cfg.scteSource);
    const mode = cfg.adDelivery ?? (hasScteSource ? 'hybrid' : 'csai');

    if (mode === 'ssai') {
      this.strategy = new SsaiAdStrategy();
    } else if (mode === 'hybrid') {
      this.strategy = new HybridAdStrategy();
    } else {
      this.strategy = new CsaiAdStrategy();
    }

    this.strategy.init(ctx, cfg);

    // Install dispatch proxies so that scheduler-initiated calls go through
    // AdsPlugin's own methods — enabling jest.spyOn(plugin, 'startBreak') etc.
    if (this.csai) {
      this.csai._dispatchStartBreak = (b, kind, opts) => this.startBreak(b, kind, opts);
      this.csai._dispatchStartBreakGroup = (breaks, kind) => this.startBreakGroup(breaks, kind);
      this.csai._dispatchPlayBreakFromVast = (...args) => this.playBreakFromVast(...args);
      this.csai._dispatchGetVastXmlText = (...args) => Promise.resolve(this.getVastXmlText(...args));
      this.csai._dispatchBuildParsedForNonLinear = (...args) => this.buildParsedForNonLinearFromXml(...args);
      this.csai._dispatchMountAdVideo = (...args) => this.mountAdVideo(...args);
      this.csai._dispatchStartAdPlayback = () => this.startAdPlayback();
    }

    if (mode !== 'ssai') {
      const scteSource = cfg.hybrid?.scteSource ?? cfg.scteSource;
      const resolveUrl = cfg.hybrid?.resolveScteUrl ?? cfg.resolveScteUrl;
      if (scteSource && resolveUrl) this.bindScteSource(scteSource, resolveUrl);
    }
  }

  async playAds(vastUrl: string): Promise<boolean> {
    const sourceType = this.csai?.scheduler?.inferSourceTypeForUrl(vastUrl);
    return this.playBreakFromVast({ kind: 'url', value: vastUrl }, { kind: 'manual', id: 'manual', sourceType });
  }

  async playAdsFromXml(vastXml: string): Promise<boolean> {
    return this.playBreakFromVast({ kind: 'xml', value: vastXml }, { kind: 'manual', id: 'manual' });
  }

  getDueMidrollBreaks(currentTime: number): AdsBreakConfig[] {
    return this.strategy?.getDueMidrollBreaks?.(currentTime) ?? [];
  }

  getDueMidrollBreak(currentTime: number): AdsBreakConfig | undefined {
    return this.strategy?.getDueMidrollBreak?.(currentTime);
  }

  requestSkip(reason: 'button' | 'close' | 'api' = 'api'): void {
    this.strategy?.requestSkip?.(reason);
  }

  destroy(): void {
    this.scteUnsub?.();
    this.scteUnsub = undefined;
    this.strategy?.destroy();
    this.strategy = undefined;
  }

  private bindScteSource(
    source: ScteSource,
    resolveUrl: (cue: ScteOutCue) => string | null | undefined | Promise<string | null | undefined>
  ): void {
    const prev = source.onCue;
    source.onCue = (cue) => {
      prev?.(cue);
      void Promise.resolve(resolveUrl(cue)).then((url) => {
        if (url) void this.playAds(url);
      });
    };
    this.scteUnsub = () => {
      source.onCue = prev;
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private get csai(): CsaiAdStrategy | undefined {
    return this.strategy instanceof CsaiAdStrategy ? this.strategy : undefined;
  }

  // Lazy AdDomManager used by dom delegates when no strategy is set up yet (test-only).
  private _lazyDom?: AdDomManager;
  private get lazyDom(): AdDomManager {
    if (!this._lazyDom) {
      const overlay = document.createElement('div');
      this._lazyDom = new AdDomManager(
        overlay,
        this.rawConfig,
        () => undefined,
        () => undefined,
        () => {}
      );
    }
    return this._lazyDom;
  }

  // Internal field forwarders — test access only, not part of the public API.
  /** @internal */ get bus() {
    return this.csai?.bus;
  }
  /** @internal */ get tracker() {
    return this.csai?.tracker;
  }
  /** @internal */ get active() {
    return this.csai?.active;
  }
  /** @internal */ set active(v: boolean | undefined) {
    if (this.csai && v !== undefined) this.csai.active = v;
  }
  /** @internal */ get overlay() {
    return this.csai?.overlay;
  }
  /** @internal */ get ctx() {
    return this.csai?.ctx;
  }
  /** @internal */ get sessionUnsubs() {
    return this.csai?.sessionUnsubs;
  }
  /** @internal */ set sessionUnsubs(v: (() => void)[] | undefined) {
    if (this.csai && v !== undefined) this.csai.sessionUnsubs = v;
  }
  /** @internal */ get resumeAfter() {
    return this.csai?.resumeAfter;
  }
  /** @internal */ get globalUnsubs() {
    return this.csai?.globalUnsubs ?? [];
  }
  /** @internal */ get adVideo() {
    return this.csai?.adVideo;
  }
  /** @internal */ set adVideo(v: HTMLVideoElement | undefined) {
    if (this.csai) this.csai.adVideo = v;
  }
  /** @internal */ get forcedMuteUntilInteraction() {
    return this.csai?.forcedMuteUntilInteraction ?? false;
  }
  /** @internal */ set forcedMuteUntilInteraction(v: boolean) {
    if (this.csai) this.csai.forcedMuteUntilInteraction = v;
  }
  /** @internal */ clearSession() {
    return this.csai?.clearSession();
  }
  /** @internal */ startAdPlayback() {
    return this.csai?.startAdPlayback();
  }
  /** @internal */ mountAdVideo(...args: Parameters<CsaiAdStrategy['_dispatchMountAdVideo']>) {
    // `mountAdVideo` is private on the strategy; reach it via a typed handle for delegation.
    const csai = this.csai as unknown as { mountAdVideo: CsaiAdStrategy['_dispatchMountAdVideo'] } | undefined;
    return csai?.mountAdVideo(...args);
  }
  /** @internal */ get vastClient() {
    return this.csai?.vastClient;
  }
  /** @internal */ set vastClient(v: VastParsed) {
    if (this.csai) this.csai.vastClient = v;
  }
  /** @internal */ shouldInterceptPreroll() {
    return this.csai?.shouldInterceptPreroll();
  }
  /** @internal */ startBreak(...args: Parameters<CsaiAdStrategy['startBreak']>): Promise<void> {
    return this.csai?.startBreak(...args) ?? Promise.resolve();
  }
  /** @internal */ startBreakGroup(...args: Parameters<CsaiAdStrategy['startBreakGroup']>): Promise<void> {
    return this.csai?.startBreakGroup(...args) ?? Promise.resolve();
  }
  /** @internal */ async playBreakFromVast(...args: Parameters<CsaiAdStrategy['playBreakFromVast']>): Promise<boolean> {
    if (!this.csai) return false;
    return await this.csai.playBreakFromVast(...args);
  }

  // ─── @internal delegates ─────────────────────────────────────────────────
  //
  // These exist for test access to internal scheduler / dom / captionMgr state.
  // They are NOT part of the public API.

  // Standalone pure utilities (no strategy state required):
  /** @internal */ getVastXmlText(input: VastInput) {
    return getVastXmlText(input);
  }
  /** @internal */ normalizeVmapAdSource(adSource: unknown) {
    return normalizeVmapAdSourceFn(adSource);
  }
  /** @internal */ extractVastTagUri(adTagURI: unknown) {
    return extractVastTagUriFn(adTagURI);
  }
  /** @internal */ parseVmapTimeOffset(timeOffset: unknown) {
    return parseVmapTimeOffsetFn(timeOffset);
  }
  /** @internal */ getVastInputFromBreak(b: AdsBreakConfig) {
    return getVastInputFromBreakFn(b);
  }
  /** @internal */ setSafeHTML(el: HTMLElement, html: string) {
    return setSafeHTMLFn(el, html);
  }
  /** @internal */ collectNonLinearCreatives(parsed: VastParsed) {
    return collectNonLinearCreatives(parsed);
  }
  /** @internal */ collectNonLinearFromXml(doc: XMLDocument) {
    return collectNonLinearFromXml(doc);
  }
  /** @internal */ buildParsedForNonLinearFromXml(xmlText: string) {
    return toXmlDocument(xmlText);
  }
  /** @internal */ computeSkipAtSeconds(skipOffset: string | undefined, duration: number) {
    return computeSkipAtSeconds(skipOffset, duration);
  }
  /** @internal */ collectPodAds(parsed: VastParsed) {
    return collectPodAds(parsed, this.csai?.cfg?.preferredMediaTypes ?? []);
  }

  // Scheduler delegates (require CSAI strategy):
  /** @internal */ getPrerollBreak() {
    return this.csai?.getPrerollBreak();
  }
  /** @internal */ getBreakId(b: AdsBreakConfig) {
    return this.csai?.getBreakId(b) ?? getBreakIdFn(b);
  }
  /** @internal */ async loadVmapAndMerge(existing: AdsBreakConfig[], src?: string) {
    return this.csai?.loadVmapAndMerge(existing, src);
  }

  // Scheduler state accessors:
  /** @internal */ get resolvedBreaks() {
    return this.csai?.resolvedBreaks;
  }
  /** @internal */ set resolvedBreaks(v: AdsBreakConfig[] | undefined) {
    if (this.csai && v !== undefined) this.csai.resolvedBreaks = v;
  }
  /** @internal */ get pendingPercentBreaks() {
    return this.csai?.pendingPercentBreaks;
  }
  /** @internal */ set pendingPercentBreaks(v: CsaiAdStrategy['pendingPercentBreaks'] | undefined) {
    if (this.csai && v !== undefined) this.csai.pendingPercentBreaks = v;
  }
  /** @internal */ get playedBreaks() {
    return this.csai?.playedBreaks;
  }
  /** @internal */ get vmapPending() {
    return this.csai?.vmapPending;
  }
  /** @internal */ get vmapLoadPromise() {
    return this.csai?.vmapLoadPromise;
  }
  /** @internal */ get pendingVmapSrc() {
    return this.csai?.pendingVmapSrc;
  }
  /** @internal */ isXmlString(src: string) {
    return this.csai?.isXmlString(src);
  }

  // Dom delegates:
  /** @internal */ ensureOverlayMounted() {
    return this.csai?.ensureOverlayMounted();
  }
  /** @internal */ mountCompanions(creative: VastParsed) {
    return (this.csai?.dom ?? this.lazyDom).mountCompanions(creative);
  }
  /** @internal */ renderCompanion(companion: VastParsed) {
    return (this.csai?.dom ?? this.lazyDom).renderCompanion(companion);
  }
  /** @internal */ renderNonLinear(nl: VastParsed) {
    return (this.csai?.dom ?? this.lazyDom).renderNonLinear(nl);
  }

  // Caption delegates:
  /** @internal */ ensureRawCaptions(mediaFileRaw: VastParsed, creative?: VastParsed) {
    return this.csai?.ensureRawCaptions(mediaFileRaw, creative);
  }
  /** @internal */ attachAdCaptionTracks(adVideo: HTMLVideoElement, raw: VastParsed, creative?: VastParsed) {
    return this.csai?.attachAdCaptionTracks(adVideo, raw, creative);
  }
}

// Re-export helpers for backwards-compatibility (they now live in install.ts).
export { extendAds, installAds } from './install';
