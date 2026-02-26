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
    try {
      ctx.media.load();
    } catch {
      // ignore
    }
    this.bindMediaEvents(ctx.media, ctx.events);
    this.bindCommands(ctx);

    // When preload="none" and play is requested, bump preload so the browser
    // will actually fetch resource metadata and fire loadedmetadata.
    this.commands.push(
      ctx.events.on('cmd:startLoad', () => {
        const s = ctx.player.state.current;
        if (['ready', 'playing', 'paused', 'waiting', 'seeking', 'ended'].includes(s)) return;
        if (ctx.media.preload !== 'none') return;
        ctx.media.preload = 'metadata';
        try {
          ctx.media.load();
        } catch {
          // ignore
        }
      })
    );
  }

  detach() {
    this.unbindCommands();
    this.unbindMediaEvents();
  }
}
