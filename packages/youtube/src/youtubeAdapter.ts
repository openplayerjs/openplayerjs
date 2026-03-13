import type { IframeMediaAdapter, IframeMediaAdapterEvents, IframePlaybackState } from '@openplayerjs/core';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
      PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayerOptions = {
  videoId: string;
  width?: number | string;
  height?: number | string;
  /**
   * Override the player host. Pass `'https://www.youtube-nocookie.com'` to
   * embed without setting cookies on the viewer's browser.
   */
  host?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: { target: YTPlayer }) => void;
    onStateChange?: (e: { data: number }) => void;
    onError?: (e: { data: number }) => void;
    onPlaybackRateChange?: (e: { data: number }) => void;
  };
};

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
  getOption?(module: string, option: string): any;
  setOption?(module: string, option: string, value: any): void;
};

// ─── YT player-state → adapter state ─────────────────────────────────────────

const YT_STATE_MAP: Record<number, IframePlaybackState> = {
  '-1': 'idle', // unstarted
  0: 'ended',
  1: 'playing',
  2: 'paused',
  3: 'buffering',
  5: 'idle', // video cued
};

// ─── API loader (shared singleton) ───────────────────────────────────────────

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });

  return apiLoadPromise;
}

// ─── Simple typed event emitter ───────────────────────────────────────────────

type HandlerSets = {
  [K in keyof IframeMediaAdapterEvents]?: Set<IframeMediaAdapterEvents[K]>;
};

// ─── YouTubeIframeAdapter ─────────────────────────────────────────────────────

export class YouTubeIframeAdapter implements IframeMediaAdapter {
  private player: YTPlayer | null = null;
  private readonly videoId: string;
  private readonly noCookie: boolean;
  private readonly handlers: HandlerSets = {};
  private iframeEl: HTMLIFrameElement | null = null;
  private _ready = false;
  private _pendingPlay = false;

  constructor(options: { videoId: string; noCookie?: boolean }) {
    this.videoId = options.videoId;
    this.noCookie = options.noCookie ?? false;
  }

  // ─── Event emitter ──────────────────────────────────────────────────────

  on<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    if (!this.handlers[evt]) {
      this.handlers[evt] = new Set() as any;
    }
    (this.handlers[evt] as Set<any>).add(cb);
  }

  off<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    (this.handlers[evt] as Set<any> | undefined)?.delete(cb);
  }

  private emit<E extends keyof IframeMediaAdapterEvents>(
    evt: E,
    ...args: Parameters<IframeMediaAdapterEvents[E] & ((...a: any[]) => void)>
  ): void {
    (this.handlers[evt] as Set<any> | undefined)?.forEach((cb: (...a: any[]) => void) => cb(...args));
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  async mount(container: HTMLElement): Promise<void> {
    await loadYouTubeAPI();

    // Ensure the container can act as a positioning context for the iframe.
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    // YT.Player replaces the given element with the iframe.
    const div = document.createElement('div');
    container.appendChild(div);

    return new Promise<void>((resolve) => {
      const opts: YTPlayerOptions = {
        videoId: this.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          cc_load_policy: 1,
        },
        events: {
          onReady: () => {
            // Stretch the iframe YT created to fill the container absolutely so it
            // overlays the hidden native media element regardless of its size.
            const iframe = container.querySelector('iframe');
            if (iframe) {
              this.iframeEl = iframe as HTMLIFrameElement;
              iframe.style.cssText =
                'position:absolute;top:0;left:0;width:100%;height:100%;border:0;pointer-events:none;';
              iframe.classList.add('op-youtube-iframe');
            }
            this._ready = true;
            if (this._pendingPlay) {
              this._pendingPlay = false;
              this.player?.playVideo();
            }
            this.emit('ready');
            resolve();
          },
          onStateChange: (e) => {
            const state: IframePlaybackState = YT_STATE_MAP[e.data] ?? 'idle';
            this.emit('state', state);
          },
          onError: (e) => {
            this.emit('error', e.data);
          },
          onPlaybackRateChange: (e) => {
            this.emit('ratechange', e.data);
          },
        },
      };

      if (this.noCookie) {
        opts.host = 'https://www.youtube-nocookie.com';
      }

      this.player = new window.YT!.Player(div, opts);
    });
  }

  destroy(): void {
    try {
      this.player?.destroy();
    } catch {
      // ignore
    }
    this.player = null;
    this.iframeEl = null;
    this._ready = false;
    this._pendingPlay = false;

    for (const key of Object.keys(this.handlers) as (keyof IframeMediaAdapterEvents)[]) {
      (this.handlers[key] as Set<any> | undefined)?.clear();
    }
  }

  getElement(): HTMLElement | null {
    return this.iframeEl;
  }

  // ─── Playback ───────────────────────────────────────────────────────────

  play(): void {
    if (!this._ready) {
      this._pendingPlay = true;
      return;
    }
    this.player?.playVideo();
  }

  pause(): void {
    this._pendingPlay = false;
    this.player?.pauseVideo();
  }

  seekTo(seconds: number): void {
    this.player?.seekTo(seconds, true);
  }

  // ─── Volume ─────────────────────────────────────────────────────────────

  /** Accepts 0..1; YT API uses 0..100. */
  setVolume(volume01: number): void {
    this.player?.setVolume(volume01 * 100);
  }

  /** Returns 0..1. */
  getVolume(): number {
    return (this.player?.getVolume() ?? 100) / 100;
  }

  mute(): void {
    this.player?.mute();
  }

  unmute(): void {
    this.player?.unMute();
  }

  isMuted(): boolean {
    return this.player?.isMuted() ?? false;
  }

  // ─── Rate ────────────────────────────────────────────────────────────────

  setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate(rate);
  }

  getPlaybackRate(): number {
    return this.player?.getPlaybackRate() ?? 1;
  }

  // ─── Time ────────────────────────────────────────────────────────────────

  getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  getDuration(): number {
    return this.player?.getDuration() ?? NaN;
  }

  // ─── Captions ────────────────────────────────────────────────────────────

  /** Returns available YouTube caption tracks (best-effort; undocumented API). */
  getAvailableCaptionTracks(): { id: string; label: string; language: string }[] {
    try {
      const tracklist: any[] = this.player?.getOption?.('captions', 'tracklist') ?? [];
      return tracklist.map((t: any) => ({
        id: String(t.languageCode ?? t.vss_id ?? ''),
        label: String(t.displayName ?? t.languageCode ?? ''),
        language: String(t.languageCode ?? ''),
      }));
    } catch {
      return [];
    }
  }

  /** Returns the active caption track language code, or null if captions are off. */
  getActiveCaptionTrack(): string | null {
    try {
      const track = this.player?.getOption?.('captions', 'track') as any;
      const code = track?.languageCode;
      return code && String(code).length > 0 ? String(code) : null;
    } catch {
      return null;
    }
  }

  /** Sets the active caption track by language code, or disables captions when null. */
  setCaptionTrack(languageCode: string | null): void {
    try {
      this.player?.setOption?.('captions', 'track', languageCode ? { languageCode } : {});
    } catch {
      // ignore — undocumented API, may not be available
    }
  }
}
