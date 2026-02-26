export class Lease {
  private owners = new Map<string, string>();
  private listeners: ((capability: string, owner: string | undefined) => void)[] = [];

  onChange(cb: (capability: string, owner: string | undefined) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== cb);
    };
  }

  private notify(capability: string) {
    const owner = this.owners.get(capability);
    for (const cb of this.listeners) {
      try {
        cb(capability, owner);
      } catch {
        // ignore
      }
    }
  }

  acquire(capability: string, owner: string): boolean {
    if (this.owners.has(capability)) return false;
    this.owners.set(capability, owner);
    this.notify(capability);
    return true;
  }

  release(capability: string, owner: string) {
    if (this.owners.get(capability) === owner) {
      this.owners.delete(capability);
      this.notify(capability);
    }
  }

  owner(capability: string) {
    return this.owners.get(capability);
  }
}
