# OpenPlayerJS — Operating Manual

This file is the contract for working in this repo. It states rules, the mistakes those rules
prevent, checkable quality gates per kind of change, and exactly when to stop and ask.
Package-level detail lives in `packages/*/CLAUDE.md` — **read the package's CLAUDE.md before
editing any file in that package.** That is not optional; each one documents load-bearing
behavior that is invisible from the code alone.

## 1. What this repo is

HTML5 video/audio player. Monorepo: **pnpm workspaces + Turbo + TypeScript 6 (strict)**. All
source under `packages/`; the root holds only shared config and scripts.

| Package   | Role                                                                                                      | Detail file                  |
| --------- | --------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `core`    | Kernel: `Core`, `EventBus`, `BaseMediaEngine`, plugins, state, overlays, surfaces. **Zero runtime deps.** | `packages/core/CLAUDE.md`    |
| `player`  | UI layer: `createUI()`, controls, CSS, a11y, UMD `Player`                                                 | `packages/player/CLAUDE.md`  |
| `hls`     | `HlsMediaEngine` wrapping hls.js (priority 50)                                                            | `packages/hls/CLAUDE.md`     |
| `ads`     | `AdsPlugin` + CSAI/SSAI/Hybrid strategies                                                                 | `packages/ads/CLAUDE.md`     |
| `youtube` | `YouTubeMediaEngine` + iframe adapter (priority 100)                                                      | `packages/youtube/CLAUDE.md` |

Dependency direction is strictly one-way: everything depends on `core`; `core` depends on
nothing and knows nothing about the packages above it. Architecture rationale: `ARCHITECTURE.md`.

Published packages have external consumers that pin exact versions. Any change to a core
public type, `PlayerEventPayloadMap`, or an exported signature can break downstream code
silently — treat public-surface changes as breaking (see §7 E1). If a
`.claude/CLAUDE.local.md` exists, it lists additional local-only context and checks; follow it.

## 2. Commands (the only sanctioned entry points)

```sh
pnpm install               # workspace deps
pnpm run build             # clean → build:types → turbo bundles+css. REQUIRED before tests.
pnpm run watch             # incremental rebuild
pnpm run test              # Jest + coverage (85% global threshold)
pnpm run test:watch
pnpm run lint              # ESLint (flat) + stylelint
pnpm run type-check        # tsc --noEmit, all packages
pnpm run preflight         # workspace sanity gate (also first step of release)
pnpm run test:e2e          # Playwright (headless); :ui / :debug variants exist
pnpm run release:dry-run   # preview release; NEVER run non-dry release unprompted (E1)
```

Run a single test file with `pnpm exec jest packages/ads/__tests__/ads.test.ts`. Never bypass
these scripts with hand-rolled tsc/rollup/jest invocations that use different configs.

## 3. Non-negotiable rules — each exists because the mistake actually happened

Each entry: the mistake a model will make → the rule that prevents it.

**R1 — Putting package events in core.**
You will be tempted to add `ads:*`, `hls:*`, or `ui:*` keys to `PlayerEventPayloadMap` in
`packages/core/src/core/events.ts` because "that's where events live." **Never.** Core declares
only kernel events (lifecycle, `cmd:*`, HTML5-native names, tracks, `source:set`,
`player:interacted`). Package events are added by **declaration merging**: the owning package's
`src/events.ts` contains `declare module '@openplayerjs/core' { interface PlayerEventPayloadMap
{ 'my:event': MyPayload } }` and is side-effect-imported from that package's `index.ts`
(`import './events';` — forget this import and consumers lose the types silently). Canonical
example: `packages/ads/src/events.ts`. HLS deliberately augments nothing.

**R2 — `PlayerEventPayloadMap` is the ONE sanctioned `interface`.**
ESLint enforces `type` over `interface` everywhere. `PlayerEventPayloadMap` is an `interface`
(with inline eslint-disable) because only interfaces can be merged across modules. Do not
"fix" it to a `type`; do not use this exception as precedent for other interfaces.

**R3 — Never remove an event emission as "dead code" without grepping tests.**
An emit with no typed listener in src may still have subscribers in `__tests__/`. Removing
`ads.allAdsCompleted` this way once broke a VMAP integration test with a silent timeout.
Before deleting any `emit('X', …)`: `grep -rn "'X'" packages/` and check every hit.

**R4 — No new `as any`. Use the typed alternative for the situation:**

