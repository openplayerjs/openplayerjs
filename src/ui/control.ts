import type { Player } from '../core/player';

export type VerticalSlot = 'top' | 'middle' | 'bottom';

export type HorizontalSlot = 'left' | 'center' | 'right';

export type ControlPlacement = {
  v: VerticalSlot;
  h: HorizontalSlot;
  region?: 'main';
};

export type Control = {
  id: string;
  placement: ControlPlacement;

  create(player: Player): HTMLElement;
  destroy?(): void;
};

const registry = new Map<string, () => Control>();

function parsePlacement(key: string): ControlPlacement {
  if (key === 'main') {
    return { v: 'middle', h: 'center', region: 'main' };
  }

  const parts = key.split('-');

  let v: VerticalSlot = 'middle';
  let h: HorizontalSlot = 'center';

  for (const part of parts) {
    if (part === 'top' || part === 'bottom') v = part;
    if (part === 'left' || part === 'right') h = part;
    if (part === 'middle' || part === 'center') h = 'center';
  }

  return { v, h };
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

export function createControlGrid(controlsRoot: HTMLElement, mainRoot?: HTMLElement) {
  const top = createSection('top');
  const middle = createSection('center');
  const bottom = createSection('bottom');

  controlsRoot.append(top.section, middle.section, bottom.section);

  return {
    place(placement: Control['placement'], el: HTMLElement) {
      // Special "main" region lives in the media container, not in the controls bar.
      const region = (placement as any).region;
      if (region === 'main' && mainRoot) {
        mainRoot.appendChild(el);
        return;
      }

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
