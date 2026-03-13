import type { Core, MediaSurface } from '@openplayerjs/core';
import { getOverlayManager } from '@openplayerjs/core';

export function getActiveMedia(core: Core): MediaSurface {
  try {
    const hasOverlayMgr = typeof getOverlayManager === 'function';
    if (!hasOverlayMgr) return core.surface;

    const active = getOverlayManager(core)?.active;
    const v = active?.fullscreenVideoEl as MediaSurface | undefined;
    return v && typeof v.play === 'function' ? v : core.surface;
  } catch {
    return core.surface;
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
