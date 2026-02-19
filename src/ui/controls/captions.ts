import { EVENT_OPTIONS } from '../../core/constants';
import type { Control } from '../control';
import { getActiveMedia } from '../playback';
import { getSettingsRegistry, type SettingsSubmenuProvider } from '../settings';
import { BaseControl } from './base';

type TrackKind = 'captions' | 'subtitles';
function isRelevantKind(kind: string): kind is TrackKind {
  return kind === 'captions' || kind === 'subtitles';
}

function trackLabel(t: TextTrack, index: number) {
  return (t.label && t.label.trim()) || (t.language && t.language.trim().toUpperCase()) || `Track ${index + 1}`;
}

function listRelevantTracks(media: HTMLMediaElement): { index: number; track: TextTrack }[] {
  const list = media.textTracks ?? null;
  if (!list) return [];
  const out: { index: number; track: TextTrack }[] = [];
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (!t) continue;
    if (!isRelevantKind(String(t.kind))) continue;
    out.push({ index: i, track: t });
  }
  return out;
}

function getShowingIndex(media: HTMLMediaElement): number | 'off' {
  const tracks = listRelevantTracks(media);
  for (const x of tracks) {
    if (x.track.mode === 'showing') return x.index;
  }
  return 'off';
}

function setAllOff(media: HTMLMediaElement) {
  for (const x of listRelevantTracks(media)) x.track.mode = 'disabled';
}

function selectIndex(media: HTMLMediaElement, index: number) {
  for (const x of listRelevantTracks(media)) {
    x.track.mode = x.index === index ? 'showing' : 'disabled';
  }
}

export class CaptionsControl extends BaseControl {
  id = 'captions';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  private button!: HTMLButtonElement;
  private lastSelectedIndex: number | null = null;

  protected build(): HTMLElement {
    const player = this.player;
    const label = player.config.labels?.captions || 'CC/Subtitles';
    const buttonLabel = player.config.labels?.toggleCaptions || 'Toggle Captions';

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'op-controls__captions';
    this.button.setAttribute('aria-label', buttonLabel);
    this.button.setAttribute('aria-pressed', 'false');

    const refresh = () => {
      const media = getActiveMedia(player);
      const tracks = listRelevantTracks(media);
      this.button.style.display = tracks.length ? '' : 'none';

      const showing = getShowingIndex(media);
      const on = showing !== 'off';
      if (typeof showing === 'number') this.lastSelectedIndex = showing;

      this.button.classList.toggle('op-controls__captions--on', on);
      this.button.setAttribute('aria-pressed', on ? 'true' : 'false');
    };

    // Toggle only (on/off)
    this.button.addEventListener(
      'click',
      (e) => {
        const media = getActiveMedia(player);
        const showing = getShowingIndex(media);

        if (showing === 'off') {
          const tracks = listRelevantTracks(media);
          const idx = this.lastSelectedIndex ?? tracks[0]?.index;
          if (typeof idx === 'number') selectIndex(media, idx);
        } else {
          setAllOff(media);
        }

        refresh();
        e.preventDefault();
        e.stopPropagation();
      },
      EVENT_OPTIONS
    );

    const provider: SettingsSubmenuProvider = {
      id: 'captions',
      label,
      getSubmenu: () => {
        const media = getActiveMedia(player);
        const tracks = listRelevantTracks(media);
        if (!tracks.length) return null;

        const showing = getShowingIndex(media);

        return {
          id: 'captions',
          label,
          items: [
            {
              id: 'off',
              label: player.config.labels?.off || 'Off',
              checked: showing === 'off',
              onSelect: () => {
                setAllOff(media);
                refresh();
              },
            },
            ...tracks.map((x) => ({
              id: String(x.index),
              label: trackLabel(x.track, x.index),
              checked: x.index === showing,
              onSelect: () => {
                selectIndex(media, x.index);
                this.lastSelectedIndex = x.index;
                refresh();
              },
            })),
          ],
        };
      },
    };

    getSettingsRegistry(player).register(provider);

    this.overlayMgr.bus.on('overlay:changed', refresh);
    player.events.on('playback:ready', refresh);

    refresh();
    return this.button;
  }
}

export default function createCaptionsControl(): Control {
  return new CaptionsControl();
}
