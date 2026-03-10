import { EVENT_OPTIONS } from './constants';
import type { EventBus } from './events';

export type MediaSurfaceEventMap = {
  loadstart: void;
  loadedmetadata: void;
  durationchange: void;
  timeupdate: void;
  waiting: void;
  seeking: void;
  seeked: void;
  ended: void;
  error: unknown;
  play: void;
  playing: void;
  pause: void;
  volumechange: void;
  ratechange: void;
};

export type MediaSurfaceEvent = keyof MediaSurfaceEventMap;

export type MediaSurface = {
  /**
   * Optional DOM element that visually represents the surface.
   * Native engines return the underlying <video>/<audio>; iframe engines can
   * return a wrapper div/iframe.
   */
  readonly element?: HTMLElement | null;
  readonly currentSrc?: string;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  paused: boolean;
  ended: boolean;
  load?(source?: { src: string; type?: string }): void | Promise<void>;
  play(): void | Promise<void>;
  pause(): void;
  destroy?(): void;
  on<E extends MediaSurfaceEvent>(
    event: E,
    handler: (payload: MediaSurfaceEventMap[E]) => void,
    options?: boolean | AddEventListenerOptions
  ): () => void;
};

/**
 * Wrap a native HTMLMediaElement inside the normalized MediaSurface contract.
 */
export class HtmlMediaSurface implements MediaSurface {
  readonly element: HTMLMediaElement;

  constructor(private readonly media: HTMLMediaElement) {
    this.element = media;
  }

  get currentSrc(): string {
    return this.media.currentSrc || this.media.src || '';
  }

  get currentTime(): number {
    return this.media.currentTime || 0;
  }
  set currentTime(value: number) {
    this.media.currentTime = value;
  }

  get duration(): number {
    return this.media.duration;
  }
  set duration(_value: number) {
    // Native media duration is read-only.
  }

  get volume(): number {
    return this.media.volume;
  }
  set volume(value: number) {
    this.media.volume = value;
  }

  get muted(): boolean {
    return this.media.muted;
  }
  set muted(value: boolean) {
    this.media.muted = value;
  }

  get playbackRate(): number {
    return this.media.playbackRate;
  }
  set playbackRate(value: number) {
    this.media.playbackRate = value;
  }

  get paused(): boolean {
    return this.media.paused;
  }

  get ended(): boolean {
    return this.media.ended;
  }

  load(source?: { src: string; type?: string }): void {
    if (source?.src && this.media.src !== source.src) {
      this.media.src = source.src;
    }
    this.media.load();
  }

  play(): Promise<void> | void {
    return this.media.play();
  }

  pause(): void {
    this.media.pause();
  }

  on<E extends MediaSurfaceEvent>(
    event: E,
    handler: (payload: MediaSurfaceEventMap[E]) => void,
    options?: boolean | AddEventListenerOptions
  ): () => void {
    const wrapped = ((evt: Event) => {
      if (event === 'error') {
        handler((this.media.error ?? evt) as MediaSurfaceEventMap[E]);
        return;
      }
      handler(undefined as MediaSurfaceEventMap[E]);
    }) as EventListener;

    this.media.addEventListener(event, wrapped, options);
    return () => this.media.removeEventListener(event, wrapped, options);
  }
}

export function bridgeSurfaceEvents(surface: MediaSurface, events: EventBus): (() => void)[] {
  return [
    surface.on('loadstart', () => events.emit('loadstart'), EVENT_OPTIONS),
    surface.on('loadedmetadata', () => events.emit('loadedmetadata'), EVENT_OPTIONS),
    surface.on('durationchange', () => events.emit('durationchange'), EVENT_OPTIONS),
    surface.on('timeupdate', () => events.emit('timeupdate'), EVENT_OPTIONS),
    surface.on('waiting', () => events.emit('waiting'), EVENT_OPTIONS),
    surface.on('seeking', () => events.emit('seeking'), EVENT_OPTIONS),
    surface.on('seeked', () => events.emit('seeked'), EVENT_OPTIONS),
    surface.on('ended', () => events.emit('ended'), EVENT_OPTIONS),
    surface.on('error', (error) => events.emit('error', error), EVENT_OPTIONS),
    surface.on('play', () => events.emit('play'), EVENT_OPTIONS),
    surface.on('playing', () => events.emit('playing'), EVENT_OPTIONS),
    surface.on('pause', () => events.emit('pause'), EVENT_OPTIONS),
    surface.on('volumechange', () => events.emit('volumechange'), EVENT_OPTIONS),
    surface.on('ratechange', () => events.emit('ratechange'), EVENT_OPTIONS),
  ];
}
