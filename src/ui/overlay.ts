import { EVENT_OPTIONS } from '../core/constants';
import { Player } from '../core/player';
import { togglePlayback } from './playback';

export type CenterIcon = 'play' | 'pause';

export interface CenterOverlayBindings {
  button: HTMLButtonElement;
  loader: HTMLSpanElement;

  showButton: (show: boolean) => void;
  showLoader: (show: boolean) => void;
}

export function createCenterOverlayDom(player: Player): CenterOverlayBindings {
  const button = document.createElement('button');
  button.className = 'op-player__play';
  button.tabIndex = 0;
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-hidden', 'false');
  button.setAttribute('aria-label', 'Play');
  button.setAttribute('aria-keyshortcuts', 'K Enter');

  button.addEventListener(
    'click',
    async (e) => {
      await togglePlayback(player);
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
  loader.setAttribute('aria-label', 'Loading');

  const srText = document.createElement('span');
  srText.textContent = 'Toggle play/pause';
  button.appendChild(srText);

  const showButton = (show: boolean) => {
    if (show) {
      button.classList.remove('op-player__play--paused');
      button.setAttribute('aria-hidden', 'false');
      button.removeAttribute('inert');
      button.inert = false;
      button.tabIndex = 0;
    } else {
      // Avoid aria-hidden on a focused element (Chrome warning).
      const active = document.activeElement;
      if (active && (active === button || button.contains(active))) {
        (active as HTMLElement).blur?.();
      }

      button.classList.add('op-player__play--paused');
      button.setAttribute('aria-hidden', 'true');
      button.setAttribute('inert', '');
      button.inert = true;
      button.tabIndex = -1;
    }
  };

  const showLoader = (show: boolean) => {
    loader.style.display = show ? '' : 'none';
    loader.setAttribute('aria-hidden', show ? 'false' : 'true');
  };

  return { button, loader, showButton, showLoader };
}
