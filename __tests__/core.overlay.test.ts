import { OverlayManager } from '../src/core/overlay';

describe('core/overlay', () => {
  test('selects highest-priority overlay and emits on changes', () => {
    const mgr = new OverlayManager();
    const seen: (string | null)[] = [];
    mgr.bus.on('overlay:changed', (ov) => seen.push(ov?.id ?? null));

    mgr.activate({ id: 'cast', priority: 1, mode: 'normal', duration: 0, value: 0, canSeek: true });
    expect(mgr.active?.id).toBe('cast');

    mgr.activate({ id: 'ads', priority: 10, mode: 'countdown', duration: 30, value: 30, canSeek: false });
    expect(mgr.active?.id).toBe('ads');

    // Lower priority overlay updates don't steal focus.
    mgr.update('cast', { label: 'Casting' });
    expect(mgr.active?.id).toBe('ads');

    mgr.deactivate('ads');
    expect(mgr.active?.id).toBe('cast');

    expect(seen).toEqual(['cast', 'ads', 'ads', 'cast']);
  });
});
