import type { Core } from '@openplayer/core';
import { EVENT_OPTIONS } from '@openplayer/core';
import { resolveUIConfig } from './configuration';
import type { CenterOverlayBindings } from './overlay';
import { getActiveMedia, togglePlayback } from './playback';

export function bindCenterOverlay(core: Core, keyTarget: HTMLElement, bindings?: CenterOverlayBindings) {
  let lastNonZeroVolume = core.volume || 1;

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

  keyTarget.addEventListener('click', onPointer, EVENT_OPTIONS);
  keyTarget.addEventListener('pointerdown', onPointer, EVENT_OPTIONS);
  keyTarget.addEventListener('pointerleave', onPointer, EVENT_OPTIONS);

  window.addEventListener('click', onPointer, EVENT_OPTIONS);
  window.addEventListener('pointerdown', onPointer, EVENT_OPTIONS);
  window.addEventListener('keydown', onKeyboard, EVENT_OPTIONS);

  keyTarget.addEventListener(
    'keydown',
    async (e) => {
      const key = e.key;

      onKeyboard();

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

      const conf = resolveUIConfig(core).step;
      const step = conf && conf > 0 ? conf : 5;

      switch (key) {
        // Toggle play/pause
        case 'k':
        case 'K':
        case 'Enter':
        case ' ':
        case 'Spacebar': {
          await togglePlayback(core);
          e.preventDefault();
          e.stopPropagation();
          break;
        }
        // End key ends video
        case 'End':
          if (core.duration !== Infinity) {
            core.currentTime = core.duration;
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        // Home key resets progress
        case 'Home':
          core.currentTime = 0;
          e.preventDefault();
          e.stopPropagation();
          break;

        // Volume
        case 'ArrowUp': {
          const upVolume = Math.min(core.volume + 0.1, 1);
          core.volume = upVolume;
          core.muted = !(upVolume > 0);
          if (upVolume > 0) lastNonZeroVolume = upVolume;
          const el = getActiveMedia(core);
          if (el && el !== core.media) {
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
          const downVolume = Math.max(core.volume - 0.1, 0);
          core.volume = downVolume;
          core.muted = !(downVolume > 0);
          if (downVolume > 0) lastNonZeroVolume = downVolume;
          const el = getActiveMedia(core);
          if (el && el !== core.media) {
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
          const el = getActiveMedia(core);
          const nextMuted = !core.muted;

          if (nextMuted) {
            // store last non-zero volume before muting
            if (core.volume > 0) lastNonZeroVolume = core.volume;

            core.volume = 0;
            core.muted = true;

            if (el && el !== core.media) {
              try {
                el.volume = 0;
                el.muted = true;
              } catch {
                // ignore
              }
            }
          } else {
            const restore = lastNonZeroVolume > 0 ? lastNonZeroVolume : 1;
            core.volume = restore;
            core.muted = false;

            if (el && el !== core.media) {
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
          if (core.duration !== Infinity) {
            core.currentTime = Math.max(0, core.currentTime - step);
            e.preventDefault();
            e.stopPropagation();
          }
          break;

        case 'L':
        case 'l':
        case 'ArrowRight':
          if (core.duration !== Infinity) {
            core.currentTime = Math.min(core.duration, core.currentTime + step);
            e.preventDefault();
            e.stopPropagation();
          }
          break;

        // Rate
        case '<':
          core.playbackRate = Math.max(core.playbackRate - 0.25, 0.25);

          e.preventDefault();
          e.stopPropagation();
          break;
        case '>':
          core.playbackRate = Math.min(core.playbackRate + 0.25, 2);
          e.preventDefault();
          e.stopPropagation();
          break;
        default:
          break;
      }
    },
    EVENT_OPTIONS
  );

  core.events.on('waiting', () => {
    bindings?.showLoader(true);
    bindings?.showButton(false);
  });
  core.events.on('seeking', () => {
    bindings?.showLoader(true);
    bindings?.showButton(false);
  });
  core.events.on('seeked', () => {
    bindings?.showLoader(false);
    // After seeking, only show the center button if we are paused.
    // When seeking during playback (common on iOS), keeping the play button visible
    // causes it to linger even after the loader is hidden.
    bindings?.showButton(core.media?.paused ?? false);
  });
  core.events.on('play', () => {
    bindings?.showLoader(false);
    bindings?.showButton(false);
  });
  core.events.on('pause', () => {
    bindings?.showLoader(false);
    bindings?.showButton(true);
  });
  core.events.on('playing', () => {
    bindings?.showLoader(false);
    bindings?.showButton(false);
  });
  core.events.on('ended', () => {
    bindings?.showLoader(false);
    bindings?.showButton(true);
  });
}
