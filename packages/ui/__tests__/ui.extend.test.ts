/** @jest-environment jsdom */

import { EventBus } from '@openplayer/core';
import { extendControls } from '../src/extend';

function makePlayer() {
  const events = new EventBus();
  return {
    events,
    emit: jest.fn(),
  } as any;
}

describe('extendControls', () => {
  test('returns api and attaches it to player.controls', () => {
    const player = makePlayer();
    const api = extendControls(player);
    expect(player.controls).toBe(api);
    expect(typeof api.addElement).toBe('function');
    expect(typeof api.addControl).toBe('function');
  });

  describe('addElement', () => {
    test('throws when no ui:addElement listener is registered', () => {
      const player = makePlayer();
      const api = extendControls(player);
      const el = document.createElement('div');
      expect(() => api.addElement(el)).toThrow('UI not initialized; cannot addElement');
    });

    test('emits ui:addElement with default placement and controls:changed', () => {
      const player = makePlayer();
      const api = extendControls(player);
      const el = document.createElement('div');

      const received: any[] = [];
      player.events.on('ui:addElement', (payload: any) => received.push(payload));

      const result = api.addElement(el);

      expect(result).toBe(el);
      expect(received).toHaveLength(1);
      expect(received[0]).toEqual({ el, placement: { v: 'bottom', h: 'right' } });
      expect(player.emit).toHaveBeenCalledWith('controls:changed');
    });

    test('emits ui:addElement with custom placement', () => {
      const player = makePlayer();
      const api = extendControls(player);
      const el = document.createElement('div');

      const received: any[] = [];
      player.events.on('ui:addElement', (payload: any) => received.push(payload));

      api.addElement(el, { v: 'top', h: 'left' });

      expect(received[0]).toEqual({ el, placement: { v: 'top', h: 'left' } });
    });
  });

  describe('addControl', () => {
    test('throws when no ui:addControl listener is registered', () => {
      const player = makePlayer();
      const api = extendControls(player);
      const control = { id: 'test', placement: { v: 'bottom' as const, h: 'right' as const }, create: () => document.createElement('div') };
      expect(() => api.addControl(control)).toThrow('UI not initialized; cannot addControl');
    });

    test('emits ui:addControl and returns payload.el set by listener', () => {
      const player = makePlayer();
      const api = extendControls(player);
      const resultEl = document.createElement('span');
      const control = { id: 'my-control', placement: { v: 'bottom' as const, h: 'left' as const }, create: jest.fn(() => resultEl) };

      player.events.on('ui:addControl', (payload: any) => {
        payload.el = resultEl;
      });

      const result = api.addControl(control);

      expect(result).toBe(resultEl);
      expect(player.emit).toHaveBeenCalledWith('controls:changed');
    });

    test('returns undefined when listener does not set payload.el', () => {
      const player = makePlayer();
      const api = extendControls(player);
      const control = { id: 'my-control', placement: { v: 'bottom' as const, h: 'left' as const }, create: jest.fn() };

      player.events.on('ui:addControl', (_: any) => {
        // listener registered but does not set payload.el
      });

      const result = api.addControl(control);
      expect(result).toBeUndefined();
    });
  });
});
