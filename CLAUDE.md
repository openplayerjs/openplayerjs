# OpenPlayerJS — Code Practices & Development Guide

## Repository Overview

Monorepo managed with **pnpm workspaces** and **Turbo**. All source lives under `packages/`; the root contains only shared config.

```
packages/
  core/      — Player, EventBus, engines, plugin system, state, overlays
  player/    — UI controls, createUI(), style.css  (@openplayerjs/player)
  hls/       — HlsMediaEngine (wraps hls.js)
  ads/       — AdsPlugin, strategies (CSAI/SSAI/Hybrid)
  youtube/   — YouTubeMediaEngine + YouTubeIframeAdapter
```

---

## Local Development

```sh
pnpm install          # install all workspace deps
pnpm run build        # full build (required before running tests)
pnpm run watch        # incremental rebuild on file changes (Turbo watch)
pnpm run test         # Jest with coverage
pnpm run test:watch   # Jest in watch mode
pnpm run lint         # ESLint + stylelint
pnpm run type-check   # tsc --noEmit across all packages
pnpm run preflight    # pre-release sanity check script
```

For E2E testing (Playwright):

```sh
pnpm run test:e2e           # headless
pnpm run test:e2e:ui        # with Playwright UI
pnpm run test:e2e:debug     # debug mode
```

---

## Releases

Releases are automated via `scripts/orchestrate-release.cjs` using conventional commits.

**Rules:**
- Core changed → release core first, then **all dependents at the same version** (lockstep). All packages share one version number.
- Core unchanged → release only packages that have their own changes since their last tag.

```sh
pnpm run release              # patch bump (default)
pnpm run release:minor        # minor bump
pnpm run release:major        # major bump
pnpm run release:dry-run      # preview without writing anything
pnpm run release:pack         # pack all packages to ./packed/ (for local testing)
```

Bump type is inferred from conventional commit prefixes (`feat:` → minor, `fix:` → patch, `BREAKING CHANGE` → major). Pass `--increment` to override.

---

## TypeScript Conventions

### Strict mode is non-negotiable

All packages compile with `"strict": true` and **TypeScript 6**. No `any` without justification. Use `unknown` for unknowns.

### Never add `as any` — use typed alternatives

`as any` defeats the type system and hides real errors. Prefer:

```ts
// Vendor-prefixed / non-standard browser APIs → typed intersection
type VendorElement = HTMLElement & { webkitEnterFullscreen?: () => void };
const el = target as VendorElement;

// Non-standard DOM properties (e.g. DataCue, TextTrackCue extensions) → local typed alias
type RawCue = TextTrackCue & { data?: ArrayBuffer; value?: unknown };
const raw = cue as RawCue;

// Opaque objects that need structural access → minimal typed interface
type PlayerLike = { events?: { on?: unknown; emit?: unknown } };
const p = player as PlayerLike;

// Private method access in tests → typed handle alias
type ControlInternals = ReturnType<typeof createControl> & { resolveRoot(): HTMLElement };
const c = control as unknown as ControlInternals;

// Read-only HTMLMediaElement properties in tests → Object.defineProperty
Object.defineProperty(media, 'duration', { value: 120, configurable: true });
```

Justified `as any` exceptions (document with an inline comment):
- Experimental browser APIs not yet in TypeScript's lib (e.g. `window.screen.orientation.lock`)
- Generic event forwarding loops over third-party typed event enums (hls.js)
- External library outputs with no shipped types (OMID, SIMID, `@dailymotion/vast-client` parsed objects)

### `type` over `interface` — enforced by ESLint

```ts
// CORRECT
export type PlayerPlugin = { name: string; setup?(ctx: PluginContext): void };

// WRONG — ESLint will reject this
export interface PlayerPlugin {
  name: string;
}
```

### `import type` for type-only imports — enforced by ESLint

```ts
import type { MediaSource } from '../core/media'; // type import
import { EventBus } from '../core/events'; // value import
```

### Naming

| Construct            | Convention                      | Example                                    |
| -------------------- | ------------------------------- | ------------------------------------------ |
| Files (multi-word)   | kebab-case                      | `event-bus.ts`, `media-engine.ts`          |
| Classes              | PascalCase                      | `EventBus`, `BaseMediaEngine`, `AdsPlugin` |
| Methods / properties | camelCase                       | `canPlay()`, `bindSurfaceEvents()`         |
| Constants            | UPPER_SNAKE_CASE                | `DVR_THRESHOLD`, `OVERLAY_MANAGER_KEY`     |
| Private fields       | `private` keyword or `#` prefix | `private readonly surface`                 |

### Access modifiers

Always declare access modifiers explicitly. Use `readonly` whenever a field is never reassigned.

