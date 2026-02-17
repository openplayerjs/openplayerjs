import type { MediaEngineContext, MediaSource } from '../core/media';
import { BaseMediaEngine } from './base';

export class DefaultMediaEngine extends BaseMediaEngine {
  name = 'default-engine';
  version = '1.0.0';
  capabilities = ['media-engine'];
  priority = 0;

  canPlay(source: MediaSource) {
    const media = document.createElement('video');
    return media.canPlayType(source.type || '') !== '';
  }

  attach(ctx: MediaEngineContext) {
    if (ctx.activeSource?.src && ctx.media.src !== ctx.activeSource.src) {
      ctx.media.src = ctx.activeSource.src;
    }
    this.bindMediaEvents(ctx.media, ctx.events);
    this.bindCommands(ctx);
    this.bindPlayPauseCommands(ctx);
    if (ctx.media.preload !== 'none') {
      try {
        ctx.media.load();
      } catch {
        // nothing
      }
    }
  }

  detach() {
    this.unbindCommands();
    this.unbindMediaEvents();
  }
}
