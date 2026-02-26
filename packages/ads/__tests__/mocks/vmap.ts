export default class VMAP {
  static __breaks: any[] = [];
  adBreaks: any[];
  constructor() {
    this.adBreaks = VMAP.__breaks;
  }
}
