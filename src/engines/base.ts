import { EVENT_OPTIONS } from '../core/constants';
import type { Listener } from '../core/events';
import type { MediaEngineContext, MediaSource } from '../core/media';

type MediaListener = {
  type: keyof HTMLMediaElementEventMap;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
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

  protected bindMediaEvents(media: HTMLMediaElement, events: MediaEngineContext['events']) {
    this.media = media;
    this.events = events;

    const onLoadedMetadata = () => {
      events.emit('media:loadedmetadata');
      events.emit('media:duration', media.duration);
      events.emit('playback:ready');
    };

    const onDurationChange = () => events.emit('media:duration', media.duration);
    const onTimeUpdate = () => events.emit('media:timeupdate', media.currentTime);
    const onWaiting = () => events.emit('playback:waiting');
    const onSeeking = () => events.emit('playback:seeking');
    const onSeeked = () => events.emit('playback:seeked');
    const onEnded = () => events.emit('playback:ended');
    const onError = () => events.emit('playback:error', media.error);
    const onPlay = () => events.emit('playback:play');
    const onPlaying = () => events.emit('playback:playing');
    const onPause = () => events.emit('playback:paused');

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
    const owner = ctx.player.leases.owner('playback');
    return !owner || owner === this.name;
  }

  protected bindCommands(ctx: MediaEngineContext) {
    const { media, events } = ctx;

    this.commands.push(
      events.on('playback:seek', (t: number) => {
        if (!this.canHandlePlayback(ctx)) return;
        try {
          media.currentTime = t;
        } catch {
          // Nothing to do
        }
      })
    );

    this.commands.push(
      events.on('media:volume', (v: number) => {
        if (!this.canHandlePlayback(ctx)) return;
        media.volume = v;
      })
    );
    this.commands.push(
      events.on('media:muted', (m: boolean) => {
        if (!this.canHandlePlayback(ctx)) return;
        media.muted = m;
      })
    );
    this.commands.push(
      events.on('media:rate', (r: number) => {
        if (!this.canHandlePlayback(ctx)) return;
        media.playbackRate = r;
      })
    );
  }

  protected unbindCommands() {
    for (const off of this.commands) off();
    this.commands = [];
  }

  protected bindPlayPauseCommands(ctx: MediaEngineContext) {
    const { media, events } = ctx;
    this.commands.push(
      events.on('playback:play', () => {
        if (!this.canHandlePlayback(ctx)) return;
        this.playImpl(media);
      })
    );
    this.commands.push(
      events.on('playback:pause', () => {
        if (!this.canHandlePlayback(ctx)) return;
        this.pauseImpl(media);
      })
    );
  }

  private playImpl(media: HTMLMediaElement): void {
    void media.play().catch(() => {
      //
    });
  }

  private pauseImpl(media: HTMLMediaElement) {
    media.pause();
  }
}
