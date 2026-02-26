import type { Control } from '../control';
import { BaseControl } from './base';
import { CurrentTimeControl } from './currentTime';
import { DurationControl } from './duration';

export class TimeControl extends BaseControl {
  id = 'time';
  placement: Control['placement'] = { v: 'bottom', h: 'left' };

  protected build(): HTMLElement {
    const player = this.player;

    const delimiter = document.createElement('span');
    delimiter.className = 'op-controls__time-delimiter';
    delimiter.textContent = '/';

    const container = document.createElement('span');
    container.className = 'op-controls-time';

    const currentTime = new CurrentTimeControl().create(player);
    const duration = new DurationControl().create(player);

    container.appendChild(currentTime);
    container.appendChild(delimiter);
    container.appendChild(duration);

    return container;
  }
}

export default function createTimeControl(): Control {
  return new TimeControl();
}
