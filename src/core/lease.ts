export class Lease {
  private owners = new Map<string, string>();

  acquire(capability: string, owner: string): boolean {
    if (this.owners.has(capability)) return false;
    this.owners.set(capability, owner);
    return true;
  }

  release(capability: string, owner: string) {
    if (this.owners.get(capability) === owner) {
      this.owners.delete(capability);
    }
  }

  owner(capability: string) {
    return this.owners.get(capability);
  }
}
