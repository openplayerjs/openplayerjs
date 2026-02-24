import { EVENT_OPTIONS } from '../../core/constants';
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
    btn.setAttribute('aria-label', playLabel);
    btn.setAttribute('aria-pressed', 'false');

    btn.addEventListener(
      'click',
      async (e) => {
        await togglePlayback(player);
        e.preventDefault();
        e.stopPropagation();
      },
      EVENT_OPTIONS
    );

    const setPlaying = (playing: boolean) => {
      btn.classList.toggle('op-controls__playpause--pause', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? pauseLabel : playLabel);
    };

    player.events.on('play', () => setPlaying(true));
    player.events.on('pause', () => setPlaying(false));
    player.events.on('playing', () => setPlaying(true));
    player.events.on('pause', () => setPlaying(false));
    player.events.on('ended', () => setPlaying(false));

    return btn;
  }
}

export default function createPlayControl(): Control {
  return new PlayControl();
}
