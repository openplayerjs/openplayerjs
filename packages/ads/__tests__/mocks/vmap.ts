export default class VMAP {
  static __breaks: unknown[] = [];
  /** When set, the constructor throws it — simulates the library choking on malformed VMAP XML. */
  static __throw: unknown = null;
  adBreaks: unknown[];
  constructor() {
    if (VMAP.__throw) throw VMAP.__throw;
    this.adBreaks = VMAP.__breaks;
  }
}
