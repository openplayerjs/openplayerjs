// core/overlay.ts
import { EventBus } from './events';

export type OverlayMode = 'normal' | 'countdown';

export interface OverlayState {
  /** Unique overlay id, e.g. "ads", "cast" */
  id: string;
  /** Higher wins when multiple overlays are active */
  priority: number;

  /** 'countdown' means value counts down to 0 (remaining time) */
  mode: OverlayMode;

  /** Seconds */
  duration: number;
  /** Seconds; for countdown this is remaining time */
  value: number;

  /** Whether UI should allow seeking */
  canSeek: boolean;

  /** Optional UI hints */
  label?: string;
  bufferedPct?: number; // 0..100
  fullscreenEl?: HTMLElement;
  fullscreenVideoEl?: HTMLElement;
}

export type OverlayEvent = 'overlay:changed';

class OverlayBus<E extends string> {
  constructor(private bus: EventBus) {}

  on(event: E, cb: (...args: any[]) => void) {
    return this.bus.on(event as any, cb);
  }

  emit(event: E, ...data: any[]) {
    this.bus.emit(event as any, ...data);
  }
}

const OVERLAY_MANAGER_KEY = '__op::overlay::manager';

export class OverlayManager {
  public readonly bus: OverlayBus<OverlayEvent>;
  public active: OverlayState | null = null;

  private overlays = new Map<string, OverlayState>();

  constructor() {
    this.bus = new OverlayBus<OverlayEvent>(new EventBus());
  }

  /** Activate or replace an overlay */
  activate(state: OverlayState) {
    this.overlays.set(state.id, state);
    this.recomputeAndEmit();
  }

  /** Update an active overlay (no-op if missing) */
  update(id: string, patch: Partial<OverlayState>) {
    const cur = this.overlays.get(id);
    if (!cur) return;
    const next: OverlayState = { ...cur, ...patch, id: cur.id };
    this.overlays.set(id, next);
    this.recomputeAndEmit();
  }

  /** Deactivate overlay */
  deactivate(id: string) {
    const existed = this.overlays.delete(id);
    if (!existed) return;
    this.recomputeAndEmit();
  }

  private recomputeAndEmit() {
    const next = this.pickActive();
    this.active = next;
    // Emit on every recompute; UI likes frequent updates.
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
  return mgr;
}
