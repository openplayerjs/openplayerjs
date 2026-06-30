# Architecture

OpenPlayerJS is a headless-first, plugin-driven HTML5 media player delivered as a pnpm monorepo.

## Package map

```
packages/
  core/    — Player runtime, EventBus, engine resolution, plugin system, state, overlays
  player/  — UI layer: controls, CSS, keyboard/pointer bindings, accessibility
  hls/     — HlsMediaEngine (wraps hls.js)
  ads/     — AdsPlugin: CSAI / SSAI / Hybrid ad delivery strategies
  youtube/ — YouTubeMediaEngine + YouTubeIframeAdapter
```

`@openplayerjs/core` is the only package with zero runtime dependencies. All others peer-depend on it. No package imports another sibling by relative path — always `@openplayerjs/core`.

---

## Core concepts

### `Core` (core/src/core/index.ts)

The central runtime object. Owns:
- `EventBus` — typed pub/sub used for all inter-component communication
- `StateManager<PlaybackState>` — single-field state machine (`idle → loading → ready → playing ↔ paused …`)
- `PluginRegistry` — ordered list of `PlayerPlugin` instances
- `Lease` — capability exclusion lock (e.g. `'playback'` is acquired by AdsPlugin during ad playback)
- `HtmlMediaSurface` (native) / `IframeMediaSurface` (YouTube etc.) — normalized playback interface

Construction order: register `DefaultMediaEngine` → register user plugins → `queueMicrotask(maybeAutoLoad)`.

### Engine resolution

`Core.load()` iterates registered plugins for those with `capabilities: ['media-engine']`, sorts by `priority` (descending), then walks sources × engines until `engine.canPlay(source)` returns `true`. The winning engine is called with `engine.attach(ctx)`.

Engine priorities: `HlsMediaEngine = 50`, `DefaultMediaEngine = 0`. Higher wins.

### `MediaSurface`

All playback operations go through a `MediaSurface`. Native engines use `HtmlMediaSurface` (wraps `<video>`). Iframe engines (YouTube) replace it via `ctx.setSurface(iframeSurface)` and restore it in `detach()` via `ctx.resetSurface()`.

The surface exposes: `currentTime`, `duration`, `volume`, `muted`, `playbackRate`, `paused`, `ended`, `play()`, `pause()`, `on(event, handler)`.

### `BaseMediaEngine`

Abstract base for all engines. Provides:
- `bindSurfaceEvents(surface, events)` — bridges surface DOM events → EventBus
- `bindCommands(ctx)` — subscribes to `cmd:seek / cmd:setVolume / cmd:setMuted / cmd:setRate / cmd:play / cmd:pause`
- `bindMediaEvents(media, events)` — convenience wrapper using `createMediaSurfaceShim`
- `unbindSurfaceEvents()` / `unbindCommands()` — cleanup

### `BaseMediaEngine` for iframe engines

Pattern:
1. Create adapter (`YouTubeIframeAdapter`)
2. Wrap in `IframeMediaSurface(adapter)`
3. Call `ctx.setSurface(surface)`
4. `bindSurfaceEvents(surface, ctx.events)` + `bindCommands(ctx)`
5. `surface.mount(ctx.container)` — injects iframe into DOM
6. In `detach()`: `unbindCommands()` → `unbindSurfaceEvents()` → `surface.destroy()` → `ctx.resetSurface()`

### Event system

`PlayerEventPayloadMap` (an **interface** in `core/src/core/events.ts`) is the typed registry for every event on the shared `EventBus`. Never emit or subscribe to untyped strings.

**Package hierarchy is enforced here.** Core declares only kernel events. Each other package owns its events and contributes them via TypeScript **declaration merging** from its `src/events.ts` (`declare module '@openplayerjs/core' { interface PlayerEventPayloadMap { … } }`), side-effect-imported from the package's `index.ts`. Core never references `hls:*`, `ads:*`, or `ui:*`. This is the one place the repo uses `interface` over `type`, because only an interface can be augmented across module boundaries.

