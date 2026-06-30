/**
 * Ad lifecycle event payloads contributed to the shared `EventBus` via TypeScript
 * declaration merging. Core stays agnostic of ad-specific events; any consumer that
 * imports `@openplayerjs/ads` gets these typed on `core.on(...)` / `core.emit(...)`.
 *
 * All ad events are delivered on the single shared `EventBus`:
 *   - `CsaiAdStrategy` / `HybridAdStrategy` emit via the `PluginBus<AdsEvent>` wrapper.
 *   - `SsaiAdStrategy` emits `ads:break:start` / `ads:break:end` / `ads:quartile` directly.
 *
 * Keep this in sync with the `AdsEvent` union in `./types`.
 */
import '@openplayerjs/core';

/** Break descriptor carried by ad events that reference a specific break. */
type AdBreakRef = { id: string; kind: string };

declare module '@openplayerjs/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface PlayerEventPayloadMap {
    'ads:requested': string;
    'ads:loaded': { break: AdBreakRef; count: number };
    'ads:break:start': { id: string; kind: string; at?: string | number };
    'ads:break:end': { id: string; kind: string; at?: string | number };
    'ads:ad:start': { break: AdBreakRef; index: number; sequence?: number };
    'ads:ad:end': { break: AdBreakRef; index: number; sequence?: number };
    'ads:impression': { break: AdBreakRef; index?: number; event?: unknown };
    'ads:quartile': { breakId: string; quartile: 25 | 50 | 75 | 100 };
    'ads:timeupdate': { break: AdBreakRef; currentTime: number; remainingTime?: number; duration: number };
    'ads:duration': { break: AdBreakRef; duration: number };
    'ads:skip': { break: AdBreakRef | null; reason: string };
    'ads:clickthrough': { break: AdBreakRef; url: string };
    'ads:pause': { break: AdBreakRef };
    'ads:resume': { break: AdBreakRef };
    'ads:mute': { break: AdBreakRef };
    'ads:unmute': { break: AdBreakRef };
    'ads:volumeChange': { break: AdBreakRef; volume: number; muted: boolean };
    'ads:allAdsCompleted': { break: AdBreakRef };
    'ads:error': { reason?: string; error?: unknown; message?: string; owner?: string };
  }
}
