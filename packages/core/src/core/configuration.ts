import type { PlayerPlugin } from './plugin';

export type PlayerConfig = {
  plugins?: PlayerPlugin[];
  startTime?: number;
  startVolume?: number;
  startPlaybackRate?: number;
  duration?: number;
  sourceFallback?: boolean;
};

export const defaultConfiguration: PlayerConfig = {
  startTime: 0,
  duration: 0,
  sourceFallback: true,
};
