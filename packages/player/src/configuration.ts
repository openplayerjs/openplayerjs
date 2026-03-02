import type { Core, PlayerConfig } from '@openplayer/core';

/**
 * UI configuration augments `@openplayer/core`'s `PlayerConfig` when `@openplayer/ui` is installed.
 *
 * This keeps `@openplayer/core` focused on runtime / engine concerns, while UI packages own
 * sizing, label strings, keyboard seek step and progress interaction flags.
 */

export type PlayerUIConfig = PlayerConfig & {
  labels?: Record<string, string>;
  width?: string | number;
  height?: string | number;
  step?: number;
  allowSkip?: boolean;
  allowRewind?: boolean;
};

export const defaultUIConfiguration: Required<Pick<PlayerUIConfig, 'step' | 'allowSkip' | 'allowRewind'>> = {
  step: 0,
  allowSkip: true,
  allowRewind: true,
};

export const defaultLabels = Object.freeze({
  auto: 'Auto',
  captions: 'CC/Subtitles',
  click: 'Click to unmute',
  container: 'Media player',
  fullscreen: 'Fullscreen',
  levels: 'Quality Levels',
  live: 'Live',
  loading: 'Loading...',
  media: 'Media',
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
});

export type ResolvedUIConfig = {
  allowSkip: boolean;
  allowRewind: boolean;
  step: number;
  width?: string | number;
  height?: string | number;
  labels: Record<string, string>;
};

export function resolveUIConfig(coreOrConfig: Core | PlayerConfig): ResolvedUIConfig {
  const config = (coreOrConfig as Core).config ? (coreOrConfig as Core).config : (coreOrConfig as PlayerConfig);

  const allowSkip = (config as any).allowSkip ?? defaultUIConfiguration.allowSkip;
  const allowRewind = (config as any).allowRewind ?? defaultUIConfiguration.allowRewind;
  const step = (config as any).step ?? defaultUIConfiguration.step;
  const width = (config as any).width;
  const height = (config as any).height;

  const labels = { ...defaultLabels, ...((config as any).labels || {}) };

  // Normalize config in-place when called with a Player instance so downstream code can rely on it.
  if ((coreOrConfig as any).config) {
    try {
      (config as any).labels = labels;
      (config as any).allowSkip = allowSkip;
      (config as any).allowRewind = allowRewind;
      (config as any).step = step;
    } catch {
      // ignore
    }
  }

  return { allowSkip, allowRewind, step, width, height, labels };
}
