/** @jest-environment jsdom */

import { DEFAULT_CONTROLS, buildControls, createControlGrid, getControl, normalizeControlsConfig, registerControl } from '../src/control';

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
      'bottom-left': ['dummy'],
    });

    expect(controls.some((c) => c.id === 'dummy' && c.placement.v === 'top' && c.placement.h === 'left')).toBe(true);
    expect(controls.some((c) => c.id === 'dummy' && c.placement.v === 'bottom' && c.placement.h === 'left')).toBe(true);
  });

  test('createControlGrid places region=main elements into mainRoot, not controlsRoot', () => {
    const controlsRoot = document.createElement('div');
    const mainRoot = document.createElement('div');
    const grid = createControlGrid(controlsRoot, mainRoot);

    const el = document.createElement('button');
    grid.place({ v: 'middle', h: 'center', region: 'main' }, el);

    expect(mainRoot.contains(el)).toBe(true);
    expect(controlsRoot.contains(el)).toBe(false);
  });

  test('buildControls with no argument returns default controls', () => {
    // Register the built-in controls used in DEFAULT_CONTROLS
    for (const id of ['progress', 'play', 'time', 'volume', 'captions', 'settings', 'fullscreen']) {
      if (!getControl(id)) {
        registerControl(id, () => ({ id, placement: { v: 'bottom', h: 'left' }, create: () => document.createElement('div') }));
      }
    }

    const controls = buildControls();
    const ids = controls.map((c) => c.id);

    for (const slot of Object.values(DEFAULT_CONTROLS)) {
      for (const id of slot) {
        expect(ids).toContain(id);
      }
    }
  });

  test('buildControls with empty object returns default controls', () => {
    const withEmpty = buildControls({});
    const withNone  = buildControls();
    expect(withEmpty.map((c) => c.id)).toEqual(withNone.map((c) => c.id));
  });

  test('buildControls with layers format normalizes to flat slots', () => {
    registerControl('vol', () => ({ id: 'vol', placement: { v: 'bottom', h: 'left' }, create: () => document.createElement('div') }));
    registerControl('prog', () => ({ id: 'prog', placement: { v: 'top', h: 'left' }, create: () => document.createElement('div') }));
    registerControl('fs', () => ({ id: 'fs', placement: { v: 'bottom', h: 'right' }, create: () => document.createElement('div') }));

    const controls = buildControls({
      layers: {
        left:   ['vol'],
        middle: ['prog'],
        right:  ['fs'],
      },
    });

    const vol  = controls.find((c) => c.id === 'vol');
    const prog = controls.find((c) => c.id === 'prog');
    const fs   = controls.find((c) => c.id === 'fs');

    expect(vol?.placement).toMatchObject({ v: 'bottom', h: 'left' });
    expect(prog?.placement).toMatchObject({ v: 'top' });
    expect(fs?.placement).toMatchObject({ v: 'bottom', h: 'right' });
  });

  test('buildControls ignores non-array properties like alwaysVisible', () => {
    registerControl('p2', () => ({ id: 'p2', placement: { v: 'bottom', h: 'left' }, create: () => document.createElement('div') }));

    const controls = buildControls({ top: ['p2'], alwaysVisible: true } as any);
    expect(controls.some((c) => c.id === 'p2')).toBe(true);
  });

  test('normalizeControlsConfig returns DEFAULT_CONTROLS for null/undefined/empty', () => {
    expect(normalizeControlsConfig(null)).toEqual(DEFAULT_CONTROLS);
    expect(normalizeControlsConfig(undefined)).toEqual(DEFAULT_CONTROLS);
    expect(normalizeControlsConfig({})).toEqual(DEFAULT_CONTROLS);
    expect(normalizeControlsConfig({ alwaysVisible: true })).toEqual(DEFAULT_CONTROLS);
  });

  test('normalizeControlsConfig maps layers format correctly', () => {
    const result = normalizeControlsConfig({
      layers: { left: ['play'], middle: ['progress'], right: ['fullscreen'] },
    });
    expect(result).toEqual({ 'bottom-left': ['play'], top: ['progress'], 'bottom-right': ['fullscreen'] });
  });

  test('normalizeControlsConfig returns DEFAULT_CONTROLS for empty layers object', () => {
    expect(normalizeControlsConfig({ layers: {} })).toEqual(DEFAULT_CONTROLS);
  });

  test('normalizeControlsConfig passes flat format through unchanged', () => {
    const flat = { top: ['progress'], 'bottom-left': ['play'] };
    expect(normalizeControlsConfig(flat)).toEqual(flat);
  });

  test('buildControls maps "main" key to region:main placement', () => {
    registerControl('dummy-main', () => ({
      id: 'dummy-main',
      placement: { v: 'middle', h: 'center' },
      create: () => document.createElement('div'),
    }));

    const controls = buildControls({ main: ['dummy-main'] });
    const c = controls.find((c) => c.id === 'dummy-main');
    expect(c?.placement.region).toBe('main');
  });
});
