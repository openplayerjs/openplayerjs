import type { Player } from '../core/player';

export type VerticalSlot = 'top' | 'middle' | 'bottom';

export type HorizontalSlot = 'left' | 'center' | 'right';

export interface ControlPlacement {
  v: VerticalSlot;
  h: HorizontalSlot;
}

export interface Control {
  id: string;
  placement: ControlPlacement;

  create(player: Player): HTMLElement;
  destroy?(): void;
}

const registry = new Map<string, () => Control>();

function parsePlacement(key: string): ControlPlacement {
  const parts = key.split('-');

  let v = 'middle';
  let h = 'center';

  for (const part of parts) {
    if (part === 'top' || part === 'bottom') {
      v = part;
    }
    if (part === 'left' || part === 'right') {
      h = part;
    }
  }

  return { v: v as VerticalSlot, h: h as HorizontalSlot };
}

function createSection(name: string) {
  const section = document.createElement('div');
  section.className = `op-controls__layer op-controls-layer__${name}`;

  const left = document.createElement('div');
  left.className = 'op-controls__left';

  const center = document.createElement('div');
  center.className = 'op-controls__middle';

  const right = document.createElement('div');
  right.className = 'op-controls__right';

  section.append(left, center, right);

  return { section, left, center, right };
}

export function createControlGrid(root: HTMLElement) {
  const top = createSection('top');
  const middle = createSection('center');
  const bottom = createSection('bottom');

  root.append(top.section, middle.section, bottom.section);

  return {
    place(placement: Control['placement'], el: HTMLElement) {
      const row = placement.v === 'top' ? top : placement.v === 'middle' ? middle : bottom;
      const col = placement.h === 'left' ? row.left : placement.h === 'center' ? row.center : row.right;

      col.appendChild(el);
    },
  };
}

export function registerControl(name: string, factory: () => Control) {
  registry.set(name, factory);
}

export function getControl(name: string): Control | null {
  const factory = registry.get(name);
  return factory?.() || null;
}

export function buildControls(config: any) {
  const controls: Control[] = [];

  Object.entries(config || {}).forEach(([key, names]) => {
    if (!Array.isArray(names)) return;

    const placement = parsePlacement(key);

    names.forEach((name) => {
      const control = getControl(name);
      if (!control) return;

      control.placement = placement;
      controls.push(control);
    });
  });

  return controls;
}
