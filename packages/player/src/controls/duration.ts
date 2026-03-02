import { formatTime, generateISODateTime } from '@openplayer/core';
import { resolveUIConfig } from '../configuration';
import type { Control } from '../control';
import { BaseControl } from './base';

export class DurationControl extends BaseControl {
  id = 'duration';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  protected build(): HTMLElement {
    const core = this.core;

    const el = document.createElement('time');
    el.className = 'op-controls__duration';
    el.setAttribute('aria-hidden', 'false');
    el.setAttribute('datetime', 'PT0M0S');

    const update = () => {
      if (this.activeOverlay) {
        el.setAttribute('aria-hidden', 'false');
        el.innerText = formatTime(this.activeOverlay.duration);
        return;
      }

      const d = core.duration;
      if (core.isLive || d === Infinity) {
        el.removeAttribute('datetime');
        el.textContent = resolveUIConfig(core).labels.live;
        return;
      }

      el.setAttribute('aria-hidden', 'false');
      const duration = Number.isFinite(d) ? Math.max(0, d) : core.config?.duration || 0;
      const formattedDuration = formatTime(duration);
      el.textContent = formattedDuration;
      el.setAttribute('datetime', generateISODateTime(duration));
    };

    this.onPlayer('durationchange', update);
    this.onPlayer('timeupdate', update);
    this.overlayMgr.bus.on('overlay:changed', update);

    update();
    return el;
  }
}

export default function createDurationControl(): Control {
  return new DurationControl();
}
