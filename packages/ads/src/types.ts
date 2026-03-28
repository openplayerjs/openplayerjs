import type { EventBus, PluginContext } from '@openplayerjs/core';

// ─── Public event union ──────────────────────────────────────────────────────

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

// ─── Internal VAST input ─────────────────────────────────────────────────────

export type VastInput = { kind: 'url'; value: string } | { kind: 'xml'; value: string | XMLDocument | Element };

// ─── Break timing ────────────────────────────────────────────────────────────

export type BreakAt = 'preroll' | 'postroll' | number;

// ─── Caption types ───────────────────────────────────────────────────────────

export type VastClosedCaption = {
  type?: string;
  language?: string;
  fileURL?: string;
};

export type CaptionResource = {
  src: string;
  kind: 'captions' | 'subtitles';
  srclang?: string;
  label?: string;
  type?: string;
};

// ─── SCTE-35 cue types (CSAI + SSAI shared) ──────────────────────────────────

/** A SCTE-35 splice-out cue surfaced by an HLS (or DASH) engine. */
export type ScteOutCue = {
  id: string;
  scte35Out: string;
  plannedDuration?: number;
  startDate?: Date;
};

/**
 * Duck-typed interface for any engine that fires SCTE-35 cues.
 * Satisfied by `HlsMediaEngine` without importing that package.
 */
export type ScteSource = {
  onCue?: ((cue: ScteOutCue) => void) | undefined;
};

// ─── Strategy abstraction ─────────────────────────────────────────────────────

/** Selects which ad delivery path AdsPlugin uses. */
export type AdDeliveryMode = 'csai' | 'ssai' | 'hybrid';

/**
 * Shared contract for CSAI, SSAI, and hybrid delivery strategies.
 * AdsPlugin is a thin dispatcher; the strategy owns all delivery-specific logic.
 */
export type AdSessionStrategy = {
  readonly mode: AdDeliveryMode;
  /** Called once when the plugin receives a PluginContext. */
  init(ctx: PluginContext, config: AdsPluginConfig): void;
  /** Mirror of PlayerPlugin.destroy — release all subscriptions and DOM state. */
  destroy(): void;
  /** Fetch and play a VAST/VMAP URL as an ad break. */
  playAds?(vastUrl: string): Promise<boolean>;
  /** Parse and play inline VAST XML as an ad break. */
  playAdsFromXml?(vastXml: string): Promise<boolean>;
  /** Return all midroll breaks whose cue point is at or before currentTime. */
  getDueMidrollBreaks?(currentTime: number): AdsBreakConfig[];
  /** Return the earliest unplayed midroll break at or before currentTime. */
  getDueMidrollBreak?(currentTime: number): AdsBreakConfig | undefined;
  /** Skip the currently playing ad. */
  requestSkip?(reason?: 'button' | 'close' | 'api'): void;
};

// ─── Public configuration ────────────────────────────────────────────────────

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

export type OmidConfig = {
  accessMode?: 'domain' | 'limited';
};

// ─── Strategy sub-configs ─────────────────────────────────────────────────────

/** Options specific to CSAI (client-side ad insertion) delivery. */
export type CsaiAdConfig = {
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
  breakTolerance?: number;
  adSourcesMode?: 'waterfall' | 'playlist';
  omid?: OmidConfig;
  labels?: { skip?: string; advertisement?: string; adEnded?: string };
  requestInterceptor?: (req: AdTagRequest) => AdTagRequest | null | Promise<AdTagRequest | null>;
  eventSink?: (event: AdLifecycleEvent) => void;
};

/** Options specific to SSAI (server-side ad stitching) delivery. */
export type SsaiAdConfig = {
  eventSink?: (event: AdLifecycleEvent) => void;
};

/**
 * Options for CSAI + SCTE-35 hybrid delivery.
 * Inherits all CSAI options; `scteSource` and `resolveScteUrl` are required
 * (the hybrid bridge only activates when both are provided).
 */
export type HybridAdConfig = CsaiAdConfig & {
  scteSource: ScteSource;
  resolveScteUrl: (cue: ScteOutCue) => string | null | undefined | Promise<string | null | undefined>;
};

