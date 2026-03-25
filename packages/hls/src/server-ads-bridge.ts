import type { HlsMediaEngine, ScteOutCue } from './hls';

/**
 * Minimal interface satisfied by `AdsPlugin.playAds()`.
 * Keeping it narrow prevents a hard dependency on `@openplayerjs/ads`.
 */
type AdsTrigger = {
  playAds(vastUrl: string): Promise<unknown>;
};

export type ScteResolveOptions = {
  /**
   * Called for every new SCTE-35 OUT cue that appears in the manifest.
   * Return a VAST URL to trigger an ad break immediately, or `null`/`undefined`
   * to ignore the cue (e.g. when there is no matching ad inventory).
   *
   * May be async — the bridge awaits the result before calling `playAds`.
   */
  resolveUrl: (cue: ScteOutCue) => string | null | undefined | Promise<string | null | undefined>;
};

/**
 * Bridges SCTE-35 OUT cues detected by `HlsMediaEngine` to `AdsPlugin`.
 *
 * Usage:
 * ```ts
 * const bridge = new ServerAdsBridge(hlsEngine, adsPlugin, {
 *   resolveUrl: (cue) => `https://ad-server/vast?scte35=${cue.scte35Out}`,
 * });
 * // later:
 * bridge.destroy(hlsEngine);
 * ```
 */
export class ServerAdsBridge {
  private prevOnCue: ((cue: ScteOutCue) => void) | undefined;

  constructor(engine: HlsMediaEngine, ads: AdsTrigger, options: ScteResolveOptions) {
    this.prevOnCue = engine.onCue;
    engine.onCue = (cue: ScteOutCue) => {
      // Chain any previously registered handler first.
      this.prevOnCue?.(cue);
      void Promise.resolve(options.resolveUrl(cue)).then((url) => {
        if (url) void ads.playAds(url);
      });
    };
  }

  /** Removes the bridge's `onCue` handler and restores the previous one. */
  destroy(engine: HlsMediaEngine): void {
    engine.onCue = this.prevOnCue;
    this.prevOnCue = undefined;
  }
}
