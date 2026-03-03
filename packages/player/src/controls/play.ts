import { EVENT_OPTIONS } from '@openplayerjs/core';
import { setA11yLabel } from '../a11y';
import { resolveUIConfig } from '../configuration';
import type { Control } from '../control';
import { togglePlayback } from '../playback';
import { BaseControl } from './base';

export class PlayControl extends BaseControl {
  id = 'play';
  placement: Control['placement'] = { v: 'bottom', h: 'left' };

  protected build(): HTMLElement {
    const core = this.core;
    const labels = resolveUIConfig(core).labels;
    const playLabel = labels.play;
    const pauseLabel = labels.pause;

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
        await togglePlayback(core);
        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    const setPlaying = (playing: boolean) => {
      btn.classList.toggle('op-controls__playpause--pause', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      setA11yLabel(btn, playing ? pauseLabel : playLabel);
    };

    this.onPlayer('play', () => setPlaying(true));
    this.onPlayer('pause', () => setPlaying(false));
    this.onPlayer('playing', () => setPlaying(true));
    this.onPlayer('pause', () => setPlaying(false));
    this.onPlayer('ended', () => setPlaying(false));

    return btn;
  }
}

export default function createPlayControl(): Control {
  return new PlayControl();
}
