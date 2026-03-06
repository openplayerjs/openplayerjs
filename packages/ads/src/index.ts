/**
 * @openplayerjs/ads
 *
 * VAST / VMAP / VPAID ad-serving plugin for OpenPlayerJS.
 * Peer dependencies: @openplayerjs/core, @dailymotion/vast-client, @dailymotion/vmap
 *
 * ESM usage:
 *   import { AdsPlugin } from '@openplayerjs/ads';
 *   new Core(el, { plugins: [new AdsPlugin({ breaks: [...] })] });
 *
 * UMD / CDN usage: load openplayer-ads.umd.js after the main OpenPlayer bundle.
 * It auto-registers itself under window.OpenPlayerPlugins.ads.
 */

export { AdsPlugin } from './ads';
// Prototype and instance extension helpers (used by the UMD wrapper).
export { extendAds, installAds } from './ads';
