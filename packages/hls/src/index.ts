/**
 * @openplayer/hls
 *
 * HLS streaming engine for OpenPlayerJS, powered by hls.js.
 * Peer dependency: @openplayer/core, hls.js >=1.0
 *
 * ESM usage:
 *   import { HlsMediaEngine } from '@openplayer/hls';
 *   new Core(el, { plugins: [new HlsMediaEngine()] });
 *
 * UMD / CDN usage: load openplayer-hls.umd.js after the main OpenPlayer bundle.
 * It auto-registers itself under window.OpenPlayerPlugins.hls.
 */

export { HlsMediaEngine } from './hls';