// ─── Top-level plugin config ──────────────────────────────────────────────────

export type AdsPluginConfig = {
  /** Ad sources to play at the top level (VAST/VMAP/NONLINEAR). */
  sources?: AdsSource | AdsSource[];
  /** Enable verbose debug logging. */
  debug?: boolean;
  /**
   * 'csai' (default) — client-side ad insertion: plugin fetches VAST/VMAP
   *   and renders an ad <video> element. Ad blockers can intercept requests.
   *
   * 'ssai' — server-side ad stitching: ads are baked into the HLS/DASH stream.
   *   No VAST fetch; ad boundaries detected via SCTE-35 TextTrack cues.
   *
   * 'hybrid' — CSAI triggered by SCTE-35 OUT cues from the engine. Provide
   *   `hybrid.scteSource` and `hybrid.resolveScteUrl` (or the flat aliases).
   */
  adDelivery?: AdDeliveryMode;

  /**
   * CSAI-specific options. When provided, fields here take precedence over
   * their flat top-level equivalents (kept for backward compatibility).
   */
  csai?: CsaiAdConfig;

  /** SSAI-specific options. */
  ssai?: SsaiAdConfig;

  /**
   * CSAI + SCTE-35 hybrid options. Use when `adDelivery` is `'hybrid'`.
   * `scteSource` and `resolveScteUrl` are required in this sub-config.
   */
  hybrid?: HybridAdConfig;

  // ── Flat CSAI fields (backward compatible; prefer csai.* when adding new) ─

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
  breakTolerance?: number;
  adSourcesMode?: 'waterfall' | 'playlist';
  omid?: OmidConfig;
  labels?: { skip?: string; advertisement?: string; adEnded?: string };

  /** Optional interceptor called before every ad tag fetch. */
  requestInterceptor?: (req: AdTagRequest) => AdTagRequest | null | Promise<AdTagRequest | null>;

  /** Optional sink for structured ad lifecycle events. */
  eventSink?: (event: AdLifecycleEvent) => void;

  // ── Flat SCTE-35 / hybrid fields (backward compat; prefer hybrid.*) ───────

  /** CSAI + SCTE-35 hybrid: duck-typed engine reference that exposes `onCue` */
  scteSource?: ScteSource;

  /** Called for every SCTE-35 OUT cue when `scteSource` is configured */
  resolveScteUrl?: (cue: ScteOutCue) => string | null | undefined | Promise<string | null | undefined>;
};

// ─── Internal media/creative types ──────────────────────────────────────────

export type NormalizedMediaFile = {
  type: string;
  fileURL: string;
  bitrate: number;
  width: number;
  height: number;
  raw: any;
};

export type PodAd = {
  creativeIndex?: number;
  ad: any;
  creative: any;
  mediaFile: NormalizedMediaFile;
  sequence?: number;
  skipOffset?: string;
  companions?: any[];
  nonLinears?: any[];
};

export type XmlNonLinearItem = {
  nonLinear: any;
  companions?: any[];
};

export type AdVerification = {
  vendor: string;
  scriptUrl: string;
  params: string;
};

// ─── PluginBus ───────────────────────────────────────────────────────────────

export class PluginBus<E extends string> {
  constructor(private bus: EventBus) {}

  on(event: E, cb: (...args: any[]) => void) {
    return this.bus.on(event, cb);
  }

  emit(event: E, ...data: any[]) {
    this.bus.emit(event, ...data);
  }
}

export type AdTagRequest = {
  url: string;
  headers: Record<string, string>;
  /** 'vast' | 'vmap' — so the server can route by type */
  adType: 'vast' | 'vmap';
  /** The content source URL playing when this request is made */
  contentSrc?: string;
};

export type AdLifecycleEvent = {
  type: 'request' | 'impression' | 'quartile' | 'complete' | 'skip' | 'error';
  adId?: string;
  breakId?: string;
  contentSrc?: string;
  elapsedSec?: number;
  metadata?: Record<string, unknown>;
};
