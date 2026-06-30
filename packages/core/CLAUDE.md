# @openplayerjs/core — AI context

## Role
The foundational runtime. No runtime dependencies. Every other package peer-depends on this one.

## Key files
- `src/core/index.ts` — `Core` class: engine resolution, play/pause, state, plugins, surfaces
- `src/core/events.ts` — `EventBus` + `PlayerEventPayloadMap` (all typed events live here)
- `src/core/plugin.ts` — `PlayerPlugin` type, `PluginRegistry`, `PluginContext`
- `src/core/state.ts` — `StateManager<PlaybackState>`
- `src/core/lease.ts` — `Lease` (capability exclusion for ads/cast etc.)
- `src/core/overlay.ts` — `OverlayManager`, stored in `WeakMap<object, OverlayManager>`
- `src/core/surface.ts` — `MediaSurface` interface, `HtmlMediaSurface`, `bridgeSurfaceEvents`
- `src/core/dispose.ts` — `DisposableStore` (LIFO cleanup)
- `src/engines/base.ts` — `BaseMediaEngine` abstract class
- `src/engines/html5.ts` — `DefaultMediaEngine` (native HTML5, priority 0)
- `src/engines/iframe.ts` — `IframeMediaSurface` + adapter types

## Critical rules
- **Never** add runtime dependencies to this package.
- **Core is agnostic of every other package.** `PlayerEventPayloadMap` declares ONLY kernel events (lifecycle, commands, HTML5 media, tracks). Never add `hls:*`, `ads:*`, `ui:*`, or any package-specific keys here — those live in the owning package's `src/events.ts` augmentation (see "Adding a new event").
- **`cmd:startLoad`** must stay in `PlayerEventPayloadMap` — it is emitted by `Core.load()` and handled by both `DefaultMediaEngine` and `HlsMediaEngine`.
- **`cmd:play` is emitted synchronously** in `Core.play()` before any `await`. This preserves the browser user-gesture activation context for autoplay. Engines must call `surface.play()` in their `cmd:play` handler immediately.
- **`StateManager` has no guard rail** — all transition calls succeed. Do not add transitions that skip states (e.g. idle → ended).
- **`IframeMediaSurface` polling** pauses automatically when the adapter reports `paused` or `ended` state, and resumes on `playing`. Do not start polling manually outside of `onAdapterReady`.
- **`OverlayManager`** is stored in a `WeakMap` (`_overlayManagers`). Do not store it as a property on `Core`.

## Adding a new event
- **Kernel event** (emitted by core itself): add an entry to the `PlayerEventPayloadMap` **interface** in `src/core/events.ts`. It is re-exported from `src/index.ts`.
- **Package-specific event** (hls/ads/youtube/player): do NOT touch core. Add it to that package's `src/events.ts`, which augments the interface via declaration merging:
  ```ts
  declare module '@openplayerjs/core' {
    interface PlayerEventPayloadMap { 'my:event': MyPayload; }
  }
  ```
  and is side-effect-imported from the package's `index.ts` (`import './events';`).
- Never emit untyped string events on the shared `EventBus`.

### Why `PlayerEventPayloadMap` is an `interface`
It is the single sanctioned exception to the repo's `type`-over-`interface` rule (with an inline `eslint-disable`). A `type` alias cannot be merged across module boundaries; an `interface` can, which is what lets packages contribute their own events without core knowing about them. The ad events (`ads:*`) that used to live here were moved out to `packages/ads/src/events.ts`. (The HLS engine had a few events here too — they were removed entirely once it turned out nothing consumed them; HLS now drives the player through standard core events only.)

## `DisposableStore` supports `using` (TS 5.2+)
`DisposableStore` implements `[Symbol.dispose]()` as an alias for `dispose()`. You can write:
```ts
using store = new DisposableStore();
```
The store is automatically disposed when the block exits.

## `IframeMediaAdapter.on/off` use `NonNullable`
Optional events in `IframeMediaAdapterEvents` (e.g. `timeupdate?`) use `NonNullable<IframeMediaAdapterEvents[E]>` in the `on/off` signature. This eliminates `as any` casts when registering callbacks for optional events.

## Adding a new engine
1. Extend `BaseMediaEngine`.
2. Set `priority` higher than `DefaultMediaEngine` (0) to override it for your sources.
3. Call `bindSurfaceEvents` + `bindCommands` in `attach()`.
4. Call `unbindCommands` + `unbindSurfaceEvents` in `detach()`.
5. For iframe engines: `ctx.setSurface(surface)` in `attach()`, `ctx.resetSurface()` in `detach()`.
