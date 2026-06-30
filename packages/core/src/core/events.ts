export type Listener<T = unknown> = (payload?: T) => void;

/**
 * Typed registry of every event that can travel on the shared {@link EventBus}.
 *
 * Core declares ONLY kernel-level events here (lifecycle, commands, HTML5 media
 * notifications, tracks). Core stays agnostic of any package's domain — it must
 * never gain `hls:*`, `ads:*`, or `ui:*` entries.
 *
 * Package-specific events are contributed via **declaration merging**: each
 * package ships an augmentation that adds its own keys, e.g.
 *
 * ```ts
 * // packages/<pkg>/src/events.ts
 * declare module '@openplayerjs/core' {
 *   interface PlayerEventPayloadMap {
 *     'my:event': MyPayload;
 *   }
 * }
 * ```
 *
 * This is the one place we intentionally use `interface` over `type` (the repo
 * default) — a `type` alias cannot be augmented across module boundaries.
 *
 * @see packages/ads/src/events.ts
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface PlayerEventPayloadMap {
  // Player lifecycle / high-level
  'player:interacted': void;
  'player:destroy': void;
  'source:set': string;
  'source:fallback': { failed: string; next: string };
  'overlay:changed': unknown;

  // Commands (requests)
  'cmd:load': void;
  'cmd:play': void;
  'cmd:pause': void;
  'cmd:startLoad': void;
  'cmd:seek': number;
  'cmd:setVolume': number;
  'cmd:setMuted': boolean;
  'cmd:setRate': number;

  // HTML5-like media notifications (no payload; read from player/media)
  'loadstart': void;
  'loadedmetadata': void;
  'durationchange': void;
  'timeupdate': void;
  'play': void;
  'playing': void;
  'pause': void;
  'waiting': void;
  'seeking': void;
  'seeked': void;
  'ended': void;
  'error': MediaError | null;
  'volumechange': void;
  'ratechange': void;

  // Tracks
  'texttrack:add': HTMLTrackElement;
  'texttrack:remove': HTMLTrackElement;
  'texttrack:listchange': void;
}

export type PlayerEvent = keyof PlayerEventPayloadMap;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  on<E extends PlayerEvent>(
    event: E,
    cb: (payload: PlayerEventPayloadMap[E] extends void ? undefined : PlayerEventPayloadMap[E]) => void
  ): () => boolean;
  // A `never` payload param accepts a callback with any concrete payload type
  // (parameter contravariance), so untyped/dynamic events stay usable without `any`.
  on(event: PlayerEvent | string, cb: (payload: never) => void): () => boolean;
  on(event: PlayerEvent | string, cb: (payload: never) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb as Listener);
    return () => this.listeners.get(event)!.delete(cb as Listener);
  }

  emit<E extends PlayerEvent>(event: E, payload?: PlayerEventPayloadMap[E]): void;
  emit(event: PlayerEvent | string, payload?: unknown): void;
  emit(event: PlayerEvent | string, payload?: unknown) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }

  listenerCount(event: PlayerEvent | string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  clear() {
    this.listeners.clear();
  }
}
