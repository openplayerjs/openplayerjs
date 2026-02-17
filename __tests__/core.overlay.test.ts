/** @jest-environment jsdom */

import { OverlayManager, getOverlayManager } from '../src/core/overlay';
import { Player } from '../src/core/player';

function makePlayer() {
  const v = document.createElement('video');
  document.body.appendChild(v);
  // Mock canPlayType for DefaultMediaEngine selection
  (v as any).canPlayType = () => 'probably';
  return new Player(v, { plugins: [] });
}

describe('overlay manager', () => {
  test('OverlayManager picks highest priority and emits changes', () => {
    const mgr = new OverlayManager();
    const changes: any[] = [];
    mgr.bus.on('overlay:changed', (ov) => changes.push(ov));

    mgr.activate({ id: 'a', priority: 1, mode: 'normal', duration: 10, value: 2, canSeek: true });
    expect(mgr.active?.id).toBe('a');

    mgr.activate({ id: 'b', priority: 5, mode: 'countdown', duration: 5, value: 5, canSeek: false });
    expect(mgr.active?.id).toBe('b');

    mgr.deactivate('b');
    expect(mgr.active?.id).toBe('a');

    mgr.deactivate('a');
    expect(mgr.active).toBeNull();

    // At least 4 change emissions (activate a, activate b, deactivate b, deactivate a)
    expect(changes.length).toBeGreaterThanOrEqual(4);
  });

  test('getOverlayManager memoizes on player', () => {
    const p = makePlayer();
    const a = getOverlayManager(p as any);
    const b = getOverlayManager(p as any);
    expect(a).toBe(b);
  });
});
