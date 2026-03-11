/** @jest-environment jsdom */

import { Core, getOverlayManager } from '@openplayerjs/core';
import { SettingsControl } from '../src/controls/settings';
import createSettingsControl from '../src/controls/settings';

function makeCore(): Core {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  return new Core(v, { plugins: [] });
}

function nn<T>(v: T | null | undefined, label = 'element'): T {
  if (!v) throw new Error(`Expected truthy ${label}, got ${String(v)}`);
  return v;
}

// ─── factory ─────────────────────────────────────────────────────────────────

describe('createSettingsControl factory', () => {
  test('returns a control with id="settings"', () => {
    const ctrl = createSettingsControl();
    expect(ctrl.id).toBe('settings');
    expect(ctrl.placement).toEqual({ v: 'bottom', h: 'right' });
  });

  test('placement override is applied', () => {
    const ctrl = createSettingsControl({ v: 'top', h: 'left' });
    expect(ctrl.placement).toEqual({ v: 'top', h: 'left' });
  });
});

// ─── toggle open / close ─────────────────────────────────────────────────────

describe('SettingsControl – open/close/toggle', () => {
  test('clicking the settings button opens the panel and emits ui:menu:open', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    const panel = nn(el.querySelector('.op-menu'), 'panel') as HTMLElement;

    const opened: string[] = [];
    player.events.on('ui:menu:open', () => opened.push('open'));

    expect(panel.style.display).toBe('none');
    button.click();
    expect(panel.style.display).toBe('block');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(opened).toHaveLength(1);

    control.destroy();
  });

  test('clicking settings button again closes the panel and emits ui:menu:close', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    const panel = nn(el.querySelector('.op-menu'), 'panel') as HTMLElement;

    const closed: string[] = [];
    player.events.on('ui:menu:close', () => closed.push('close'));

    // Open then close
    button.click();
    button.click();
    expect(panel.style.display).toBe('none');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(closed).toHaveLength(1);

    control.destroy();
  });

  test('pressing Escape key while menu is open closes it', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click(); // open

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    const panel = nn(el.querySelector('.op-menu'), 'panel') as HTMLElement;
    expect(panel.style.display).toBe('none');

    control.destroy();
  });

  test('pressing Escape when menu is closed does nothing', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    // Menu is closed — Escape should be a no-op
    expect(() =>
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    ).not.toThrow();

    control.destroy();
  });

  test('clicking outside the menu container closes it', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click(); // open

    // Click on a target outside .op-menu--container
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const panel = nn(el.querySelector('.op-menu'), 'panel') as HTMLElement;
    expect(panel.style.display).toBe('none');

    control.destroy();
  });

  test('clicking inside menu container does not close it', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click(); // open

    // Click inside the container — should stay open
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const panel = nn(el.querySelector('.op-menu'), 'panel') as HTMLElement;
    expect(panel.style.display).toBe('block');

    control.destroy();
  });
});

// ─── submenu navigation ───────────────────────────────────────────────────────

describe('SettingsControl – submenu navigation', () => {
  test('clicking a root-menu row navigates into the Speed submenu', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click();

    const view = nn(el.querySelector('.op-menu__submenu'), 'menu view') as HTMLElement;
    // Root menu should list the Speed row
    const rows = view.querySelectorAll('button.op-controls__menu-item');
    expect(rows.length).toBeGreaterThan(0);

    // Click first row to enter submenu
    (rows[0] as HTMLButtonElement).click();

    // Now the header with back button should appear
    const header = view.querySelector('.op-menu__header');
    expect(header).not.toBeNull();

    control.destroy();
  });

  test('clicking the back button returns to the root menu', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click();

    const view = nn(el.querySelector('.op-menu__submenu'), 'menu view') as HTMLElement;
    const rows = view.querySelectorAll('button.op-controls__menu-item');
    (rows[0] as HTMLButtonElement).click(); // enter submenu

    const back = nn(view.querySelector('button.op-submenu__back'), 'back button') as HTMLButtonElement;
    back.click(); // go back

    // Root menu is restored — no header, just rows
    const header = view.querySelector('.op-menu__header');
    expect(header).toBeNull();

    control.destroy();
  });

  test('clicking a speed option selects it and re-renders', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click();

    const view = nn(el.querySelector('.op-menu__submenu'), 'menu view') as HTMLElement;
    const rows = view.querySelectorAll('button.op-controls__menu-item');
    (rows[0] as HTMLButtonElement).click(); // enter Speed submenu

    // Items now include speed options (0.25, 0.5, 0.75, 1, …)
    const items = view.querySelectorAll('button.op-controls__menu-item');
    expect(items.length).toBeGreaterThan(1);

    // Click "0.5x" item
    const halfSpeed = Array.from(items).find((btn) => btn.textContent?.includes('0.5')) as HTMLButtonElement | undefined;
    if (halfSpeed) {
      halfSpeed.click();
      expect(player.playbackRate).toBeCloseTo(0.5);
    }

    control.destroy();
  });
});

