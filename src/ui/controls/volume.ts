import { EVENT_OPTIONS } from '../../core/constants';
import { isMobile } from '../../core/utils';
import type { Control } from '../control';
import { getActiveMedia } from '../playback';
import { BaseControl } from './base';

export class VolumeControl extends BaseControl {
  id = 'volume';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  protected build(): HTMLElement {
    const player = this.player;
    const { labels = {} } = player.config;

    const wrapper = document.createElement('div');
    wrapper.className = 'op-controls__volume';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('aria-valuemin', '0');
    wrapper.setAttribute('aria-valuemax', '100');
    wrapper.setAttribute('aria-valuenow', `${player.volume}`);
    wrapper.setAttribute('aria-label', labels.volume);
    wrapper.setAttribute('aria-orientation', 'vertical');
    wrapper.setAttribute('role', 'slider');

    const slider = document.createElement('input');
    slider.className = 'op-controls__volume--input';
    slider.tabIndex = -1;
    slider.type = 'range';
    slider.value = player.volume.toString();
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.1';
    slider.setAttribute('aria-label', labels.volumeSlider);

    const display = document.createElement('progress');
    display.className = 'op-controls__volume--display';
    display.max = 10;
    display.value = player.volume * 10;

    wrapper.appendChild(slider);
    wrapper.appendChild(display);

    let lastVolume = player.volume;

    const formatVolume = (vol: number) => {
      if (vol >= 1) return 1;
      if (vol <= 0) return 0;
      return vol;
    };

    const updateSlider = (vol: number) => {
      const v = formatVolume(vol);
      display.value = v * 10;
      const formattedVol = Math.floor(v * 100);
      container.setAttribute('aria-valuenow', `${formattedVol}`);
      container.setAttribute('aria-valuetext', `Volume: ${formattedVol}`);
    };

    const updateBtn = (vol: number) => {
      const v = formatVolume(vol);
      if (v <= 0.5 && v > 0) {
        btn.classList.remove('op-controls__mute--muted');
        btn.classList.add('op-controls__mute--half');
      } else if (v === 0) {
        btn.classList.add('op-controls__mute--muted');
        btn.classList.remove('op-controls__mute--half');
      } else {
        btn.classList.remove('op-controls__mute--muted');
        btn.classList.remove('op-controls__mute--half');
      }
    };

    slider.addEventListener(
      'input',
      (e: Event) => {
        const vol = Number((e.target as HTMLInputElement).value);
        const v = formatVolume(vol);
        lastVolume = v;
        player.volume = v;
        player.muted = v === 0;

        // Ensure active ad element follows the volume changes.
        const el = getActiveMedia(player);
        if (el && el !== player.media) {
          try {
            el.volume = v;
            el.muted = v === 0;
          } catch {
            // ignore
          }
        }

        updateSlider(v);
        updateBtn(v);
      },
      EVENT_OPTIONS
    );

    player.events.on('media:volume', (vol: number) => {
      const v = formatVolume(vol);
      if (v > 0) lastVolume = v;
      updateBtn(v);
      updateSlider(v);
    });

    const btn = document.createElement('button');
    btn.tabIndex = 0;
    btn.type = 'button';
    btn.title = 'Mute';
    btn.className = 'op-controls__mute';
    btn.setAttribute('aria-label', 'Muted');
    btn.setAttribute('aria-pressed', 'false');

    btn.addEventListener(
      'click',
      (e) => {
        const el = getActiveMedia(player);
        // Preserve last non-zero volume when muting, restore it when unmuting.
        if (!player.muted) {
          if (player.volume > 0) lastVolume = player.volume;
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
          const restore = lastVolume > 0 ? lastVolume : 1;
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
      },
      EVENT_OPTIONS
    );

    player.events.on('media:muted', (muted: boolean) => {
      const restore = lastVolume > 0 ? lastVolume : 1;
      slider.value = muted ? '0' : restore.toString();
      const formattedValue = Number(slider.value);
      updateSlider(formattedValue);
      updateBtn(formattedValue);
      btn.setAttribute('aria-pressed', muted ? 'true' : 'false');

      const el = getActiveMedia(player);
      if (el && el !== player.media) {
        try {
          el.muted = muted;
          if (!muted) el.volume = restore;
        } catch {
          // ignore
        }
      }
    });

    const container = document.createElement('div');
    container.className = 'op-controls__volume--container';
    container.appendChild(btn);
    container.appendChild(wrapper);

    return container;
  }
}

export default function createVolumeControl(): Control | null {
  return isMobile() ? null : new VolumeControl();
}
