export type PlayerConfig = {
  plugins?: any[];
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
