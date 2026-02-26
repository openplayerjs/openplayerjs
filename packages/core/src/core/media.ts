import type { EventBus } from './events';
import type { Player } from './player';

export type MediaSource = {
  src: string;
  type?: string;
};

export type MediaEngineContext = {
  media: HTMLMediaElement;
  events: EventBus;
  activeSource?: MediaSource;
  config?: any;
  player: Player;
};

export type MediaEnginePlugin = {
  name: string;
  version: string;
  capabilities: ['media-engine'];
  priority: number;

  canPlay(source: MediaSource): boolean;
  attach(ctx: MediaEngineContext): void;
  detach?(ctx: MediaEngineContext): void;
};
