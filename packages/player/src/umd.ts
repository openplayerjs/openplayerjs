import type { PlayerConfig, PlayerEventPayloadMap, PlayerPlugin } from '@openplayerjs/core';
import * as CoreExports from '@openplayerjs/core';
import { setA11yLabel } from './a11y';
import type { Control } from './control';
import { buildControls, normalizeControlsConfig, registerControl } from './control';
import type { ControlPlacement } from './controls/base';
import createCaptionsControl from './controls/captions';
import createCurrentTimeControl from './controls/currentTime';
import createDurationControl from './controls/duration';
import createFullscreenControl from './controls/fullscreen';
import createPlayControl from './controls/play';
import createProgressControl from './controls/progress';
import createSettingsControl from './controls/settings';
import createTimeControl from './controls/time';
import createVolumeControl from './controls/volume';
import { extendControls } from './extend';
import { createUI } from './ui';

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
  factory: (config?: unknown) => unknown;
  /** Prototype-level extension hook (optional). */
  install?: (PlayerCtor: unknown) => void;
  /** Instance-level extension hook (optional). */
  extend?: (player: unknown, plugin: unknown, cfg?: unknown) => void;
  defaults?: unknown;
  kind?: 'plugin' | 'extension' | string;
};

type ControlId = string;

type CoreWithControls = CoreExports.Core & {
  controls?: {
    addElement(el: HTMLElement, placement: ControlPlacement): void;
    addControl(control: Control): void;
  };
};

type Unsubscribe = () => void;

/** UMD config is the typed player config plus arbitrary per-plugin config keys. */
type UMDConfig = PlayerConfig & Record<string, unknown>;

/** A plugin instance created from a UMD registry entry. */
type CreatedPlugin = { entry: UMDPluginEntry; plugin: unknown; cfg: unknown };

type PendingListener = {
  event: keyof PlayerEventPayloadMap;
  cb: (payload?: unknown) => void;
  off?: Unsubscribe;
};

function extractControlIds(controlsCfg: unknown): ControlId[] {
  const normalized = normalizeControlsConfig(controlsCfg);
  const ids = new Set<string>();
  for (const names of Object.values(normalized)) {
    for (const id of names) if (typeof id === 'string') ids.add(id);
  }
  return [...ids];
}

