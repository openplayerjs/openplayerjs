import { getOverlayManager } from '../core/overlay';
import type { Player } from '../core/player';

export function getActiveMedia(player: Player): HTMLMediaElement {
  const active = getOverlayManager(player).active;
  const v = active?.fullscreenVideoEl as unknown as HTMLMediaElement | undefined;
  return v && typeof v.play === 'function' ? v : player.media;
}

export async function togglePlayback(player: Player): Promise<void> {
  const isPlaying =
    player.state.current === 'playing' || player.state.current === 'waiting' || player.state.current === 'seeking';

  if (isPlaying) {
    player.pause();
    return;
  }

  await player.play();
}
