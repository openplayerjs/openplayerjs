import { Player as CorePlayer } from '../core/player';
import { createUI } from '../ui';
import { buildControls, registerControl } from '../ui/control';
import createCaptionsControl from '../ui/controls/captions';
import createDurationControl from '../ui/controls/duration';
import createFullscreenControl from '../ui/controls/fullscreen';
import createPlayControl from '../ui/controls/play';
import createProgressControl from '../ui/controls/progress';
import createSettingsControl from '../ui/controls/settings';
import createCurrentTimeControl from '../ui/controls/time';
import createVolumeControl from '../ui/controls/volume';

declare global {
  interface Window {
    OpenPlayerPlugins?: Record<string, any>;
  }
}

type ControlId = string;

type Unsubscribe = () => void;

interface PendingListener {
  event: string;
  cb: (...args: any[]) => void;
  off?: Unsubscribe;
}

function extractControlIds(controlsCfg: any): ControlId[] {
  if (!controlsCfg || typeof controlsCfg !== 'object') return [];
  const ids = new Set<string>();

  for (const key of Object.keys(controlsCfg)) {
    const list = controlsCfg[key];
    if (!Array.isArray(list)) continue;
    for (const id of list) if (typeof id === 'string') ids.add(id);
  }

  return [...ids];
}

function getControlFactory(id: string) {
  const factories: Record<string, () => any> = {
    play: createPlayControl,
    volume: createVolumeControl,
    captions: createCaptionsControl,
    fullscreen: createFullscreenControl,
    currentTime: createCurrentTimeControl,
    duration: createDurationControl,
    progress: createProgressControl,
    settings: createSettingsControl,
  };
  return factories[id];
}

function registerControlsFromConfig(controlsCfg: any) {
  const ids = extractControlIds(controlsCfg);
  for (const id of ids) {
    const factory = getControlFactory(id);
    if (factory) registerControl(id, factory);
  }
}

export default class Player {
  private media!: HTMLMediaElement;
  private player!: CorePlayer;
  private pendingListeners: PendingListener[] = [];

  constructor(
    target: string | HTMLMediaElement,
    private config: any = {}
  ) {
    this.media = typeof target === 'string' ? (document.getElementById(target)! as HTMLMediaElement) : target;
  }

  async init() {
    if (this.config.controls) registerControlsFromConfig(this.config.controls);

    const detected = this.createDetectedPlugins();
    this.player = new CorePlayer(this.media, { ...this.config, plugins: detected });
    this.setupUI();

    for (const l of this.pendingListeners) {
      l.off = this.player.on(l.event, l.cb);
    }

    return this.player;
  }

  on(event: string, cb: (...args: any[]) => void): Unsubscribe {
    if (this.player && typeof this.player.on === 'function') {
      return this.player.on(event, cb);
    }

    const pending: PendingListener = { event, cb };
    this.pendingListeners.push(pending);

    return () => {
      if (pending.off) return pending.off();
      const idx = this.pendingListeners.indexOf(pending);
      if (idx >= 0) this.pendingListeners.splice(idx, 1);
    };
  }

  emit(event: any, ...args: any[]) {
    if (!this.player || typeof this.player.emit !== 'function') {
      throw new Error('OpenPlayer.emit() called before init()');
    }
    this.player.emit(event, ...args);
  }

  private createDetectedPlugins() {
    const plugins = window.OpenPlayerPlugins || {};

    return Object.keys(plugins).map((name) => {
      const pluginConfig = this.config?.[name];
      return plugins[name].factory(pluginConfig);
    });
  }

  private setupUI() {
    if (!this.config.controls) return;
    const controls = buildControls(this.config.controls);
    createUI(this.player, this.media, controls);
  }
}