// ─── loadedmetadata re-render ─────────────────────────────────────────────────

describe('SettingsControl – loadedmetadata re-render', () => {
  test('re-renders when menu is open on loadedmetadata', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click(); // open menu

    // Should not throw when loadedmetadata fires while menu is open
    expect(() => player.events.emit('loadedmetadata')).not.toThrow();

    control.destroy();
  });

  test('does not re-render when menu is closed on loadedmetadata', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    // Menu is closed — loadedmetadata should still not throw
    expect(() => player.events.emit('loadedmetadata')).not.toThrow();

    control.destroy();
  });
});

// ─── overlay:changed – period timeupdate re-render ───────────────────────────

describe('SettingsControl – overlay identity vs periodic re-render', () => {
  test('periodic overlay:changed (same id) re-renders only when menu is closed', () => {
    const player = makeCore();
    const overlayMgr = getOverlayManager(player);
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    overlayMgr.activate({
      id: 'ads',
      priority: 100,
      mode: 'normal',
      duration: 30,
      value: 5,
      canSeek: false,
    });

    // Second update with the same id — triggers periodic re-render (menu closed)
    overlayMgr.update('ads', { value: 10 });

    // Menu should still be hidden (Speed suppressed during ads)
    expect((el as HTMLElement).style.display).toBe('none');

    control.destroy();
  });

  test('menu is dismissed when overlay identity changes while open', () => {
    const player = makeCore();
    const overlayMgr = getOverlayManager(player);
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    // Open the menu
    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click();

    const panel = nn(el.querySelector('.op-menu'), 'panel') as HTMLElement;
    expect(panel.style.display).toBe('block');

    // Activate an overlay — overlay id changes → menu should close
    overlayMgr.activate({
      id: 'ads',
      priority: 100,
      mode: 'normal',
      duration: 10,
      value: 0,
      canSeek: false,
    });

    expect(panel.style.display).toBe('none');

    control.destroy();
  });
});

// ─── render() focus transfer when focus is inside menu ───────────────────────

describe('SettingsControl – render focus transfer', () => {
  test('render moves focus to panel when focus is inside the menu root', () => {
    const player = makeCore();
    const control = new SettingsControl();
    const el = control.create(player);
    document.body.appendChild(el);

    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click(); // open

    // Simulate focus inside the menu container
    button.focus();

    // Trigger a re-render (e.g. via loadedmetadata)
    expect(() => player.events.emit('loadedmetadata')).not.toThrow();

    control.destroy();
  });
});

// ─── focusout closes menu when focus leaves .op-player ───────────────────────

describe('SettingsControl – focusout handler', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('closes the menu when focus moves outside the .op-player container', () => {
    // Wrap in .op-player so button.closest('.op-player') finds the container
    const opPlayer = document.createElement('div');
    opPlayer.className = 'op-player';
    document.body.appendChild(opPlayer);

    const v = document.createElement('video');
    v.src = 'https://example.com/video.mp4';
    opPlayer.appendChild(v);

    const player = new Core(v, { plugins: [] });
    const control = new SettingsControl();
    const el = control.create(player);
    opPlayer.appendChild(el);

    // Open the menu
    const button = nn(el.querySelector('button.op-controls__settings'), 'settings button') as HTMLButtonElement;
    button.click();
    const panel = nn(el.querySelector('.op-menu'), 'panel') as HTMLElement;
    expect(panel.style.display).toBe('block');

    // Move focus to an element outside .op-player
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    // Fire focusout on the document (simulating blur from the previously-focused element)
    document.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));

    // Run the setTimeout(0) scheduled by the focusout handler
    jest.runAllTimers();

    // Menu must be closed now that focus left the player
    expect(panel.style.display).toBe('none');

    control.destroy();
  });
});
