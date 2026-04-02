import type { EventBus, Listener } from '../core/events';
import type { MediaEngineContext, MediaSource } from '../core/media';
import type { MediaSurface } from '../core/surface';
import { bridgeSurfaceEvents } from '../core/surface';

export type IEngine<T = unknown> = {
  getAdapter?(): T | undefined;
};

export abstract class BaseMediaEngine {
  protected surface: MediaSurface | null = null;
  protected events: MediaEngineContext['events'] | null = null;
  protected commands: Listener[] = [];
  private surfaceListeners: (() => void)[] = [];

  abstract name: string;
  abstract version: string;
  abstract capabilities: string[];
  abstract priority: number;
  abstract canPlay(source: MediaSource): boolean;
  abstract attach(ctx: MediaEngineContext): void | Promise<void>;
  abstract detach(ctx?: MediaEngineContext): void;

  protected bindSurfaceEvents(surface: MediaSurface, events: MediaEngineContext['events']): void {
    this.surface = surface;
    this.events = events;
    this.surfaceListeners = bridgeSurfaceEvents(surface, events);
  }

  protected unbindSurfaceEvents(): void {
    this.surfaceListeners.forEach((off) => off());
    this.surfaceListeners = [];
  }

  protected createMediaSurfaceShim(media: HTMLMediaElement): MediaSurface {
    return {
      get currentTime() {
        return media.currentTime;
      },
      set currentTime(v: number) {
        media.currentTime = v;
      },
      get duration() {
        return media.duration;
      },
      set duration(_v: number) {
        /* read-only */
      },
      get volume() {
        return media.volume;
      },
      set volume(v: number) {
        media.volume = v;
      },
      get muted() {
        return media.muted;
      },
      set muted(v: boolean) {
        media.muted = v;
      },
      get playbackRate() {
        return media.playbackRate;
      },
      set playbackRate(v: number) {
        media.playbackRate = v;
      },
      get paused() {
        return media.paused;
      },
      get ended() {
        return media.ended;
      },
      play: () => media.play(),
      pause: () => media.pause(),
      on: (event, handler) => {
        const wrapped = () => (handler as () => void)();
        media.addEventListener(event, wrapped);
        return () => media.removeEventListener(event, wrapped);
      },
    };
  }

  protected bindMediaEvents(media: HTMLMediaElement, events: EventBus): void {
    const shim = this.createMediaSurfaceShim(media);
    this.surfaceListeners = bridgeSurfaceEvents(shim, events);
  }

  protected unbindMediaEvents(): void {
    this.unbindSurfaceEvents();
  }

  protected addMediaListener(
    media: HTMLMediaElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    media.addEventListener(event, handler, options);
    this.surfaceListeners.push(() => media.removeEventListener(event, handler, options));
  }

  protected canHandlePlayback(ctx: MediaEngineContext): boolean {
    const owner = ctx.core.leases.owner('playback');
    return !owner || owner === this.name;
  }

  protected bindCommands(ctx: MediaEngineContext): void {
    const { events } = ctx;

    this.commands.push(
      events.on('cmd:seek', (t: number) => {
        if (!this.canHandlePlayback(ctx)) return;
        try {
          ctx.surface.currentTime = t;
        } catch {
          // ignore
        }
      })
    );

    this.commands.push(
      events.on('cmd:setVolume', (v: number) => {
        try {
          ctx.surface.volume = v;
        } catch {
          // ignore
        }
      })
    );

    this.commands.push(
      events.on('cmd:setMuted', (m: boolean) => {
        try {
          ctx.surface.muted = m;
        } catch {
          // ignore
        }
      })
    );

    this.commands.push(
      events.on('cmd:setRate', (r: number) => {
        if (!this.canHandlePlayback(ctx)) return;
        try {
          ctx.surface.playbackRate = r;
        } catch {
          // ignore
        }
      })
    );

    this.bindPlayPauseCommands(ctx);
  }

  protected unbindCommands(): void {
    for (const off of this.commands) off();
    this.commands = [];
  }

  protected bindPlayPauseCommands(ctx: MediaEngineContext): void {
    const { events } = ctx;

    this.commands.push(
      events.on('cmd:play', () => {
        if (!this.canHandlePlayback(ctx)) return;
        this.playImpl(ctx.surface);
      })
    );

    this.commands.push(
      events.on('cmd:pause', () => {
        if (!this.canHandlePlayback(ctx)) return;
        this.pauseImpl(ctx.surface);
      })
    );
  }

  private playImpl(surface: MediaSurface): void {
    const maybePromise = surface.play();
    if (maybePromise && typeof (maybePromise as Promise<void>).catch === 'function') {
      void (maybePromise as Promise<void>).catch(() => {
        // ignore
      });
    }
  }

  private pauseImpl(surface: MediaSurface): void {
    surface.pause();
  }
}
