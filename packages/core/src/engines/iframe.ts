import { EventBus } from '../core/events';
import type { MediaSurface, MediaSurfaceEvent, MediaSurfaceEventMap } from '../core/surface';

// ─── Adapter state ────────────────────────────────────────────────────────────

export type IframePlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';

// ─── Adapter event map ────────────────────────────────────────────────────────

export type IframeMediaAdapterEvents = {
  ready: () => void;
  state: (s: IframePlaybackState) => void;
  timeupdate?: (currentTime: number) => void;
  durationchange?: (duration: number) => void;
  ratechange?: (rate: number) => void;
  volumechange?: (volume01: number, muted: boolean) => void;
  ended?: () => void;
  error?: (error: unknown) => void;
};

// ─── Adapter contract ─────────────────────────────────────────────────────────

export type IframeMediaAdapter = {
  // Lifecycle
  mount(container: HTMLElement): void | Promise<void>;
  destroy(): void;

  // Playback
  play(): Promise<void> | void;
  pause(): Promise<void> | void;
  seekTo(seconds: number): Promise<void> | void;

  // Volume
  setVolume(volume01: number): void;
  getVolume?(): number; // 0..1
  mute(): void;
  unmute(): void;
  isMuted?(): boolean;

  // Rate
  setPlaybackRate(rate: number): void;
  getPlaybackRate?(): number;

  // Time
  getCurrentTime(): number;
  getDuration(): number;

  // Optional
  getBuffered?(): TimeRanges | null;
  getElement?(): HTMLElement | null;
  setSize?(w: number, h: number): void;

  // Events
  on<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void;
  off<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void;
};

// ─── Surface options ──────────────────────────────────────────────────────────

export type IframeSurfaceOptions = {
  /** Polling interval (ms) for providers that don't emit timeupdate. Default: 250 */
  pollIntervalMs?: number;
};

// ─── IframeMediaSurface ───────────────────────────────────────────────────────

/**
 * A normalized MediaSurface backed by an IframeMediaAdapter.
 *
 * Usage inside an engine's attach():
 *   const surface = new IframeMediaSurface(adapter, { pollIntervalMs: 250 });
 *   ctx.setSurface(surface);
 *   this.bindSurfaceEvents(surface, ctx.events);  // wires internal bus → EventBus
 *   this.bindCommands(ctx);
 *   surface.mount(ctx.container);
 */
export class IframeMediaSurface implements MediaSurface {
  public readonly kind = 'iframe' as const;
  public element: HTMLElement | null = null;
  public currentSrc?: string;

  private readonly internalBus = new EventBus();
  private readonly adapter: IframeMediaAdapter;
  private readonly pollIntervalMs: number;
  private pollTimer: number | null = null;

  // Normalized state — updated by adapter events and polling
  private _paused = true;
  private _ended = false;
  private _playIntentAfterEnd = false;
  private _duration = NaN;
  private _currentTime = 0;
  private _volume = 1;
  private _muted = false;
  private _playbackRate = 1;

  constructor(adapter: IframeMediaAdapter, options: IframeSurfaceOptions = {}) {
    this.adapter = adapter;
    this.pollIntervalMs = options.pollIntervalMs ?? 250;

    this.onAdapterReady = this.onAdapterReady.bind(this);
    this.onAdapterState = this.onAdapterState.bind(this);
    this.onAdapterError = this.onAdapterError.bind(this);

    this.adapter.on('ready', this.onAdapterReady);
    this.adapter.on('state', this.onAdapterState);
    this.adapter.on('error' as keyof IframeMediaAdapterEvents, this.onAdapterError as any);

    // Wire optional push events
    this.adapter.on('timeupdate' as keyof IframeMediaAdapterEvents, ((t: number) => this.applyTime(t)) as any);
    this.adapter.on('durationchange' as keyof IframeMediaAdapterEvents, ((d: number) => this.applyDuration(d)) as any);
    this.adapter.on('ratechange' as keyof IframeMediaAdapterEvents, ((r: number) => this.applyRate(r)) as any);
    this.adapter.on(
      'volumechange' as keyof IframeMediaAdapterEvents,
      ((v: number, m: boolean) => this.applyVolume(v, m)) as any
    );
    this.adapter.on('ended' as keyof IframeMediaAdapterEvents, (() => this.applyEnded()) as any);
  }

