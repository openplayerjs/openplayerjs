import type { Core, PlayerConfig } from '@openplayerjs/core';

/**
 * UI configuration augments `@openplayerjs/core`'s `PlayerConfig` when `@openplayerjs/player` is installed.
 *
 * This keeps `@openplayerjs/core` focused on runtime / engine concerns, while UI packages own
 * sizing, label strings, keyboard seek step and progress interaction flags.
 */

export type SpeedConfig = {
  rates?: number[];
};

export type PlayerUIConfig = PlayerConfig & {
  labels?: Record<string, string>;
  width?: string | number;
  height?: string | number;
  step?: number;
  allowSkip?: boolean;
  allowRewind?: boolean;
  speed?: SpeedConfig;
  showLiveCurrentTime?: boolean;
};

export const DEFAULT_SPEED_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const defaultUIConfiguration: Required<Pick<PlayerUIConfig, 'step' | 'allowSkip' | 'allowRewind' | 'speed'>> = {
  step: 0,
  allowSkip: true,
  allowRewind: true,
  speed: { rates: [...DEFAULT_SPEED_RATES] },
};

export const defaultLabels = Object.freeze({
  auto: 'Auto',
  back: 'Back',
  captions: 'CC/Subtitles',
  captionsOff: 'Captions off',
  captionsOn: 'Captions on',
  click: 'Click to unmute',
  container: 'Media player',
  enterFullscreen: 'Enter Fullscreen',
  exitFullscreen: 'Exit Fullscreen',
  fullscreen: 'Fullscreen',
  live: 'Live',
  loading: 'Loading...',
  media: 'Media',
  mute: 'Mute',
  off: 'Off',
  pause: 'Pause',
  play: 'Play',
  progressRail: 'Time Rail',
  progressSlider: 'Time Slider',
  restart: 'Restart',
  seekTo: 'Seek to %s',
  settings: 'Player Settings',
  speed: 'Speed',
  speedNormal: 'Normal',
  tap: 'Tap to unmute',
  toggleCaptions: 'Toggle Captions',
  unmute: 'Unmute',
  volume: 'Volume',
  volumeControl: 'Volume Control',
  volumePercent: 'Volume: %s%',
  volumeSlider: 'Volume Slider',
});

export type ResolvedUIConfig = {
  allowSkip: boolean;
  allowRewind: boolean;
  step: number;
  speed: Required<SpeedConfig>;
  showLiveCurrentTime: boolean;
  width?: string | number;
  height?: string | number;
  labels: Record<string, string>;
};

export function resolveUIConfig(coreOrConfig: Core | PlayerConfig): ResolvedUIConfig {
  const coreInstance = coreOrConfig as Core;
  const uiConfig = (coreInstance.config ? coreInstance.config : coreOrConfig) as PlayerUIConfig;

  const allowSkip = uiConfig.allowSkip ?? defaultUIConfiguration.allowSkip;
  const allowRewind = uiConfig.allowRewind ?? defaultUIConfiguration.allowRewind;
  const step = uiConfig.step ?? defaultUIConfiguration.step;
  const showLiveCurrentTime = uiConfig.showLiveCurrentTime ?? false;
  const width = uiConfig.width;
  const height = uiConfig.height;

  const labels = { ...defaultLabels, ...(uiConfig.labels || {}) };

  const speedCfg = uiConfig.speed;
  const speed: Required<SpeedConfig> = {
    rates: Array.isArray(speedCfg?.rates) && speedCfg.rates.length > 0 ? speedCfg.rates : [...DEFAULT_SPEED_RATES],
  };

  // Normalize config in-place when called with a Player instance so downstream code can rely on it.
  if (coreInstance.config) {
    try {
      uiConfig.labels = labels;
      uiConfig.allowSkip = allowSkip;
      uiConfig.allowRewind = allowRewind;
      uiConfig.step = step;
      uiConfig.speed = speed;
      uiConfig.showLiveCurrentTime = showLiveCurrentTime;
    } catch {
      // ignore
    }
  }

  return { allowSkip, allowRewind, step, speed, showLiveCurrentTime, width, height, labels };
}
