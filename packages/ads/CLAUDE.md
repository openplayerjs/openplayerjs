# @openplayerjs/ads — AI context

## Role
Ad delivery plugin supporting CSAI (client-side), SSAI (server-side), and Hybrid (CSAI + SCTE-35) modes. Thin dispatcher — `AdsPlugin` delegates all delivery-specific logic to a `AdSessionStrategy`.

## Key files
- `src/ads.ts` — `AdsPlugin` (thin dispatcher, public API, `@internal` delegates for tests)
- `src/strategies/csai.ts` — `CsaiAdStrategy`: VAST/VMAP fetch, ad `<video>` rendering, scheduling
- `src/strategies/ssai.ts` — `SsaiAdStrategy`: SCTE-35 TextTrack cue detection, quartile tracking
- `src/strategies/hybrid.ts` — `HybridAdStrategy`: extends CSAI, SCTE bridging handled by AdsPlugin
- `src/schedule.ts` — `AdScheduler`: break schedule, midroll detection, waterfall/playlist logic
- `src/ad-dom.ts` — `AdDomManager`: ad overlay DOM, skip button, non-linear, companions
- `src/types.ts` — all public types + `PluginBus<E>`
- `src/vast-parser.ts` — VAST XML parsing utilities (pure functions)
- `src/events.ts` — declaration-merging augmentation that adds all `ads:*` event payloads to core's `PlayerEventPayloadMap`. Side-effect-imported from `index.ts`. Keep in sync with the `AdsEvent` union in `types.ts`.

## Critical rules

### resumeContent default
`resumeContent !== false` (opt-out). Using `=== true` makes it always `false` when the field is unset, causing content to never resume after ads. This is tested in `ads.test.ts`.

### cmd:play is synchronous
`cmd:play` is emitted synchronously by `Core.play()` before any `await`. The preroll interceptor must not `await` anything before acquiring the playback lease or pausing content, or it will miss the user-gesture window.

### VMAP deferral (preload="none")
When `preload="none"`, the VMAP fetch starts **synchronously** at the top of the `cmd:play` handler (not in `rebuildSchedule()`). This ensures `vmapPending = true` is set before the eager-pause check runs.

### source:set handler
Must call `clearSession()` AND reset: `active=false`, `contentMedia=undefined`, overlay hidden, lease released, overlayManager deactivated, `vmapLoadPromise=null`, `vmapPending=false`, `pendingVmapSrc=undefined`. Missing any of these causes stuck `active=true` state after source switches.

### playedBreaks deduplication
`playedBreaks.add(id)` is called after `startBreak()` regardless of success. This prevents infinite retry on VAST error.

### waterfall mode
`adSourcesMode = 'waterfall'` — `startBreak()` iterates `break.sources[]`, stops on first success. Intermediate failures use `suppressResumeOnError: true` so content doesn't resume between attempts.

### PluginBus
`PluginBus<E>` is defined in `src/types.ts` (not imported from core — they serve different purposes). `csai.ts` uses it for the `bus: PluginBus<AdsEvent>` property that emits ad lifecycle events.

### Single-channel event model

All ad events (`ads:X`) are emitted on the **shared EventBus** (`ctx.events`) regardless of delivery mode. `PluginBus` in `CsaiAdStrategy` wraps `ctx.events` — it is NOT a separate bus.

- External consumers use `core.on('ads:X', cb)` for any delivery mode.
- `adsPlugin.bus.on('ads:X', cb)` is equivalent (same underlying EventBus); it exists for backward compatibility.
- All 20 `AdsEvent` entries are typed via **declaration merging** in `src/events.ts` (NOT in core). Core stays agnostic of ad events; `src/events.ts` augments core's `PlayerEventPayloadMap` interface and is side-effect-imported from `index.ts`. Never add `ads:*` keys to core directly.

**Payload conventions:**
- Events with a `break` property carry `{ id: string; kind: string }` as the break descriptor.
- `ads:quartile` uses `{ breakId: string; quartile: 25|50|75|100 }` (no `break` property) — consistent across CSAI and SSAI.
- SSAI break events use `kind: 'ssai'`; CSAI uses `'preroll'|'midroll'|'postroll'|'auto'|'manual'`.
- No dot-notation `ads.*` events exist on the shared EventBus.

## Test patterns
- Ads mocks in `__tests__/mocks/vmap.ts` and `vast-client.ts` — shared instances via `moduleNameMapper`
- VAST XML fixtures in `__tests__/fixtures/ads/*.xml`
- Never import `@dailymotion/vast-client` or `@dailymotion/vmap` directly in tests; always use the mock path

## SSAI notes
`SsaiAdStrategy` binds to `media.textTracks` and listens for `cuechange` on metadata tracks. Three detection paths in `processCue()`:
1. `DataCue` (ID3 ArrayBuffer via `enableID3MetadataCues`)
2. `VTTCue` with `cue.value = { key: 'SCTE35-OUT'|'SCTE35-IN', data: ArrayBuffer }` (hls.js EXT-X-DATERANGE via `enableDateRangeMetadataCues`)
3. Legacy direct-property path (`cue.scte35Out`, `cue.attr['SCTE35-OUT']`) for older hls.js builds
