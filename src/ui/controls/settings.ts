import { EVENT_OPTIONS } from '../../core/constants';
import type { Control } from '../control';
import { getSettingsRegistry, type SettingsSubmenu } from '../settings';
import { BaseControl } from './base';

export class SettingsControl extends BaseControl {
  id = 'settings';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };

  private root!: HTMLDivElement;
  private button!: HTMLButtonElement;
  private panel!: HTMLDivElement;
  private view!: HTMLDivElement;

  private isOpen = false;
  private activeSubmenuId: string | null = null;

  protected build(): HTMLElement {
    this.root = document.createElement('div');
    this.root.className = 'op-controls__settings--container';

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'op-controls__settings';
    this.button.setAttribute('aria-label', 'Settings');
    this.button.setAttribute('aria-haspopup', 'menu');
    this.button.setAttribute('aria-expanded', 'false');

    this.panel = document.createElement('div');
    this.panel.className = 'op-controls__settings-panel op-controls__menu';
    this.panel.setAttribute('role', 'menu');
    this.panel.style.display = 'none';

    // Align panel depending on document direction
    const isRtl = (document.documentElement.getAttribute('dir') || '').toLowerCase() === 'rtl';
    this.panel.classList.toggle('op-controls__settings-panel--rtl', isRtl);

    this.view = document.createElement('div');
    this.view.className = 'op-controls__settings-view';
    this.panel.appendChild(this.view);

    this.root.appendChild(this.button);
    this.root.appendChild(this.panel);

    this.button.addEventListener(
      'click',
      (e) => {
        this.toggle();
        e.preventDefault();
        e.stopPropagation();
      },
      EVENT_OPTIONS
    );

    // Close on outside click
    document.addEventListener(
      'click',
      (e) => {
        if (!this.isOpen) return;
        const t = e.target as HTMLElement;
        if (!t.closest('.op-controls__settings--container')) this.close();
      },
      EVENT_OPTIONS
    );

    // Close on ESC
    document.addEventListener(
      'keydown',
      (e) => {
        if (!this.isOpen) return;
        if (e.key === 'Escape') this.close();
      },
      EVENT_OPTIONS
    );

    // Re-render when overlay changes (active media might differ)
    this.overlayMgr.bus.on('overlay:changed', () => {
      this.activeSubmenuId = null;
      if (this.isOpen) this.render();
    });

    // Built-in "Speed" submenu
    getSettingsRegistry(this.player).register({
      id: 'speed',
      label: 'Speed',
      getSubmenu: (player) => {
        // Playback rate must not be adjustable during ads.
        // The Ads plugin activates an overlay with id "ads".
        const ov = this.overlayMgr.active;
        if (ov?.id === 'ads') return null;

        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const current = player.playbackRate || 1;
        return {
          id: 'speed',
          label: 'Speed',
          items: rates.map((r) => ({
            id: String(r),
            label: r === 1 ? 'Normal' : `${r}×`,
            checked: Math.abs(current - r) < 1e-6,
            onSelect: () => {
              player.playbackRate = r;
            },
          })),
        };
      },
    });

    // Re-render on readiness (tracks/rates may appear)
    this.player.events.on('playback:ready', () => {
      if (this.isOpen) this.render();
    });

    return this.root;
  }

  private toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  private open() {
    this.isOpen = true;
    this.button.setAttribute('aria-expanded', 'true');
    this.panel.style.display = 'block';
    this.render();
  }

  private close() {
    this.isOpen = false;
    this.activeSubmenuId = null;
    this.button.setAttribute('aria-expanded', 'false');
    this.panel.style.display = 'none';
  }

  private render() {
    const reg = getSettingsRegistry(this.player);
    const providers = reg.list();
    const available = providers
      .map((p) => ({ p, submenu: p.getSubmenu(this.player) }))
      .filter((x) => x.submenu && x.submenu.items.length) as { p: any; submenu: SettingsSubmenu }[];

    // Hide settings if there's nothing to show
    this.root.style.display = available.length ? '' : 'none';

    // Clear view
    while (this.view.firstChild) this.view.removeChild(this.view.firstChild);

    const active = this.activeSubmenuId
      ? available.find((x) => x.submenu.id === this.activeSubmenuId)?.submenu ?? null
      : null;

    if (!active) {
      // Root menu listing submenus
      for (const { submenu } of available) {
        this.view.appendChild(
          this.makeRow(submenu.label, () => {
            this.activeSubmenuId = submenu.id;
            this.render();
          })
        );
      }
      return;
    }

    // Submenu view (with back)
    const header = document.createElement('div');
    header.className = 'op-controls__settings-header';

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'op-controls__settings-back';
    back.textContent = '‹';
    back.setAttribute('aria-label', 'Back');
    back.addEventListener(
      'click',
      (e) => {
        this.activeSubmenuId = null;
        this.render();
        e.preventDefault();
        e.stopPropagation();
      },
      EVENT_OPTIONS
    );

    const title = document.createElement('div');
    title.className = 'op-controls__settings-title';
    title.textContent = active.label;

    header.append(back, title);
    this.view.appendChild(header);

    for (const item of active.items) {
      this.view.appendChild(
        this.makeRow(item.label, () => {
          if (item.disabled) return;
          item.onSelect();
          // Recompute submenu after selection
          this.render();
        }, item.checked, item.disabled)
      );
    }
  }

  private makeRow(label: string, onClick: () => void, checked = false, disabled = false): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'op-controls__menu-item op-controls__menu-item--settings';
    btn.setAttribute('role', 'menuitem');
    btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    btn.setAttribute('aria-checked', checked ? 'true' : 'false');

    const text = document.createElement('span');
    text.className = 'op-controls__menu-item-label';
    text.textContent = label;

    const mark = document.createElement('span');
    mark.className = 'op-controls__menu-item-check';

    btn.append(text, mark);

    btn.addEventListener(
      'click',
      (e) => {
        onClick();
        e.preventDefault();
        e.stopPropagation();
      },
      EVENT_OPTIONS
    );

    return btn;
  }
}

export default function createSettingsControl(): Control {
  return new SettingsControl();
}
