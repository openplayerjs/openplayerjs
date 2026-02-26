import type { Player } from '@openplayer/core';
import type { Control, ControlPlacement } from './control';

export function extendControls(player: Player) {
  const api = {
    addElement(el: HTMLElement, placement: ControlPlacement = { v: 'bottom', h: 'right' }) {
      if (player.events.listenerCount('ui:addElement') === 0) {
        throw new Error('UI not initialized; cannot addElement');
      }
      player.events.emit('ui:addElement', { el, placement });
      player.emit('controls:changed');
      return el;
    },

    addControl(control: Control) {
      if (player.events.listenerCount('ui:addControl') === 0) {
        throw new Error('UI not initialized; cannot addControl');
      }
      const payload: any = { control, el: undefined };
      player.events.emit('ui:addControl', payload);
      player.emit('controls:changed');
      return payload.el as HTMLElement | undefined;
    },
  };

  Object.assign(player, { controls: api });
  return api;
}
