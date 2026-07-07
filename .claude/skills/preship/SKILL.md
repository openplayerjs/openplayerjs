---
name: preship
description: Run the full OpenPlayerJS verification gauntlet before committing, opening a PR, or preparing a release. Use when the user says "verify", "is this ready", "run the checks", "prepare the release", or when finishing any non-trivial change. Covers build, type-check, lint, tests+coverage, generated-file hygiene, downstream-consumer checks, e2e, and release dry-run.
---

# Preship — verification gauntlet

Run the applicable tier completely. Report every failure verbatim; never summarize a red
gate as "mostly passing." A tier is green only when every command in it exited 0.

## Tier 1 — every change (always run)

Run these from the repo root, in this order (order matters: build regenerates the types the
tests and dist checks depend on):

```sh
pnpm run type-check
pnpm run lint
pnpm run build
pnpm run test
```

Then verify hygiene:

1. **Coverage** — the `pnpm run test` summary must show ≥85% for branches, functions, lines,
   and statements globally. If a metric dropped below, add tests (see the `write-tests`
   skill); never lower a threshold or add a coverage exclusion — that is an ask-first change.
2. **No generated files in the diff** — `git status --porcelain` must show no changes under
   `dist/`, `coverage/`, `playwright-report/`, `test-results/`, or to `CHANGELOG.md`.
   `pnpm-lock.yaml` may change only if the task added/updated a dependency (which itself
   requires user approval).
3. **No new escape hatches** — on the changed files:
   ```sh
   git diff -U0 master... -- packages/ | grep -nE '^\+.*(as any|@ts-ignore|@ts-expect-error|eslint-disable)'
   ```
   Every hit must match a sanctioned pattern (opaque alias for untyped external libs;
   experimental browser APIs) and carry an inline justification comment. Anything else: fix
   with a typed alternative from CLAUDE.md R4.
4. **Core bundle isolation** — if the change touched core's public surface or any rollup
   config, confirm core is still external:
   ```sh
   grep -l "class EventBus" packages/{hls,ads,player,youtube}/dist/*.js
   ```
   Any hit means core got bundled into a consumer package — a build config regression.

## Tier 2 — core/player public types changed

Trigger: the diff touches any exported type, class signature, or `PlayerEventPayloadMap` in
`packages/core` or `packages/player`.

- Public-surface changes are breaking for downstream consumers that pin exact versions. If
  `.claude/CLAUDE.local.md` lists local consumer repos with verification steps, run them now.
  If a downstream check fails: **do not** edit that repo unless the task included it. Report
  the exact errors to the user and ask how to proceed (fix downstream vs revise the API here).
- Also confirm the API diff is intentional: after `pnpm run build`, run
  `git diff --stat -- '*/dist/types/*' 2>/dev/null || true` mentally against the task — every
  changed declaration file should map to something the task asked for.

## Tier 3 — user-visible behavior changed

Trigger: the change affects what plays, renders, or responds to input in a browser (UI
controls, engines, ads flow, autoplay, fullscreen).

```sh
pnpm run test:e2e
```

- E2E specs live in `e2e/*.spec.ts` and load pages from `examples/*.html`. If the change adds
  user-visible behavior with no covering spec, write one (pattern-match the closest existing
  spec, e.g. `e2e/src-switch.spec.ts`) and add/extend an example page.
- Playwright flakes: retry a failing spec once in isolation
  (`pnpm exec playwright test e2e/foo.spec.ts`) before treating it as a real failure; if it
  fails twice, it is real — report it.

## Tier 4 — release preparation (only when explicitly asked to prepare a release)

Pre-conditions: Tiers 1–3 green, working tree clean, on `master` (or the user named a branch).

```sh
pnpm run preflight
pnpm run release:dry-run
```

Review the dry-run output against these expectations and report discrepancies:
- **Core changed since last tag** → core releases first, then player/hls/ads/youtube ALL at
  the same version (lockstep). One version number across the family.
- **Core unchanged** → only packages with their own commits since their last per-package tag
  appear.
- Bump size matches the conventional commits since the last tag (`feat`→minor, `fix`→patch,
  breaking→major). If the user wants a different bump, the command is
  `release:minor`/`release:major` — never a hand-edited version field.

**Hard stop:** never run `pnpm run release` (or any non-`:dry-run` variant), `npm publish`,
or `git push` without the user explicitly instructing it in this session. Publishing is
irreversible. Present the dry-run summary and wait.

## Reporting format

End with a table: one row per gate actually run, columns = gate, command, result
(pass / fail + one-line reason). Below it, verbatim output for every failure, then the
single next action you recommend. If everything passed, say what tier was run and that the
change is ready for commit/PR/release respectively.
