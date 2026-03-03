import type { Core } from '@openplayerjs/core';
import { getOverlayManager } from '@openplayerjs/core';

export function getActiveMedia(core: Core): HTMLMediaElement {
  try {
    const hasOverlayMgr = typeof getOverlayManager === 'function';
    if (!hasOverlayMgr) return core.media;

    const active = getOverlayManager(core)?.active;
    const v = active?.fullscreenVideoEl as unknown as HTMLMediaElement | undefined;
    return v && typeof v.play === 'function' ? v : core.media;
  } catch {
    return core.media;
  }
}

export async function togglePlayback(core: Core): Promise<void> {
  const media = getActiveMedia(core);
  const isPlaying = !media.paused && !media.ended;

  if (isPlaying) {
    core.pause();
    return;
  }

  await core.play();
}
