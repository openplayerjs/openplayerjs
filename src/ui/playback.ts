import { getOverlayManager } from '../core/overlay';
import type { Player } from '../core/player';

/**
 * Return the currently "active" media element:
 * - If an overlay exposes a fullscreenVideoEl (ads, casting, etc), prefer that
 * - Otherwise, use the player's core media element
 */
export function getActiveMedia(player: Player): HTMLMediaElement {
  const active = getOverlayManager(player).active;
  const v = active?.fullscreenVideoEl as unknown as HTMLMediaElement | undefined;
  return v && typeof v.play === 'function' ? v : player.media;
}

/**
 * Toggle playback using the player's public API (so plugins can intercept).
 *
 * We use player.state as the source of truth for "is playing" to avoid relying on
 * the media element during overlays.
 */
export async function togglePlayback(player: Player): Promise<void> {
  const isPlaying =
    player.state.current === 'playing' ||
    player.state.current === 'waiting' ||
    player.state.current === 'seeking';

  if (isPlaying) {
    player.pause();
    return;
  }

  await player.play();
}
