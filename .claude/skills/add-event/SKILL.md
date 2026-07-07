---
name: add-event
description: Add, rename, change the payload of, or remove a typed player event in OpenPlayerJS. Use whenever a task involves PlayerEventPayloadMap, EventBus events, cmd:* commands, ads:* events, or "emit/listen to X". Encodes the core-vs-package routing decision, declaration merging, payload conventions, and the safe-removal procedure.
---

# Add / change / remove a player event

Events are the most rule-dense surface in this repo. Every step below exists because skipping
it has broken something before. Work through the steps in order; do not improvise.

## Step 0 — Classify the event

Answer one question: **who emits it?**

| Emitter | Classification | Where the type goes |
| ------- | -------------- | ------------------- |
| `Core`, `StateManager`, surfaces, `DefaultMediaEngine`, track plumbing | **Kernel event** | `PlayerEventPayloadMap` interface in `packages/core/src/core/events.ts` |
| Any other package (ads, player UI, hls, youtube, external plugins) | **Package event** | That package's `src/events.ts` declaration-merging augmentation |

Hard rules:
- Core's map may contain ONLY: lifecycle, `cmd:*` commands, HTML5-native names (`playing`,
  `pause`, `ended`, `loadedmetadata`, …), track events, `source:set`, `player:interacted`.
- If you find yourself editing `packages/core/src/core/events.ts` for an `ads:*`, `hls:*`,
  `ui:*`, or `zoom:*` key — stop, you are in the wrong file.
- If the emitting package is unclear (e.g. core emits it but only ads consumes it), it is a
  kernel event only if core can describe the payload without importing any package concept.
  Otherwise redesign so the package emits it.

## Step 1 — Name and shape the payload

Naming:
- `cmd:<verb>` — player→engine command (`cmd:play`, `cmd:seek`). Kernel only.
- `<pkg-prefix>:<noun>[:<phase>]` — package events (`ads:break:start`, `ui:menu:open`).
- Never a bare untyped string; never dot-notation (`ads.foo` was migrated away — colon only).

Payload conventions (follow existing shapes, don't invent parallel ones):
- A break descriptor is `{ id: string; kind: string }` carried under a `break` property.
- Flat id references use `breakId` (e.g. `ads:quartile: { breakId, quartile: 25|50|75|100 }`).
- Paired events (`X:open`/`X:close`, `X:start`/`X:end`) must both exist and both be emitted —
  the player package relies on pairing (e.g. menu open/close gates the auto-hide timer).
- Error payloads: `{ reason?, error?, message?, owner? }` (see `ads:error`).

## Step 2 — Declare the type

**Kernel event:** add the key to the `PlayerEventPayloadMap` interface in
`packages/core/src/core/events.ts`. Do not convert the interface to a `type` — it is the one
sanctioned interface (declaration merging requires it).

**Package event:** edit (or create) `packages/<pkg>/src/events.ts`:

```ts
import '@openplayerjs/core';

declare module '@openplayerjs/core' {
  // eslint note: this augments core's sanctioned interface
  interface PlayerEventPayloadMap {
    'my:event': MyPayload;
  }
}
```

Then verify the side-effect import exists in `packages/<pkg>/src/index.ts`:

```ts
import './events';
```

If you created `events.ts` and forget this import, everything compiles locally but consumers
of the published package silently lose the typing. Check it explicitly.

If the package keeps a union of its own events (ads has `AdsEvent` in `src/types.ts`), update
it in the same commit — the augmentation and the union must stay in sync.

Special case — HLS: it deliberately has NO `events.ts`. It drives the player through standard
core events only. Before adding an HLS event, confirm a real consumer exists (three HLS events
were removed in Jun 2026 because nothing listened). Duration/live/ID3 metadata already flow
through native channels — do not re-add events for them.

## Step 3 — Emit and consume

- Emit: `ctx.events.emit('my:event', payload)` — payload type is enforced.
- Subscribe in a plugin: `ctx.on('my:event', cb)` (auto-disposed) — never a bare
  `events.on` without registering the unsubscriber in `ctx.dispose`.
- Subscribe in a control: `this.onPlayer('my:event', cb)`.
- Timing rule: if the emit sits anywhere in the `Core.play()` → `cmd:play` path, it must not
  introduce an `await`/microtask before `cmd:play` fires (Safari user-gesture context).

## Step 4 — Test

Minimum tests for a new event (in the owning package's `__tests__/`):
1. Emission: drive the real trigger (not the emit itself) and assert the callback got the
   exact payload shape — assert every property, not just truthiness.
2. Typing: subscribing through `core.on('my:event', (p) => …)` compiles with the precise
   payload type (this is implicit if the test file uses the typed callback).
3. Pairing/cleanup, when applicable: the paired close/end event fires; unsubscribe on destroy.

## Step 5 — Document

- Add the event to the owning package's README event table (payload shape included).
- If the event encodes a behavioral rule (ordering, pairing, sync requirement), add one line
  to that package's `CLAUDE.md`.

## Renaming or changing a payload

This is a **breaking change** for downstream consumers. Stop and confirm with the user
before doing it (manual §7 E1). Once approved:
1. Change type + all emit sites + all subscribe sites in one commit.
2. `grep -rn "'old:name'" packages/` until it returns nothing. If `.claude/CLAUDE.local.md`
   lists other local consumer repos, grep and type-check those per its instructions.
3. Run `pnpm run type-check`.
4. Commit as `feat(<scope>)!:` or include a `BREAKING CHANGE:` footer so the release
   orchestrator bumps major.

## Removing an event

Never trust "no typed listener" as proof of death — tests subscribe by string.
1. `grep -rn "'the:event'" packages/` — check src, `__tests__/`, `e2e/`, `examples/`.
2. Same grep in any local consumer repos listed in `.claude/CLAUDE.local.md`, if present.
3. Only when all hits are the emit itself: delete the emit, the type entry, and the union
   entry together. If the package's `events.ts` becomes empty, delete the file AND its
   `import './events'` line.
4. Run the full test suite; a hanging/timing-out test means you missed a subscriber.

## Final checklist

- [ ] Type declared in the correct home (kernel map vs package augmentation)
- [ ] `import './events'` present in the package's `index.ts` (package events)
- [ ] Package event-union (e.g. `AdsEvent`) updated if one exists
- [ ] Emission test asserts the full payload shape
- [ ] README event table updated
- [ ] `pnpm run type-check && pnpm run lint && pnpm run test` green
- [ ] Breaking change? → user approved + both monorepos type-check + `!`/footer in commit