  // ─── MediaSurface properties (getter + setter adjacent) ──────────────────

  get currentTime(): number {
    return this._currentTime;
  }
  set currentTime(value: number) {
    this._currentTime = value;
    this.internalBus.emit('seeking');
    void Promise.resolve(this.adapter.seekTo(value)).then(() => {
      this.internalBus.emit('seeked');
    });
  }

  get duration(): number {
    return this._duration;
  }
  set duration(_value: number) {
    // Provider-controlled; setter is required by the MediaSurface interface but is a no-op.
    void _value;
  }

  get volume(): number {
    return this._volume;
  }
  set volume(value: number) {
    const clamped = Math.min(1, Math.max(0, value));
    this.adapter.setVolume(clamped);
    this.applyVolume(clamped, this._muted);
  }

  get muted(): boolean {
    return this._muted;
  }
  set muted(value: boolean) {
    if (value) this.adapter.mute();
    else this.adapter.unmute();
    this.applyVolume(this._volume, value);
  }

  get playbackRate(): number {
    return this._playbackRate;
  }
  set playbackRate(value: number) {
    this.adapter.setPlaybackRate(value);
    this.applyRate(value);
  }

  get paused(): boolean {
    return this._paused;
  }

  get ended(): boolean {
    return this._ended;
  }

  // ─── MediaSurface methods ─────────────────────────────────────────────────

  load(_source?: { src: string; type?: string }): void {
    // No-op: iframe surfaces are initialized with a fixed source at construction time.
  }

  play(): Promise<void> {
    this._playIntentAfterEnd = this._ended;
    return Promise.resolve(this.adapter.play()).then(() => undefined);
  }

  pause(): void {
    void Promise.resolve(this.adapter.pause());
  }

  /**
   * Subscribe to surface events — satisfies MediaSurface.on() and is used by
   * bridgeSurfaceEvents / BaseMediaEngine.bindSurfaceEvents to forward events
   * onto the shared EventBus.
   */
  on<E extends MediaSurfaceEvent>(
    event: E,
    handler: (payload: MediaSurfaceEventMap[E]) => void,
    _options?: boolean | AddEventListenerOptions
  ): () => void {
    return this.internalBus.on(event as any, handler as any);
  }

  // ─── Extra lifecycle (beyond MediaSurface contract) ───────────────────────

  /** Mount the adapter iframe into a DOM container. Resolves once the adapter is ready. */
  async mount(container: HTMLElement): Promise<void> {
    await this.adapter.mount(container);
    // Polling starts in onAdapterReady() after the player signals it is initialized.
  }

  destroy(): void {
    this.stopPolling();
    this.adapter.off('ready', this.onAdapterReady);
    this.adapter.off('state', this.onAdapterState);
    this.adapter.off('error' as keyof IframeMediaAdapterEvents, this.onAdapterError as any);
    this.adapter.destroy();
    this.internalBus.clear();
  }

  // ─── Adapter → internal bus ───────────────────────────────────────────────

  private onAdapterReady(): void {
    this.applyDuration(this.safeNum(this.adapter.getDuration()));
    this.applyTime(this.safeNum(this.adapter.getCurrentTime()));

    if (this.adapter.getVolume) this.applyVolume(this.safeNum(this.adapter.getVolume()), this._muted);
    if (this.adapter.isMuted) this.applyVolume(this._volume, !!this.adapter.isMuted());
    if (this.adapter.getPlaybackRate) this.applyRate(this.safeNum(this.adapter.getPlaybackRate()));

    if (this.adapter.getElement) {
      this.element = this.adapter.getElement();
    }

    this.startPolling();
    this.internalBus.emit('loadedmetadata');
  }

