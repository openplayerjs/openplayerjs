import { EVENT_OPTIONS, isMobile } from '@openplayerjs/core';
import { getSharedAnnouncer, setA11yLabel } from '../a11y';
import { resolveUIConfig } from '../configuration';
import type { Control } from '../control';
import { getActiveMedia } from '../playback';
import { BaseControl } from './base';

export class VolumeControl extends BaseControl {
  id = 'volume';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  protected build(): HTMLElement {
    const core = this.core;
    const labels = resolveUIConfig(core).labels;
    const labelsMap = labels as Record<string, string>;
    const muteLabel = labels.mute;
    const unmuteLabel = labels.unmute;
    const volumeLabel = labels.volume;
    const volumeControlLabel = labels.volumeControl;
    const volumeSliderLabel = labels.volumeSlider;

    const { announce, destroy } = getSharedAnnouncer(this.resolvePlayerRoot());
    this.dispose.add(destroy);
    const fmt = (key: string, value?: string) => {
      const t = labelsMap[key] ?? key;
      return value != null ? t.replace('%s', value) : t;
    };
    let volTimer: ReturnType<typeof setTimeout> | null = null;
    this.dispose.add(() => {
      if (volTimer) clearTimeout(volTimer);
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'op-controls__volume';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('aria-valuemin', '0');
    wrapper.setAttribute('aria-valuemax', '100');
    wrapper.setAttribute('aria-valuenow', `${core.volume}`);
    setA11yLabel(wrapper, volumeControlLabel);
    wrapper.setAttribute('aria-orientation', 'vertical');
    wrapper.setAttribute('role', 'slider');

    const slider = document.createElement('input');
    slider.className = 'op-controls__volume--input';
    slider.tabIndex = -1;
    slider.type = 'range';
    slider.value = core.volume.toString();
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.1';
    setA11yLabel(slider, volumeSliderLabel, { container: wrapper });

    const display = document.createElement('progress');
    display.className = 'op-controls__volume--display';
    display.max = 10;
    display.value = core.volume * 10;

    wrapper.appendChild(slider);
    wrapper.appendChild(display);

    const btn = document.createElement('button');
    btn.tabIndex = 0;
    btn.type = 'button';
    btn.title = muteLabel;
    btn.className = 'op-controls__mute';
    setA11yLabel(btn, muteLabel);
    btn.setAttribute('aria-pressed', 'false');

    let lastVolume = core.volume;

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
        core.volume = v;
        core.muted = v === 0;

        const el = getActiveMedia(core);
        if (el && el !== core.surface) {
          try {
            el.volume = v;
            el.muted = v === 0;
          } catch {
            // ignore
          }
        }

        updateSlider(v);
        updateBtn(v);

        if (volTimer) clearTimeout(volTimer);
        volTimer = setTimeout(() => {
          announce(fmt('volumePercent', String(Math.round(v * 100))));
          volTimer = null;
        }, 400);
      },
      EVENT_OPTIONS
    );

    this.listen(
      btn,
      'click',
      (e: Event) => {
        const me = e as MouseEvent;
        const el = getActiveMedia(core);
        let announcePct: number;
        if (!core.muted) {
          if (core.volume > 0) lastVolume = core.volume;
          core.volume = 0;
          core.muted = true;
          announcePct = 0;

          if (el && el !== core.surface) {
            try {
              el.volume = 0;
              el.muted = true;
              btn.title = muteLabel;
              setA11yLabel(btn, muteLabel);
            } catch {
              // ignore
            }
          }
        } else {
          const restore = lastVolume > 0 ? lastVolume : 1;
          core.volume = restore;
          core.muted = false;
          announcePct = Math.round(restore * 100);

          if (el && el !== core.surface) {
            try {
              el.volume = restore;
              el.muted = false;
              btn.title = unmuteLabel;
              setA11yLabel(btn, unmuteLabel);
            } catch {
              // ignore
            }
          }
        }
        if (volTimer) clearTimeout(volTimer);
        volTimer = null;
        announce(fmt('volumePercent', String(announcePct)));
        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    // Re-entrancy guard: writing el.volume/el.muted fires a DOM volumechange which
    // bridges back to core.events, re-triggering this handler. The ads plugin also
    // writes core.volume/core.muted from its own volumechange listener on the ad
    // video element, creating a cross-handler loop. The flag breaks the cycle.
    let syncingVolume = false;

    const syncActiveMedia = (muted: boolean, vol: number) => {
      if (syncingVolume) return;
      const el = getActiveMedia(core);
      if (!el || el === core.surface) return;
      syncingVolume = true;
      try {
        if (el.muted !== muted) el.muted = muted;
        if (!muted && el.volume !== vol) el.volume = vol;
      } catch {
        // ignore
      } finally {
        syncingVolume = false;
      }
    };

    this.onPlayer('loadedmetadata', () => {
      const muted = core.muted || core.volume === 0;
      const vol = formatVolume(core.volume);

      if (vol > 0) lastVolume = vol;
      slider.value = (muted ? 0 : vol).toString();

      updateSlider(muted ? 0 : vol);
      updateBtn(muted ? 0 : vol);
      syncActiveMedia(muted, vol);
    });

    this.onPlayer('volumechange', () => {
      if (syncingVolume) return;
      const muted = core.muted || core.volume === 0;
      const vol = formatVolume(core.volume);

      if (vol > 0) lastVolume = vol;
      slider.value = (muted ? 0 : vol).toString();

      updateSlider(muted ? 0 : vol);
      updateBtn(muted ? 0 : vol);
      btn.setAttribute('aria-pressed', muted ? 'true' : 'false');

      syncActiveMedia(muted, vol);
    });

    const container = document.createElement('div');
    container.className = 'op-controls__volume--container';
    container.appendChild(btn);
    container.appendChild(wrapper);

    return container;
  }
}

export default function createVolumeControl(placement?: Control['placement']): Control | null {
  if (isMobile()) return null;
  const ctrl = new VolumeControl();
  if (placement) ctrl.placement = placement;
  return ctrl;
}
