export type Disposer = () => void;

export class DisposableStore {
  private disposers: Disposer[] = [];
  private disposed = false;

  get isDisposed() {
    return this.disposed;
  }

  add(disposer?: void | null | Disposer): Disposer {
    const d: Disposer = (disposer ?? (() => {})) as Disposer;

    if (this.disposed) {
      try {
        d();
      } catch {
        // best-effort cleanup
      }
      return () => {};
    }

    this.disposers.push(d);
    return d;
  }

  addEventListener(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): Disposer {
    target.addEventListener(type, handler, options);
    return this.add(() => target.removeEventListener(type, handler, options));
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;

    for (let i = this.disposers.length - 1; i >= 0; i--) {
      try {
        this.disposers[i]();
      } catch {
        // best-effort cleanup
      }
    }

    this.disposers = [];
  }
}
