import { EVENT_OPTIONS } from '../../core/constants';
import { formatTime, isMobile, offset } from '../../core/utils';
import type { Control } from '../control';
import { BaseControl } from './base';

export class ProgressControl extends BaseControl {
  id = 'progress';
  placement: Control['placement'] = { v: 'top', h: 'center' };

  private repaint?: () => void;

  protected build(): HTMLElement {
    const player = this.player;

    const progress = document.createElement('div');
    progress.className = 'op-controls__progress';
    progress.role = 'slider';
    progress.tabIndex = 0;
    progress.setAttribute('aria-label', 'Progress slider');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuenow', '0');

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.role = 'slider';
    slider.className = 'op-controls__progress--seek';
    slider.tabIndex = -1;
    slider.min = '0';
    slider.step = '0.1';
    slider.value = '0';
    slider.setAttribute('aria-label', 'Progress rail');

    const buffer = document.createElement('progress');
    buffer.className = 'op-controls__progress--buffer';
    buffer.max = 100;
    buffer.value = 0;

    const played = document.createElement('progress');
    played.className = 'op-controls__progress--played';
    played.max = 100;
    played.value = 0;

    progress.appendChild(slider);
    progress.appendChild(played);
    progress.appendChild(buffer);

    let tooltip: HTMLSpanElement;
    if (!isMobile()) {
      tooltip = document.createElement('span');
      tooltip.className = 'op-controls__tooltip';
      tooltip.tabIndex = -1;
      tooltip.innerHTML = '00:00';
      progress.appendChild(tooltip);
    }

    const setPressed = (pressed: boolean) => {
      if (pressed) slider.classList.add('op-progress--pressed');
      else slider.classList.remove('op-progress--pressed');
    };

    slider.addEventListener('pointerdown', () => setPressed(true));
    slider.addEventListener('pointerup', () => setPressed(false));
    slider.addEventListener('pointercancel', () => setPressed(false));
    slider.addEventListener('mouseleave', () => setPressed(false));

    const clearPressed = () => setPressed(false);
    document.addEventListener('pointerup', clearPressed, EVENT_OPTIONS);
    document.addEventListener('pointercancel', clearPressed, EVENT_OPTIONS);
    document.addEventListener('mouseup', clearPressed, EVENT_OPTIONS);
    document.addEventListener('touchend', clearPressed, EVENT_OPTIONS);

    const setSeekEnabled = (enabled: boolean) => {
      slider.disabled = !enabled;
      slider.classList.toggle('op-progress--disabled', !enabled);
      progress.setAttribute('aria-disabled', (!enabled).toString());
    };

    const getDuration = () => {
      if (this.activeOverlay) return this.activeOverlay.duration;
      return player.media?.duration ?? player.duration;
    };

    const getValue = () => {
      if (this.activeOverlay) return this.activeOverlay.value;
      return player.media?.currentTime ?? player.currentTime;
    };

    const getMode = () => (this.activeOverlay ? this.activeOverlay.mode : 'normal');

    const updateUI = () => {
      const duration = getDuration();
      const value = getValue();
      const mode = getMode();

      if ((player.isLive || duration === Infinity) && !this.activeOverlay) {
        progress.setAttribute('aria-hidden', 'true');
        return;
      }
      progress.setAttribute('aria-hidden', 'false');

      if (Number.isFinite(duration) && duration > 0) {
        if (!slider.max || slider.max === '0' || parseFloat(slider.max || '-1') !== duration) {
          slider.max = String(duration);
          progress.setAttribute('aria-valuemax', String(duration));
        }
      }

      this.repaint = updateUI;

      if (this.activeOverlay) setSeekEnabled(this.activeOverlay.canSeek);
      else setSeekEnabled(!player.isLive && player.media?.duration !== Infinity);

      if (slider.classList.contains('op-progress--pressed')) return;

      const d = Number.isFinite(duration) && duration > 0 ? duration : 0;
      const v = Number.isFinite(value) && value >= 0 ? value : 0;

      slider.value = String(v);

      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
        const percentage =
          mode === 'countdown' ? ((max - v - min) * 100) / (max - min) : ((v - min) * 100) / (max - min);
        slider.style.backgroundSize = `${percentage}% 100%`;
      }

      played.value = !d ? 0 : mode === 'countdown' ? ((d - v) / d) * 100 : (v / d) * 100;

      if (this.activeOverlay && Number.isFinite(this.activeOverlay.bufferedPct!)) {
        buffer.value = Math.max(0, Math.min(100, this.activeOverlay.bufferedPct!));
      }
    };

