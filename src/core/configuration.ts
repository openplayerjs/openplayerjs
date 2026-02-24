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

export const defaultLabels = Object.freeze({
  auto: 'Auto',
  captions: 'CC/Subtitles',
  click: 'Click to unmute',
  fullscreen: 'Fullscreen',
  levels: 'Quality Levels',
  live: 'Live',
  mute: 'Mute',
  off: 'Off',
  pause: 'Pause',
  play: 'Play',
  progressRail: 'Time Rail',
  progressSlider: 'Time Slider',
  settings: 'Player Settings',
  speed: 'Speed',
  speedNormal: 'Normal',
  tap: 'Tap to unmute',
  toggleCaptions: 'Toggle Captions',
  unmute: 'Unmute',
  volume: 'Volume',
  volumeControl: 'Volume Control',
  volumeSlider: 'Volume Slider',
  media: 'Media',
  container: 'Media player',
});
