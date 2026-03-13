import { EVENT_OPTIONS } from '@openplayerjs/core';
import { setA11yLabel } from '../a11y';
import { resolveUIConfig } from '../configuration';
import type { Control } from '../control';
import { getActiveMedia, togglePlayback } from '../playback';
import { BaseControl } from './base';

export class PlayControl extends BaseControl {
  id = 'play';
  placement: Control['placement'] = { v: 'bottom', h: 'left' };

  protected build(): HTMLElement {
    const core = this.core;
    const labels = resolveUIConfig(core).labels;
    const playLabel = labels.play;
    const pauseLabel = labels.pause;
    const restartLabel = labels.restart;

    let isEnded = false;

    const btn = document.createElement('button');
    btn.tabIndex = 0;
    btn.type = 'button';
    btn.className = 'op-controls__playpause';
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
      setA11yLabel(btn, isEnded && !playing ? restartLabel : playing ? pauseLabel : playLabel);
    };

    this.onPlayer('play', () => {
      isEnded = false;
      setPlaying(true);
    });
    this.onPlayer('playing', () => {
      isEnded = false;
      setPlaying(true);
    });
    this.onPlayer('pause', () => setPlaying(false));
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
