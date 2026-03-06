import type { Core } from '@openplayerjs/core';
import { EVENT_OPTIONS } from '@openplayerjs/core';
import { setA11yLabel } from './a11y';
import { resolveUIConfig } from './configuration';
import { togglePlayback } from './playback';

export type CenterIcon = 'play' | 'pause';

export type CenterOverlayBindings = {
  button: HTMLButtonElement;
  loader: HTMLSpanElement;

  showButton: (show: boolean) => void;
  showLoader: (show: boolean) => void;
  flashPause: (ms: number) => void;
};

export function createCenterOverlayDom(core: Core): CenterOverlayBindings {
  const labels = resolveUIConfig(core).labels;
  const playLabel = labels.play;
  const pauseLabel = labels.pause;
  const loadingLabel = labels.loading;

  const button = document.createElement('button');
  button.className = 'op-player__play';
  button.tabIndex = 0;
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-hidden', 'false');
  setA11yLabel(button, playLabel);
  button.setAttribute('aria-keyshortcuts', 'K Enter');

  button.addEventListener(
    'click',
    async (e) => {
      await togglePlayback(core);
      e.preventDefault();
      e.stopPropagation();
    },
    EVENT_OPTIONS
  );

  const loader = document.createElement('span');
  loader.className = 'op-player__loader';
  loader.tabIndex = -1;
  loader.setAttribute('aria-hidden', 'true');
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');

  const loaderText = document.createElement('span');
  loaderText.className = 'op-player__sr-only';
  loaderText.textContent = loadingLabel;
  loader.appendChild(loaderText);

  let flashTimer: number | undefined;
  let isFlashing = false;

  const cancelFlash = () => {
    if (flashTimer) {
      window.clearTimeout(flashTimer);
      flashTimer = undefined;
    }
    isFlashing = false;
    button.classList.remove('op-player__play--flash');
  };

  const showButton = (show: boolean) => {
    if (show) {
      if (isFlashing) return;

      button.classList.remove('op-player__play--paused');
      button.setAttribute('aria-hidden', 'false');
      button.removeAttribute('inert');
      setA11yLabel(button, playLabel);
      button.inert = false;
      button.tabIndex = 0;
    } else {
      if (isFlashing) cancelFlash();

      // Avoid aria-hidden on a focused element (Chrome warning).
      const active = document.activeElement;
      if (active && (active === button || button.contains(active))) {
        (active as HTMLElement).blur?.();
      }

      button.classList.add('op-player__play--paused');
      button.setAttribute('aria-hidden', 'true');
      button.setAttribute('inert', '');
      setA11yLabel(button, pauseLabel);
      button.inert = true;
      button.tabIndex = -1;
    }
  };

  const flashPause = (ms: number): void => {
    cancelFlash();

    isFlashing = true;
    button.classList.remove('op-player__play--paused');
    button.classList.add('op-player__play--flash');
    button.setAttribute('aria-hidden', 'false');
    button.removeAttribute('inert');
    button.inert = false;
    button.tabIndex = -1;
    setA11yLabel(button, pauseLabel);

    flashTimer = window.setTimeout(() => {
      button.classList.remove('op-player__play--flash');
      flashTimer = undefined;
      isFlashing = false;
      showButton(true);
    }, ms);
  };

  const showLoader = (show: boolean) => {
    loader.style.display = show ? '' : 'none';
    loader.setAttribute('aria-hidden', show ? 'false' : 'true');
  };

  return { button, loader, showButton, showLoader, flashPause };
}