```ts
// Vendor-prefixed browser APIs → typed intersection
type VendorElement = HTMLElement & { webkitEnterFullscreen?: () => void };
// Non-standard cue/DOM props → local alias
type RawCue = TextTrackCue & { data?: ArrayBuffer; value?: unknown };
// Read-only media props in tests → defineProperty, never assignment
Object.defineProperty(media, 'duration', { value: 120, configurable: true });
// Private member access in tests → double cast to a minimal shape
const c = control as unknown as { resolveRoot(): HTMLElement };
// NOTE: `Class & { privateMember: T }` intersections reduce to `never` for
// private members — you MUST use `as unknown as { member: T }` instead.
// Permissive event-callback params → non-optional `never` (contravariance):
on(event: string, cb: (payload: never) => void): () => boolean;
// `(payload?: never)` does NOT work — the `?` widens to undefined.
```

Sanctioned `as any` (one aliased opaque type per library, single eslint-disable at the alias):
untyped external outputs (`@dailymotion/vast-client`, VMAP, OMID, SIMID) and experimental
browser APIs absent from TS lib. Pattern: `export type VastParsed = any;` in `ads/src/types.ts`.

**R5 — `cmd:play` must stay synchronous.**
`Core.play()` emits `cmd:play` **before any `await`** to preserve the browser user-gesture
context (Safari autoplay). Engines call `media.play()` immediately in the handler. The ads
preroll interceptor must not `await` anything before acquiring the lease/pausing content.
Never insert an `await`, microtask, or setTimeout upstream of these emits.

**R6 — `resumeContent !== false`, never `=== true`.**
It is opt-out. `=== true` makes unset config default to false → content never resumes after
ads. Tested in `ads.test.ts`; the same opt-out pattern applies to other `Xxx !== false` checks
you'll find — do not "simplify" them.

**R7 — Cross-package imports use the package name.**
`import { EventBus } from '@openplayerjs/core'` — never `../../core/src/…`. Aliases are wired
in `tsconfig.base.json` (IDE/build), `jest.config.cjs` (tests), and `rollup.config.mjs`
(bundles). `@openplayerjs/core` is **external** in every consumer package's Rollup build; if
core code appears inside `dist/` of hls/ads/player/youtube, the build is wrong.

**R8 — Do not touch `tsconfig.base.json` target/lib.**
`target: "ES2022"` + `lib: [... "ESNext.Disposable"]` is load-bearing: ES2020 breaks
`build:types` (`[Symbol.dispose]` in dispose.ts) and bloats dist ~16% via downleveled class
fields. `erasableSyntaxOnly` cannot be enabled (parameter properties are used throughout).

**R9 — All cleanup goes through disposables.**
Plugins: register every subscription via `ctx.dispose` / `ctx.on()` / `ctx.listen()`.
Controls: `this.dispose.addEventListener(...)` or `this.listen(...)` — never bare
`addEventListener`. Engines: `bindSurfaceEvents`/`bindCommands` in `attach()`, matching
unbinds in `detach()`. A missed unbind is a leak that only shows up in multi-source tests.

**R10 — Keep `this` bound when forwarding third-party events.**
Extracting `const on = this.adapter.on` unbinds `this` and fails at runtime under mocks. Cast
the _object_, then call the method on it: `(this.adapter as unknown as Api).on(evt, handler)`.

**R11 — Versioning is the orchestrator's job.**
Never hand-edit `version` fields, tags, or `CHANGELOG.md`. `scripts/orchestrate-release.cjs`
owns them (core changed → all packages lockstep at one version; else per-package). Bump type
comes from conventional commits (`feat`→minor, `fix`→patch, `BREAKING CHANGE`→major).

**R12 — Commits must satisfy commitlint or the hook rejects them.**
Format: `type(scope): subject`. Types: feat|fix|perf|refactor|chore|docs|test|build|ci|revert.
Scope is **required**, from: core|player|hls|ads|youtube|deps|ci|release|docs|repo|changelog
(multi-package: `feat(core,player): …`). Header ≤150 chars, subject not Start/Pascal/UPPER case.

**R13 — Core stays dependency-free and package-agnostic.**
No runtime deps in `packages/core/package.json`, ever. No imports from sibling packages. No
knowledge of ads/hls/ui concepts in core source or types.

**R14 — Don't invent guard rails or validation.**
`StateManager` transitions are unguarded by design; don't add checks. Validate only at system
boundaries (user config, network XML, third-party APIs). Defensive try/catch is for plugin
isolation (a broken plugin must not crash the player), not for impossible states.

