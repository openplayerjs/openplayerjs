# @openplayerjs/youtube — AI context

## Role
YouTube playback engine. Embeds the YouTube IFrame Player API, maps its state to `IframeMediaSurface`, and registers as a `media-engine` plugin with `priority = 100` (overrides HLS and DefaultMediaEngine for YouTube URLs).

## Key files
- `src/engines/youtube.ts` — `YouTubeMediaEngine` extends `BaseMediaEngine`
- `src/adapters/youtube.ts` — `YouTubeIframeAdapter` implements `IframeMediaAdapter`

## URL matching
`canPlay()` matches:
- `https://www.youtube.com/watch?v=…`
- `https://youtu.be/…`
- Bare 11-character video IDs (letters, digits, `-`, `_`)

## Attach lifecycle
1. Create `YouTubeIframeAdapter(videoId, options)` — defers YT API script load to first attach
2. Wrap in `new IframeMediaSurface(adapter)`
3. `ctx.setSurface(surface)` — swap the active surface on `Core`
4. `bindSurfaceEvents(surface, ctx.events)` — bridge state events to EventBus
5. `bindCommands(ctx)` — subscribe to `cmd:play`, `cmd:pause`, `cmd:seek`, etc.
6. Hide native `<video>` element (`ctx.media.style.display = 'none'`)
7. `surface.mount(ctx.container)` — inject `<iframe>` into DOM

## Detach lifecycle
1. `unbindCommands()`
2. `unbindSurfaceEvents()`
3. `surface.destroy()` — removes iframe from DOM
4. Restore native `<video>` element visibility
5. `ctx.resetSurface()` — restore `HtmlMediaSurface`

## YouTubeIframeAdapter internals
- YT IFrame API script is loaded once per page (singleton guard via `window.__op_yt_api_loaded`)
- `YT.Player` creation is deferred until `onYouTubeIframeAPIReady` fires
- **Volume**: YT API uses 0–100; adapter normalises to/from 0–1 at all boundaries
- **State mapping**: `YT.PlayerState.PLAYING → 'playing'`, `PAUSED → 'paused'`, `ENDED → 'ended'`, `BUFFERING → 'waiting'`, `CUED → 'idle'`
- Captions: calls `setOption('captions', 'track', { languageCode })` when `cmd:setTrack` fires

## Testing patterns
- Tests use `window.YT = { Player: jest.fn(…) }` to fake the YT API global
- The `YoutubeIframeAdapter` must be constructable without a real DOM iframe
- Use `new StubAdapter()` pattern (implements `IframeMediaAdapter`) to test engine lifecycle in isolation
- Tests live in `packages/youtube/__tests__/youtube.engine.test.ts`
- Package is excluded from global coverage thresholds (collect coverage is disabled for this package)

## Known limitations
- `duration` is only available after the YT API fires `onReady` and the video is cued. Returns `NaN` before that.
- `seekTo()` requires the player to be in a cued or playing state; seeking on a fresh embed may be a no-op until `onReady`.
- `getPlaybackQuality()` / `setPlaybackQuality()` are not surfaced through `MediaSurface` (YT-specific API).
