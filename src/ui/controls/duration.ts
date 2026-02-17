import { formatTime } from '../../core/utils';
import type { Control } from '../control';
import { BaseControl } from './base';

export class DurationControl extends BaseControl {
  id = 'duration';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  protected build(): HTMLElement {
    const player = this.player;

    const el = document.createElement('time');
    el.className = 'op-controls__duration';
    el.setAttribute('aria-hidden', 'false');

    const update = () => {
      if (this.activeOverlay) {
        el.setAttribute('aria-hidden', 'false');
        el.innerText = formatTime(this.activeOverlay.duration);
        return;
      }

      const d = player.duration;
      if (player.isLive || d === Infinity) {
        el.setAttribute('aria-hidden', 'true');
        return;
      }

      el.setAttribute('aria-hidden', 'false');
      el.innerText = formatTime(Number.isFinite(d) ? d : 0);
    };

    player.events.on('media:duration', () => update());
    player.events.on('media:timeupdate', () => update());

    this.overlayMgr.bus.on('overlay:changed', () => update());

    update();
    return el;
  }
}

export default function createDurationControl(): Control {
  return new DurationControl();
}
