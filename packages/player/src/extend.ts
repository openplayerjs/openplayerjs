import type { Core } from '@openplayerjs/core';
import type { Control, ControlPlacement } from './control';

export function extendControls(core: Core) {
  const api = {
    addElement(el: HTMLElement, placement: ControlPlacement = { v: 'bottom', h: 'right' }) {
      if (core.events.listenerCount('ui:addElement') === 0) {
        throw new Error('UI not initialized; cannot addElement');
      }
      core.events.emit('ui:addElement', { el, placement });
      core.emit('controls:changed');
      return el;
    },

    addControl(control: Control) {
      if (core.events.listenerCount('ui:addControl') === 0) {
        throw new Error('UI not initialized; cannot addControl');
      }
      const payload: any = { control, el: undefined };
      core.events.emit('ui:addControl', payload);
      core.emit('controls:changed');
      return payload.el as HTMLElement | undefined;
    },
  };

  Object.assign(core, { controls: api });
  return api;
}
