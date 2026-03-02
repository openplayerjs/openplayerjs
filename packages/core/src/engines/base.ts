import { EVENT_OPTIONS } from '../core/constants';
import type { Listener } from '../core/events';
import type { MediaEngineContext, MediaSource } from '../core/media';

type MediaListener = {
  type: keyof HTMLMediaElementEventMap;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
};

export type IEngine = {
  getAdapter?<T = unknown>(): T | undefined;
};

export abstract class BaseMediaEngine {
  protected media: HTMLMediaElement | null = null;
  protected events: MediaEngineContext['events'] | null = null;

  protected commands: Listener[] = [];
  private mediaListeners: MediaListener[] = [];

  abstract name: string;
  abstract version: string;
  abstract capabilities: string[];
  abstract priority: number;

  abstract canPlay(source: MediaSource): boolean;
  abstract attach(ctx: MediaEngineContext): void;
  abstract detach(): void;

  /**
   * Bridge real HTMLMediaElement events into the player EventBus using
   * HTML5 event names (no payload; consumers read from player/media).
   */
  protected bindMediaEvents(media: HTMLMediaElement, events: MediaEngineContext['events']) {
    this.media = media;
    this.events = events;

    const onLoadedMetadata = () => events.emit('loadedmetadata');
    const onDurationChange = () => events.emit('durationchange');
    const onTimeUpdate = () => events.emit('timeupdate');
    const onWaiting = () => events.emit('waiting');
    const onSeeking = () => events.emit('seeking');
    const onSeeked = () => events.emit('seeked');
    const onEnded = () => events.emit('ended');
    const onError = () => events.emit('error', media.error);
    const onPlay = () => events.emit('play');
    const onPlaying = () => events.emit('playing');
    const onPause = () => events.emit('pause');
    const onVolumeChange = () => events.emit('volumechange');
    const onRateChange = () => events.emit('ratechange');

    this.addMediaListener(media, 'loadedmetadata', onLoadedMetadata, EVENT_OPTIONS);
    this.addMediaListener(media, 'durationchange', onDurationChange, EVENT_OPTIONS);
    this.addMediaListener(media, 'timeupdate', onTimeUpdate, EVENT_OPTIONS);
    this.addMediaListener(media, 'waiting', onWaiting, EVENT_OPTIONS);
    this.addMediaListener(media, 'seeking', onSeeking, EVENT_OPTIONS);
    this.addMediaListener(media, 'seeked', onSeeked, EVENT_OPTIONS);
    this.addMediaListener(media, 'ended', onEnded, EVENT_OPTIONS);
    this.addMediaListener(media, 'error', onError, EVENT_OPTIONS);
    this.addMediaListener(media, 'playing', onPlaying, EVENT_OPTIONS);
    this.addMediaListener(media, 'pause', onPause, EVENT_OPTIONS);
    this.addMediaListener(media, 'play', onPlay, EVENT_OPTIONS);
    this.addMediaListener(media, 'volumechange', onVolumeChange, EVENT_OPTIONS);
    this.addMediaListener(media, 'ratechange', onRateChange, EVENT_OPTIONS);
  }

  protected unbindMediaEvents() {
    if (!this.media) return;
    for (const l of this.mediaListeners) {
      this.media.removeEventListener(l.type, l.handler, l.options);
    }
    this.mediaListeners = [];
  }

  protected addMediaListener(
    media: HTMLMediaElement,
    type: keyof HTMLMediaElementEventMap,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) {
    media.addEventListener(type, handler, options);
    this.mediaListeners.push({ type, handler, options });
  }

  protected canHandlePlayback(ctx: MediaEngineContext): boolean {
    const owner = ctx.core.leases.owner('playback');
    return !owner || owner === this.name;
  }

  /**
   * Commands are explicit and separate from notifications.
   */
  protected bindCommands(ctx: MediaEngineContext) {
    const { media, events } = ctx;

    this.commands.push(
      events.on('cmd:seek', (t: number) => {
        if (!this.canHandlePlayback(ctx)) return;
        try {
          media.currentTime = t;
        } catch {
          // ignore
        }
      })
    );

    this.commands.push(
      events.on('cmd:setVolume', (v: number) => {
        media.volume = v;
      })
    );
    this.commands.push(
      events.on('cmd:setMuted', (m: boolean) => {
        media.muted = m;
      })
    );
    this.commands.push(
      events.on('cmd:setRate', (r: number) => {
        if (!this.canHandlePlayback(ctx)) return;
        media.playbackRate = r;
      })
    );

    this.bindPlayPauseCommands(ctx);
  }

  protected unbindCommands() {
    for (const off of this.commands) off();
    this.commands = [];
  }

  protected bindPlayPauseCommands(ctx: MediaEngineContext) {
    const { media, events } = ctx;

    this.commands.push(
      events.on('cmd:play', () => {
        if (!this.canHandlePlayback(ctx)) return;
        this.playImpl(media);
      })
    );

    this.commands.push(
      events.on('cmd:pause', () => {
        if (!this.canHandlePlayback(ctx)) return;
        this.pauseImpl(media);
      })
    );
  }

  private playImpl(media: HTMLMediaElement): void {
    void media.play().catch(() => {
      // ignore
    });
  }

  private pauseImpl(media: HTMLMediaElement) {
    media.pause();
  }
}
