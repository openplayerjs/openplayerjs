import { EVENT_OPTIONS } from '../core/constants';
import type { Player } from '../core/player';
import { isAudio, isMobile } from '../core/utils';
import { createControlGrid, type Control } from './control';
import { bindCenterOverlay } from './events';
import { createCenterOverlayDom } from './overlay';

export function createUI(player: Player, media: HTMLMediaElement, controls: Control[]) {
  const tmpMedia = media;
  const isMediaAudio = isAudio(tmpMedia);
  const wrapper = document.createElement('div');
  wrapper.className = 'op-player';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Media player');
  wrapper.tabIndex = 0;

  media.controls = false;

  media.replaceWith(wrapper);

  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'op-media';
  mediaContainer.tabIndex = 0;
  mediaContainer.setAttribute('role', 'group');
  mediaContainer.setAttribute('aria-label', 'Media');
  mediaContainer.appendChild(tmpMedia);

  const mainControls = document.createElement('div');
  mainControls.className = 'op-media__main';
  mediaContainer.appendChild(mainControls);

  if (!isMediaAudio) {
    const overlay = createCenterOverlayDom(player);
    mediaContainer.appendChild(overlay.button);
    mediaContainer.appendChild(overlay.loader);
    bindCenterOverlay(player, overlay, wrapper);
  }

  const controlsRoot = document.createElement('div');
  controlsRoot.className = 'op-controls';
  controlsRoot.setAttribute('aria-hidden', 'false');

  if (isMediaAudio) {
    const grid = createControlGrid(controlsRoot, mainControls);

    wrapper.appendChild(mediaContainer);
    wrapper.appendChild(controlsRoot);

    controls.forEach((control) => {
      const el = control.create(player);
      el.dataset.controlId = control.id;
      grid.place(control.placement, el);
    });
    return;
  }

  const mobile = isMobile();
  const POINTER_SHOW_MS = 3000;
  const KEYBOARD_SHOW_MS = 6500;
  let hideTimer: number | undefined;
  let lastInteraction: 'pointer' | 'keyboard' = 'pointer';

  const controlsHaveFocus = (): boolean => controlsRoot.contains(document.activeElement);

  const showControls = (): void => {
    mediaContainer.classList.remove('op-media--controls-hidden');
    if (hideTimer) window.clearTimeout(hideTimer);
    controlsRoot.classList.add('op-controls--visible');
    controlsRoot.classList.remove('op-controls--hidden');
    controlsRoot.setAttribute('aria-hidden', 'false');
  };

  const hideControls = (): void => {
    if (controlsHaveFocus()) {
      // If keyboard navigation is currently focused inside the controls, allow hiding after a longer delay,
      // but move focus back to the player wrapper so focus isn't trapped in a hidden bar.
      if (lastInteraction === 'keyboard') {
        wrapper.focus();
      } else {
        return;
      }
    }
    mediaContainer.classList.add('op-media--controls-hidden');
    controlsRoot.classList.add('op-controls--hidden');
    controlsRoot.setAttribute('aria-hidden', 'true');
  };

  const scheduleHide = (ms?: number): void => {
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => hideControls(), ms ?? POINTER_SHOW_MS);
  };

  const onControlsHover = (): void => {
    lastInteraction = 'pointer';
    showControls();
    scheduleHide(POINTER_SHOW_MS);
  };

  controlsRoot.addEventListener('focusin', () => {
    lastInteraction = 'keyboard';
    showControls();
    scheduleHide(KEYBOARD_SHOW_MS);
  });
  controlsRoot.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!controlsHaveFocus()) scheduleHide(lastInteraction === 'keyboard' ? KEYBOARD_SHOW_MS : POINTER_SHOW_MS);
    }, 0);
  });

  const isFocusInMediaArea = (): boolean => {
    const active = document.activeElement;
    if (!active) return false;
    return wrapper.contains(active) && !controlsRoot.contains(active);
  };

  wrapper.addEventListener(
    'focusin',
    () => {
      if (isFocusInMediaArea()) {
        showControls();
        if (hideTimer) window.clearTimeout(hideTimer);
      }
    },
    EVENT_OPTIONS
  );

  wrapper.addEventListener(
    'focusout',
    () => {
      window.setTimeout(() => {
        if (!wrapper.contains(document.activeElement) && !controlsHaveFocus()) scheduleHide();
      }, 0);
    },
    EVENT_OPTIONS
  );

  wrapper.addEventListener(
    'keydown',
    () => {
      lastInteraction = 'keyboard';
      if (isFocusInMediaArea()) {
        showControls();
        if (hideTimer) window.clearTimeout(hideTimer);
      } else if (controlsHaveFocus()) {
        showControls();
        scheduleHide(KEYBOARD_SHOW_MS);
      }
    },
    EVENT_OPTIONS
  );

  if (mobile) {
    wrapper.addEventListener(
      'pointerdown',
      () => {
        lastInteraction = 'pointer';
        showControls();
        scheduleHide(POINTER_SHOW_MS);
      },
      EVENT_OPTIONS
    );
  } else {
    wrapper.addEventListener('pointermove', onControlsHover, EVENT_OPTIONS);
    wrapper.addEventListener('pointerenter', onControlsHover, EVENT_OPTIONS);
    controlsRoot.addEventListener('pointerenter', onControlsHover, EVENT_OPTIONS);
    controlsRoot.addEventListener('pointermove', onControlsHover, EVENT_OPTIONS);
    controlsRoot.addEventListener('pointerleave', () => scheduleHide(POINTER_SHOW_MS), EVENT_OPTIONS);
  }

  const grid = createControlGrid(controlsRoot, mainControls);

  wrapper.appendChild(mediaContainer);
  wrapper.appendChild(controlsRoot);

  controls.forEach((control) => {
    const el = control.create(player);
    el.dataset.controlId = control.id;
    grid.place(control.placement, el);
  });
}
