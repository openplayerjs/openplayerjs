import type { EventBus } from './events';
import type { Core } from './index';
import type { HtmlMediaSurface, MediaSurface } from './surface';

export type MediaSource = {
  src: string;
  type?: string;
};

export type MediaEngineContext = {
  /**
   * The underlying native `<video>` or `<audio>` element.
   *
   * Use this only for low-level DOM operations that have no surface equivalent:
   * attaching a third-party adapter (e.g. `hls.js` via `adapter.attachMedia(ctx.media)`),
   * reading DOM attributes (`ctx.media.preload`, `ctx.media.autoplay`), or
   * registering raw DOM listeners via `this.addMediaListener(ctx.media, ...)`.
   *
   * For all playback operations (play, pause, seek, volume, rate) use `ctx.surface` instead.
   * Iframe-based engines (YouTube, Vimeo, etc.) should call `ctx.setSurface(iframeSurface)`
   * to replace the default `HtmlMediaSurface` with their own implementation.
   */
  media: HTMLMediaElement;
  /**
   * The DOM container in which this engine should render its visual output.
   * For native engines this is the media element's parent; iframe-based engines
   * should mount their iframe here instead of directly on `media`.
   * Defaults to `media.parentElement ?? media`.
   */
  container: HTMLElement;
  events: EventBus;
  activeSource?: MediaSource;
  config?: any;
  core: Core;
  surface: MediaSurface;
  setSurface(surface: MediaSurface): MediaSurface;
  resetSurface(): HtmlMediaSurface;
};

export type MediaEnginePlugin = {
  name: string;
  version: string;
  capabilities: ['media-engine'];
  priority: number;
  canPlay(source: MediaSource): boolean;
  attach(ctx: MediaEngineContext): void | Promise<void>;
  detach?(ctx: MediaEngineContext): void;
};
