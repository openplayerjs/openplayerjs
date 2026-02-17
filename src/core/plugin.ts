import type { EventBus, PlayerEvent } from './events';
import type { Lease } from './lease';
import type { Player } from './player';
import type { PlaybackState, StateManager } from './state';

export type PluginContext = {
  events: EventBus;
  state: StateManager<PlaybackState>;
  leases: Lease;
  player: Player;
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
