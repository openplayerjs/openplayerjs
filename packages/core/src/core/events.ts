export type Listener<T = any> = (payload?: T) => void;

export type PlayerEventPayloadMap = {
  // Player lifecycle / high-level
  'player:interacted': void;
  'player:destroy': void;
  'source:set': string;
  'overlay:changed': unknown;

  // Commands (requests)
  'cmd:load': void;
  'cmd:play': void;
  'cmd:pause': void;
  // 'cmd:startLoad': void;
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
};

export type PlayerEvent = keyof PlayerEventPayloadMap;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  on<E extends PlayerEvent>(
    event: E,
    cb: (payload: PlayerEventPayloadMap[E] extends void ? undefined : PlayerEventPayloadMap[E]) => void
  ): () => boolean;
  on(event: PlayerEvent | string, cb: Listener): () => boolean;
  on(event: PlayerEvent | string, cb: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)!.delete(cb);
  }

  emit<E extends PlayerEvent>(event: E, payload?: PlayerEventPayloadMap[E]): void;
  emit(event: PlayerEvent | string, payload?: any): void;
  emit(event: PlayerEvent | string, payload?: any) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }

  listenerCount(event: PlayerEvent | string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  clear() {
    this.listeners.clear();
  }
}
