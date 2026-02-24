import { EVENT_OPTIONS } from '../../core/constants';
import { setControlLabel } from '../a11y';
import type { Control } from '../control';
import { togglePlayback } from '../playback';
import { BaseControl } from './base';

export class PlayControl extends BaseControl {
  id = 'play';
  placement: Control['placement'] = { v: 'bottom', h: 'left' };

  protected build(): HTMLElement {
    const player = this.player;
    const playLabel = player.config.labels?.play || 'Play';
    const pauseLabel = player.config.labels?.pause || 'Pause';

    const btn = document.createElement('button');
    btn.tabIndex = 0;
    btn.type = 'button';
    btn.className = 'op-controls__playpause';
    setControlLabel(btn, playLabel);
    btn.setAttribute('aria-pressed', 'false');

    this.listen(
      btn,
      'click',
      async (e: Event) => {
        const me = e as MouseEvent;
        await togglePlayback(player);
        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    const setPlaying = (playing: boolean) => {
      btn.classList.toggle('op-controls__playpause--pause', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      setControlLabel(btn, playing ? pauseLabel : playLabel);
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
