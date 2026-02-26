import type { IEngine, MediaEngineContext, MediaSource } from '@openplayer/core';
import { BaseMediaEngine, EVENT_OPTIONS } from '@openplayer/core';
import type { Events, HlsListeners } from 'hls.js';
import Hls from 'hls.js';

type AdapterListener = {
  event: keyof HlsListeners;
  handler: (...args: any[]) => void;
  options?: any;
};

export class HlsMediaEngine extends BaseMediaEngine implements IEngine {
  name = 'hls-engine';
  version = '1.0.0';
  capabilities = ['media-engine'];
  priority = 50;

  private adapter: Hls | null = null;
  private attemptedErrorRecovery: number | null = null;
  private recoverSwapAudioCodecDate: number | null = null;
  private startedLoad = false;
  private adapterListeners: AdapterListener[] = [];

  constructor(private config: any = {}) {
    super();
  }

  getAdapter<T = Hls>(): T | undefined {
    return this.adapter as T;
  }

  canPlay(source: MediaSource) {
    if (!Hls.isSupported()) return false;
    if (source.type === 'application/x-mpegURL' || source.type === 'application/vnd.apple.mpegurl') return true;
    try {
      const u = new URL(source.src, window.location.href);
      return u.pathname.endsWith('.m3u8');
    } catch {
      return source.src.split('?')[0].endsWith('.m3u8');
    }
  }

  attach(ctx: MediaEngineContext) {
    this.bindMediaEvents(ctx.media, ctx.events);
    this.bindCommands(ctx);

    const autoStartLoad = ctx.media.autoplay || ctx.media.preload !== 'none';

    this.adapter = new Hls({
      autoStartLoad,
      lowLatencyMode: true,
      backBufferLength: 90,
      renderTextTracksNatively: true,
      enableWebVTT: true,
      ...this.config,
    });
    this.adapter.loadSource(ctx.activeSource?.src || '');
    this.adapter.attachMedia(ctx.media);

    for (const e of Object.values(Hls.Events) as Events[]) {
      this.onAdapterEvent(
        e,
        (...args: any[]) => {
          const data = args.length > 1 ? args[1] : args[0];
          ctx.events.emit(e, data);
        },
        EVENT_OPTIONS
      );
    }

    const onPlay = () => {
      if (!this.canHandlePlayback(ctx)) {
        // If another surface owns playback (ads/cast/etc), force content back to paused.
        try {
          ctx.media.pause();
        } catch {
          //
        }
        return;
      }
      if (!this.adapter) return;
      if (autoStartLoad) return;
      if (this.startedLoad) return;
      this.startedLoad = true;
      this.adapter.startLoad();
    };

    const onPause = () => {
      if (!autoStartLoad && this.adapter) {
        this.adapter.stopLoad();
        this.startedLoad = false;
      }
    };

    this.addMediaListener(ctx.media, 'play', onPlay);
    this.addMediaListener(ctx.media, 'pause', onPause);

    this.commands.push(
      ctx.events.on('cmd:startLoad', () => {
        if (!this.adapter) return;
        if (autoStartLoad) return;
        if (this.startedLoad) return;
        this.startedLoad = true;
        this.adapter.startLoad();
      })
    );

    this.onAdapterEvent(Hls.Events.MANIFEST_PARSED, () => ctx.events.emit('loadedmetadata'), EVENT_OPTIONS);
    this.onAdapterEvent(
      Hls.Events.MEDIA_ATTACHED,
      () => {
        if (ctx.media.autoplay && this.canHandlePlayback(ctx)) {
          ctx.media.muted = true;
          try {
            ctx.media.play();
          } catch {
            // Nothing
          }
        }
      },
      EVENT_OPTIONS
    );
    this.onAdapterEvent(
      Hls.Events.LEVEL_UPDATED,
      (_, { details }) => {
        ctx.player.isLive = details.live;
        ctx.events.emit('media:duration', details.totalduration);
      },
      EVENT_OPTIONS
    );
    this.onAdapterEvent(
      Hls.Events.LEVEL_LOADED,
      (_, { details }) => {
        ctx.player.isLive = details.live;
        ctx.events.emit('media:duration', details.totalduration);
      },
      EVENT_OPTIONS
    );
    this.onAdapterEvent(
      Hls.Events.FRAG_PARSING_METADATA,
      (_, data) => ctx.events.emit('playback:metadataready', { data }),
      EVENT_OPTIONS
    );
    this.onAdapterEvent(
      Hls.Events.SUBTITLE_TRACKS_UPDATED,
      () => ctx.events.emit('texttrack:listchange'),
      EVENT_OPTIONS
    );
    this.onAdapterEvent(
      Hls.Events.ERROR,
      (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.MEDIA_ERROR: {
              const now = Date.now();
              if (!this.attemptedErrorRecovery || now - this.attemptedErrorRecovery > 3000) {
                this.attemptedErrorRecovery = now;
                this.adapter?.recoverMediaError();
              } else {
                if (!this.recoverSwapAudioCodecDate || now - this.recoverSwapAudioCodecDate > 3000) {
                  this.recoverSwapAudioCodecDate = now;
                  this.adapter?.swapAudioCodec();
                  this.adapter?.recoverMediaError();
                }
              }
              break;
            }
            case Hls.ErrorTypes.NETWORK_ERROR:
              // All retries and media options have been exhausted.
              // Immediately trying to restart loading could cause loop loading.
              // Consider modifying loading policies to best fit your asset and network
              // conditions (manifestLoadPolicy, playlistLoadPolicy, fragLoadPolicy).
              break;
            default:
              this.adapter?.destroy();
              this.adapter = null;
              break;
          }
        }

        ctx.events.emit('playback:error', data);
      },
      EVENT_OPTIONS
    );
  }

  detach() {
    this.unbindCommands();
    this.unbindMediaEvents();
    this.unbindAdapterEvents();
    this.adapter?.detachMedia();
    this.adapter?.destroy();
    this.adapter = null;
    this.startedLoad = false;
  }

  private onAdapterEvent(event: keyof HlsListeners, handler: (...args: any[]) => void, options?: any) {
    if (!this.adapter) return;
    this.adapter.on(event as any, handler);
    this.adapterListeners.push({ event, handler, options });
  }

  private unbindAdapterEvents() {
    if (!this.adapter) {
      this.adapterListeners = [];
      return;
    }

    for (const l of this.adapterListeners) {
      this.adapter.off(l.event, l.handler);
    }
    this.adapterListeners = [];
  }
}