```ts
export abstract class BaseMediaEngine {
  protected surface: MediaSurface | null = null; // subclasses can read
  private surfaceListeners: (() => void)[] = []; // internal only
  abstract name: string; // subclass must define
}
```

### Error handling

Use try/catch for defensive cleanup — a broken plugin must not crash the player:

```ts
for (const p of this.plugins) {
  try {
    p.destroy?.();
  } catch {
    /* ignore */
  }
}
```

Only validate at system boundaries (user input, external APIs). Don't add validation for impossible states.

---

## Architecture Patterns

### Engine pattern — `BaseMediaEngine`

All media engines extend `BaseMediaEngine` (`packages/core/src/engines/base.ts`).

Required abstract members:

```ts
abstract name: string;
abstract version: string;
abstract capabilities: string[];
abstract priority: number;             // higher = preferred; HLS=50, HTML5=0
abstract canPlay(src: MediaSource): boolean;
abstract attach(ctx: MediaEngineContext): void | Promise<void>;
abstract detach(): void;
```

Lifecycle helpers to use (not override):

- `bindSurfaceEvents(surface, events)` — bridges surface events to EventBus
- `unbindSurfaceEvents()` — cleanup alias
- `bindCommands(ctx)` — subscribes to `cmd:*` events; results stored in `this.commands`
- `bindMediaEvents(media, events)` — bridges native HTMLMediaElement events
- `unbindMediaEvents()` — cleanup alias

### Plugin pattern — `PlayerPlugin`

```ts
export type PlayerPlugin = {
  name: string;
  version: string;
  capabilities?: string[]; // e.g. ['media-engine'], ['ads']
  setup?(ctx: PluginContext): void;
  onEvent?(event: PlayerEvent, payload?: unknown): void;
  destroy?(): void;
};
```

`PluginContext` provides:

- `events: EventBus` — subscribe to typed player events
- `state: StateManager<PlaybackState>` — current playback state + transitions
- `leases: Lease` — acquire exclusive capability ownership
- `core: Core` — player instance reference
- `dispose: DisposableStore` — register cleanup callbacks; called on player destroy
- Convenience: `ctx.on()`, `ctx.listen()`, `ctx.add()`

**Rule**: Register all subscriptions through `ctx.dispose` so they are automatically cleaned up.

### Event system — `EventBus`

Events are fully typed via `PlayerEventPayloadMap`. Never emit or listen to untyped strings.

```ts
// Subscribe (returns unsubscribe fn)
const off = events.on('cmd:play', () => media.play());

// Emit
events.emit('media:timeupdate', currentTime);
```

#### Package boundary — core stays agnostic of package events (CRITICAL)

`PlayerEventPayloadMap` lives in core and declares **only kernel-level events** (lifecycle, commands, HTML5 media notifications, tracks). **Core must never gain `hls:*`, `ads:*`, `ui:*`, or any other package-specific keys.** This preserves the hierarchy: core is the kernel, player is the UI layer, and engines/plugins are independent packages.

Package-specific events are added via **TypeScript declaration merging**. Each owning package ships a `src/events.ts` that augments the interface and is side-effect-imported from its `index.ts`:

```ts
// packages/<pkg>/src/events.ts
import '@openplayerjs/core';

declare module '@openplayerjs/core' {
  interface PlayerEventPayloadMap {
    'my:event': MyPayload;
  }
}
```

```ts
// packages/<pkg>/src/index.ts
import './events'; // registers the augmentation in the published types
```

Because `PlayerEventPayloadMap` is an `interface` (the one sanctioned exception to the `type`-over-`interface` rule — a `type` alias cannot be augmented), any consumer that imports the package gets its events typed on `core.on(...)` / `core.emit(...)`. Canonical example: [packages/ads/src/events.ts](packages/ads/src/events.ts). (The HLS engine currently augments nothing — it drives the player through standard core events only.)

**To add an event:** core/kernel event → edit `packages/core/src/core/events.ts`. Package event → edit that package's `src/events.ts` augmentation (never core).

Event naming conventions:

- `cmd:*` — commands from player to engine (`cmd:play`, `cmd:pause`, `cmd:seek`, `cmd:startLoad`) — **core**
- HTML5-native names without prefix — playback events bridged from DOM (`playing`, `pause`, `ended`, `loadedmetadata`) — **core**
- `source:set` / `player:interacted` — source/interaction — **core**
- `ads:*` — ad lifecycle events on the **shared EventBus** (all 20 events; `core.on('ads:X', cb)` works for any delivery mode) — **`@openplayerjs/ads`** (augmentation)

### Iframe engine pattern

For non-native engines (YouTube, etc.):

