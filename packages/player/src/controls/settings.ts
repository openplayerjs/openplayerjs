import { EVENT_OPTIONS } from '@openplayerjs/core';
import { setA11yLabel } from '../a11y';
import { resolveUIConfig } from '../configuration';
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
    const labels = resolveUIConfig(this.core).labels;

    this.root = document.createElement('div');
    this.root.className = 'op-menu--container';

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'op-controls__settings';
    this.button.setAttribute('aria-haspopup', 'menu');
    this.button.setAttribute('aria-expanded', 'false');
    setA11yLabel(this.button, labels.settings);

    this.panel = document.createElement('div');
    this.panel.className = 'op-menu';
    this.panel.setAttribute('role', 'menu');
    this.panel.style.display = 'none';

    this.view = document.createElement('div');
    this.view.className = 'op-menu__submenu';
    this.panel.appendChild(this.view);

    this.root.appendChild(this.button);
    this.root.appendChild(this.panel);

    this.listen(
      this.button,
      'click',
      (e: Event) => {
        const me = e as MouseEvent;
        this.toggle();
        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    this.listen(
      document,
      'click',
      (e: Event) => {
        if (!this.isOpen) return;
        const t = e.target as HTMLElement;
        if (!t.closest('.op-menu--container')) this.close();
      },
      EVENT_OPTIONS
    );

    this.listen(
      document,
      'keydown',
      (e: Event) => {
        if (!this.isOpen) return;
        const ke = e as KeyboardEvent;
        if (ke.key === 'Escape') this.close();
      },
      EVENT_OPTIONS
    );

    this.dispose.add(
      this.overlayMgr.bus.on('overlay:changed', () => {
        this.activeSubmenuId = null;
        // Always re-compute availability so the control can hide during ads
        // and re-appear when content resumes, even if the menu isn't open.
        this.render();
      })
    );

    getSettingsRegistry(this.core).register({
      id: 'speed',
      label: labels.speed,
      getSubmenu: (core) => {
        const ov = this.overlayMgr.active;
        if (ov?.id === 'ads') return null;

        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const current = core.playbackRate || 1;
        return {
          id: 'speed',
          label: labels.speed,
          items: rates.map((r) => ({
            id: String(r),
            label: r === 1 ? labels.speedNormal : `${r}x`,
            checked: Math.abs(current - r) < 1e-6,
            onSelect: () => {
              core.playbackRate = r;
            },
          })),
        };
      },
    });

    // Re-render on readiness (tracks/rates may appear)
    this.onPlayer('loadedmetadata', () => {
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
    const reg = getSettingsRegistry(this.core);
    const providers = reg.list();
    const available = providers
      .map((p) => ({ p, submenu: p.getSubmenu(this.core) }))
      .filter((x) => x.submenu && x.submenu.items.length) as { p: any; submenu: SettingsSubmenu }[];

    // Hide settings if there's nothing to show
    this.root.style.display = available.length ? '' : 'none';

    // Clear view
    while (this.view.firstChild) this.view.removeChild(this.view.firstChild);

    const active = this.activeSubmenuId
      ? (available.find((x) => x.submenu.id === this.activeSubmenuId)?.submenu ?? null)
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

    const header = document.createElement('div');
    header.className = 'op-menu__header';

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'op-submenu__back';
    setA11yLabel(back, 'Back');
    this.listen(
      back,
      'click',
      (e: Event) => {
        const me = e as MouseEvent;
        this.activeSubmenuId = null;
        this.render();
        me.preventDefault();
        me.stopPropagation();
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
        this.makeRow(
          item.label,
          () => {
            if (item.disabled) return;
            item.onSelect();
            // Recompute submenu after selection
            this.render();
          },
          item.checked,
          item.disabled
        )
      );
    }
  }

  private makeRow(label: string, onClick: () => void, checked = false, disabled = false): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'op-controls__menu-item';
    btn.setAttribute('role', 'menuitem');
    btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    btn.setAttribute('aria-checked', checked ? 'true' : 'false');

    const text = document.createElement('span');
    text.className = 'op-controls__menu-item-label';
    text.textContent = label;

    const mark = document.createElement('span');
    mark.className = `op-menu__item-check ${checked ? 'checked' : ''}`;

    btn.append(mark, text);

    this.listen(
      btn,
      'click',
      (e: Event) => {
        const me = e as MouseEvent;
        onClick();
        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    return btn;
  }
}

export default function createSettingsControl(): Control {
  return new SettingsControl();
}
