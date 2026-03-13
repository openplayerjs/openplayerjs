/**
 * @openplayerjs/youtube
 *
 * YouTube iframe engine for OpenPlayerJS, powered by YT player API.
 * Peer dependency: @openplayerjs/core
 *
 * ESM usage:
 *   import { YouTubeMediaEngine } from '@openplayerjs/youtube';
 *   new Core(el, { plugins: [new YouTubeMediaEngine()] });
 *
 * UMD / CDN usage: load openplayer-youtube.js after the main OpenPlayer bundle.
 * It auto-registers itself under window.OpenPlayerPlugins.youtube.
 */

export { YouTubeMediaEngine } from './youtube';
export type { YouTubeEngineConfig } from './youtube';
