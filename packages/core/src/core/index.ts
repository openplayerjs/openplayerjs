import { DefaultMediaEngine } from '../engines/html5';
import { defaultConfiguration, type PlayerConfig } from './configuration';
import { DisposableStore } from './dispose';
import type { PlayerEvent } from './events';
import { EventBus } from './events';
import { Lease } from './lease';
import type { MediaEngineContext, MediaEnginePlugin, MediaSource } from './media';
import type { PlayerPlugin } from './plugin';
import { PluginRegistry } from './plugin';
import type { PlaybackState } from './state';
import { StateManager } from './state';
import { predictMimeType } from './utils';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export class Core {
  media: HTMLMediaElement;
  isLive = false;
  events = new EventBus();
  leases = new Lease();
  state = new StateManager<PlaybackState>('idle');
  config: PlayerConfig;
  userInteracted = false;
  canAutoplay = false;
  canAutoplayMuted = false;

  private interactionUnsubs: (() => void)[] = [];

  private plugins = new PluginRegistry();
  private pluginDisposables = new WeakMap<PlayerPlugin, DisposableStore>();

  private _src?: string;
  private _volume = 1;
  private _playbackRate = 1;
  private _currentTime = 0;
  private _muted = false;
  private _duration = 0;
  private detectedSources?: MediaSource[];
  private activeEngine?: MediaEnginePlugin;
  private playerContext: MediaEngineContext | null = null;

  private autoplaySupport?: { autoplay: boolean; muted: boolean };
  private autoplaySupportPromise?: Promise<{ autoplay: boolean; muted: boolean }>;

  private readyPromise?: Promise<void>;
  private readyResolve?: () => void;
  private readyReject?: (e?: unknown) => void;

  private playRequestPromise?: Promise<void>;

  constructor(media: HTMLMediaElement | string, config: PlayerConfig = {}) {
    if (typeof media === 'string') {
      const el = document.querySelector(media);
      if (!el || !(el instanceof HTMLMediaElement)) {
        throw new Error(`OpenPlayer: could not find media element for selector: ${media}`);
      }
      this.media = el;
    } else {
      this.media = media;
    }
    this.registerPlugin(new DefaultMediaEngine());
    this.config = { ...defaultConfiguration, ...config };
    this.media.currentTime = this.config.startTime || this.media.currentTime;
    this._currentTime = this.config.startTime || this.media.currentTime;
    this._duration = this.config.duration || this.media.duration;
    const initialVolume = clamp01(this.config.startVolume ?? this.media.volume);
    this.media.volume = initialVolume;
    this._volume = initialVolume;

    if (this.config.startVolume !== undefined) {
      this.media.muted = initialVolume <= 0;
      this._muted = initialVolume <= 0;
    } else {
      this._muted = this.media.muted;
    }
    this.media.playbackRate = this.config.startPlaybackRate || this.media.playbackRate;
    this._playbackRate = this.config.startPlaybackRate || this.media.playbackRate;

    (this.config.plugins || []).forEach((p) => this.registerPlugin(p));
    this.bindStateTransitions();
    this.bindMediaSync();
    this.bindLeaseSync();
    this.bindFirstInteraction();
    queueMicrotask(() => this.maybeAutoLoad());
  }

  on<E extends PlayerEvent>(event: E, cb: (payload?: any) => void) {
    // Keep the surface flexible (plugins may emit custom events).
    return this.events.on(event, cb);
  }

  emit(event: PlayerEvent | string, payload?: any) {
    this.events.emit(event, payload);
    this.plugins
      .all()
      .filter((p: any) => !p.capabilities?.includes('media-engine'))
      .forEach((p: PlayerPlugin) => {
        p.onEvent?.(event as PlayerEvent, payload);
      });
  }

  registerPlugin(plugin: PlayerPlugin) {
    this.plugins.register(plugin);

    const dispose = new DisposableStore();
    this.pluginDisposables.set(plugin, dispose);

    plugin.setup?.({
      core: this,
      media: this.media,
      events: this.events,
      state: this.state,
      leases: this.leases,
      dispose,
      add: (d: (() => void) | void | null) => dispose.add(d ?? undefined),
      on: (event: string, cb: (payload?: any) => void) => dispose.add(this.events.on(event, cb)),
      listen: (
        target: EventTarget,
        type: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) => dispose.addEventListener(target, type, handler, options),
    });
  }

  set src(value: string | undefined) {
    this._src = value;
    if (value) {
      this.detectedSources = [{ src: value, type: predictMimeType(this.media, value) }];
      this.emit('source:set', value);
      // Tear down any active engine so that load() can re-initialise cleanly
      // with the new source, even when the player is already in a non-idle state.
      if (this.playerContext) {
        this.activeEngine?.detach?.(this.playerContext);
        this.activeEngine = undefined;
        this.playerContext = null;
      }
      this.state.transition('idle');
      this.readyPromise = undefined;
      this.readyResolve = undefined;
      this.readyReject = undefined;
      this.playRequestPromise = undefined;

      queueMicrotask(() => this.load());
    }
  }

  get src() {
    return this._src;
  }

  get volume() {
    return this._volume;
  }

  set volume(v: number) {
    const next = clamp01(v);
    this._volume = next;
    this.emit('cmd:setVolume', next);
  }

  get muted() {
    return this._muted;
  }

  set muted(muted: boolean) {
    this._muted = muted;
    this.emit('cmd:setMuted', muted);
  }

  set playbackRate(rate: number) {
    this._playbackRate = rate;
    this.emit('cmd:setRate', rate);
  }

  get playbackRate(): number {
    return this._playbackRate;
  }

  set currentTime(time: number) {
    this._currentTime = time;
    this.emit('cmd:seek', time);
  }

  get currentTime(): number {
    return this._currentTime;
  }

  get duration(): number {
    return this._duration;
  }

  load() {
    if (this.state.current !== 'idle') return;

    this.emit('cmd:startLoad');
    this.createReadyPromise();

    const sources = this.detectedSources ?? this.readMediaSources(this.media);
    this.detectedSources = sources;
    const { engine, source: activeSource } = this.resolveMediaEngine(sources);

    this.playerContext = {
      media: this.media,
      events: this.events,
      config: this.config,
      activeSource,
      core: this,
    };

    this.activeEngine?.detach?.(this.playerContext);
    this.activeEngine = engine;

    this.emit('loadstart');

    this.emit('cmd:load');

    this.activeEngine.attach(this.playerContext);

    this.emit('cmd:setVolume', this._volume);
    this.emit('cmd:setMuted', this._muted);
    this.emit('cmd:setRate', this._playbackRate);
    if (this._currentTime) this.emit('cmd:seek', this._currentTime);
  }

  async whenReady(): Promise<void> {
    if (
      this.state.current === 'ready' ||
      this.state.current === 'playing' ||
      this.state.current === 'paused' ||
      this.state.current === 'waiting' ||
      this.state.current === 'seeking' ||
      this.state.current === 'ended'
    ) {
      return;
    }

    if (!this.activeEngine) this.load();
    this.createReadyPromise();
    return this.readyPromise ?? Promise.resolve();
  }

  async play() {
    if (this.playRequestPromise) return this.playRequestPromise;

    if (!this.activeEngine) this.load();

    // Emit cmd:play synchronously while the user-gesture task is still active.
    // Browsers (especially Safari) require media.play() to be called in the same
    // microtask/task as the user interaction; any await before this would cause
    // the autoplay policy to reject the play() call on unmuted media.
    this.emit('cmd:play');

    // Await readiness for state-machine consistency (does not re-emit cmd:play).
    this.playRequestPromise = this.whenReady().finally(() => {
      this.playRequestPromise = undefined;
    });

    return this.playRequestPromise;
  }

  async determineAutoplaySupport(): Promise<{ autoplay: boolean; muted: boolean }> {
    if (this.autoplaySupport) return this.autoplaySupport;
    if (this.autoplaySupportPromise) return this.autoplaySupportPromise;

    // Gate on readiness, but don't fail detection if readiness never arrives.
    await this.whenReady().catch(() => {});

    const media = this.media;
    const defaultVol = media.volume;
    const defaultMuted = media.muted;

    const restore = () => {
      try {
        media.volume = defaultVol;
      } catch {
        // ignore
      }
      try {
        media.muted = defaultMuted;
      } catch {
        // ignore
      }
      // Keep Player state consistent with the underlying element.
      this._volume = defaultVol;
      this._muted = defaultMuted;
    };

    this.autoplaySupportPromise = (async () => {
      try {
        // Attempt unmuted autoplay first.
        try {
          const playPromise = media.play();
          if (playPromise !== undefined) await playPromise;
          try {
            media.pause();
          } catch {
            // ignore
          }
          this.canAutoplay = true;
          this.canAutoplayMuted = false;
          return { autoplay: true, muted: false };
        } catch {
          // Unmuted autoplay failed; retry muted autoplay.
          try {
            media.volume = 0;
            media.muted = true;
            this._volume = 0;
            this._muted = true;
          } catch {
            // ignore
          }

          try {
            const playPromiseMuted = media.play();
            if (playPromiseMuted !== undefined) await playPromiseMuted;
            try {
              media.pause();
            } catch {
              // ignore
            }
            this.canAutoplay = true;
            this.canAutoplayMuted = true;
            return { autoplay: true, muted: true };
          } catch {
            // Autoplay is blocked even when muted.
            this.canAutoplay = false;
            this.canAutoplayMuted = false;
            return { autoplay: false, muted: false };
          }
        }
      } finally {
        restore();
      }
    })();

    this.autoplaySupport = await this.autoplaySupportPromise;
    return this.autoplaySupportPromise;
  }

  pause() {
    if (this.state.current === 'idle' || this.state.current === 'loading') {
      return;
    }
    this.emit('cmd:pause');
  }

  destroy() {
    this.events.emit('player:destroy');
    if (this.playerContext) this.activeEngine?.detach?.(this.playerContext);
    this.playerContext = null;

    this.plugins.all().forEach((p) => {
      // Always dispose tracked resources first.
      try {
        this.pluginDisposables.get(p)?.dispose();
      } catch {
        // ignore
      }

      try {
        p.destroy?.();
      } catch {
        // ignore
      }
    });

    this.interactionUnsubs.forEach((u) => u());
    this.interactionUnsubs = [];
    this.events.clear();
  }

  addCaptions(args: {
    src: string;
    srclang?: string;
    label?: string;
    kind?: 'captions' | 'subtitles';
    default?: boolean;
  }) {
    const track = document.createElement('track');
    track.kind = args.kind || 'captions';
    track.src = args.src;
    if (args.srclang) track.srclang = args.srclang;
    if (args.label) track.label = args.label;
    if (args.default) track.default = true;
    this.media.appendChild(track);
    this.emit('texttrack:add', track);
    this.emit('texttrack:listchange');
    return track;
  }

  getPlugin<T = unknown>(name: string): T | undefined {
    return this.plugins.all().find((p) => p?.name === name) as T | undefined;
  }

  extend(extension: Record<string, unknown>) {
    if (!extension || typeof extension !== 'object') return this;
    for (const key of Object.keys(extension)) {
      if ((this as any)[key] === undefined) {
        (this as any)[key] = extension[key];
      } else if (
        (this as any)[key] &&
        typeof (this as any)[key] === 'object' &&
        extension[key] &&
        typeof extension[key] === 'object'
      ) {
        const target = (this as any)[key];
        const source = extension[key];
        for (const k of Object.keys(source)) {
          if (target[k] === undefined) target[k] = (source as any)[k];
        }
      }
    }
    return this;
  }

  private bindFirstInteraction() {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc) return;

    const mark = () => {
      if (this.userInteracted) return;
      this.userInteracted = true;
      this.emit('player:interacted');
      this.interactionUnsubs.forEach((u) => u());
      this.interactionUnsubs = [];
    };

    const opts: AddEventListenerOptions = { capture: true, passive: true };
    const removeOpts: AddEventListenerOptions = { capture: true };

    const on = (type: string) => {
      doc.addEventListener(type, mark, opts);
      this.interactionUnsubs.push(() => doc.removeEventListener(type, mark, removeOpts));
    };

    on('pointerdown');
    on('mousedown');
    on('touchstart');
    on('keydown');
  }

  private resolveMediaEngine(sources: MediaSource[]): { engine: MediaEnginePlugin; source: MediaSource } {
    if (sources.length === 0) throw new Error('Player cannot resolve media with an empty source');

    const engines = this.plugins
      .all()
      .filter(
        (p): p is MediaEnginePlugin =>
          !!(!!p && p.capabilities?.includes('media-engine') && typeof (p as MediaEnginePlugin).canPlay === 'function')
      );

    // Don't mutate registry order.
    const sortedEngines = [...engines].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name)
    );

    for (const source of sources) {
      for (const engine of sortedEngines) {
        if (engine.canPlay?.(source)) {
          return { engine, source };
        }
      }
    }

    throw new Error('No compatible media engine found');
  }

  private bindStateTransitions() {
    // Load lifecycle
    this.events.on('loadstart', () => this.state.transition('loading'));

    // Resolve "ready" when metadata is available (closest HTML5 analogue to previous playback:ready).
    this.events.on('loadedmetadata', () => {
      this.state.transition('ready');
      if (this.readyResolve) {
        this.readyResolve();
        this.readyResolve = undefined;
        this.readyReject = undefined;
      }
    });

    // IMPORTANT: state transitions only on observed playback events (not on commands).
    this.events.on('playing', () => this.state.transition('playing'));
    this.events.on('pause', () => this.state.transition('paused'));
    this.events.on('waiting', () => this.state.transition('waiting'));
    this.events.on('seeking', () => this.state.transition('seeking'));
    this.events.on('seeked', () => this.state.transition('ready'));
    this.events.on('ended', () => this.state.transition('ended'));

    this.events.on('error', (e: MediaError | null) => {
      this.state.transition('error');
      if (this.readyReject) {
        this.readyReject(e);
        this.readyResolve = undefined;
        this.readyReject = undefined;
      }
    });
  }

  private bindMediaSync() {
    const read = () => {
      // time + duration
      try {
        this._currentTime = this.media.currentTime || 0;
      } catch {
        // ignore
      }
      try {
        const d = this.media.duration;
        this._duration = d;
      } catch {
        // ignore
      }

      // volume + mute
      try {
        this._muted = Boolean(this.media.muted);
        const v = this.media.volume;
        if (Number.isFinite(v)) this._volume = v;
      } catch {
        // ignore
      }

      // rate
      try {
        const r = this.media.playbackRate;
        if (Number.isFinite(r)) this._playbackRate = r;
      } catch {
        // ignore
      }
    };

    this.events.on('loadedmetadata', () => read());
    this.events.on('durationchange', () => read());
    this.events.on('timeupdate', () => read());
    this.events.on('volumechange', () => read());
    this.events.on('ratechange', () => read());
  }

  private bindLeaseSync() {
    this.leases.onChange((cap) => {
      if (cap !== 'playback') return;

      queueMicrotask(() => {
        this.emit('cmd:setVolume', this._volume);
        this.emit('cmd:setMuted', this._muted);
        this.emit('cmd:setRate', this._playbackRate);
        if (this._currentTime) this.emit('cmd:seek', this._currentTime);
      });
    });
  }

  private createReadyPromise() {
    if (this.readyPromise) return;
    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
    });
  }

  private readMediaSources(media: HTMLMediaElement): MediaSource[] {
    const sources: MediaSource[] = [];

    if (media.src) {
      sources.push({ src: media.src, type: predictMimeType(media, media.src) });
    }

    try {
      media.querySelectorAll('source').forEach((el) => {
        sources.push({ src: el.src, type: el.type || predictMimeType(media, el.src) });
      });
    } catch {
      // ignore
    }

    return sources;
  }

  private maybeAutoLoad() {
    if (this.state.current !== 'idle') return;

    const hasEngines = this.plugins.all().some((p) => p.capabilities?.includes('media-engine'));
    if (!hasEngines) return;

    const sources = this.readMediaSources(this.media);
    if (sources.length === 0) return;
    this.detectedSources = sources;

    // Capture autoplay intent before we clear the src attribute.
    const wantsAutoplay = this.media.autoplay;

    try {
      const sources = this.media.querySelectorAll('source');
      sources.forEach((s) => s.remove());
      if (this.media.getAttribute('src')) this.media.removeAttribute('src');
      if (this.media.src) this.media.src = '';

      this.load();

      if (wantsAutoplay) {
        // Programmatic media.load() above resets the element and causes some browsers
        // (notably Chromium) not to re-trigger native autoplay after the src is restored.
        // Disable the autoplay attribute to prevent a native-vs-plugin race, then
        // propagate the play intent through Core's event system so plugins (e.g. AdsPlugin)
        // can intercept the preroll before content begins.
        this.media.autoplay = false;
        queueMicrotask(() => this.emit('cmd:play'));
      }
    } catch {
      // best effort; don't block attach
    }
  }
}
