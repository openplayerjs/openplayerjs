export type PlayerEvent =
  | 'source:set'
  | 'playback:load'
  | 'playback:metadataready'
  | 'playback:ready'
  | 'playback:play'
  | 'playback:playing'
  | 'playback:pause'
  | 'playback:paused'
  | 'playback:waiting'
  | 'playback:seek'
  | 'playback:seeking'
  | 'playback:seeked'
  | 'playback:ended'
  | 'playback:error'
  | 'media:loadedmetadata'
  | 'media:timeupdate'
  | 'media:duration'
  | 'media:volume'
  | 'media:rate'
  | 'media:muted'
  | 'media:buffered'
  | 'texttrack:add'
  | 'texttrack:remove'
  | 'texttrack:listchange'
  | 'texttrack:change';

export type Listener = (payload?: any) => void;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  on(event: PlayerEvent | string, cb: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)!.delete(cb);
  }

  emit(event: PlayerEvent | string, payload?: any) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }
}
