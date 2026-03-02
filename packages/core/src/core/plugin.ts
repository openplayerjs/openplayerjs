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
  on<E extends PlayerEvent>(event: E, cb: (payload?: any) => void): Disposer;
  listen(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): Disposer;
};

export type PluginClass<T extends PlayerPlugin> = new (config?: any) => T;

export type PlayerPlugin = {
  name: string;
  version: string;
  capabilities?: string[];

  setup?(ctx: PluginContext): void;
  onEvent?(event: PlayerEvent, payload?: any): void;
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

export class PluginBus<E extends string> {
  constructor(private bus: EventBus) {}
  on(event: E, cb: (...args: any[]) => void) {
    return this.bus.on(event as any, cb);
  }
  emit(event: E, ...data: any[]) {
    this.bus.emit(event as any, ...data);
  }
}
