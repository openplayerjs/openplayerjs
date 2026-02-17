import { buildControls, createControlGrid, getControl, registerControl } from '../src/ui/control';

describe('ui/control branch coverage', () => {
  test('createControlGrid places into all rows/cols', () => {
    const root = document.createElement('div');
    const grid = createControlGrid(root);

    const tl = document.createElement('button');
    const mc = document.createElement('button');
    const br = document.createElement('button');

    grid.place({ v: 'top', h: 'left' }, tl);
    grid.place({ v: 'middle', h: 'center' }, mc);
    grid.place({ v: 'bottom', h: 'right' }, br);

    expect(root.querySelector('.op-controls-layer__top .op-controls__left')?.contains(tl)).toBe(true);
    expect(root.querySelector('.op-controls-layer__center .op-controls__middle')?.contains(mc)).toBe(true);
    expect(root.querySelector('.op-controls-layer__bottom .op-controls__right')?.contains(br)).toBe(true);
  });

  test('register/getControl and buildControls handle non-arrays and missing controls', () => {
    // ensure registry path is exercised
    registerControl('dummy', () => ({
      id: 'dummy',
      placement: { v: 'middle', h: 'center' },
      create: () => document.createElement('div'),
    }));

    expect(getControl('dummy')?.id).toBe('dummy');
    expect(getControl('missing')).toBeNull();

    const controls = buildControls({
      'top-left': ['dummy', 'missing'],
      'bottom-right': 'not-an-array',
      // parsePlacement: include both top/bottom and left/right branches
      'bottom-left': ['dummy'],
    });

    // top-left should place dummy (missing is ignored)
    expect(controls.some((c) => c.id === 'dummy' && c.placement.v === 'top' && c.placement.h === 'left')).toBe(true);
    // bottom-left should parse both tokens
    expect(controls.some((c) => c.id === 'dummy' && c.placement.v === 'bottom' && c.placement.h === 'left')).toBe(
      true
    );
  });
});
