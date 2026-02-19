export type PlayerConfig = {
  debug?: boolean;
  plugins?: any[];
  labels?: Record<string, string>;
  width?: string | number;
  height?: string | number;
  startTime?: number;
  startVolume?: number;
  startPlaybackRate?: number;
  step?: number;
  duration?: number;
};

export const defaultConfiguration: PlayerConfig = {
  startTime: 0,
  startVolume: 1,
  startPlaybackRate: 1,
  step: 0,
  duration: 0,
  width: 0,
  height: 0,
};
