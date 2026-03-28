import { VASTClient, VASTTracker } from '@dailymotion/vast-client';
import type { PluginContext } from '@openplayerjs/core';
import { getOverlayManager } from '@openplayerjs/core';

import { AdDomManager } from '../ad-dom';
import { CaptionManager } from '../caption-manager';
import { OmidSession } from '../omid';
import { AdScheduler, getBreakIdFn } from '../schedule';
import { SimidSession } from '../simid';
import type {
  AdDeliveryMode,
  AdSessionStrategy,
  AdsBreakConfig,
  AdsEvent,
  AdsPluginConfig,
  AdsSource,
  AdsSourceType,
  CsaiAdConfig,
  ScteSource,
  VastInput,
} from '../types';
import { PluginBus } from '../types';
import {
  collectNonLinearCreatives,
  collectNonLinearFromXml,
  collectPodAds,
  collectPodAdsFromXml,
  computeSkipAtSeconds,
  extractAdVerifications,
  extractSimidUrl,
  getVastXmlText,
  toXmlDocument,
} from '../vast-parser';

// ─── Normalized internal config ───────────────────────────────────────────────

export type NormalizedCsaiConfig = {
  sources: AdsSource[];
  breaks: AdsBreakConfig[];
  interceptPlayForPreroll: boolean;
  autoPlayOnReady: boolean;
  allowNativeControls: boolean;
  resumeContent: boolean;
  preferredMediaTypes: string[];
  debug: boolean;
  breakTolerance: number;
  adSourcesMode: 'waterfall' | 'playlist';
  omid: { accessMode?: 'domain' | 'limited' };
  labels: { skip?: string; advertisement?: string; adEnded?: string };
  adDelivery: AdDeliveryMode;
  mountEl?: HTMLElement;
  mountSelector?: string;
  nonLinearContainer?: HTMLElement;
  nonLinearSelector?: string;
  companionContainer?: HTMLElement;
  companionSelector?: string;
  requestInterceptor?: AdsPluginConfig['requestInterceptor'];
  eventSink?: AdsPluginConfig['eventSink'];
  scteSource?: ScteSource;
  resolveScteUrl?: AdsPluginConfig['resolveScteUrl'];
};

/** Merge flat top-level fields with the `csai` sub-config (sub-config wins). */
function normalizeCsaiConfig(config: AdsPluginConfig): NormalizedCsaiConfig {
  const merged: AdsPluginConfig & CsaiAdConfig = { ...config, ...config.csai };

  const sources = normalizeSources(merged);
  const breaks = merged.breaks ?? [];
  const hasExplicitPreroll = breaks.some(
    (b) => b.at === 'preroll' && (b.source?.src || (Array.isArray(b.sources) && b.sources.some((s) => s?.src)))
  );
  const hasSourceVastOrVmap = sources.some((s) => s.type === 'VAST' || s.type === 'VMAP' || s.type === 'NONLINEAR');

  return {
    allowNativeControls: merged.allowNativeControls ?? false,
    resumeContent: merged.resumeContent ?? true,
    preferredMediaTypes: merged.preferredMediaTypes || [
      'video/mp4',
      'video/webm',
      'application/vnd.apple.mpegurl',
      'application/x-mpegURL',
    ],
    debug: config.debug ?? false,
    breakTolerance: merged.breakTolerance ?? 0.25,
    sources,
    breaks,
    interceptPlayForPreroll: merged.interceptPlayForPreroll ?? (Boolean(hasExplicitPreroll) || hasSourceVastOrVmap),
    autoPlayOnReady: merged.autoPlayOnReady || false,
    mountEl: merged.mountEl,
    mountSelector: merged.mountSelector,
    nonLinearContainer: merged.nonLinearContainer,
    nonLinearSelector: merged.nonLinearSelector,
    companionContainer: merged.companionContainer,
    companionSelector: merged.companionSelector,
    adSourcesMode: merged.adSourcesMode ?? 'waterfall',
    omid: merged.omid ?? {},
    labels: merged.labels ?? {},
    adDelivery: config.adDelivery ?? 'csai',
    requestInterceptor: merged.requestInterceptor,
    eventSink: merged.eventSink,
    scteSource: config.hybrid?.scteSource,
    resolveScteUrl: config.hybrid?.resolveScteUrl,
  };
}

function normalizeSources(cfg: AdsPluginConfig): AdsSource[] {
  const list: AdsSource[] = [];
  const raw = cfg.sources ? (Array.isArray(cfg.sources) ? cfg.sources : [cfg.sources]) : [];
  raw.forEach((s) => {
    if (!s || typeof s.src !== 'string') return;
    const src = s.src.trim();
    if (!src) return;
    const type = s.type as AdsSourceType;
    if (type === 'VAST' || type === 'VMAP' || type === 'NONLINEAR') list.push({ type, src });
  });
  return list;
}

// ─── CsaiAdStrategy ───────────────────────────────────────────────────────────

/**
 * Client-side ad insertion strategy.
 *
 * Owns all CSAI-specific logic: scheduling, VAST fetching, ad video rendering,
 * tracking, OMID/SIMID sessions, and break lifecycle management.
 *
 * `HybridAdStrategy` extends this class and adds SCTE-35 cue bridging on top.
 */
export class CsaiAdStrategy implements AdSessionStrategy {
  readonly mode: AdDeliveryMode = 'csai';

  // ── Internal state (/** @internal */ for AdsPlugin delegate access) ─────

  /** @internal */ ctx!: PluginContext;
  /** @internal */ bus!: PluginBus<AdsEvent>;
  /** @internal */ cfg!: NormalizedCsaiConfig;
  /** @internal */ scheduler!: AdScheduler;
  /** @internal */ captionMgr!: CaptionManager;
  /** @internal */ _dom?: AdDomManager;

