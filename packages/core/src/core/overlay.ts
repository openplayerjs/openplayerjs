import { EventBus } from './events';

export type OverlayMode = 'normal' | 'countdown';

export type OverlayState = {
  id: string;
  priority: number;
  mode: OverlayMode;
  duration: number;
  value: number;
  canSeek: boolean;
  label?: string;
  bufferedPct?: number;
  fullscreenEl?: HTMLElement;
  fullscreenVideoEl?: HTMLElement;
};

export type OverlayEvent = 'overlay:changed';

/** Minimal structural view of a player exposing an event bus, used to bridge overlay state. */
type PlayerLike = {
  events?: {
    on?: (event: string, cb: (payload?: unknown) => void) => () => void;
    emit?: (event: string, payload?: unknown) => void;
  };
};

class OverlayBus<E extends string> {
  constructor(private bus: EventBus) {}

  on(event: E, cb: (payload: never) => void) {
    return this.bus.on(event, cb);
  }

  emit(event: E, payload?: unknown) {
    this.bus.emit(event, payload);
  }

  clear() {
    this.bus.clear();
  }
}

const _overlayManagers = new WeakMap<object, OverlayManager>();

export class OverlayManager {
  readonly bus: OverlayBus<OverlayEvent>;
  active: OverlayState | null = null;

  private overlays = new Map<string, OverlayState>();

  constructor() {
    this.bus = new OverlayBus<OverlayEvent>(new EventBus());
  }

  dispose() {
    this.overlays.clear();
    this.active = null;
    this.bus.clear();
  }

  activate(state: OverlayState) {
    this.overlays.set(state.id, state);
    this.recomputeAndEmit();
  }

  update(id: string, patch: Partial<OverlayState>) {
    const cur = this.overlays.get(id);
    if (!cur) return;
    const next: OverlayState = { ...cur, ...patch, id: cur.id };
    this.overlays.set(id, next);
    this.recomputeAndEmit();
  }

  deactivate(id: string) {
    const existed = this.overlays.delete(id);
    if (!existed) return;
    this.recomputeAndEmit();
  }

  private recomputeAndEmit() {
    const next = this.pickActive();
    this.active = next;
    this.bus.emit('overlay:changed', this.active);
  }

  private pickActive(): OverlayState | null {
    let best: OverlayState | null = null;
    for (const s of this.overlays.values()) {
      if (!best || s.priority > best.priority) best = s;
    }
    return best;
  }
}

export function getOverlayManager(player: object): OverlayManager {
  const existing = _overlayManagers.get(player);
  if (existing) return existing;

  const mgr = new OverlayManager();
  _overlayManagers.set(player, mgr);

  try {
    const p = player as PlayerLike;
    if (typeof p?.events?.on === 'function' && typeof p?.events?.emit === 'function') {
      const off = mgr.bus.on('overlay:changed', (active) => p.events!.emit!('overlay:changed', active));
      p.events.on('player:destroy', () => {
        try {
          off();
        } catch {
          // ignore
        }
        try {
          mgr.dispose();
        } catch {
          // ignore
        }
        _overlayManagers.delete(player);
      });
    }
  } catch {
    // ignore
  }

  return mgr;
}