1. Implement `IframeMediaAdapter` for the third-party API
2. Wrap in `IframeMediaSurface` (internal EventBus-backed)
3. Call `bindSurfaceEvents(surface, ctx.events)` + `bindCommands(ctx)`
4. Call `ctx.setSurface(surface)` to swap active surface
5. Call `surface.mount(ctx.container)` to inject the iframe
6. In `detach()`: unbind → destroy surface → `ctx.resetSurface()`

### Surface architecture

- `HtmlMediaSurface` — wraps native `HTMLMediaElement` (default)
- `IframeMediaSurface` — wraps an `IframeMediaAdapter`; polling-based state sync
- `ctx.setSurface()` / `ctx.resetSurface()` — swap between surfaces
- `MediaSurface` interface has: `currentTime`, `duration`, `volume`, `muted`, `playbackRate` (all read/write)

### Overlay manager

Accessed via `getOverlayManager(core)`. Highest-priority active overlay wins. Used by ads to display countdown/skip UI.

### State manager

```ts
const state = new StateManager<PlaybackState>('idle');
state.current; // current state string
state.transition('playing');
```

States: `idle → loading → ready → playing ↔ paused`, also `waiting`, `seeking`, `ended`, `error`.

---

## Cross-Package Import Rules

All packages import `@openplayerjs/core` by package name — **never** by relative path.

```ts
// CORRECT (any non-core package)
import { BaseMediaEngine, EventBus } from '@openplayerjs/core';

// WRONG
import { BaseMediaEngine } from '../../core/src/engines/base';
```

Path aliases are configured in `tsconfig.base.json` (for IDE/build) and `jest.config.cjs` (for tests).

---

## Testing

### Setup & environment

- All tests run in `jsdom` (declared per-file: `/** @jest-environment jsdom */`)
- `__tests__/setup/mediaMocks.ts` is loaded via `setupFilesAfterEnv` — provides `play()`, `pause()`, `load()`, `canPlayType()` mocks and media property getters/setters for all tests
- Test runner: **Jest** + **ts-jest**

### File naming conventions

| Suffix                                          | Purpose                                       |
| ----------------------------------------------- | --------------------------------------------- |
| `*.test.ts`                                     | Happy-path and main feature coverage          |
| `*.branches.test.ts`                            | Edge cases, error paths, conditional branches |
| Feature-named: `player.autoplay.unmute.test.ts` | Specific behavior/scenario                    |

### Test file locations

Tests live in `packages/*/__tests__/` — not in a root `__tests__/` (only setup files are there).

### Standard test structure

```ts
/** @jest-environment jsdom */

describe('Feature name', () => {
  // ── shared factory ────────────────────────────────────────────────────────
  function makeCore() {
    const v = document.createElement('video');
    v.src = 'https://example.com/video.mp4';
    document.body.appendChild(v);
    return new Core(v, { plugins: [] });
  }

  beforeEach(() => {
    // reset DOM state if needed
    document.body.innerHTML = '';
  });

  test('description of expected behaviour', () => {
    // Arrange
    const p = makeCore();

    // Act
    p.events.emit('playing');

    // Assert
    expect(p.state.current).toBe('playing');
  });
});
```

### Core test conventions

- Use a local `makeCore()` factory function — never rely on module-level state
- For Core: pass `{ plugins: [] }` explicitly to avoid loading unintended engines
- Simulate readiness: `p.events.emit('loadedmetadata')` to resolve `whenReady()`
- Mock `play` / `pause` on Core when testing UI controls to make tests synchronous:
  ```ts
  p.play = jest.fn(async () => {
    p.events.emit('playing');
  }) as unknown as Core['play'];
  p.pause = jest.fn(() => {
    p.emit('cmd:pause');
    p.events.emit('pause');
  }) as unknown as Core['pause'];
  ```

### Timer-dependent tests

Use `jest.useFakeTimers()` at the top of the describe block. Advance with `jest.advanceTimersByTime(ms)`.

### Non-null helper pattern

```ts
function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}
```

Use when querying DOM elements that must exist.

### Mocking media properties

```ts
Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
```

Use `configurable: true` so the property can be re-defined in later tests.

### Mocking external libraries (ads)

External packages `@dailymotion/vast-client` and `@dailymotion/vmap` are mapped to mocks in `packages/ads/__tests__/mocks/` via `jest.config.cjs moduleNameMapper`. The mock files export `jest.fn()` instances shared between tests and the mapper.

### Mocking adapters (YouTube/iframe)

Implement the interface (`IframeMediaAdapter`, etc.) with stub methods:

