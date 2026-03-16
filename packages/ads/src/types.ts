import type { EventBus } from '@openplayerjs/core';

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
  omid?: OmidConfig;
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
