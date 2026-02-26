import { EVENT_OPTIONS, isMobile } from '@openplayer/core';
import type { Control } from '../control';
import { getActiveMedia } from '../playback';
import { setControlLabel } from '../a11y';
import { BaseControl } from './base';

export class VolumeControl extends BaseControl {
  id = 'volume';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  protected build(): HTMLElement {
    const player = this.player;
    const muteLabel = player.config.labels?.mute || 'Mute';
    const unmuteLabel = player.config.labels?.unmute || 'Unmute';
    const volumeLabel = player.config.labels?.volume || 'Volume';
    const volumeControlLabel = player.config.labels?.volumeControl || 'Volume Control';
    const volumeSliderLabel = player.config.labels?.volumeSlider || 'Volume Slider';

    const wrapper = document.createElement('div');
    wrapper.className = 'op-controls__volume';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('aria-valuemin', '0');
    wrapper.setAttribute('aria-valuemax', '100');
    wrapper.setAttribute('aria-valuenow', `${player.volume}`);
    setControlLabel(wrapper, volumeControlLabel);
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
    setControlLabel(slider, volumeSliderLabel, { container: wrapper });

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
      wrapper.setAttribute('aria-valuenow', `${formattedVol}`);
      wrapper.setAttribute('aria-valuetext', `${volumeLabel}: ${formattedVol}`);
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

    this.listen(
      slider,
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

    const btn = document.createElement('button');
    btn.tabIndex = 0;
    btn.type = 'button';
    btn.title = muteLabel;
    btn.className = 'op-controls__mute';
    setControlLabel(btn, muteLabel);
    btn.setAttribute('aria-pressed', 'false');

    this.listen(
      btn,
      'click',
      (e: Event) => {
        const me = e as MouseEvent;
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
              btn.title = muteLabel;
              setControlLabel(btn, muteLabel);
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
              btn.title = unmuteLabel;
              setControlLabel(btn, unmuteLabel);
            } catch {
              // ignore
            }
          }
        }
        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    // Keep UI in sync with the player's effective volume/mute state.
    this.onPlayer('volumechange', () => {
      const muted = player.muted || player.volume === 0;
      const vol = formatVolume(player.volume);

      if (vol > 0) lastVolume = vol;

      // Slider reflects 0 when muted, otherwise the current volume.
      slider.value = (muted ? 0 : vol).toString();

      updateSlider(muted ? 0 : vol);
      updateBtn(muted ? 0 : vol);
      btn.setAttribute('aria-pressed', muted ? 'true' : 'false');

      // Ensure active ad element follows state changes (e.g., unmute during ad playback).
      const el = getActiveMedia(player);
      if (el && el !== player.media) {
        try {
          el.muted = muted;
          if (!muted) el.volume = vol;
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
