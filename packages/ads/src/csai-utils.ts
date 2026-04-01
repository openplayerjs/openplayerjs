/**
 * Pure utility functions and config-normalisation helpers for the CSAI ad strategy.
 *
 * Everything in this module is stateless and free of class dependencies so it can
 * be unit-tested in isolation without any DOM or plugin-context setup.
 */

import type {
  AdBlockerFallbackConfig,
  AdDeliveryMode,
  AdsBreakConfig,
  AdsPluginConfig,
  AdsSource,
  AdsSourceType,
  CsaiAdConfig,
  ScteSource,
} from './types';

// ─── Normalised config type ────────────────────────────────────────────────────

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
  targeting?: Record<string, string>;
  userId?: CsaiAdConfig['userId'];
  adTagResolver?: CsaiAdConfig['adTagResolver'];
  adBlockerFallback?: AdBlockerFallbackConfig;
};

// ─── Source normalisation ──────────────────────────────────────────────────────

export function normalizeSources(cfg: AdsPluginConfig): AdsSource[] {
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

// ─── Config normalisation ──────────────────────────────────────────────────────

/** Merge flat top-level fields with the `csai` sub-config (sub-config wins). */
export function normalizeCsaiConfig(config: AdsPluginConfig): NormalizedCsaiConfig {
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
    targeting: merged.targeting,
    userId: merged.userId,
    adTagResolver: merged.adTagResolver,
    adBlockerFallback: merged.adBlockerFallback,
  };
}

// ─── Ad tag URL pipeline helpers ──────────────────────────────────────────────

/**
 * Apply targeting macro substitution and userId to an ad tag URL.
 *
 * Step 1 — `{USER_ID}` macro is replaced first (or `&ppid=` appended if absent).
 * Step 2 — Each `{KEY}` in the targeting map is replaced; keys with no matching
 *           macro are appended as `&key=value` query parameters.
 *
 * The function never throws; an invalid URL string is returned as-is.
 */
export function applyTargeting(url: string, targeting: Record<string, string>, userId?: string): string {
  let result = url;

  if (userId !== undefined) {
    if (result.includes('{USER_ID}')) {
      result = result.split('{USER_ID}').join(encodeURIComponent(userId));
    } else {
      result += (result.includes('?') ? '&' : '?') + `ppid=${encodeURIComponent(userId)}`;
    }
  }

  const appended: string[] = [];
  for (const [key, value] of Object.entries(targeting)) {
    const macro = `{${key}}`;
    if (result.includes(macro)) {
      result = result.split(macro).join(encodeURIComponent(value));
    } else {
      appended.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  if (appended.length) {
    result += (result.includes('?') ? '&' : '?') + appended.join('&');
  }
  return result;
}

/**
 * Heuristic to distinguish a genuine network failure (ad blocker, DNS block,
 * network error) from a VAST parse / no-ads error.
 *
 * Ad blockers typically manifest as a `TypeError: Failed to fetch` or a `0`
 * HTTP status, both of which surface as `TypeError` from the Fetch API.
 * A sentinel `_skipSignal` flag is set by `resolveAdTagUrl` when the
 * `adTagResolver` hook returns an empty string.
 */
export function isAdBlockerError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error && (err as any)._skipSignal === true) return true;
  if (err instanceof Error && /failed to fetch|network request failed/i.test(err.message)) return true;
  return false;
}
