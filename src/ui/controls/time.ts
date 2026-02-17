import { formatTime } from '../../core/utils';
import type { Control } from '../control';
import { BaseControl } from './base';

export class CurrentTimeControl extends BaseControl {
  id = 'currentTime';
  placement: Control['placement'] = { v: 'bottom', h: 'left' };

  protected build(): HTMLElement {
    const player = this.player;

    const el = document.createElement('time');
    el.className = 'op-controls__current';
    el.setAttribute('role', 'timer');
    el.setAttribute('aria-live', 'off');
    el.setAttribute('aria-hidden', 'false');
    el.innerText = '0:00';

    const update = () => {
      if (this.activeOverlay) {
        el.setAttribute('aria-hidden', 'false');
        el.innerText = formatTime(this.activeOverlay.value);
        return;
      }

      if (player.isLive) {
        el.setAttribute('aria-hidden', 'true');
        return;
      }

      const t = player.currentTime;
      el.setAttribute('aria-hidden', 'false');
      el.innerText = formatTime(Number.isFinite(t) ? t : 0);
    };

    player.events.on('media:timeupdate', () => update());
    player.events.on('playback:seeked', () => update());
    player.events.on('media:duration', () => update());

    this.overlayMgr.bus.on('overlay:changed', () => update());

    update();
    return el;
  }
}

export default function createCurrentTimeControl(): Control {
  return new CurrentTimeControl();
}
