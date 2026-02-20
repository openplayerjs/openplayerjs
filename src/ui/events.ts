import { EVENT_OPTIONS } from '../core/constants';
import type { Player } from '../core/player';
import type { CenterOverlayBindings } from './overlay';
import { getActiveMedia, togglePlayback } from './playback';

export function bindCenterOverlay(player: Player, keyTarget: HTMLElement, bindings?: CenterOverlayBindings) {
  let lastNonZeroVolume = player.volume || 1;

  const onKeyboard = () => {
    if (keyTarget.classList.contains('op-player__keyboard--inactive')) {
      keyTarget.classList.remove('op-player__keyboard--inactive');
    }
  };

  const onPointer = () => {
    if (!keyTarget.classList.contains('op-player__keyboard--inactive')) {
      keyTarget.classList.add('op-player__keyboard--inactive');
    }
  };

  // Pointer/touch interaction should switch to "pointer mode" and hide keyboard focus styling.
  // Bind to the player wrapper (keyTarget) so toggling on the wrapper updates the class.
  keyTarget.addEventListener('click', onPointer, EVENT_OPTIONS);
  keyTarget.addEventListener('pointerdown', onPointer, EVENT_OPTIONS);
  keyTarget.addEventListener('pointerleave', onPointer, EVENT_OPTIONS);

  // Also listen at window-level for interactions that might happen outside the wrapper.
  window.addEventListener('click', onPointer, EVENT_OPTIONS);
  window.addEventListener('pointerdown', onPointer, EVENT_OPTIONS);

  // Some tests (and real-world cases) dispatch keyboard events on window.
  window.addEventListener('keydown', onKeyboard, EVENT_OPTIONS);

  keyTarget.addEventListener(
    'keydown',
    async (e) => {
      const key = e.key;

      onKeyboard();

      // If a control button is focused, let Space/Enter activate it (native button behavior).
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (key === ' ' || key === 'Enter' || key === 'Spacebar') &&
        (activeEl.tagName === 'BUTTON' || activeEl.getAttribute('role') === 'button')
      ) {
        activeEl.click();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const step = player.config.step || 5;

      switch (key) {
        // Toggle play/pause
        case 'k':
        case 'K':
        case 'Enter':
        case ' ':
        case 'Spacebar': {
          await togglePlayback(player);
          e.preventDefault();
          e.stopPropagation();
          break;
        }
        // End key ends video
        case 'End':
          if (player.duration !== Infinity) {
            player.currentTime = player.duration;
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        // Home key resets progress
        case 'Home':
          player.currentTime = 0;
          e.preventDefault();
          e.stopPropagation();
          break;

        // Volume
        case 'ArrowUp': {
          const upVolume = Math.min(player.volume + 0.1, 1);
          player.volume = upVolume;
          player.muted = !(upVolume > 0);
          if (upVolume > 0) lastNonZeroVolume = upVolume;
          const el = getActiveMedia(player);
          if (el && el !== player.media) {
            try {
              el.volume = upVolume;
              el.muted = !(upVolume > 0);
            } catch {
              // ignore
            }
          }
          e.preventDefault();
          e.stopPropagation();
          break;
        }
        case 'ArrowDown': {
          const downVolume = Math.max(player.volume - 0.1, 0);
          player.volume = downVolume;
          player.muted = !(downVolume > 0);
          if (downVolume > 0) lastNonZeroVolume = downVolume;
          const el = getActiveMedia(player);
          if (el && el !== player.media) {
            try {
              el.volume = downVolume;
              el.muted = !(downVolume > 0);
            } catch {
              // ignore
            }
          }
          e.preventDefault();
          e.stopPropagation();
          break;
        }

        // Fullscreen toggle
        case 'f':
        case 'F': {
          const fullscreenTarget = e.target as any;
          if (fullscreenTarget.requestFullscreen) fullscreenTarget.requestFullscreen();
          else if (fullscreenTarget.mozRequestFullScreen) fullscreenTarget.mozRequestFullScreen();
          else if (fullscreenTarget.webkitRequestFullScreen) fullscreenTarget.webkitRequestFullScreen();
          else if (fullscreenTarget.msRequestFullscreen) fullscreenTarget.msRequestFullscreen();
          else if (fullscreenTarget.webkitEnterFullscreen) fullscreenTarget.webkitEnterFullscreen();
          e.preventDefault();
          e.stopPropagation();
          break;
        }

        // Mute toggle preserving last volume
        case 'm':
        case 'M': {
          const el = getActiveMedia(player);
          const nextMuted = !player.muted;

          if (nextMuted) {
            // store last non-zero volume before muting
            if (player.volume > 0) lastNonZeroVolume = player.volume;

            player.volume = 0;
            player.muted = true;

            if (el && el !== player.media) {
              try {
                el.volume = 0;
                el.muted = true;
              } catch {
                // ignore
              }
            }
          } else {
            const restore = lastNonZeroVolume > 0 ? lastNonZeroVolume : 1;
            player.volume = restore;
            player.muted = false;

            if (el && el !== player.media) {
              try {
                el.volume = restore;
                el.muted = false;
              } catch {
                // ignore
              }
            }
          }

          e.preventDefault();
          e.stopPropagation();
          break;
        }

        // Seek
        case 'J':
        case 'j':
        case 'ArrowLeft':
          if (player.duration !== Infinity) {
            player.currentTime = Math.max(0, player.currentTime - step);
            e.preventDefault();
            e.stopPropagation();
          }
          break;

        case 'L':
        case 'l':
        case 'ArrowRight':
          if (player.duration !== Infinity) {
            player.currentTime = Math.min(player.duration, player.currentTime + step);
            e.preventDefault();
            e.stopPropagation();
          }
          break;

        // Rate
        case '<':
          player.playbackRate = Math.max(player.playbackRate - 0.25, 0.25);
          player.events.emit('media:rate', player.playbackRate);
          e.preventDefault();
          e.stopPropagation();
          break;
        case '>':
          player.playbackRate = Math.min(player.playbackRate + 0.25, 2);
          player.events.emit('media:rate', player.playbackRate);
          e.preventDefault();
          e.stopPropagation();
          break;
        default:
          break;
      }
    },
    EVENT_OPTIONS
  );

  player.events.on('playback:waiting', () => {
    bindings?.showLoader(true);
    bindings?.showButton(false);
  });
  player.events.on('playback:seeking', () => {
    bindings?.showLoader(true);
    bindings?.showButton(false);
  });
  player.events.on('playback:seeked', () => {
    bindings?.showLoader(false);
    // After seeking, only show the center button if we are paused.
    // When seeking during playback (common on iOS), keeping the play button visible
    // causes it to linger even after the loader is hidden.
    bindings?.showButton(player.media?.paused ?? false);
  });
  player.events.on('playback:play', () => {
    bindings?.showLoader(false);
    // Play intent: hide the big play button. It will remain hidden when playback starts.
    bindings?.showButton(false);
  });
  player.events.on('playback:pause', () => {
    bindings?.showLoader(false);
    bindings?.showButton(true);
  });
  player.events.on('playback:playing', () => {
    bindings?.showLoader(false);
    bindings?.showButton(false);
  });
  player.events.on('playback:ended', () => {
    bindings?.showLoader(false);
    bindings?.showButton(true);
  });
}