  private onAdapterState(s: IframePlaybackState): void {
    switch (s) {
      case 'loading':
      case 'buffering':
        // Don't surface a loading state after the video has ended — the adapter
        // (e.g. YouTube) buffers as it auto-restarts, which would flicker the
        // loader on top of the ended/restart UI.  Only emit 'waiting' once the
        // user has expressed a new play intent.
        if (!this._ended || this._playIntentAfterEnd) this.internalBus.emit('waiting');
        break;

      case 'playing':
        // Some iframe providers fires a spurious PLAYING state immediately after ENDED.
        // Suppress it unless the user explicitly called play() after the video ended.
        if (this._ended && !this._playIntentAfterEnd) break;
        this._paused = false;
        this._ended = false;
        this._playIntentAfterEnd = false;
        this.internalBus.emit('play');
        this.internalBus.emit('playing');
        break;

      case 'paused':
        this._paused = true;
        this.internalBus.emit('pause');
        break;

      case 'ended': {
        // Prevent iframe providers to fire 'ended' spuriously when seekTo() lands within the
        // last ~2 s of the video before playback has actually completed. Only accept 'ended' when
        // the tracked position is close enough to the known duration, or when duration is
        // not yet known (NaN) so we never silently swallow a real end event.
        const ENDED_TOLERANCE_S = 2;
        if (Number.isFinite(this._duration) && this._currentTime < this._duration - ENDED_TOLERANCE_S) break;

        this._paused = true;
        this._ended = true;
        this.internalBus.emit('ended');
        // Explicitly pause the adapter so it doesn't auto-replay (e.g. YouTube
        // restarts from 0 after firing ENDED when seeking near the end).
        void Promise.resolve(this.adapter.pause());
        break;
      }

      case 'idle':
        break;

      case 'error':
        // Error detail arrives via onAdapterError
        break;
    }
  }

  private onAdapterError(err: unknown): void {
    this.internalBus.emit('error', err as any);
  }

  private applyTime(t: number): void {
    if (!Number.isFinite(t)) return;
    this._currentTime = t;
    if (!this._paused && !this._ended) this.internalBus.emit('timeupdate');
  }

  private applyDuration(d: number): void {
    if (!Number.isFinite(d) || d <= 0) return;
    if (d === this._duration) return;
    this._duration = d;
    this.internalBus.emit('durationchange');
  }

  private applyRate(r: number): void {
    if (!Number.isFinite(r) || r <= 0) return;
    if (r === this._playbackRate) return;
    this._playbackRate = r;
    this.internalBus.emit('ratechange');
  }

  private applyVolume(v: number, muted: boolean): void {
    if (!Number.isFinite(v)) return;
    const clamped = Math.min(1, Math.max(0, v));
    if (clamped === this._volume && !!muted === this._muted) return;
    this._volume = clamped;
    this._muted = !!muted;
    this.internalBus.emit('volumechange');
  }

  private applyEnded(): void {
    this._ended = true;
    this._paused = true;
    this.internalBus.emit('ended');
  }

  // ─── Polling ──────────────────────────────────────────────────────────────

  private startPolling(): void {
    if (this.pollTimer != null) return;

    const tick = () => {
      this.applyTime(this.safeNum(this.adapter.getCurrentTime()));
      this.applyDuration(this.safeNum(this.adapter.getDuration()));
      if (this.adapter.getVolume || this.adapter.isMuted) {
        const vol = this.adapter.getVolume ? this.safeNum(this.adapter.getVolume()) : this._volume;
        const mut = this.adapter.isMuted ? !!this.adapter.isMuted() : this._muted;
        this.applyVolume(vol, mut);
      }
      if (this.adapter.getPlaybackRate) this.applyRate(this.safeNum(this.adapter.getPlaybackRate()));
      this.pollTimer = window.setTimeout(tick, this.pollIntervalMs);
    };

    this.pollTimer = window.setTimeout(tick, this.pollIntervalMs);
  }

  private stopPolling(): void {
    if (this.pollTimer != null) {
      window.clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private safeNum(n: unknown): number {
    const v = Number(n);
    return Number.isFinite(v) ? v : NaN;
  }
}
