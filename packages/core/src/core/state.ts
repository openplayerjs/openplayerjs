export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'waiting'
  | 'seeking'
  | 'ended'
  | 'error';

export class StateManager<S extends string> {
  constructor(private state: S) {}

  get current() {
    return this.state;
  }

  transition(next: S) {
    this.state = next;
  }
}
