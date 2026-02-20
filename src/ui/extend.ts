import type { Player } from '../core/player';
import type { Control, ControlPlacement } from './control';

/**
 * Attaches UI-related APIs onto a player instance under `player.controls`.
 * This preserves separation of concerns (core stays UI-agnostic) while keeping
 * a convenient imperative API for UMD consumers.
 */
export function extendControls(player: Player) {
  const api = {
    /** Append an arbitrary element to the control grid (requires UI to be initialized). */
    addElement(el: HTMLElement, placement: ControlPlacement = { v: 'bottom', h: 'right' }) {
      if (player.events.listenerCount('ui:addElement' as any) === 0) {
        throw new Error('UI not initialized; cannot addElement');
      }
      player.events.emit('ui:addElement' as any, { el, placement });
      player.emit('controls:changed' as any);
      return el;
    },

    /** Add a Control definition to the control grid (requires UI to be initialized). */
    addControl(control: Control) {
      if (player.events.listenerCount('ui:addControl' as any) === 0) {
        throw new Error('UI not initialized; cannot addControl');
      }
      const payload: any = { control, el: undefined };
      player.events.emit('ui:addControl' as any, payload);
      player.emit('controls:changed' as any);
      return payload.el as HTMLElement | undefined;
    },
  };

  (player as any).extend?.({ controls: api }) ?? Object.assign(player as any, { controls: api });
  return api;
}
