import type { MediaEngineContext, MediaSource } from '../core/media';
import { BaseMediaEngine } from './base';

export class DefaultMediaEngine extends BaseMediaEngine {
  name = 'default-engine';
  version = '1.0.0';
  capabilities = ['media-engine'];
  priority = 0;

  canPlay(source: MediaSource): boolean {
    const media = document.createElement('video');
    return media.canPlayType(source.type || '') !== '';
  }

  attach(ctx: MediaEngineContext): void {
    const surface = ctx.resetSurface();

    try {
      surface.load?.(ctx.activeSource);
    } catch {
      // ignore
    }

    this.bindSurfaceEvents(surface, ctx.events);
    this.bindCommands(ctx);

    this.commands.push(
      ctx.events.on('cmd:startLoad', () => {
        const s = ctx.core.state.current;
        if (['ready', 'playing', 'paused', 'waiting', 'seeking', 'ended'].includes(s)) return;
        // ctx.media.preload is intentionally read/written here: it is a DOM attribute
        // with no surface equivalent. The surface abstraction covers playback operations
        // only; loading hints are DOM-level concerns that must be set directly on the element.
        if (ctx.media.preload !== 'none') return;
        ctx.media.preload = 'metadata';
        try {
          surface.load?.(ctx.activeSource);
        } catch {
          // ignore
        }
      })
    );
  }

  detach(_ctx?: MediaEngineContext): void {
    this.unbindCommands();
    this.unbindSurfaceEvents();
  }
}
