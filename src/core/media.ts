import type { EventBus } from './events';
import type { Player } from './player';

export interface MediaSource {
  src: string;
  type?: string;
}

export interface MediaEngineContext {
  media: HTMLMediaElement;
  events: EventBus;
  activeSource?: MediaSource;
  config?: any;
  player: Player;
}

export interface MediaEnginePlugin {
  name: string;
  version: string;
  capabilities: ['media-engine'];
  priority: number;

  canPlay(source: MediaSource): boolean;
  attach(ctx: MediaEngineContext): void;
  detach?(ctx: MediaEngineContext): void;
}
