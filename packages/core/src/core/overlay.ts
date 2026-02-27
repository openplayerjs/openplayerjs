// core/overlay.ts
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

class OverlayBus<E extends string> {
  constructor(private bus: EventBus) {}

  on(event: E, cb: (...args: any[]) => void) {
    return this.bus.on(event as any, cb);
  }

  emit(event: E, ...data: any[]) {
    this.bus.emit(event as any, ...data);
  }

  clear() {
    this.bus.clear();
  }
}

const OVERLAY_MANAGER_KEY = '__op::overlay::manager';

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

export function getOverlayManager(player: any): OverlayManager {
  if (player[OVERLAY_MANAGER_KEY]) return player[OVERLAY_MANAGER_KEY] as OverlayManager;
  const mgr = new OverlayManager();
  player[OVERLAY_MANAGER_KEY] = mgr;

  try {
    if (player?.events?.on && player?.events?.emit) {
      const off = mgr.bus.on('overlay:changed', (active: any) => player.events.emit('overlay:changed', active));
      player.events.on('player:destroy', () => {
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
        try {
          delete player[OVERLAY_MANAGER_KEY];
        } catch {
          // ignore
        }
      });
    }
  } catch {
    // ignore
  }

  return mgr;
}