  private overlayId = 'ads';
  /** @internal */ overlay!: HTMLDivElement;
  /** @internal */ adVideo?: HTMLVideoElement;
  private adEndPromise: Promise<void> | null = null;
  private adEngineDetach?: () => void;

  private currentBreakMeta?: { kind: string; breakId: string };
  /** @internal */ vastClient: any;
  /** @internal */ tracker?: any;
  private _lastCreative: any;

  /** @internal */ globalUnsubs: (() => void)[] = [];
  /** @internal */ sessionUnsubs: (() => void)[] = [];

  /** @internal */ active = false;
  /** @internal */ resumeAfter = false;
  private contentMedia?: HTMLMediaElement;
  private contentHadControls = false;
  private startingBreak = false;
  private userPlayIntent = false;
  /** @internal */ forcedMuteUntilInteraction = false;
  private syncingVolume = false;

  /**
   * @internal
   * Dispatch proxies — AdsPlugin replaces these after init() so that
   * `jest.spyOn(plugin, 'startBreak')` etc. can intercept scheduler calls.
   */
  _dispatchStartBreak!: (
    b: AdsBreakConfig,
    kind: 'preroll' | 'midroll' | 'postroll' | 'auto',
    opts?: { suppressResume?: boolean }
  ) => Promise<void>;
  _dispatchStartBreakGroup!: (breaks: AdsBreakConfig[], kind: 'preroll' | 'midroll' | 'postroll' | 'auto') => Promise<void>;
  _dispatchPlayBreakFromVast!: (
    input: VastInput,
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string; sourceType?: AdsSourceType },
    opts?: { suppressResumeOnError?: boolean; suppressResumeOnSuccess?: boolean }
  ) => Promise<boolean>;
  _dispatchGetVastXmlText!: (input: VastInput) => Promise<string>;
  _dispatchBuildParsedForNonLinear!: (xmlText: string) => XMLDocument | null;
  _dispatchMountAdVideo!: (contentMedia: HTMLMediaElement, mediaFile: { fileURL: string; raw: any }, creative?: any) => void;
  _dispatchStartAdPlayback!: () => void;

  private simidSession?: SimidSession;
  private omidSession?: OmidSession;

  // ─── AdSessionStrategy ────────────────────────────────────────────────────

  init(ctx: PluginContext, config: AdsPluginConfig): void {
    this.ctx = ctx;
    this.cfg = normalizeCsaiConfig(config);
    this.bus = new PluginBus<AdsEvent>(ctx.events);
    this.vastClient = new VASTClient();

    this.overlay = document.createElement('div');
    this.overlay.className = 'op-ads';
    this.overlay.style.display = 'none';

    this.scheduler = new AdScheduler(this.cfg, ctx, this.warn.bind(this), (err) => {
      this.bus.emit('ads:error', { reason: 'vmap_parse_failed', error: err });
      ctx.events.emit('ads.error', { reason: 'vmap_parse_failed', error: err });
    });

    this.captionMgr = new CaptionManager();
    this.dom = new AdDomManager(
      this.overlay,
      this.cfg,
      () => this.adVideo,
      () => this.tracker,
      () => this.requestSkip('button')
    );

    this.globalUnsubs.push(
      ctx.events.on('source:set', () => {
        this.scheduler.reset();
        this.startingBreak = false;
        this.clearSession();
        this.active = false;
        this.contentMedia = undefined;
        this.contentHadControls = false;
        this.overlay.style.display = 'none';
        this.ctx.leases.release('playback', 'ads');
        try {
          getOverlayManager(this.ctx.core).deactivate(this.overlayId);
        } catch {
          /* ignore */
        }
        this.userPlayIntent = false;
        this.scheduler.rebuild();
      })
    );

    // Default proxies point to own methods; AdsPlugin overrides these after init()
    // so that jest.spyOn(plugin, 'startBreak') etc. intercept scheduler-initiated calls.
    this._dispatchStartBreak = (b, kind, opts) => this.startBreak(b, kind, opts);
    this._dispatchStartBreakGroup = (breaks, kind) => this.startBreakGroup(breaks, kind);
    this._dispatchPlayBreakFromVast = (input, meta, opts) => this.playBreakFromVast(input, meta, opts);
    this._dispatchGetVastXmlText = (input) => Promise.resolve(this.getVastXmlText(input));
    this._dispatchBuildParsedForNonLinear = (xmlText) => this.buildParsedForNonLinearFromXml(xmlText);
    this._dispatchMountAdVideo = (m, mf, c) => this.mountAdVideo(m, mf, c);
    this._dispatchStartAdPlayback = () => this.startAdPlayback();

    this.scheduler.rebuild();
    this.bindBreakScheduler();

    if (this.cfg.interceptPlayForPreroll) this.bindPrerollInterceptors();

    this.globalUnsubs.push(
      ctx.events.on('player:interacted', () => {
        this.forcedMuteUntilInteraction = false;
        if (this.active && this.adVideo) {
          try {
            this.adVideo.muted = ctx.core.muted;
            this.adVideo.volume = ctx.core.volume;
          } catch {
            /* ignore */
          }
        }
      })
    );
  }

  destroy(): void {
    this.finish({ resume: false });
    for (const off of this.globalUnsubs) off();
    this.globalUnsubs = [];
    this.overlay?.remove();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  async playAds(vastUrl: string): Promise<boolean> {
    const sourceType = this.scheduler.inferSourceTypeForUrl(vastUrl);
    return this.playBreakFromVast({ kind: 'url', value: vastUrl }, { kind: 'manual', id: 'manual', sourceType });
  }

  async playAdsFromXml(vastXml: string): Promise<boolean> {
    return this.playBreakFromVast({ kind: 'xml', value: vastXml }, { kind: 'manual', id: 'manual' });
  }

  getDueMidrollBreaks(currentTime: number): AdsBreakConfig[] {
    return this.scheduler.getDueMidrollBreaks(currentTime);
  }

  getDueMidrollBreak(currentTime: number): AdsBreakConfig | undefined {
    return this.scheduler.getDueMidrollBreak(currentTime);
  }

  requestSkip(reason: 'button' | 'close' | 'api' = 'api'): void {
    this.dom.requestSkip(
      reason,
      this.adVideo,
      this.currentBreakMeta,
      (data) => {
        this.bus.emit('ads:skip', data);
        this.ctx.events.emit('ads.skipped', data);
        this.ctx.events.emit('adsskipped', data);
        this.omidSession?.skipped();
        this.simidSession?.skip();
      },
      this.log.bind(this)
    );
  }

  /**
   * @deprecated Use SimidSession directly for full protocol support.
   * Best-effort SIMID iframe mounting from creative data.
   */
  tryMountSimidLayer(creative: any): void {
    const simidUrl = extractSimidUrl(creative);
    if (!simidUrl) return;
    this.dom.ensureOverlayMounted(this.ctx.core.media);
    this.dom.mountSimidIframe(simidUrl);
  }

  // ─── DOM accessor ─────────────────────────────────────────────────────────

  /** @internal */
  get dom(): AdDomManager {
    if (!this._dom) {
      const overlay = document.createElement('div');
      this._dom = new AdDomManager(
        overlay,
        this.cfg,
        () => this.adVideo,
        () => this.tracker,
        () => {}
      );
    }
    return this._dom;
  }

  /** @internal */
  set dom(v: AdDomManager) {
    this._dom = v;
  }

  // ─── Preroll interception ──────────────────────────────────────────────────

  private bindPrerollInterceptors(): void {
    const { events, core } = this.ctx;
    const media = core.media;

    const maybeStartDeferredVmap = () => {
      if (this.scheduler.pendingVmapSrc && !this.scheduler.vmapLoadPromise) {
        this.scheduler.vmapPending = true;
        const src = this.scheduler.pendingVmapSrc;
        this.scheduler.pendingVmapSrc = undefined;
        this.scheduler.vmapLoadPromise = this.scheduler.loadVmapAndMerge([...this.scheduler.resolvedBreaks], src);
      }
    };

    this.globalUnsubs.push(
      events.on('cmd:play', () => {
        maybeStartDeferredVmap();
        const vmapWasPending = this.scheduler.vmapPending;
        const shouldInterceptNow = this.shouldInterceptPreroll();

        if (shouldInterceptNow || (vmapWasPending && !this.active && !this.startingBreak)) {
          try {
            media.pause();
          } catch {
            /* ignore */
          }
        }
        void (async () => {
          if (this.scheduler.vmapLoadPromise) await this.scheduler.vmapLoadPromise.catch(() => undefined);
          if (!this.shouldInterceptPreroll()) {
            if (vmapWasPending && !shouldInterceptNow && !this.active && !this.startingBreak) events.emit('cmd:play');
            return;
          }
          this.userPlayIntent = !!core.userInteracted;
          let guard = 0;
          while (guard++ < 10) {
            const pre = this.scheduler.getPrerollBreak();
            if (!pre) break;
            await this._dispatchStartBreak(pre, 'preroll');
          }
        })();
      })
    );

    const onNativePlayCapture = () => {
      maybeStartDeferredVmap();
      const vmapWasPending = this.scheduler.vmapPending;
      const shouldInterceptNow = this.shouldInterceptPreroll();

      if (shouldInterceptNow || (vmapWasPending && !this.active && !this.startingBreak)) {
        try {
          media.pause();
        } catch {
          /* ignore */
        }
      }
      void (async () => {
        if (this.scheduler.vmapLoadPromise) await this.scheduler.vmapLoadPromise.catch(() => undefined);
        if (!this.shouldInterceptPreroll()) {
          if (vmapWasPending && !shouldInterceptNow && !this.active && !this.startingBreak) events.emit('cmd:play');
          return;
        }
        this.userPlayIntent = !!core.userInteracted;
        let guard = 0;
        while (guard++ < 10) {
          const pre = this.scheduler.getPrerollBreak();
          if (!pre) break;
          await this._dispatchStartBreak(pre, 'preroll');
        }
      })();
    };

    media.addEventListener('play', onNativePlayCapture, { capture: true });
    this.globalUnsubs.push(() => media.removeEventListener('play', onNativePlayCapture, { capture: true }));
  }

  /** @internal */ shouldInterceptPreroll(): boolean {
    const pre = this.scheduler.getPrerollBreak();
    if (!pre) return false;
    if (this.active || this.startingBreak) return false;
    const media = this.ctx.core.media;
    const t = media?.currentTime ?? 0;
    if (t > 0.25) return false;
    const id = this.scheduler.getBreakId(pre);
    if (pre.once !== false && this.scheduler.playedBreaks.has(id)) return false;
    if (this.ctx.state.current === 'ended') return false;
    return true;
  }

  // ─── Break scheduler ───────────────────────────────────────────────────────

  private bindBreakScheduler(): void {
    const content = this.ctx.core.media;
    if (!content) return;

    const onTime = () => {
      if (this.active || this.startingBreak) return;
      const t = content.currentTime || 0;
      const due = this.scheduler.getDueMidrollBreaks(t);
      if (!due.length) return;
      const earliestBreak = due[0];
      const earliestAt = earliestBreak.at as number;
      const vmapOffset = earliestBreak.timeOffset;
      const tol = this.cfg.breakTolerance ?? 0.25;

      const group = vmapOffset
        ? this.scheduler.resolvedBreaks.filter(
            (b) =>
              typeof b.at === 'number' &&
              !this.scheduler.playedBreaks.has(this.scheduler.getBreakId(b)) &&
              b.timeOffset === vmapOffset &&
              Math.abs((b.at as number) - earliestAt) <= Math.max(1.0, tol)
          )
        : due.filter((b) => Math.abs((b.at as number) - earliestAt) <= tol);

      if (!group.length) return;
      if (group.length === 1) void this._dispatchStartBreak(group[0], 'midroll');
      else void this._dispatchStartBreakGroup(group, 'midroll');
    };
    content.addEventListener('timeupdate', onTime);
    this.globalUnsubs.push(() => content.removeEventListener('timeupdate', onTime));

    const onEnded = () => {
      if (this.active || this.startingBreak) return;
      void (async () => {
        if (this.scheduler.vmapLoadPromise) await this.scheduler.vmapLoadPromise.catch(() => undefined);
        while (!this.active && !this.startingBreak) {
          const post = this.scheduler.getPostrollBreak();
          if (!post) break;
          this.ctx.events.emit('ads.mediaended', {
            break: { kind: 'postroll', id: this.scheduler.getBreakId(post) },
            at: post.at,
          });
          await this._dispatchStartBreak(post, 'postroll');
        }
      })();
    };
    content.addEventListener('ended', onEnded);
    this.globalUnsubs.push(() => content.removeEventListener('ended', onEnded));
  }

  // ─── Break control ────────────────────────────────────────────────────────

  /** @internal */ async startBreak(
    b: AdsBreakConfig,
    kind: 'preroll' | 'midroll' | 'postroll' | 'auto',
    opts?: { suppressResume?: boolean }
  ): Promise<void> {
    if (this.active || this.startingBreak) return;
    const id = this.scheduler.getBreakId(b);
    const once = b.once !== false;
    if (once && this.scheduler.playedBreaks.has(id)) return;

    const waterfallSources = b.sources;
    if (waterfallSources && waterfallSources.length > 1) {
      if (once) this.scheduler.playedBreaks.add(id);
      this.startingBreak = true;
      this.bus.emit('ads:break:start', { id, kind, at: b.at });
      try {
        for (let i = 0; i < waterfallSources.length; i++) {
          const src = waterfallSources[i];
          const isLastWaterfall = i === waterfallSources.length - 1;
          const input: VastInput = this.scheduler.isXmlString(src.src)
            ? { kind: 'xml', value: src.src }
            : { kind: 'url', value: src.src };
          const success = await this._dispatchPlayBreakFromVast(
            input,
            { kind, id, sourceType: src.type as AdsSourceType },
            { suppressResumeOnError: !isLastWaterfall, suppressResumeOnSuccess: opts?.suppressResume }
          );
          if (success) break;
        }
      } finally {
        this.startingBreak = false;
        this.bus.emit('ads:break:end', { id, kind, at: b.at });
      }
      return;
    }

    const { input, sourceType } = this.scheduler.getVastInputFromBreak(b);
    if (!input) return;
    if (once) this.scheduler.playedBreaks.add(id);
    this.startingBreak = true;
    this.bus.emit('ads:break:start', { id, kind, at: b.at });
    try {
      await this._dispatchPlayBreakFromVast(input, { kind, id, sourceType }, { suppressResumeOnSuccess: opts?.suppressResume });
    } finally {
      this.startingBreak = false;
      this.bus.emit('ads:break:end', { id, kind, at: b.at });
    }
  }

  /** @internal */ async startBreakGroup(breaks: AdsBreakConfig[], kind: 'preroll' | 'midroll' | 'postroll' | 'auto') {
    let startedMain = false;
    const playable: AdsBreakConfig[] = [];
    for (const b of breaks) {
      if (kind === 'midroll') {
        const { input } = this.scheduler.getVastInputFromBreak(b);
        const url = input?.kind === 'url' ? input.value : '';
        const isBumper = /bumper/i.test(url) || /bumper/i.test(b.id || '');
        if (isBumper && startedMain) {
          this.scheduler.playedBreaks.add(this.scheduler.getBreakId(b));
          continue;
        }
        if (!isBumper) startedMain = true;
      }
      playable.push(b);
    }
    for (let i = 0; i < playable.length; i++) {
      await this._dispatchStartBreak(playable[i], kind, { suppressResume: i < playable.length - 1 });
    }
  }

  // ─── Main ad playback ─────────────────────────────────────────────────────

  /** @internal */ async playBreakFromVast(
    input: VastInput,
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string; sourceType?: AdsSourceType },
    opts?: { suppressResumeOnError?: boolean; suppressResumeOnSuccess?: boolean }
  ): Promise<boolean> {
    if (this.active) return false;

    this.dom.ensureOverlayMounted(this.ctx.core.media);
    const {
      events,
      leases,
      core: { media },
    } = this.ctx;

    const requestPayload = input.kind === 'url' ? input.value : '[xml]';
    this.bus.emit('ads:requested', requestPayload);
    this.log('requested', requestPayload, meta);
    this.resumeAfter = this.cfg.resumeContent !== false && meta.kind !== 'postroll';

    const pauseAndAcquireLease = () => {
      try {
        media.pause();
      } catch {
        /* ignore */
      }
      events.emit('cmd:pause');
      if (!leases.acquire('playback', 'ads')) {
        this.bus.emit('ads:error', { reason: 'playback lease already owned', owner: leases.owner('playback') });
        this.ctx.events.emit('ads.error', { reason: 'playback lease already owned', owner: leases.owner('playback') });
        return false;
      }
      return true;
    };

    let rawDoc: XMLDocument | null = null;
    const loadRawDocBestEffort = async () => {
      if (rawDoc) return;
      try {
        rawDoc = this._dispatchBuildParsedForNonLinear(await this._dispatchGetVastXmlText(input));
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
          await loadRawDocBestEffort();
          if (rawDoc) parsed = await this.vastClient.parseVAST(rawDoc);
          else throw e;
        }
      } else {
        const doc =
          typeof input.value === 'string'
            ? toXmlDocument(input.value)
            : input.value instanceof XMLDocument
              ? input.value
              : toXmlDocument(new XMLSerializer().serializeToString(input.value));
        rawDoc = doc;
        parsed = await this.vastClient.parseVAST(doc);
      }

      this.log('vast parsed', { ads: parsed?.ads?.length ?? 0, version: parsed?.version });

      const emitLoaded = (count: number) => {
        this.bus.emit('ads:loaded', { break: meta, count });
        this.ctx.events.emit('ads.loaded', { break: meta, count });
      };

      if (meta.sourceType === 'NONLINEAR') {
        const nonLinearItems = collectNonLinearCreatives(parsed);
        if (nonLinearItems.length) {
          emitLoaded(nonLinearItems.length);
          await this.playNonLinearOnlyBreak(parsed, meta);
          return true;
        }
        await loadRawDocBestEffort();
        if (rawDoc) {
          const xmlItems = collectNonLinearFromXml(rawDoc);
          if (xmlItems.length) {
            emitLoaded(xmlItems.length);
            await this.playNonLinearOnlyBreakFromXml(xmlItems, meta);
            return true;
          }
        }
      }

      let pod = collectPodAds(parsed, this.cfg.preferredMediaTypes);
      this.log('linear pod items', pod.length);

      if (!pod.length) {
        const nonLinearItems = collectNonLinearCreatives(parsed);
        if (nonLinearItems.length) {
          emitLoaded(nonLinearItems.length);
          await this.playNonLinearOnlyBreak(parsed, meta);
          return true;
        }
        await loadRawDocBestEffort();
        if (rawDoc) {
          pod = collectPodAdsFromXml(rawDoc, this.cfg.preferredMediaTypes);
          this.log('linear pod items (xml fallback)', pod.length);
          if (!pod.length) {
            const xmlItems = collectNonLinearFromXml(rawDoc);
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

      const verifications = extractAdVerifications(parsed, rawDoc);
      if (OmidSession.isAvailable() && verifications.length) {
        verifications.forEach((v) => {
          if (v.scriptUrl) OmidSession.injectVerificationScript(v.scriptUrl, v.params);
        });
        this.omidSession = new OmidSession(media as HTMLVideoElement, verifications, this.cfg.omid?.accessMode);
      }

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
        this._dispatchMountAdVideo(media, item.mediaFile, item.creative);
        const endPromise = this.waitForAdEnd();

        this.dom.setupSkipUIForPodItem(item, this.log.bind(this));
        this.log('skip ui', { raw: this.dom.skipOffsetRaw, at: this.dom.skipAtSeconds });
        this.dom.mountCompanions(item.creative);
        this.dom.mountNonLinear(item.creative);

        const simidUrl = extractSimidUrl(item.creative, rawDoc);
        if (simidUrl && this.adVideo) {
          const iframe = this.dom.mountSimidIframe(simidUrl);
          const clickThruRaw =
            item.creative?.videoClickThroughURLTemplate?.url ??
            item.creative?.videoClickThroughURLTemplate ??
            item.creative?.videoClicks?.clickThrough ??
            '';
          const simidCreativeInfo = {
            adParameters: String(
              item.creative?.linear?.adParameters?.value ?? item.creative?.adParameters?.value ?? ''
            ),
            clickThruUri: typeof clickThruRaw === 'string' ? clickThruRaw : String(clickThruRaw || ''),
          };
          this.simidSession = new SimidSession(
            iframe,
            this.adVideo,
            {
              onSkip: () => this.requestSkip('api'),
              onStop: () => {
                const v = this.adVideo;
                if (v) {
                  try {
                    v.dispatchEvent(new Event('ended'));
                  } catch {
                    /* ignore */
                  }
                }
              },
              onPause: () => this.ctx.events.emit('cmd:pause'),
              onPlay: () => this.ctx.events.emit('cmd:play'),
              onClickThrough: (url) => {
                this.dom.safeWindowOpen(url);
                try {
                  this.tracker?.trackClick?.();
                } catch {
                  /* ignore */
                }
                this.bus.emit('ads:clickthrough', { break: meta, url });
                this.ctx.events.emit('ads.click', { break: meta, url });
              },
              onTrackingEvent: (event, _data) => {
                this.bus.emit('ads:impression', { break: meta, event });
              },
              onFatal: (_code, _reason) => {
                this.simidSession?.destroy();
                this.simidSession = undefined;
              },
              onRequestChangeAdDuration: (durationChange, resolve, _reject) => {
                resolve();
                const v = this.adVideo;
                if (v && Number.isFinite(v.duration)) {
                  this.simidSession?.adDurationChange(v.duration + durationChange);
                }
              },
            },
            simidCreativeInfo
          );
          this.sessionUnsubs.push(() => {
            this.simidSession?.destroy();
            this.simidSession = undefined;
          });
        }

        if (!this.cfg.allowNativeControls) this.bindAdSurfaceCommands();

        this.tracker?.trackImpression?.();
        this.omidSession?.impression();
        this.bus.emit('ads:impression', { break: meta, index: i });

        this.bindTrackerAndTelemetry({ kind: meta.kind, breakId: meta.id });
        this._dispatchStartAdPlayback();
        await endPromise;

        this.bus.emit('ads:ad:end', { break: meta, index: i, sequence: item.sequence });
      }

      this.bus.emit('ads:allAdsCompleted', { break: meta });
      this.ctx.events.emit('ads.allAdsCompleted', { break: meta });
      const announcer = this.overlay && this.overlay.querySelector('.op-ads__sr-announcer');
      if (announcer) announcer.textContent = this.cfg.labels?.adEnded || 'Advertisement ended';

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

  // ─── Non-linear playback ──────────────────────────────────────────────────

  private async playNonLinearOnlyBreak(
    parsed: any,
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string }
  ) {
    this.dom.ensureOverlayMounted(this.ctx.core.media);
    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';
    if (!this.overlay.querySelector('.op-ads__sr-announcer')) {
      const announcer = document.createElement('div');
      announcer.className = 'op-ads__sr-announcer op-player__sr-only';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.textContent = 'Advertisement';
      this.overlay.appendChild(announcer);
    }
    this.active = true;

    if (!this.overlay.querySelector('.op-ads__sr-announcer')) {
      const announcer = document.createElement('div');
      announcer.className = 'op-ads__sr-announcer op-player__sr-only';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.textContent = this.cfg.labels?.advertisement || 'Advertisement';
      this.overlay.appendChild(announcer);
    }

    const items = collectNonLinearCreatives(parsed);
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

      const companionCreative =
        (item.ad?.creatives as any[] | undefined)?.find((c: any) => c?.type === 'companion') ?? item.creative;
      this.dom.mountCompanions(companionCreative);
      this.dom.ensureNonLinearDom();
      const el = this.dom.renderNonLinear(item.nonLinear);
      if (el) this.dom.nonLinearWrap!.appendChild(el);

      try {
        this.tracker?.trackImpression?.();
        this.tracker?.trackCreativeView?.();
      } catch {
        /* ignore */
      }
      this.bus.emit('ads:impression', { break: meta, index: i });
      this.bus.emit('ads:ad:start', { break: meta, index: i, sequence: item.sequence });
      maxDuration = Math.max(maxDuration, this.dom.nonLinearSuggestedDurationSeconds(item.nonLinear));
    }

    this.active = false;
    this.ctx.events.emit('cmd:play');
    void this.dismissNonLinear(items, meta, maxDuration);
  }

  private async playNonLinearOnlyBreakFromXml(
    items: { nonLinear: any; companions?: any[] }[],
    meta: { kind: 'preroll' | 'midroll' | 'postroll' | 'auto' | 'manual'; id: string }
  ) {
    this.dom.ensureOverlayMounted(this.ctx.core.media);
    this.dom.clearAdOverlays();
    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';
    this.active = true;
    let maxDuration = 0;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.companions?.length)
        this.dom.mountCompanions({ companions: it.companions, companionAds: { companions: it.companions } });
      this.dom.ensureNonLinearDom();
      const el = this.dom.renderNonLinear(it.nonLinear);
      if (el) this.dom.nonLinearWrap!.appendChild(el);
      maxDuration = Math.max(maxDuration, this.dom.nonLinearSuggestedDurationSeconds(it.nonLinear));
      this.bus.emit('ads:impression', { break: meta, index: i });
      this.bus.emit('ads:ad:start', { break: meta, index: i });
    }

    this.active = false;
    this.ctx.events.emit('cmd:play');
    void this.dismissNonLinear(items, meta, maxDuration);
  }

  private async dismissNonLinear(items: any[], meta: any, maxDuration: number) {
    const start = Date.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const elapsed = (Date.now() - start) / 1000;
        const anyLeft = !!this.dom.nonLinearWrap?.querySelector('.op-ads__nonlinear-item');
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
    this.currentBreakMeta = undefined;
  }

  // ─── Ad video management ──────────────────────────────────────────────────

  private mountAdVideo(contentMedia: HTMLMediaElement, mediaFile: { fileURL: string; raw: any }, creative?: any) {
    this.dom.ensureOverlayMounted(contentMedia);
    const root = this.overlay.parentElement as HTMLElement;
    this.overlay.replaceChildren();
    this.overlay.style.display = 'block';

    this.contentMedia = contentMedia;
    this.captionMgr.captureActiveCaptionTrack(contentMedia);

    const v = document.createElement('video');
    v.className = 'op-ads__media';
    v.playsInline = true;
    const contentPreload = (contentMedia.getAttribute('preload') || contentMedia.preload || '').toLowerCase();
    const isAutoplayPath = !!contentMedia.autoplay;
    const forceMutedForPolicy = isAutoplayPath && !this.ctx.core.userInteracted;

    v.preload = contentPreload === 'none' ? 'metadata' : 'auto';
    v.controls = this.cfg.allowNativeControls;
    v.style.width = '100%';
    v.style.height = '100%';

    const hlsEngine = this.ctx.core.getPlugin?.<{
      canPlay(s: { src: string }): boolean;
      attachMedia(v: HTMLVideoElement, src: string): () => void;
    }>('hls-engine');
    if (hlsEngine?.canPlay({ src: mediaFile.fileURL }) && hlsEngine.attachMedia) {
      this.adEngineDetach = hlsEngine.attachMedia(v, mediaFile.fileURL);
    } else {
      v.src = mediaFile.fileURL;
      try {
        v.load();
      } catch {
        /* ignore */
      }
    }

    const desiredMuted = forceMutedForPolicy ? true : this.ctx.core.muted;
    const desiredVolume = forceMutedForPolicy ? 0 : this.ctx.core.volume;
    v.muted = desiredMuted;
    v.defaultMuted = desiredMuted;
    if (Number.isFinite(desiredVolume)) v.volume = Math.max(0, Math.min(1, desiredVolume));

    this.adEndPromise = new Promise((resolve) => {
      const cleanup = () => {
        if (this.adVideo === v) {
          try {
            v.pause();
          } catch {
            /* ignore */
          }
          v.remove();
          this.adVideo = undefined;
        } else v.remove();
      };
      const onEnded = () => {
        this.ctx.events.emit('ended');
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        resolve();
      };
      v.addEventListener('ended', onEnded, { once: true });
      v.addEventListener('error', onError, { once: true });
      this.sessionUnsubs.push(() => v.removeEventListener('ended', onEnded));
      this.sessionUnsubs.push(() => v.removeEventListener('error', onError));
    });

    this.overlay.appendChild(v);
    this.adVideo = v;

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const cur = this.adVideo;
      if (!cur || !cur.paused || cur.ended) return;
      try {
        const p = cur.play?.();
        if (p && typeof p.catch === 'function') p.catch(() => undefined);
      } catch {
        /* ignore */
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    this.sessionUnsubs.push(() => document.removeEventListener('visibilitychange', onVisibility));

    const captionTracks = this.captionMgr.attachAdCaptionTracks(v, mediaFile.raw, creative);
    this.sessionUnsubs.push(() => {
      captionTracks.forEach((el) => el.remove());
    });

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
      /* ignore */
    }

    const updateOverlay = () => {
      if (!overlayMgr) return;
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
    this.sessionUnsubs.push(() => v.removeEventListener('loadedmetadata', updateOverlay));
    this.sessionUnsubs.push(() => v.removeEventListener('timeupdate', updateOverlay));
  }

  // ─── Ad surface commands ──────────────────────────────────────────────────

  private bindAdSurfaceCommands(): void {
    const { events } = this.ctx;
    const v = () => this.adVideo;

    this.sessionUnsubs.push(
      events.on('cmd:play', () => {
        const wantsAutoplayPath = Boolean(this.contentMedia?.autoplay);
        const shouldForceMute = !this.userPlayIntent && wantsAutoplayPath && !this.ctx.core.userInteracted;
        if (shouldForceMute) {
          this.forcedMuteUntilInteraction = true;
          try {
            if (v()) {
              v()!.muted = true;
              v()!.volume = 0;
            }
          } catch {
            /* ignore */
          }
        } else {
          this.forcedMuteUntilInteraction = false;
          try {
            if (v()) {
              v()!.muted = this.ctx.core.muted;
              v()!.volume = this.ctx.core.volume;
            }
          } catch {
            /* ignore */
          }
        }
        v()
          ?.play()
          .catch(() => {
            /* ignore */
          });
      })
    );
    this.sessionUnsubs.push(events.on('cmd:pause', () => v()?.pause()));
    this.sessionUnsubs.push(
      events.on('cmd:setVolume', (x: any) => {
        const vol = Number(x);
        if (!Number.isFinite(vol) || !v() || this.syncingVolume || this.forcedMuteUntilInteraction) return;
        v()!.volume = vol;
      })
    );
    this.sessionUnsubs.push(
      events.on('cmd:setMuted', (x: any) => {
        if (!v() || this.syncingVolume) return;
        if (this.forcedMuteUntilInteraction && !this.ctx.core.userInteracted) {
          v()!.muted = true;
          v()!.volume = 0;
          return;
        }
        v()!.muted = Boolean(x);
      })
    );
  }

  // ─── Tracker & telemetry ──────────────────────────────────────────────────

  private bindTrackerAndTelemetry(meta: { kind: string; breakId: string }): void {
    this.currentBreakMeta = meta;
    const v = this.adVideo!;
    let started = false;
    let lastMuted = v.muted || v.volume === 0;
    let lastVol = Number.isFinite(v.volume) ? v.volume : 1;
    let lastPaused = v.paused;
    let q25 = false,
      q50 = false,
      q75 = false,
      q100 = false;

    const emitDuration = () => {
      const dur = v.duration;
      if (Number.isFinite(dur) && dur > 0) {
        this.bus.emit('ads:duration', { break: meta, duration: dur });
        this.ctx.events.emit('ads.durationChange', { duration: dur, break: meta });
      }
    };

    const emitQuartile = (quartile: 0 | 25 | 50 | 75 | 100) => {
      this.bus.emit('ads:quartile', { break: meta, quartile });
      if (quartile === 25) {
        this.ctx.events.emit('ads.firstQuartile', { break: meta });
        this.omidSession?.firstQuartile();
      }
      if (quartile === 50) {
        this.ctx.events.emit('ads.midpoint', { break: meta });
        this.omidSession?.midpoint();
      }
      if (quartile === 75) {
        this.ctx.events.emit('ads.thirdQuartile', { break: meta });
        this.omidSession?.thirdQuartile();
      }
      if (quartile === 100) {
        this.ctx.events.emit('ads.complete', { break: meta });
        this.omidSession?.complete();
      }
    };

    const onPlaying = () => {
      if (!started) {
        started = true;
        this.tracker?.trackStart?.();
        this.ctx.events.emit('play');
        this.ctx.events.emit('ads.start', { break: meta });
        emitQuartile(0);
        emitDuration();
        const dur = v.duration;
        const vol = v.muted ? 0 : Number.isFinite(v.volume) ? v.volume : 1;
        this.omidSession?.loaded();
        this.omidSession?.start(Number.isFinite(dur) ? dur : 0, vol);
        this.simidSession?.progress(v.currentTime, Number.isFinite(dur) ? dur : 0);
      } else if (lastPaused) {
        this.tracker?.trackResume?.();
        this.bus.emit('ads:resume', { break: meta });
        this.ctx.events.emit('ads.resume', { break: meta });
        this.omidSession?.resume();
        this.simidSession?.resume();
      }
      this.ctx.events.emit('playing');
      lastPaused = false;
    };

    const onPause = () => {
      if (started) {
        this.tracker?.trackPause?.();
        this.omidSession?.pause();
        this.simidSession?.pause();
      }
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
      this.bus.emit('ads:timeupdate', { break: meta, currentTime: cur, remainingTime: remaining, duration: dur });
      this.ctx.events.emit('ads.adProgress', { currentTime: cur, duration: dur, break: meta });
      this.tracker?.setDuration?.(dur);
      this.tracker?.setProgress?.(cur);
      this.simidSession?.progress(cur, dur);

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
      this.omidSession?.volumeChange(muted ? 0 : vol);
      this.simidSession?.volumeChange(vol, muted);

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

      if (this.forcedMuteUntilInteraction && !this.ctx.core.userInteracted) return;
      if (this.syncingVolume) return;
      try {
        this.syncingVolume = true;
        this.ctx.core.muted = muted;
        if (Number.isFinite(vol)) this.ctx.core.volume = Math.max(0, Math.min(1, vol));
      } catch {
        /* ignore */
      } finally {
        this.syncingVolume = false;
      }
    };

    const onClick = (ev: PointerEvent) => {
      if (ev.defaultPrevented) return;
      const c = this._lastCreative;
      const click =
        c?.videoClickThroughURLTemplate || c?.videoClicks?.clickThrough || c?.videoClicks?.clickThroughURLTemplate;
      if (!click) return;
      const url = typeof click === 'string' ? click : click.url;
      this.dom.safeWindowOpen(url);
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

  // ─── Playback start ───────────────────────────────────────────────────────

  /** @internal */ startAdPlayback(): void {
    const v = this.adVideo;
    this.ctx.events.emit('play');
    if (!v) return;

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
        const p2 = tryPlay(true);
        if (p2)
          p2.catch(() => {
            /* both failed */
          });
      });
    }
  }

  private waitForAdEnd(): Promise<void> {
    return this.adEndPromise || Promise.resolve();
  }

  // ─── Session cleanup ──────────────────────────────────────────────────────

  /** @internal */ clearSession(): void {
    this.dom.clearSession();
    for (const off of this.sessionUnsubs) off();
    this.sessionUnsubs = [];
    this.tracker = undefined;

    if (this.adEngineDetach) {
      this.adEngineDetach();
      this.adEngineDetach = undefined;
    }

    if (this.adVideo) {
      try {
        this.adVideo.pause();
      } catch {
        /* ignore */
      }
      this.adVideo.remove();
      this.adVideo = undefined;
    }

    try {
      this.overlay
        .querySelectorAll('video.op-ads__media')
        .forEach((n) => n?.parentNode?.removeChild?.(n) ?? n.remove?.());
    } catch {
      /* ignore */
    }

    this.adEndPromise = null;
    this.captionMgr.removeAdCaptions();
    this.overlay.replaceChildren();
  }

  private finish(opts: { resume: boolean; suppressResume?: boolean }): void {
    const { events, leases } = this.ctx;
    this.clearSession();
    if (this.contentMedia && this.contentHadControls) this.contentMedia.setAttribute('controls', '');
    this.contentMedia = undefined;
    this.contentHadControls = false;
    this.overlay.style.display = 'none';
    this.overlay.replaceChildren();
    leases.release('playback', 'ads');
    this.active = false;
    const shouldResume = !!(opts.resume || this.userPlayIntent || this.resumeAfter);
    this.userPlayIntent = false;
    this.captionMgr.restoreActiveTextTrack(this.ctx?.core?.media);
    try {
      getOverlayManager(this.ctx.core).deactivate(this.overlayId);
    } catch {
      /* ignore */
    }

    this.omidSession?.destroy();
    this.omidSession = undefined;

    if (!opts.suppressResume) {
      if (shouldResume) events.emit('cmd:play');
      else events.emit('cmd:pause');
    }
  }

  // ─── Logging ──────────────────────────────────────────────────────────────

  protected log(...args: any[]): void {
    // eslint-disable-next-line no-console
    if (this.cfg?.debug) console.debug('[player][ads]', ...args);
  }

  protected warn(...args: any[]): void {
    // eslint-disable-next-line no-console
    if (this.cfg?.debug) console.warn('[player][ads]', ...args);
  }

  // ─── @internal delegates (used by AdsPlugin for test access) ─────────────

  /** @internal */ getVastXmlText(input: any) {
    return getVastXmlText(input);
  }
  /** @internal */ buildParsedForNonLinearFromXml(xmlText: string) {
    return toXmlDocument(xmlText);
  }
  /** @internal */ computeSkipAtSecondsDelegate(skipOffset: string | undefined, duration: number) {
    return computeSkipAtSeconds(skipOffset, duration);
  }
  /** @internal */ collectPodAdsDelegate(parsed: any) {
    return collectPodAds(parsed, this.cfg?.preferredMediaTypes);
  }
  /** @internal */ getPrerollBreak() {
    return this.scheduler.getPrerollBreak();
  }
  /** @internal */ getBreakId(b: AdsBreakConfig) {
    return this.scheduler ? this.scheduler.getBreakId(b) : getBreakIdFn(b);
  }
  /** @internal */ async loadVmapAndMerge(existing: AdsBreakConfig[], src?: string) {
    return this.scheduler.loadVmapAndMerge(existing, src);
  }
  /** @internal */ get resolvedBreaks() {
    return this.scheduler?.resolvedBreaks;
  }
  /** @internal */ set resolvedBreaks(v: AdsBreakConfig[]) {
    if (this.scheduler) this.scheduler.resolvedBreaks = v;
  }
  /** @internal */ get pendingPercentBreaks() {
    return this.scheduler?.pendingPercentBreaks;
  }
  /** @internal */ set pendingPercentBreaks(v: any[]) {
    if (this.scheduler) this.scheduler.pendingPercentBreaks = v;
  }
  /** @internal */ get playedBreaks() {
    return this.scheduler?.playedBreaks;
  }
  /** @internal */ get vmapPending() {
    return this.scheduler?.vmapPending;
  }
  /** @internal */ get vmapLoadPromise() {
    return this.scheduler?.vmapLoadPromise;
  }
  /** @internal */ get pendingVmapSrc() {
    return this.scheduler?.pendingVmapSrc;
  }
  /** @internal */ isXmlString(src: string) {
    return this.scheduler?.isXmlString(src);
  }
  /** @internal */ ensureOverlayMounted() {
    return this.dom.ensureOverlayMounted(this.ctx.core.media);
  }
  /** @internal */ mountCompanions(creative: any) {
    return this.dom.mountCompanions(creative);
  }
  /** @internal */ renderCompanion(companion: any) {
    return this.dom.renderCompanion(companion);
  }
  /** @internal */ renderNonLinear(nl: any) {
    return this.dom.renderNonLinear(nl);
  }
  /** @internal */ ensureRawCaptions(mediaFileRaw: any, creative?: any) {
    return this.captionMgr.ensureRawCaptions(mediaFileRaw, creative);
  }
  /** @internal */ attachAdCaptionTracks(adVideo: HTMLVideoElement, raw: any, creative?: any) {
    return this.captionMgr.attachAdCaptionTracks(adVideo, raw, creative);
  }
}
