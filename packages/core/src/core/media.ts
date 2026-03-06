import type { EventBus } from './events';
import type { Core } from './index';

export type MediaSource = {
  src: string;
  type?: string;
};

export type MediaEngineContext = {
  media: HTMLMediaElement;
  events: EventBus;
  activeSource?: MediaSource;
  config?: any;
  core: Core;
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