```ts
class StubAdapter implements IframeMediaAdapter {
  private listeners = new Map<string, Function>();
  on<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]) {
    this.listeners.set(evt as string, cb as Function);
  }
  emit<E extends keyof IframeMediaAdapterEvents>(evt: E, ...args: unknown[]) {
    this.listeners.get(evt as string)?.(...args);
  }
  // ... other methods as jest.fn()
}
```

### Coverage thresholds

85% branches / functions / lines / statements globally. YouTube package is excluded from coverage collection. `umd.ts` and `index.ts` barrel files are also excluded.

### Coverage gaps (as of Jun 2026)

- `packages/youtube/` — excluded from thresholds; only basic engine lifecycle tested
- `packages/ads/src/strategies/csai.ts` — weakest area (~74% branches); uncovered paths include SIMID, OMID, and HLS-engine-for-ad-video paths which require external dependencies and full browser contexts not available in jsdom
- Async race conditions in surface swapping (Core.load with concurrent attach/detach)

---

## Build & Tooling

### Build sequence

```sh
pnpm run build        # clean → build:types → turbo build:bundles build:css
pnpm run build:types  # tsc -b tsconfig.references.json (generates .d.ts)
```

### Output formats

Each package produces:

- `dist/index.js` — ESM (for bundlers)
- `dist/openplayer*.js` + minified — UMD (CDN / browser globals)
- `dist/types/` — TypeScript declarations

### Rollup externals

`@openplayerjs/core` is **external** to all consumer packages. It must not be bundled into `hls`, `ads`, `player`, or `youtube` builds.

### Path resolution

- **IDE / build**: `tsconfig.base.json` `paths` map `@openplayerjs/*` → `packages/*/src/index.ts`
- **Jest**: `moduleNameMapper` in `jest.config.cjs` maps the same aliases
- **Rollup**: `workspaceAlias()` plugin in `rollup.config.mjs` resolves them during bundle

### Linting

```sh
pnpm run lint         # ESLint (flat config) + stylelint for CSS
```

Key enforced rules: `consistent-type-imports`, `consistent-type-definitions: type`, `import/no-cycle` (max depth 10), `no-unused-vars`.

---

## Ads Plugin Architecture

### Ad source modes (`adSourcesMode`)

`AdsPluginConfig.adSourcesMode` controls how multiple ad sources are handled per break:

- `'waterfall'` (default) — single `AdsBreakConfig` with a `sources: AdsSource[]` array. `startBreak()` tries each source in order and stops on first success. Failed tries do **not** emit `cmd:play` between attempts (`suppressResumeOnError`).
- `'playlist'` — one `AdsBreakConfig` per source; the interceptor loop plays them sequentially.
- Single source — same as before (no `sources` array).

`playedBreaks.add(id)` is always called after `startBreak()` regardless of success, preventing infinite retry.

### `resumeContent` default

`resumeAfter = (this.cfg.resumeContent !== false) && meta.kind !== 'postroll'`

`resumeContent` is **opt-out** (`!== false`), not opt-in. Using `=== true` means unset config defaults to `false` and content never resumes.

### `preload="none"` VMAP deferral

VMAP fetch starts synchronously at the top of the first `cmd:play` handler (not in `rebuildSchedule()`). This ensures `vmapPending=true` is captured before the eager-pause check runs.

### `source:set` handler

Calls `clearSession()` and also resets: `active=false`, `contentMedia=undefined`, overlay hidden, releases playback lease, deactivates `overlayManager`, clears `vmapLoadPromise`/`vmapPending`/`pendingVmapSrc`. This prevents stuck `active=true` state after source switches.

---

## Key Behavioral Decisions

### `cmd:play` fires synchronously before `await`

`player.play()` emits `cmd:play` BEFORE any `await`, preserving the browser's user-gesture activation context (critical for Safari autoplay). Engines must call `media.play()` in the `cmd:play` handler immediately.

### `resumeContent` defaults to `true` (opt-out)

In AdsPlugin, `resumeContent !== false` — not `resumeContent === true`. Without this, unset config defaults to `false` and content never resumes after ads.

### `preload="none"` VMAP deferral

When `preload="none"`, VMAP fetch starts synchronously at the top of the first play handler (not in `rebuildSchedule()`). This ensures `vmapPending=true` is set before the eager-pause check runs.

### HLS readiness signal

`MANIFEST_PARSED` emits `loadedmetadata` on EventBus (resolves `whenReady()` fast). The DOM `loadedmetadata` still fires later via `bindMediaEvents` but is a no-op for the readiness promise.

### UMD plugin registration

Plugins must be passed to `CorePlayer` constructor before `maybeAutoLoad()` is called. UMD bundles register themselves on `window.OpenPlayerPlugins`; `Player.init()` reads that before constructing CorePlayer.
