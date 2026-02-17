/**
 * Lightweight VMAP mock.
 * Tests can set `VMAP.__breaks = [...]` before plugin setup / source:set.
 */
export default class VMAP {
  static __breaks: any[] = [];
  adBreaks: any[];
  constructor() {
    this.adBreaks = VMAP.__breaks;
  }
}
