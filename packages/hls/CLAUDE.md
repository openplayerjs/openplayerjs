# @openplayerjs/hls — AI context

## Role
HLS streaming engine. Wraps `hls.js` and registers as a `media-engine` plugin with `priority = 50` (overrides `DefaultMediaEngine`'s `priority = 0` for `.m3u8` sources).

## Key files
- `src/hls.ts` — `HlsMediaEngine`

## Event ownership (CRITICAL)
HLS emits **no custom player events** — it drives the player purely through standard core events (`loadedmetadata`, `durationchange` (bridged), `texttrack:listchange`) and forwards the raw hls.js events. It therefore contributes nothing to core's `PlayerEventPayloadMap` (no `src/events.ts` augmentation). If you ever need a genuine HLS-specific player event, create `src/events.ts` with a `declare module '@openplayerjs/core'` augmentation, side-effect-import it from `index.ts`, and emit it from `hls.ts` — never add the key to core directly. See `packages/ads/src/events.ts` for the pattern.

> Three HLS events were removed (Jun 2026) because nothing consumed them: `media:duration` and `playback:metadataready` (zero listeners; duration flows via the native `durationchange` → `core.duration`), and `playback:error` (error handling/recovery is internal to the engine). Don't reintroduce them without a real consumer.

### Timed metadata (ID3) — native, no custom event
ID3 timed metadata is surfaced through the **standard HTML5 `TextTrack` API**, not a custom event. The engine sets `enableID3MetadataCues: true` (+ `renderTextTracksNatively: true`), so hls.js attaches a `kind: 'metadata'` TextTrack to the `<video>` and adds each ID3 frame as a `DataCue`. Consumers set `track.mode = 'hidden'` and listen to the DOM `cuechange` event (`cue.value` = parsed frame, `cue.data` = raw ArrayBuffer) — the same path `SsaiAdStrategy` uses for SCTE-35. These config flags are the contract that makes this work; keep them (locked by `engines.test.ts`). This is why the `playback:metadataready` event was unnecessary.

## Critical rules
- **`MANIFEST_PARSED`** emits `'loadedmetadata'` on the EventBus. This resolves `Core.whenReady()` fast, before the DOM `loadedmetadata` fires. Do not remove this.
- **`LEVEL_LOADED`** keeps `core.isLive` in sync once per level load. **`LEVEL_UPDATED`** also updates `core.isLive` and processes SCTE-35 dateRanges (it fires on every live playlist refresh, so keep its work minimal). Duration is not emitted — it reaches `core.duration` via the native `durationchange` event.
- **`autoStartLoad`** is `ctx.media.autoplay || ctx.media.preload !== 'none'`. When false (preload=none), load is deferred; `cmd:startLoad` triggers `adapter.startLoad()` via `maybeStartLoad()`.
- **Error recovery**: `MEDIA_ERROR` → `adapter.recoverMediaError()` (throttled to 3 s). If recovery fails, `adapter.swapAudioCodec()` + retry. `NETWORK_ERROR` → do nothing (hls.js handles retries). Other fatal errors → `adapter.destroy()`.
- **`onCue`** is a nullable callback set by `AdsPlugin` in hybrid mode. When set, `LEVEL_UPDATED` iterates `details.dateRanges` looking for `SCTE35-OUT` attributes and fires the callback for each new cue ID.
- **`onPause`**: if `autoStartLoad` is false, call `adapter.stopLoad()` + reset `startedLoad`. This prevents buffering when the user pauses in preload=none mode.
- **`attachMedia(video, src)`** is a secondary API for attaching a separate hls.js instance to an ad creative video element. The caller owns the returned dispose function.

## SCTE-35 cue IDs
Track seen cue IDs in `this.seenCueIds` (a `Set<string>`) to prevent duplicate `onCue` callbacks for the same dateRange across multiple `LEVEL_UPDATED` events. Clear in `detach()`.

## hls.js event forwarding
All hls.js events are forwarded to the shared EventBus via a generic loop (`for ... of Object.values(HlsClass.Events)`). Specific handlers for lifecycle events are registered separately via `onAdapterEvent`.
