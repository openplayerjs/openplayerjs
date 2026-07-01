import type { DisposableStore, Disposer } from './dispose';
import type { EventBus, PlayerEvent } from './events';
import type { Core } from './index';
import type { Lease } from './lease';
import type { PlaybackState, StateManager } from './state';

export type PluginContext = {
  events: EventBus;
  state: StateManager<PlaybackState>;
  leases: Lease;
  core: Core;
  media?: HTMLMediaElement;
  dispose: DisposableStore;
  add(disposer?: void | null | Disposer): Disposer;
  // `never` payload param accepts a callback with any concrete payload type
  // (parameter contravariance), matching the dynamic nature of plugin event wiring.
  on(event: PlayerEvent | string, cb: (payload: never) => void): Disposer;
  listen(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): Disposer;
};

export type PluginClass<T extends PlayerPlugin> = new (config?: unknown) => T;

export type PlayerPlugin = {
  name: string;
  version: string;
  capabilities?: string[];

  setup?(ctx: PluginContext): void;
  onEvent?(event: PlayerEvent, payload?: unknown): void;
  destroy?(): void;
};

export class PluginRegistry {
  private plugins: PlayerPlugin[] = [];

  register(plugin: PlayerPlugin) {
    this.plugins.push(plugin);
  }

  all() {
    return this.plugins;
  }
}