Naming conventions (owner in **bold**):
- `cmd:*` — commands to the active engine (`cmd:play`, `cmd:seek`, `cmd:startLoad`) — **core**
- Bare HTML5 names — bridged from `MediaSurface` (`playing`, `pause`, `ended`, `loadedmetadata`, …) — **core**
- `player:*` / `source:*` — lifecycle & source management (`player:destroy`, `source:set`) — **core**
- `ads:*` — ad lifecycle events on the shared EventBus — **`@openplayerjs/ads`** (`src/events.ts`)
- `ui:*` — player-package UI signals (`ui:menu:open`, `ui:addControl`, …) — **`@openplayerjs/player`**

### Plugin system

`PlayerPlugin` shape:
```ts
{ name, version, capabilities?, setup?(ctx), onEvent?(event, payload), destroy?() }
```

`setup(ctx)` receives a `PluginContext` with:
- `events` — EventBus
- `state` — StateManager
- `leases` — Lease
- `core` — Core instance
- `dispose` — DisposableStore (register cleanup; called on `Core.destroy()`)
- Convenience: `ctx.on()`, `ctx.listen()`, `ctx.add()`

Always register subscriptions through `ctx.dispose` so they are automatically cleaned up on destroy.

### `OverlayManager`

Accessed via `getOverlayManager(core)`. Stored in a module-level `WeakMap<object, OverlayManager>` keyed on the `Core` instance. Highest-priority active overlay wins. Used by AdsPlugin to display countdown/skip UI and to signal the UI layer that click-to-pause should be suppressed for linear ads.

---

## Ads plugin

`AdsPlugin` is a thin dispatcher. It selects one of three strategies based on `config.adDelivery`:

| Mode | Strategy | How ads are delivered |
|---|---|---|
| `'csai'` (default) | `CsaiAdStrategy` | Fetches VAST/VMAP, renders an ad `<video>` |
| `'ssai'` | `SsaiAdStrategy` | Detects SCTE-35 splice cues in the HLS metadata TextTrack |
| `'hybrid'` | `HybridAdStrategy` (extends CSAI) | CSAI triggered by SCTE-35 OUT cues from the engine |

### CSAI scheduling

`AdScheduler` holds the `AdsBreakConfig[]` array. On `cmd:play` (preroll interceptor) or `timeupdate` (midroll), the scheduler checks for due breaks. `startBreak()` fetches the VAST/VMAP URL, parses creatives with `@dailymotion/vast-client`, acquires the `'playback'` lease, mounts an ad `<video>`, and plays the pod. On completion, `finish()` releases the lease and optionally resumes content.

Key invariants:
- `resumeContent !== false` (opt-out default) — unset config means `true`
- `cmd:play` is emitted synchronously before any `await` to preserve browser user-gesture context
- VMAP is fetched eagerly on attach (preload=metadata/auto) or deferred until first play intent (preload=none)

---

## Player UI package

`createUI(core, media, controls, options)` builds the wrapper DOM structure and wires all interactions. Controls are factory functions that return `Control` objects; they are placed into a CSS grid via `createControlGrid`.

Each control extends `BaseControl` which owns a `DisposableStore`. All event listeners are registered through `this.dispose` so they are torn down automatically when `control.destroy()` is called.

Keyboard bindings live in `bindCenterOverlay` (`events.ts`). The `'f'` key requests fullscreen on the player wrapper (`keyTarget`). Arrow keys adjust volume/seek. `Space`/`k` toggle playback.

---

## Build pipeline

```
build:types      tsc -b tsconfig.references.json → dist/types/**
build:bundles    rollup per-package → dist/index.js (ESM) + dist/openplayer*.js (UMD)
build:css        postcss src/style.css → dist/openplayer.css
```

Turbo caches bundle and CSS outputs. `workspaceAlias()` in `rollup.config.mjs` resolves `@openplayerjs/*` to local source during bundling. `@openplayerjs/core` is external to all consumer package bundles.

UMD bundles register themselves on `window.OpenPlayerPlugins`. `Player.init()` reads that registry before constructing `Core` so plugins are present before `maybeAutoLoad()` fires.

---

## Testing

- Jest + ts-jest, jsdom environment
- 85% branch/function/line/statement threshold (global; youtube excluded)
- `__tests__/setup/mediaMocks.ts` provides `play()`, `pause()`, `load()`, `canPlayType()` mocks globally
- Use `makeCore()` factory functions; never module-level state
- Simulate readiness with `p.events.emit('loadedmetadata')`
- Timer-dependent tests use `jest.useFakeTimers()`
