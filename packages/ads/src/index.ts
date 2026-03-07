/**
 * @openplayerjs/ads
 *
 * VAST / VMAP / SIMID / OMID ad-serving plugin for OpenPlayerJS.
 * Peer dependencies: @openplayerjs/core, @dailymotion/vast-client, @dailymotion/vmap
 *
 * ESM usage:
 *   import { AdsPlugin } from '@openplayerjs/ads';
 *   new Core(el, { plugins: [new AdsPlugin({ breaks: [...] })] });
 *
 * UMD / CDN usage: load openplayer-ads.js after the main OpenPlayer bundle.
 * It auto-registers itself under window.OpenPlayerPlugins.ads.
 */

export { AdsPlugin } from './ads';
export { installAds, extendAds } from './install';
export { SimidSession, SIMID_PLAYER, SIMID_CREATIVE } from './simid';
export { OmidSession } from './omid';
export type {
  AdsEvent,
  AdsPluginConfig,
  AdsSource,
  AdsBreakConfig,
  AdsSourceType,
  NormalizedMediaFile,
  AdVerification,
} from './types';