function getControlFactory(id: string) {
  const factories: Record<string, () => Control | null> = {
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

function registerControlsFromConfig(controlsCfg: unknown) {
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

function shallowMergeDefaults(defaults: unknown, cfg: unknown): unknown {
  if (!defaults) return cfg ?? {};
  if (!cfg) return { ...(defaults as Record<string, unknown>) };
  if (typeof defaults !== 'object' || typeof cfg !== 'object') return cfg;
  return { ...(defaults as Record<string, unknown>), ...(cfg as Record<string, unknown>) };
}

function maybeInstallEntry(entry: UMDPluginEntry, PlayerCtor: unknown) {
  if (!entry.install) return;
  const enabled = !!window.OpenPlayerConfig?.extendPlayerPrototype;
  if (!enabled) return;

  window.__OpenPlayerInstalledPlugins = window.__OpenPlayerInstalledPlugins || {};
  if (window.__OpenPlayerInstalledPlugins[entry.name]) return;

  entry.install(PlayerCtor);
  window.__OpenPlayerInstalledPlugins[entry.name] = true;
}

export default class Player {
  private media!: HTMLMediaElement;
  private core!: CoreExports.Core;
  private pendingListeners: PendingListener[] = [];
  private createdPlugins: CreatedPlugin[] = [];

  constructor(
    target: string | HTMLMediaElement,
    private config: UMDConfig = {}
  ) {
    this.media = resolveMedia(target);
  }

  getCore() {
    return this.core;
  }

  init() {
    const rawControls = this.config.controls as { alwaysVisible?: boolean } | undefined;
    const normalizedControls = normalizeControlsConfig(rawControls);
    const alwaysVisible = rawControls?.alwaysVisible === true;

    registerControlsFromConfig(normalizedControls);

    this.createdPlugins = this.createDetectedPlugins();

    // Optional prototype-level installs, controlled via window.OpenPlayerConfig.extendPlayerPrototype
    for (const p of this.createdPlugins) maybeInstallEntry(p.entry, Player);

    // Core receives plugin instances only (core remains generic)
    this.core = new CoreExports.Core(this.media, {
      ...this.config,
      plugins: this.createdPlugins.map((p) => p.plugin) as PlayerPlugin[],
    });

    const controls = buildControls(normalizedControls);
    createUI(this.core, this.media, controls, { alwaysVisible });

    // Attach UI imperative API under player.controls
    extendControls(this.core);

    // Apply instance-level extensions (e.g. player.ads)
    for (const p of this.createdPlugins) {
      try {
        p.entry.extend?.(this.core, p.plugin, p.cfg);
      } catch {
        // ignore plugin extension errors to keep core usable
      }
    }

    for (const l of this.pendingListeners) {
      l.off = this.core.on(l.event, l.cb);
    }

    return this.core;
  }

  on(event: keyof PlayerEventPayloadMap, cb: (payload?: unknown) => void): Unsubscribe {
    if (this.core && typeof this.core.on === 'function') {
      return this.core.on(event, cb);
    }

    const pending: PendingListener = { event, cb };
    this.pendingListeners.push(pending);

    return () => {
      if (pending.off) return pending.off();
      const idx = this.pendingListeners.indexOf(pending);
      if (idx >= 0) this.pendingListeners.splice(idx, 1);
    };
  }

  emit(event: keyof PlayerEventPayloadMap, ...args: unknown[]) {
    if (!this.core || typeof this.core.emit !== 'function') {
      throw new Error('OpenPlayer.emit() called before init()');
    }
    this.core.emit(event, ...args);
  }

  async play() {
    if (!this.core) throw new Error('OpenPlayer.play() called before init()');
    await this.core.play();
  }

  pause() {
    if (!this.core) throw new Error('OpenPlayer.play() called before init()');
    this.core.pause();
  }

  load() {
    if (!this.core) throw new Error('OpenPlayer.load() called before init()');
    this.core.load();
  }

  destroy() {
    if (!this.core) throw new Error('OpenPlayer.destroy() called before init()');
    this.core.destroy();
  }

  addCaptions(args: {
    src: string;
    srclang?: string;
    label?: string;
    kind?: 'captions' | 'subtitles';
    default?: boolean;
  }) {
    if (!this.core) throw new Error('OpenPlayer.addCaptions() called before init()');
    return this.core.addCaptions(args);
  }

  addElement(el: HTMLElement, placement: ControlPlacement = { v: 'bottom', h: 'right' }) {
    (this.core as CoreWithControls).controls?.addElement(el, placement);
  }

  addControl(control: Control) {
    if (!this.core) throw new Error('OpenPlayer.addControl() called before init()');
    (this.core as CoreWithControls).controls?.addControl(control);
  }

  get currentTime(): number {
    return this.core?.currentTime ?? 0;
  }

  set currentTime(value: number) {
    if (!this.core) throw new Error('OpenPlayer.currentTime must be set after init()');
    this.core.currentTime = value;
  }

  get duration(): number {
    return this.core?.duration ?? 0;
  }

  set src(source: string) {
    if (!this.core) throw new Error('OpenPlayer.src must be set after init()');
    this.core.src = source;
  }

  get src() {
    return this.core?.src ?? '';
  }

  set volume(vol: number) {
    if (!this.core) throw new Error('OpenPlayer.volume must be set after init()');
    this.core.volume = vol;
  }

  get volume() {
    return this.core?.volume ?? 1;
  }

  set muted(muted: boolean) {
    if (!this.core) throw new Error('OpenPlayer.muted must be set after init()');
    this.core.muted = muted;
  }

  get muted() {
    return this.core?.muted ?? false;
  }

  set playbackRate(rate: number) {
    if (!this.core) throw new Error('OpenPlayer.playbackRate must be set after init()');
    this.core.playbackRate = rate;
  }

  get playbackRate() {
    return this.core?.playbackRate ?? 1;
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
      .filter(Boolean) as CreatedPlugin[];
  }
}

// --- UMD interop -------------------------------------------------------------
// In UMD builds, add-on bundles (ads/hls) are configured with
// globals: { '@openplayerjs/core': 'OpenPlayerJS' }
// which means they expect core exports (e.g. getOverlayManager, EVENT_OPTIONS)
// to be available on the global OpenPlayer object.
//
// The UI bundle exposes OpenPlayer as a constructor, so we attach the core
// exports as static properties for compatibility.
//
// This is safe in ESM/CJS too: it only adds extra static properties.
try {
  Object.assign(Player as unknown as Record<string, unknown>, CoreExports, { registerControl, setA11yLabel });
} catch {
  // ignore if environment prevents assignment
}
