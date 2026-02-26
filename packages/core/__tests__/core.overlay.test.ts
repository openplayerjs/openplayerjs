/** @jest-environment jsdom */

import { EventBus } from '../src/core/events';
import { getOverlayManager, type OverlayState } from '../src/core/overlay';

describe('OverlayManager + getOverlayManager()', () => {
  test('mirrors overlay changes onto player EventBus and disposes on player:destroy', () => {
    const player: { events: EventBus } = { events: new EventBus() };

    const mgr1 = getOverlayManager(player);
    const mgr2 = getOverlayManager(player);
    expect(mgr2).toBe(mgr1); // cached branch

    const received: OverlayState[] = [];
    const off = player.events.on('overlay:changed', (a: OverlayState) => received.push(a));

    const overlay: OverlayState = {
      id: 'ads',
      priority: 10,
      mode: 'countdown',
      duration: 5,
      value: 5,
      canSeek: false,
      label: 'Ad',
    };

    mgr1.activate(overlay);
    expect(received.length).toBe(1);
    expect(received[0]?.id).toBe('ads');

    // Destroy should remove the mirroring listener, dispose the manager, and delete the cache key.
    player.events.emit('player:destroy');

    // After destroy, manager is disposed; activating should not mirror to player bus.
    mgr1.activate({ ...overlay, value: 4 });
    expect(received.length).toBe(1);

    // Cache key should have been deleted; a new manager is returned.
    const mgr3 = getOverlayManager(player);
    expect(mgr3).not.toBe(mgr1);

    off();
  });

  test('update/deactivate no-op branches do not emit and priority selection works', () => {
    const mgr = getOverlayManager({ events: new EventBus() } as { events: EventBus });

    const events: OverlayState[] = [];
    const off = mgr.bus.on('overlay:changed', (a: OverlayState) => events.push(a));

    // update() missing id branch
    mgr.update('missing', { value: 1 });
    expect(events.length).toBe(0);

    // deactivate() missing id branch
    mgr.deactivate('missing');
    expect(events.length).toBe(0);

    // pickActive priority branch
    mgr.activate({
      id: 'low',
      priority: 1,
      mode: 'normal',
      duration: 10,
      value: 0,
      canSeek: true,
    });
    mgr.activate({
      id: 'high',
      priority: 100,
      mode: 'normal',
      duration: 10,
      value: 0,
      canSeek: true,
    });
    expect(mgr.active?.id).toBe('high');

    off();
  });
});