**R15 — UI strings come from `defaultLabels`.**
No hard-coded English in `packages/player/src/controls/`. Add the key to `defaultLabels` in
`configuration.ts`; callers override via `config.labels`.

**R16 — Generated/derived files are never edited by hand.**
`dist/`, `dist/types/`, `coverage/`, `CHANGELOG.md`, `pnpm-lock.yaml` (except via pnpm
commands), `playwright-report/`, `test-results/`.

## 4. Conventions

- **Files** kebab-case (`event-bus.ts`) · **classes** PascalCase · **methods/props** camelCase ·
  **constants** UPPER_SNAKE_CASE · explicit access modifiers, `readonly` when never reassigned.
- `type` over `interface` (ESLint-enforced; sole exception R2). `import type` for type-only
  imports (enforced). `unknown` over `any`. `import/no-cycle` is an error.
- Event names: `cmd:*` = player→engine commands; unprefixed HTML5-native names = bridged DOM
  playback events; `ads:*` etc. = package events via augmentation (R1). Never emit or subscribe
  with an untyped string.
- Payload conventions (ads): break descriptor `{ id, kind }` under a `break` property;
  `ads:quartile` is `{ breakId, quartile: 25|50|75|100 }`; SSAI uses `kind: 'ssai'`.
- Comments state constraints the code can't show. No narration, no "why my change is correct."
  Match surrounding density.

## 5. Testing (the spec lives here — read tests before changing behavior)

- Jest + ts-jest, jsdom. Every test file starts with `/** @jest-environment jsdom */`.
- Location: `packages/<pkg>/__tests__/`. Root `__tests__/setup/mediaMocks.ts` is auto-loaded
  and provides `play()/pause()/load()/canPlayType()` and media property accessors.
- Naming: `*.test.ts` happy path · `*.branches.test.ts` edge/error paths ·
  feature-named files (`player.autoplay.unmute.test.ts`) for specific scenarios.
- Structure: local `makeCore()` factory per describe; `new Core(v, { plugins: [] })` explicitly;
  no module-level state; `document.body.innerHTML = ''` in beforeEach when the DOM is touched.
- Readiness: `p.events.emit('loadedmetadata')` resolves `whenReady()`. Make play/pause
  synchronous in UI tests by stubbing them (`p.play = jest.fn(async () => p.events.emit('playing')) as unknown as Core['play']`).
- Timers: `jest.useFakeTimers()` + `advanceTimersByTime` — never real waits.
- Ads externals: **never** import `@dailymotion/vast-client`/`vmap` in tests; jest
  `moduleNameMapper` routes them to `packages/ads/__tests__/mocks/`. VAST fixtures:
  `packages/ads/__tests__/fixtures/ads/*.xml`.
- Coverage: 85% branches/functions/lines/statements globally. Excluded: youtube package,
  `umd.ts`, `index.ts` barrels. Known weak spot: `ads/src/strategies/csai.ts` (~74% branches —
  SIMID/OMID paths need real browsers).
- `nn<T>()` helper for must-exist DOM queries; `configurable: true` on every defineProperty.

## 6. Quality gates — checkable, per deliverable

**G0 — every code change, no exceptions.** All of:

1. `pnpm run type-check` exits 0.
2. `pnpm run lint` — 0 errors AND no new warnings (baseline is 0 `no-explicit-any` warnings
   in both src and tests; keep it there).
3. `pnpm run build` succeeds (catches .d.ts and rollup breakage type-check misses).
4. `pnpm run test` passes and global coverage stays ≥85% on all four metrics.
5. Diff contains no edits to generated files (R16) and no new `as any`/`@ts-ignore`/
   `eslint-disable` outside the sanctioned patterns (R4).

