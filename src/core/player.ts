import { DefaultMediaEngine } from '../engines/html5';
import { EventBus, PlayerEvent } from './events';
import { Lease } from './lease';
import { MediaEngineContext, MediaEnginePlugin, MediaSource } from './media';
import { PlayerPlugin, PluginRegistry } from './plugin';
import { PlaybackState, StateManager } from './state';
import { predictMimeType } from './utils';

type PlayerConfig = { debug?: boolean; plugins?: any[], labels?: Record<string, string>, [key: string]: unknown }

const defaultLabels = Object.freeze({
  auto: 'Auto',
  captions: 'CC/Subtitles',
  click: 'Click to unmute',
  fullscreen: 'Fullscreen',
  levels: 'Quality Levels',
  live: 'Live',
  mute: 'Mute',
  off: 'Off',
  pause: 'Pause',
  play: 'Play',
  progressRail: 'Time Rail',
  progressSlider: 'Time Slider',
  settings: 'Player Settings',
  speed: 'Speed',
  speedNormal: 'Normal',
  tap: 'Tap to unmute',
  toggleCaptions: 'Toggle Captions',
  unmute: 'Unmute',
  volume: 'Volume',
  volumeControl: 'Volume Control',
  volumeSlider: 'Volume Slider',
});

export class Player {
  public media: HTMLMediaElement;
  public isLive = false;
  public events = new EventBus();
  public leases = new Lease();
  public state = new StateManager<PlaybackState>('idle');
  public config: PlayerConfig;

  private plugins = new PluginRegistry();

  private _src?: string;
  private _volume = 1;
  private _playbackRate = 1;
  private _currentTime = 0;
  private _muted = false;
  private _duration = 0;
  private detectedSources?: MediaSource[];
  private activeEngine?: MediaEnginePlugin;
  private playerContext: MediaEngineContext | null = null;

  constructor(
    media: HTMLMediaElement | string,
    config: PlayerConfig = {}
  ) {
    this.media = media instanceof HTMLMediaElement ? media : document.querySelector(media)!;
    this.registerPlugin(new DefaultMediaEngine());
    const labels = { ...defaultLabels, ...config.labels };
    this.config = { ...config, labels };
    (this.config.plugins || []).forEach((p) => this.registerPlugin(p));
    this.bindStateTransitions();
    this.bindMediaSync();
    this.maybeAutoLoad();
  }

  on(event: PlayerEvent | string, cb: (...args: any[]) => void) {
    return this.events.on(event as any, cb);
  }

  emit(event: PlayerEvent | string, payload?: any) {
    this.events.emit(event, payload);
    this.plugins
      .all()
      .filter((p) => !p.capabilities?.includes('media-engine'))
      .forEach((p: PlayerPlugin) => {
        p.onEvent?.(event as PlayerEvent, payload);
      });
  }

  /* ---------------- Plugin ---------------- */

  registerPlugin(plugin: any) {
    this.plugins.register(plugin);

    plugin.setup?.({
      player: this,
      media: this.media,
      events: this.events,
      state: this.state,
      leases: this.leases,
    });
  }

  /* ---------------- Public API ---------------- */

  set src(value: string | undefined) {
    this._src = value;
    if (value) {
      this.detectedSources = [{ src: value, type: predictMimeType(this.media, value) }];
      this.emit('source:set', value);
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
    this._volume = v;
    this.emit('media:volume', v);
  }

  get muted() {
    return this._muted;
  }

  set muted(muted: boolean) {
    this._muted = muted;
    this.emit('media:muted', muted);
  }

  set playbackRate(rate: number) {
    this._playbackRate = rate;
    this.emit('media:rate', rate);
  }

  get playbackRate(): number {
    return this._playbackRate;
  }

  set currentTime(time: number) {
    this._currentTime = time;
    this.emit('playback:seek', time);
  }

  get currentTime(): number {
    return this._currentTime;
  }

  get duration(): number {
    return this._duration;
  }

  load() {
    if (this.state.current !== 'idle') return;

    const sources = this.detectedSources ?? this.readMediaSources(this.media);
    this.detectedSources = sources;
    const { engine, source: activeSource } = this.resolveMediaEngine(sources);

    this.playerContext = {
      media: this.media,
      events: this.events,
      config: this.config,
      activeSource,
      player: this,
    };

    this.activeEngine?.detach?.(this.playerContext);
    this.activeEngine = engine;
    this.activeEngine.attach(this.playerContext);

    this.emit('playback:load');
  }

  async play() {
    if (!this.activeEngine) this.load();
    this.emit('playback:play');
  }

  pause() {
    this.emit('playback:pause');
  }

  destroy() {
    if (this.playerContext) {
      this.activeEngine?.detach?.(this.playerContext);
      this.playerContext = null;
    }
  }

  /* ---------------- Internals ---------------- */

  private resolveMediaEngine(sources: MediaSource[]): { engine: MediaEnginePlugin; source: MediaSource } {
    const engines = this.plugins
      .all()
      .filter(
        (p) => p.capabilities?.includes('media-engine') && typeof (p as MediaEnginePlugin).canPlay === 'function'
      ) as MediaEnginePlugin[];

    const sortedEngines = engines.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name));

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
    this.events.on('playback:load', () => this.state.transition('loading'));
    this.events.on('playback:ready', () => this.state.transition('ready'));
    this.events.on('playback:play', () => this.state.transition('playing'));
    this.events.on('playback:pause', () => this.state.transition('paused'));
    this.events.on('playback:playing', () => this.state.transition('playing'));
    this.events.on('playback:paused', () => this.state.transition('paused'));
    this.events.on('playback:waiting', () => this.state.transition('waiting'));
    this.events.on('playback:seeking', () => this.state.transition('seeking'));
    this.events.on('playback:seeked', () => this.state.transition('ready'));
    this.events.on('playback:ended', () => this.state.transition('ended'));
    this.events.on('playback:error', () => this.state.transition('error'));
  }

  private bindMediaSync() {
    this.events.on('media:timeupdate', (t: number) => (this._currentTime = t));
    this.events.on('media:duration', (d: number) => (this._duration = d));
    this.events.on('media:muted', (muted: boolean) => (this._muted = muted));
    this.events.on('media:volume', (vol: number) => (this._volume = vol));
    this.events.on('media:rate', (rate: number) => (this._playbackRate = rate));
  }

  private readMediaSources(media: HTMLMediaElement): MediaSource[] {
    const sources: MediaSource[] = [];

    if (media.src) {
      sources.push({ src: media.src, type: predictMimeType(media, media.src) });
    }

    // Some host environments (tests, embedded contexts) can throw from DOM queries.
    // Reading sources should be best-effort and must never prevent player construction.
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

    try {
      const sources = this.media.querySelectorAll('source');
      sources.forEach((s) => s.remove());
      if (this.media.getAttribute('src')) this.media.removeAttribute('src');
      if (this.media.src) this.media.src = '';

      this.load();
    } catch {
      // best effort; don't block attach
    }
  }
}
