---
name: write-tests
description: Write or extend Jest tests for OpenPlayerJS to this repo's exact conventions — makeCore factories, typed internals handles instead of `as any`, media property mocking, fake timers, ads/vast mocks, and coverage-gap targeting. Use when asked to add tests, raise coverage, fix the 85% threshold, or when a bug fix needs its regression test.
---

# Write tests the OpenPlayerJS way

Tests here are the executable spec and are lint-clean (zero `no-explicit-any` warnings in
`__tests__/` — a state that took a 394-warning sweep to reach; do not regress it). Follow
this playbook exactly.

## Step 0 — Target the right gap

- Regression test for a bug fix: write it FIRST, confirm it fails on the pre-fix code
  (`git stash` the fix if needed), then confirm it passes after.
- Coverage work: find the actual uncovered branches, don't guess:
  ```sh
  pnpm run test 2>/dev/null | tail -40          # per-file summary
  # then open coverage/lcov-report/<pkg>/<file>.html or:
  pnpm exec jest packages/<pkg> --coverage --collectCoverageFrom='packages/<pkg>/src/**'
  ```
- Skip what's excluded by design: the youtube package, `umd.ts`, `index.ts` barrels, and the
  documented-unreachable CSAI paths (SIMID/OMID/real-browser HLS) — don't burn time there.

## Step 1 — File placement and skeleton

- Location: `packages/<pkg>/__tests__/`. Naming: `feature.test.ts` for main coverage,
  `feature.branches.test.ts` for edge/error paths, scenario-named files for specific
  behaviors (`player.autoplay.unmute.test.ts`).
- Every file starts with the environment pragma and uses local factories:

```ts
/** @jest-environment jsdom */
import { Core } from '@openplayerjs/core'; // always the package alias, never relative

describe('Feature name', () => {
  function makeCore() {
    const v = document.createElement('video');
    v.src = 'https://example.com/video.mp4';
    document.body.appendChild(v);
    return new Core(v, { plugins: [] }); // explicit empty plugins — no accidental engines
  }

  function nn<T>(v: T | null | undefined): T {
    expect(v).toBeTruthy();
    return v as T;
  }

  beforeEach(() => {
    document.body.innerHTML = '';
  });
});
```

No module-level mutable state. Anything shared goes inside the describe as a factory.

## Step 2 — Standard levers

**Readiness / playback state** (mediaMocks from `__tests__/setup/mediaMocks.ts` is already
loaded globally — play/pause/load/canPlayType are mocked):

```ts
p.events.emit('loadedmetadata');            // resolves whenReady()
p.events.emit('playing');                   // drive state transitions
```

**Synchronous play/pause for UI tests:**

```ts
p.play = jest.fn(async () => { p.events.emit('playing'); }) as unknown as Core['play'];
p.pause = jest.fn(() => { p.emit('cmd:pause'); p.events.emit('pause'); }) as unknown as Core['pause'];
```

**Read-only media properties — always defineProperty, always configurable:**

```ts
Object.defineProperty(p.media, 'duration', { value: 120, configurable: true });
Object.defineProperty(p.media, 'paused', { value: false, configurable: true });
```

**Timers:** `jest.useFakeTimers()` at the top of the describe; drive with
`jest.advanceTimersByTime(ms)`; flush microtask-based logic with `await Promise.resolve()`.
Never a real `setTimeout` wait.

**jsdom quirks:** patch `window.scrollX/scrollY` (the source reads these, not
`pageXOffset`); `queueMicrotask`-based focus handlers need a microtask flush, not a timer.

## Step 3 — Typed access instead of `as any` (mandatory)

| Need | Pattern |
| ---- | ------- |
| `@internal` getters on a plugin | `type AdsPluginInternals = AdsPlugin & { bus: NonNullable<AdsPlugin['bus']>; active: boolean };` then `as unknown as AdsPluginInternals`. `@internal` **methods** are public — call them directly, no cast. |
| `private` members | `as unknown as { member: T }` — an intersection `Class & { privateMember }` reduces to `never`; the double cast is the only way. |
| Partial mock context | `const ctx = {...} as unknown as PluginContext;` — and keep `on:` a single non-overloaded impl so contextual typing works. |
| Window/global stubs | One local shape per file: `const win = window as unknown as { YT?: { Player: jest.Mock } };` assign/delete through it. |
| Custom cue props | `type RawCue = TextTrackCue & { data?: ArrayBuffer; value?: unknown; scte35Out?: string };` |
| Vendor DOM APIs | `type VendorElement = HTMLElement & { webkitEnterFullscreen?: () => void };` |
| Config extras | Cast to the real config type: `{ plugins: [], step: 10 } as PlayerUIConfig` — never `as any`. |
| Wrong-type mock returns | `mockResolvedValue(undefined as unknown as boolean)` when the signature demands it. |

## Step 4 — Package-specific rules

**ads** — never import `@dailymotion/vast-client` or `@dailymotion/vmap`; jest's
`moduleNameMapper` routes them to `packages/ads/__tests__/mocks/` (the mocks export shared
`jest.fn()` instances — reset them in `beforeEach`). VAST XML fixtures live in
`packages/ads/__tests__/fixtures/ads/*.xml`; add a fixture rather than inlining XML. Break
configs passed to typed methods need an explicit annotation
(`const brk: AdsBreakConfig = { at: 0, source: { type: 'VAST', … } }`) or the `type` literal
widens to `string`.

**hls** — mock event names as constants OUTSIDE the `jest.mock()` factory
(`const E = { MANIFEST_PARSED: 'MANIFEST_PARSED' } as const`); get the mock instance via
`engine.getAdapter<HlsMockWithEmit>()` and `adapter!.emit(E.MANIFEST_PARSED, null, {})`.
Keep `.on/.emit` as method calls on the cast object so `this` stays bound.

**youtube / iframe** — stub the adapter, not the network: a `StubAdapter implements
IframeMediaAdapter` with a `Map<string, Function>` listener registry and jest.fn methods;
fake the API global via a typed window handle (`win.YT = { Player: jest.fn(...) }`).

**player controls** — build through the real factory, drive with dispatched DOM events
(`el.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }))`), and assert on DOM state +
emitted player events, not on private fields, unless a private is the only observable.

## Step 5 — Assert like the spec

- Assert exact payloads and full shapes (`toEqual({ id: 'brk-1', kind: 'preroll' })`), not
  `toHaveBeenCalled()` alone.
- Every error/early-return branch you're covering gets its own `test()` with a name that
  states the behavior ("does not resume content between waterfall attempts"), not the
  implementation ("calls startBreak with flag").
- Clean up what you create: if the test attaches engines, mounts UI, or acquires leases,
  destroy the player at the end so cross-test leaks can't hide.

## Step 6 — Verify

```sh
pnpm exec jest packages/<pkg>/__tests__/<file>.test.ts   # the new file, fast loop
pnpm run test                                            # full suite + 85% coverage gates
pnpm run lint                                            # zero new warnings, incl. no-explicit-any
pnpm run type-check
```

A test that passes but emits lint warnings or needs `as any` is not done. A suite that hangs
or times out after your change usually means you removed/renamed an event a test subscribes
to — grep the event name across `packages/` before anything else.
