import { EVENT_OPTIONS } from '@openplayerjs/core';
import { getSharedAnnouncer, setA11yLabel } from '../a11y';
import { resolveUIConfig } from '../configuration';
import type { Control } from '../control';
import { getActiveMedia, togglePlayback } from '../playback';
import { BaseControl } from './base';

export class PlayControl extends BaseControl {
  id = 'play';
  placement: Control['placement'] = { v: 'bottom', h: 'left' };

  protected build(): HTMLElement {
    const core = this.core;
    const labels = resolveUIConfig(core).labels as Record<string, string>;
    const playLabel = labels.play;
    const pauseLabel = labels.pause;
    const restartLabel = labels.restart;

    const { announce, destroy } = getSharedAnnouncer(this.resolvePlayerRoot());
    this.dispose.add(destroy);
    const fmt = (key: string, value?: string) => {
      const t = labels[key] ?? key;
      return value != null ? t.replace('%s', value) : t;
    };

    let isEnded = false;

    const btn = document.createElement('button');
    btn.tabIndex = 0;
    btn.type = 'button';
    btn.className = 'op-controls__playpause';
    btn.title = playLabel;
    setA11yLabel(btn, playLabel);
    btn.setAttribute('aria-pressed', 'false');

    this.listen(
      btn,
      'click',
      async (e: Event) => {
        const me = e as MouseEvent;
        me.preventDefault();
        me.stopPropagation();
        if (isEnded) {
          const media = getActiveMedia(core);
          media.currentTime = 0;
        }
        await togglePlayback(core);
      },
      EVENT_OPTIONS
    );

    const setPlaying = (playing: boolean) => {
      btn.classList.toggle('op-controls__playpause--pause', playing);
      btn.classList.toggle('op-controls__playpause--replay', isEnded && !playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      const newLabel = isEnded && !playing ? restartLabel : playing ? pauseLabel : playLabel;
      btn.title = newLabel;
      setA11yLabel(btn, newLabel);
    };

    this.onPlayer('play', () => {
      isEnded = false;
      setPlaying(true);
    });
    this.onPlayer('playing', () => {
      isEnded = false;
      setPlaying(true);
      if (!core.media.seeking) announce(labels['pause'] ? fmt('play') : 'Playing');
    });
    this.onPlayer('pause', () => {
      setPlaying(false);
      announce(labels['pause'] ?? 'Paused');
    });
    this.onPlayer('ended', () => {
      isEnded = true;
      setPlaying(false);
    });

    return btn;
  }
}

export default function createPlayControl(placement?: Control['placement']): Control {
  const ctrl = new PlayControl();
  if (placement) ctrl.placement = placement;
  return ctrl;
}
