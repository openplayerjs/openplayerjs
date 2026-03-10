import { EVENT_OPTIONS, getCaptionTrackProvider } from '@openplayerjs/core';
import type { CaptionTrack } from '@openplayerjs/core';
import { setA11yLabel } from '../a11y';
import { resolveUIConfig } from '../configuration';
import type { Control } from '../control';
import { getSettingsRegistry, type SettingsSubmenuProvider } from '../settings';
import { BaseControl } from './base';

const CAPTION_PREF_KEY = 'op:caption:track';

function readCaptionPref(): string | null {
  try { return localStorage.getItem(CAPTION_PREF_KEY); } catch { return null; }
}

function saveCaptionPref(id: string | null): void {
  try {
    if (id === null) localStorage.removeItem(CAPTION_PREF_KEY);
    else localStorage.setItem(CAPTION_PREF_KEY, id);
  } catch { /* ignore */ }
}

type TrackKind = 'captions' | 'subtitles';
function isRelevantKind(kind: string): kind is TrackKind {
  return kind === 'captions' || kind === 'subtitles';
}

function trackLabel(t: TextTrack, index: number) {
  return (t.label && t.label.trim()) || (t.language && t.language.trim().toUpperCase()) || `Track ${index + 1}`;
}

function listNativeTracks(media: HTMLMediaElement): { index: number; track: TextTrack }[] {
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

function getNativeShowingIndex(media: HTMLMediaElement): number | 'off' {
  for (const x of listNativeTracks(media)) {
    if (x.track.mode === 'showing') return x.index;
  }
  return 'off';
}

function setNativeAllOff(media: HTMLMediaElement) {
  for (const x of listNativeTracks(media)) x.track.mode = 'disabled';
}

// For ad video: use 'hidden' instead of 'disabled' so the browser keeps the
// VTT data loaded; 'disabled' discards cue data and the re-fetch on re-enable
// can silently fail, making captions unrecoverable until the ad restarts.
function setNativeAllHidden(media: HTMLMediaElement) {
  for (const x of listNativeTracks(media)) x.track.mode = 'hidden';
}

function selectNativeIndex(media: HTMLMediaElement, index: number, offMode: 'disabled' | 'hidden' = 'disabled') {
  for (const x of listNativeTracks(media)) {
    x.track.mode = x.index === index ? 'showing' : offMode;
  }
}

export class CaptionsControl extends BaseControl {
  id = 'captions';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  private button!: HTMLButtonElement;
  private lastSelectedIndex: number | null = null;
  private lastSelectedProviderId: string | null = readCaptionPref();
  private prefApplied = false;

  protected build(): HTMLElement {
    const core = this.core;
    const labels = resolveUIConfig(core).labels;
    const label = labels.captions;
    const buttonLabel = labels.toggleCaptions;

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'op-controls__captions';
    setA11yLabel(this.button, buttonLabel);
    this.button.setAttribute('aria-pressed', 'false');

    const getProvider = () => getCaptionTrackProvider(core);

    const getAdVideo = (): HTMLVideoElement | null => {
      const el = this.activeOverlay?.fullscreenVideoEl;
      return el instanceof HTMLVideoElement ? el : null;
    };

    const refresh = () => {
      const adVideo = getAdVideo();

      if (this.activeOverlay) {
        // During an ad overlay, show caption button only if the ad video has tracks.
        if (adVideo) {
          const adTracks = listNativeTracks(adVideo);
          this.button.style.display = adTracks.length > 0 ? '' : 'none';
          if (adTracks.length > 0) {
            const on = getNativeShowingIndex(adVideo) !== 'off';
            this.button.classList.toggle('op-controls__captions--on', on);
            this.button.setAttribute('aria-pressed', on ? 'true' : 'false');
          }
        } else {
          this.button.style.display = 'none';
        }
        return;
      }

      const provider = getProvider();
      const nativeTracks = listNativeTracks(core.media);
      const providerTracks = provider?.getTracks() ?? [];
      const hasTracks = nativeTracks.length > 0 || providerTracks.length > 0;
      this.button.style.display = hasTracks ? '' : 'none';

      const on = provider
        ? provider.getActiveTrack() !== null
        : getNativeShowingIndex(core.media) !== 'off';

      this.button.classList.toggle('op-controls__captions--on', on);
      this.button.setAttribute('aria-pressed', on ? 'true' : 'false');
    };

    // Toggle only (on/off)
    this.listen(
      this.button,
      'click',
      (e: Event) => {
        const me = e as MouseEvent;
        const adVideo = getAdVideo();

        if (this.activeOverlay && adVideo) {
          // Toggle captions on the ad video. Use 'hidden' (not 'disabled') so
          // the browser keeps VTT data; 'disabled' discards it and re-enabling
          // silently fails.
          const showing = getNativeShowingIndex(adVideo);
          if (showing === 'off') {
            const tracks = listNativeTracks(adVideo);
            const idx = this.lastSelectedIndex ?? tracks[0]?.index;
            if (typeof idx === 'number') selectNativeIndex(adVideo, idx, 'hidden');
          } else {
            setNativeAllHidden(adVideo);
          }
        } else {
          const provider = getProvider();
          if (provider) {
            const active = provider.getActiveTrack();
            if (active !== null) {
              provider.setTrack(null);
            } else {
              const tracks = provider.getTracks();
              const id = this.lastSelectedProviderId ?? tracks[0]?.id ?? null;
              provider.setTrack(id);
              if (id) this.lastSelectedProviderId = id;
            }
          } else {
            const showing = getNativeShowingIndex(core.media);
            if (showing === 'off') {
              const tracks = listNativeTracks(core.media);
              const idx = this.lastSelectedIndex ?? tracks[0]?.index;
              if (typeof idx === 'number') selectNativeIndex(core.media, idx);
            } else {
              setNativeAllOff(core.media);
            }
          }
        }

        refresh();
        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    const provider: SettingsSubmenuProvider = {
      id: 'captions',
      label,
      getSubmenu: () => {
        const adVideo = getAdVideo();

        if (this.activeOverlay && adVideo) {
          // Show ad video's caption tracks in the submenu
          const adTracks = listNativeTracks(adVideo);
          if (!adTracks.length) return null;
          const showing = getNativeShowingIndex(adVideo);
          return {
            id: 'captions',
            label,
            items: [
              {
                id: 'off',
                label: labels.off,
                checked: showing === 'off',
                onSelect: () => { setNativeAllHidden(adVideo); refresh(); },
              },
              ...adTracks.map((x) => ({
                id: String(x.index),
                label: trackLabel(x.track, x.index),
                checked: x.index === showing,
                onSelect: () => {
                  selectNativeIndex(adVideo, x.index, 'hidden');
                  this.lastSelectedIndex = x.index;
                  refresh();
                },
              })),
            ],
          };
        }

        if (this.activeOverlay) return null;

        const captionProvider = getProvider();
        const nativeTracks = listNativeTracks(core.media);

        if (captionProvider) {
          const providerTracks = captionProvider.getTracks();
          if (!providerTracks.length) return null;
          const active = captionProvider.getActiveTrack();

          return {
            id: 'captions',
            label,
            items: [
              {
                id: 'off',
                label: labels.off,
                checked: active === null,
                onSelect: () => {
                  captionProvider.setTrack(null);
                  refresh();
                },
              },
              ...providerTracks.map((t: CaptionTrack) => ({
                id: t.id,
                label: t.label || t.language || t.id,
                checked: t.id === active,
                onSelect: () => {
                  captionProvider.setTrack(t.id);
                  this.lastSelectedProviderId = t.id;
                  saveCaptionPref(t.id);
                  refresh();
                },
              })),
            ],
          };
        }

        if (!nativeTracks.length) return null;
        const showing = getNativeShowingIndex(core.media);

        return {
          id: 'captions',
          label,
          items: [
            {
              id: 'off',
              label: labels.off,
              checked: showing === 'off',
              onSelect: () => {
                setNativeAllOff(core.media);
                refresh();
              },
            },
            ...nativeTracks.map((x) => ({
              id: String(x.index),
              label: trackLabel(x.track, x.index),
              checked: x.index === showing,
              onSelect: () => {
                selectNativeIndex(core.media, x.index);
                this.lastSelectedIndex = x.index;
                saveCaptionPref(x.track.language || String(x.index));
                refresh();
              },
            })),
          ],
        };
      },
    };

    getSettingsRegistry(core).register(provider);

    this.dispose.add(
      this.overlayMgr.bus.on('overlay:changed', (ov: unknown) => {
        if (ov) {
          // Defer: mountAdVideo attaches caption tracks after activate() fires overlay:changed.
          Promise.resolve().then(() => refresh());
        } else {
          refresh();
        }
      })
    );
    this.onPlayer('loadedmetadata', () => {
      // Reset on each new engine attach (e.g. content starting after a preroll ad)
      // so the stored preference can be re-applied to the fresh provider instance.
      this.prefApplied = false;

      // Restore native track selection from stored pref (language code or index string).
      const storedPref = readCaptionPref();
      if (storedPref) {
        const nativeTracks = listNativeTracks(core.media);
        if (nativeTracks.length > 0) {
          const match =
            nativeTracks.find((x) => x.track.language === storedPref) ??
            nativeTracks.find((x) => String(x.index) === storedPref);
          if (match) {
            selectNativeIndex(core.media, match.index);
            this.lastSelectedIndex = match.index;
            this.prefApplied = true;
          }
        }
      }

      // For provider tracks (e.g. YouTube): eagerly apply the stored preference
      // before refresh() so the button immediately shows ON. Without this, the
      // button would flash OFF during the ~500 ms before the subscribe poll fires.
      const captionProvider = getProvider();
      if (captionProvider && this.lastSelectedProviderId) {
        captionProvider.setTrack(this.lastSelectedProviderId);
      }

      refresh();

      // If the engine exposes a subscribe hook, wire it up now so it can push
      // track-list updates (e.g. YouTube captions module loads after onReady).
      if (captionProvider?.subscribe) {
        this.dispose.add(
          captionProvider.subscribe(() => {
            // Validate the eagerly-applied preference once tracks are available.
            // If the track isn't in this video's tracklist, clear it.
            if (!this.prefApplied) {
              this.prefApplied = true;
              const pref = this.lastSelectedProviderId;
              if (pref) {
                const available = captionProvider.getTracks();
                if (available.some((t) => t.id === pref)) {
                  captionProvider.setTrack(pref);
                } else {
                  captionProvider.setTrack(null);
                }
              }
            }
            refresh();
          })
        );
      }
    });
    this.onPlayer('playing', () => {
      // If the subscribe poll exhausted its retries before the video started playing
      // (e.g. a preroll longer than the poll window), apply the stored preference now
      // that YouTube's tracklist is populated.
      if (!this.prefApplied) {
        const provider = getProvider();
        if (provider) {
          const tracks = provider.getTracks();
          if (tracks.length > 0) {
            this.prefApplied = true;
            const pref = this.lastSelectedProviderId;
            if (pref) {
              if (tracks.some((t) => t.id === pref)) {
                provider.setTrack(pref);
              } else {
                provider.setTrack(null);
              }
            }
          }
        }
      }
      refresh();
    });

    refresh();
    return this.button;
  }
}

export default function createCaptionsControl(placement?: Control['placement']): Control {
  const ctrl = new CaptionsControl();
  if (placement) ctrl.placement = placement;
  return ctrl;
}
