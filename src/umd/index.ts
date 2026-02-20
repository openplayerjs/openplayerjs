import { Player as CorePlayer } from '../core/player';
import { createUI } from '../ui';
import { buildControls, registerControl } from '../ui/control';
import createCaptionsControl from '../ui/controls/captions';
import createCurrentTimeControl from '../ui/controls/currentTime';
import createDurationControl from '../ui/controls/duration';
import createFullscreenControl from '../ui/controls/fullscreen';
import createPlayControl from '../ui/controls/play';
import createProgressControl from '../ui/controls/progress';
import createSettingsControl from '../ui/controls/settings';
import createTimeControl from '../ui/controls/time';
import createVolumeControl from '../ui/controls/volume';
import { extendControls } from '../ui/extend';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    OpenPlayerPlugins?: Record<string, UMDPluginEntry>;
    OpenPlayerConfig?: {
      /** If true, OpenPlayer plugin bundles may extend the CorePlayer prototype lazily. */
      extendPlayerPrototype?: boolean;
    };
    /** Internal: tracks which plugin installs were already applied. */
    __OpenPlayerInstalledPlugins?: Record<string, true>;
  }
}

export type UMDPluginEntry = {
  name: string;
  factory: (config?: any) => any;
  /** Prototype-level extension hook (optional). */
  install?: (PlayerCtor: any) => void;
  /** Instance-level extension hook (optional). */
  extend?: (player: any, plugin: any, cfg?: any) => void;
  defaults?: any;
  kind?: 'plugin' | 'extension' | string;
};

type ControlId = string;

type Unsubscribe = () => void;

type PendingListener = {
  event: string;
  cb: (...args: any[]) => void;
  off?: Unsubscribe;
};

function extractControlIds(controlsCfg: any): ControlId[] {
  if (!controlsCfg || typeof controlsCfg !== 'object') return [];
  const ids = new Set<string>();

  for (const key of Object.keys(controlsCfg)) {
    const list = (controlsCfg as any)[key];
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
    time: createTimeControl,
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

function resolveMedia(target: string | HTMLMediaElement): HTMLMediaElement {
  if (target instanceof HTMLMediaElement) return target;

  const byId = document.getElementById(target);
  const el = byId ?? document.querySelector(target);

  if (!el) {
    throw new Error(
      `OpenPlayer: target "${target}" not found. ` +
        `Pass an HTMLMediaElement or a valid id ("video") or selector ("#video").`
    );
  }

  if (!(el instanceof HTMLMediaElement)) {
    throw new Error(`OpenPlayer: target "${target}" is not an HTMLMediaElement.`);
  }

  return el;
}

function shallowMergeDefaults(defaults: any, cfg: any) {
  if (!defaults) return cfg ?? {};
  if (!cfg) return { ...defaults };
  if (typeof defaults !== 'object' || typeof cfg !== 'object') return cfg;
  return { ...defaults, ...cfg };
}

function maybeInstallEntry(entry: UMDPluginEntry) {
  if (!entry.install) return;
  const enabled = !!window.OpenPlayerConfig?.extendPlayerPrototype;
  if (!enabled) return;

  window.__OpenPlayerInstalledPlugins = window.__OpenPlayerInstalledPlugins || {};
  if (window.__OpenPlayerInstalledPlugins[entry.name]) return;

  entry.install(CorePlayer as any);
  window.__OpenPlayerInstalledPlugins[entry.name] = true;
}

export default class Player {
  private media!: HTMLMediaElement;
  private player!: CorePlayer;
  private pendingListeners: PendingListener[] = [];
  private createdPlugins: { entry: UMDPluginEntry; plugin: any; cfg: any }[] = [];

  constructor(
    target: string | HTMLMediaElement,
    private config: any = {}
  ) {
    this.media = resolveMedia(target);
  }

  async init() {
    if (this.config.controls) registerControlsFromConfig(this.config.controls);

    this.createdPlugins = this.createDetectedPlugins();

    // Optional prototype-level installs, controlled via window.OpenPlayerConfig.extendPlayerPrototype
    for (const p of this.createdPlugins) maybeInstallEntry(p.entry);

    // Core receives plugin instances only (core remains generic)
    this.player = new CorePlayer(this.media, {
      ...this.config,
      plugins: this.createdPlugins.map((p) => p.plugin),
    });

    this.setupUI();

    // Attach UI imperative API under player.controls
    extendControls(this.player);

    // Apply instance-level extensions (e.g. player.ads)
    for (const p of this.createdPlugins) {
      try {
        p.entry.extend?.(this.player as any, p.plugin, p.cfg);
      } catch {
        // ignore plugin extension errors to keep core usable
      }
    }

    for (const l of this.pendingListeners) {
      l.off = this.player.on(l.event as any, l.cb);
    }

    return this.player;
  }

  on(event: string, cb: (...args: any[]) => void): Unsubscribe {
    if (this.player && typeof (this.player as any).on === 'function') {
      return (this.player as any).on(event, cb);
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
    if (!this.player || typeof (this.player as any).emit !== 'function') {
      throw new Error('OpenPlayer.emit() called before init()');
    }
    (this.player as any).emit(event, ...args);
  }

  destroy() {
    if (!this.player) throw new Error('OpenPlayer.destroy() called before init()');
    this.player.destroy();
  }

  addCaptions(args: {
    src: string;
    srclang?: string;
    label?: string;
    kind?: 'captions' | 'subtitles';
    default?: boolean;
  }) {
    if (!this.player) throw new Error('OpenPlayer.addCaptions() called before init()');
    return (this.player as any).addCaptions(args);
  }

  private createDetectedPlugins() {
    const plugins = window.OpenPlayerPlugins || {};
    return Object.keys(plugins)
      .map((name) => {
        const entry = plugins[name];
        if (!entry?.factory) return undefined;
        const mergedCfg = shallowMergeDefaults(entry.defaults, this.config?.[name]);
        const plugin = entry.factory(mergedCfg);
        return { entry: { ...entry, name }, plugin, cfg: mergedCfg };
      })
      .filter(Boolean) as { entry: UMDPluginEntry; plugin: any; cfg: any }[];
  }

  private setupUI() {
    const controls = buildControls(this.config.controls);
    createUI(this.player, this.media, controls);
  }
}
