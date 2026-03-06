export default class VMAP {
  static __breaks: unknown[] = [];
  adBreaks: unknown[];
  constructor() {
    this.adBreaks = VMAP.__breaks;
  }
}
