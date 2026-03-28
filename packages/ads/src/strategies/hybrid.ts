import type { AdDeliveryMode } from '../types';
import { CsaiAdStrategy } from './csai';

/**
 * CSAI + SCTE-35 hybrid ad delivery strategy.
 *
 * Behaves identically to `CsaiAdStrategy` for ad rendering. The SCTE-35 cue
 * bridging (mapping `engine.onCue` → `playAds()`) is handled by `AdsPlugin`
 * so that spy/intercept tests can observe calls at the public API boundary.
 *
 * Configuration (prefer the sub-config form; flat aliases kept for backward compat):
 * ```ts
 * new AdsPlugin({
 *   adDelivery: 'hybrid',
 *   hybrid: {
 *     scteSource: hlsEngine,          // any object with onCue?: (cue) => void
 *     resolveScteUrl: (cue) => adServerUrl(cue.id),
 *   },
 * });
 * ```
 */
export class HybridAdStrategy extends CsaiAdStrategy {
  override readonly mode: AdDeliveryMode = 'hybrid';
}
