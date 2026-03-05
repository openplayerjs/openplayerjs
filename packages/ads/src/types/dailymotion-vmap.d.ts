declare module '@dailymotion/vmap' {
  export type VMAPAdBreak = {
    timeOffset: string | number;
    breakType?: string;
    breakId?: string;
    adSource?: {
      adTagURI?: { uri: string };
      vastAdData?: unknown;
    };
    extensions?: unknown[];
  };

  export default class VMAP {
    constructor(xml: Document);
    adBreaks: VMAPAdBreak[];
  }
}
