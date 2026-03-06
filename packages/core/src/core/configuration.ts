export type PlayerConfig = {
  plugins?: any[];
  startTime?: number;
  startVolume?: number;
  startPlaybackRate?: number;
  duration?: number;
};

export const defaultConfiguration: PlayerConfig = {
  startTime: 0,
  duration: 0,
};