    slider.addEventListener(
      'input',
      (e) => {
        if (!slider.classList.contains('op-progress--pressed')) return;
        if (this.activeOverlay && !this.activeOverlay.canSeek) return;

        const target = e.target as HTMLInputElement;
        const min = parseFloat(target.min);
        const max = parseFloat(target.max);
        const val = parseFloat(target.value);

        if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
          slider.style.backgroundSize = `${((val - min) * 100) / (max - min)}% 100%`;
        }

        const duration = getDuration();
        const d = Number.isFinite(duration) && duration > 0 ? duration : 0;
        played.value = d ? (val / d) * 100 : 0;
        player.currentTime = val;
      },
      EVENT_OPTIONS
    );

    player.events.on('media:duration', updateUI);
    player.events.on('media:timeupdate', updateUI);

    player.events.on('playback:waiting', () => {
      if (!slider.classList.contains('loading')) slider.classList.add('loading');
      if (slider.classList.contains('error')) slider.classList.remove('error');
    });

    player.events.on('playback:play', () => {
      if (slider.classList.contains('loading')) slider.classList.remove('loading');
      if (slider.classList.contains('error')) slider.classList.remove('error');

      if (!player.isLive && player.media.duration !== Infinity) {
        progress.removeAttribute('aria-valuenow');
        progress.removeAttribute('aria-valuetext');
      }
    });

    player.events.on('playback:playing', () => {
      if (slider.classList.contains('loading')) slider.classList.remove('loading');
      if (slider.classList.contains('error')) slider.classList.remove('error');
    });

    player.events.on('playback:ended', () => {
      slider.style.backgroundSize = '0% 100%';
      if (slider.max) slider.max = '0';
      buffer.value = 0;
      played.value = 0;
    });

    progress.addEventListener(
      'pointermove',
      (e: MouseEvent): void => {
        if (isMobile()) return;
        if (this.activeOverlay && !this.activeOverlay.canSeek) return;

        const duration = getDuration();
        if ((player.isLive || duration === Infinity) && !this.activeOverlay) return;

        const x = e.pageX;
        let pos = x - offset(progress).left;
        const half = tooltip.offsetWidth / 2;
        const percentage = pos / progress.offsetWidth;
        const time = percentage * duration;

        const root = this.resolvePlayerRoot();
        const limit = root.offsetWidth - tooltip.offsetWidth;

        if (pos <= 0 || x - offset(root).left <= half) pos = 0;
        else if (x - offset(root).left >= limit) pos = limit - offset(slider).left - 10;
        else pos -= half;

        if (percentage >= 0 && percentage <= 1) tooltip.classList.add('op-controls__tooltip--visible');
        else tooltip.classList.remove('op-controls__tooltip--visible');

        tooltip.style.left = `${pos}px`;

        if (Number.isFinite(duration) && duration > 0) {
          const remaining = Math.max(0, duration - time);
          tooltip.innerHTML = Number.isNaN(remaining) ? '00:00' : formatTime(remaining);
        } else {
          tooltip.innerHTML = Number.isNaN(time) ? '00:00' : formatTime(time);
        }
      },
      EVENT_OPTIONS
    );

    document.addEventListener(
      'pointermove',
      (e) => {
        if (!(e.target as HTMLElement).closest('.op-controls__progress')) {
          tooltip.classList.remove('op-controls__tooltip--visible');
        }
      },
      EVENT_OPTIONS
    );

    updateUI();
    return progress;
  }

  protected onOverlayChanged(): void {
    this.repaint?.();
  }
}

export default function createProgressControl(): Control {
  return new ProgressControl();
}