**G1 — bug fix.** G0, plus: a test that fails on the pre-fix code and passes after (name it
after the behavior, put it in the owning package's `__tests__/`); if the bug came from a
GitHub issue, reference it in the commit (`fixes #NNN`); if the fix encodes a new behavioral
rule, add it to the owning package's CLAUDE.md.

**G2 — feature.** G0, plus: public types exported from the package's `index.ts`; new events
follow R1 including the side-effect import; config options documented in the package README;
package CLAUDE.md updated if the feature adds a rule or invariant; user-visible player
behavior gets an `examples/*.html` page and an `e2e/*.spec.ts` when it can only be proven in
a real browser; happy-path AND branch tests.

**G3 — refactor.** G0, plus: zero behavior change (no test assertions modified — if a test
must change, it's not a refactor, say so); public API surface identical
(`git diff dist/types/` after build shows no changes, or the change is explicitly approved);
event emissions removed only per R3.

**G4 — new control (player).** G2, plus: extends `BaseControl` with `id`, `placement`,
`build()`; factory `createXxxControl()` exported; registered in `getControlFactory()` in
`src/umd.ts`; all strings via `defaultLabels` (R15); listeners via disposables (R9);
a11y label via `setA11yLabel()`.

**G5 — new engine.** G2, plus: extends `BaseMediaEngine` with all abstract members;
`priority` chosen consciously (HTML5=0, HLS=50, YouTube=100); `attach()`/`detach()` symmetric
per R9; iframe engines follow the surface swap sequence in `packages/core/CLAUDE.md`.

**G6 — release readiness** (when asked to prepare a release): working tree clean; G0 green;
`pnpm run preflight` passes; `pnpm run test:e2e` passes; `pnpm run release:dry-run` output
reviewed and version/lockstep behavior matches intent. Actually publishing is E1 below.

## 7. Uncertainty and escalation

**Resolution order when you don't know how something behaves** (exhaust these before asking):

1. Tests in the owning package's `__tests__/` — they are the executable spec.
2. The owning package's `CLAUDE.md`, then `ARCHITECTURE.md`.
3. `git log --follow -p <file>` — recent history explains most surprises; PR-squash bodies
   are detailed in this repo.
4. Any additional sources listed in `.claude/CLAUDE.local.md`, if present.

**Proceed without asking (E0):** reversible changes within the stated task scope; adding
tests; updating docs alongside code; fixing lint/type errors your change introduced;
choosing between two internal implementations when one clearly matches existing patterns
(note the choice in your summary).

**Stop and ask first (E1):** running `pnpm run release*` (anything non-dry-run) or `npm
publish`; `git push` of any kind; deleting files you did not create in the session; changing
a public API signature, an event name, or an event payload shape (all are breaking for
downstream consumers); adding or upgrading any dependency; editing shared config
(`tsconfig*`, `rollup*`, `jest.config.cjs`, `eslint.config.cjs`, `turbo.json`,
`commitlint.config.cjs`); editing any repository outside this one when the task didn't
mention it; weakening a coverage threshold or excluding a file from coverage; anything
under R16.

**Ambiguity rule:** if two readings of the task lead to different public behavior, ask. If
they lead to the same public behavior, pick the one consistent with the closest existing
pattern and state the assumption in your summary. Never invent product behavior (new events,
new config options, new defaults) that the task didn't request.

**Failure honesty:** report failing gates verbatim with the command output. Never mark a
deliverable done with a failing test, a skipped gate, or an unverified claim.

## 8. Behavioral decisions ledger (why the code looks "wrong" but isn't)

- `cmd:play` synchronous before `await` — Safari user-gesture (R5).
- `resumeContent !== false` — opt-out semantics (R6).
- VMAP with `preload="none"` fetches synchronously at the top of the first `cmd:play`
  handler, not in `rebuildSchedule()` — so `vmapPending=true` beats the eager-pause check.
- `playedBreaks.add(id)` after `startBreak()` regardless of success — prevents infinite retry.
- Waterfall ads (`adSourcesMode:'waterfall'`) suppress `cmd:play` between failed source
  attempts (`suppressResumeOnError`).
- `source:set` in ads resets the full session (active flag, contentMedia, overlay, lease,
  vmap state) — partial resets leave the plugin stuck `active=true`.
- HLS `MANIFEST_PARSED` emits `loadedmetadata` on the EventBus so `whenReady()` resolves
  before the DOM event; duration/live flow through native `durationchange`, not custom events.
- ID3 timed metadata uses the native TextTrack API (`enableID3MetadataCues` +
  `enableDateRangeMetadataCues` + `renderTextTracksNatively`, contract locked by
  `engines.test.ts`) — do not add a metadata event.
- UMD plugins must reach the `CorePlayer` constructor before `maybeAutoLoad()`; `Player.init()`
  reads `window.OpenPlayerPlugins` first.
- Fullscreen `'f'` uses `keyTarget` (wrapper), not `e.target`; focus-out handlers use
  `queueMicrotask`, not `setTimeout`.
