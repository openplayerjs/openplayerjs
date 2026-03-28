/**
 * @openplayerjs/ads
 *
 * VAST / VMAP / SSAI / Hybrid ad-serving plugin for OpenPlayerJS.
 * Peer dependencies: @openplayerjs/core, @dailymotion/vast-client, @dailymotion/vmap
 *
 * Delivery modes (set via `adDelivery` in `AdsPluginConfig`):
 *   - 'csai' (default)  — client-side insertion; fetches VAST/VMAP, renders an ad <video>
 *   - 'ssai'            — server-side stitching; detects ad boundaries via SCTE-35 TextTrack cues
 *   - 'hybrid'          — CSAI triggered by SCTE-35 OUT cues from the HLS engine
 *
 * ESM usage (CSAI):
 *   import { AdsPlugin } from '@openplayerjs/ads';
 *   new Core(el, {
 *     plugins: [new AdsPlugin({
 *       breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://...' } }],
 *     })],
 *   });
 *
 * ESM usage (SSAI):
 *   new Core(el, {
 *     plugins: [new AdsPlugin({ adDelivery: 'ssai', ssai: { eventSink: (e) => log(e) } })],
 *   });
 *
 * ESM usage (Hybrid):
 *   new Core(el, {
 *     plugins: [new AdsPlugin({
 *       adDelivery: 'hybrid',
 *       hybrid: { scteSource: hlsEngine, resolveScteUrl: (cue) => myVastUrl(cue) },
 *     })],
 *   });
 *
 * UMD / CDN usage: load openplayer-ads.js after the main OpenPlayer bundle.
 * It auto-registers itself under window.OpenPlayerPlugins.ads.
 */

export { AdsPlugin } from './ads';
export { extendAds, installAds } from './install';
export { OmidSession } from './omid';
export { SIMID_CREATIVE, SIMID_PLAYER, SimidSession } from './simid';
export { CsaiAdStrategy } from './strategies/csai';
export { HybridAdStrategy } from './strategies/hybrid';
export { decodeSplice } from './strategies/scte35';
export type { SpliceCommand } from './strategies/scte35';
export { SsaiAdStrategy } from './strategies/ssai';
export type {
  AdDeliveryMode,
  AdLifecycleEvent,
  AdsBreakConfig,
  AdSessionStrategy,
  AdsEvent,
  AdsPluginConfig,
  AdsSource,
  AdsSourceType,
  AdTagRequest,
  AdVerification,
  CsaiAdConfig,
  HybridAdConfig,
  NormalizedMediaFile,
  ScteOutCue,
  ScteSource,
  SsaiAdConfig,
} from './types';
