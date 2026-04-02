# OpenPlayerJS — Code Practices & Development Guide

## Repository Overview

Monorepo managed with **pnpm workspaces** and **Turbo**. All source lives under `packages/`; the root contains only shared config.

```
packages/
  core/      — Player, EventBus, engines, plugin system, state, overlays
  player/    — UI controls, createUI(), CSS
  hls/       — HlsMediaEngine (wraps hls.js)
  ads/       — AdsPlugin, strategies (CSAI/SSAI/Hybrid)
  youtube/   — YouTubeMediaEngine + YouTubeIframeAdapter
```

---

## TypeScript Conventions

### Strict mode is non-negotiable
All packages compile with `"strict": true`. No `any` without justification. Use `unknown` for unknowns.

### `type` over `interface` — enforced by ESLint
```ts
// CORRECT
export type PlayerPlugin = { name: string; setup?(ctx: PluginContext): void };

// WRONG — ESLint will reject this
export interface PlayerPlugin { name: string; }
```

### `import type` for type-only imports — enforced by ESLint
```ts
import type { MediaSource } from '../core/media';   // type import
import { EventBus } from '../core/events';           // value import
```

### Naming
| Construct | Convention | Example |
|-----------|-----------|---------|
| Files (multi-word) | kebab-case | `event-bus.ts`, `media-engine.ts` |
| Classes | PascalCase | `EventBus`, `BaseMediaEngine`, `AdsPlugin` |
| Methods / properties | camelCase | `canPlay()`, `bindSurfaceEvents()` |
| Constants | UPPER_SNAKE_CASE | `DVR_THRESHOLD`, `OVERLAY_MANAGER_KEY` |
| Private fields | `private` keyword or `#` prefix | `private readonly surface` |

### Access modifiers
Always declare access modifiers explicitly. Use `readonly` whenever a field is never reassigned.

```ts
export abstract class BaseMediaEngine {
  protected surface: MediaSurface | null = null;     // subclasses can read
  private surfaceListeners: (() => void)[] = [];     // internal only
  abstract name: string;                             // subclass must define
}
```

### Error handling
Use try/catch for defensive cleanup — a broken plugin must not crash the player:

```ts
for (const p of this.plugins) {
  try { p.destroy?.(); } catch { /* ignore */ }
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
  capabilities?: string[];   // e.g. ['media-engine'], ['ads']
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

Event naming conventions:
- `cmd:*` — commands from player to engine (`cmd:play`, `cmd:pause`, `cmd:seek`, `cmd:startLoad`)
- `media:*` — media state notifications (`media:timeupdate`, `media:rate`, `media:volume`)
- HTML5-native names without prefix — playback events bridged from DOM (`playing`, `pause`, `ended`, `loadedmetadata`)
- `ads:*` — ad lifecycle events emitted by AdsPlugin
- `source:set` — player source changed
- `player:interacted` — user interacted with player

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
state.current;           // current state string
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
| Suffix | Purpose |
|--------|---------|
| `*.test.ts` | Happy-path and main feature coverage |
| `*.branches.test.ts` | Edge cases, error paths, conditional branches |
| Feature-named: `player.autoplay.unmute.test.ts` | Specific behavior/scenario |

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
  p.play = jest.fn(async () => { p.events.emit('playing'); }) as unknown as Core['play'];
  p.pause = jest.fn(() => { p.emit('cmd:pause'); p.events.emit('pause'); }) as unknown as Core['pause'];
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

### Coverage gaps (as of Apr 2026)
- `packages/youtube/` — excluded from thresholds; only basic engine lifecycle tested
- `packages/hls/` — SCTE-35 cue parsing has minimal coverage; error recovery paths partially covered
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
- `dist/openplayer*.umd.js` + minified — UMD (CDN / browser globals)
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
