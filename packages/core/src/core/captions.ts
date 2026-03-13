import type { Core } from './index';

export type CaptionTrack = {
  id: string;
  label: string;
  language: string;
};

export type CaptionTrackProvider = {
  getTracks(): CaptionTrack[];
  getActiveTrack(): string | null;
  setTrack(id: string | null): void;
  /** Optional: call `notify` whenever the track list changes so controls can refresh. */
  subscribe?: (notify: () => void) => () => void;
};

const CAPTION_KEY: unique symbol = Symbol.for('openplayerjs.caption.provider');

type CaptionHost = Core & { [CAPTION_KEY]?: CaptionTrackProvider | null };

export function getCaptionTrackProvider(core: Core): CaptionTrackProvider | null {
  return (core as CaptionHost)[CAPTION_KEY] ?? null;
}

export function setCaptionTrackProvider(core: Core, provider: CaptionTrackProvider | null): void {
  (core as CaptionHost)[CAPTION_KEY] = provider;
}
