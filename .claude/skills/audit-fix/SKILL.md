---
name: audit-fix
description: Resolve a `pnpm audit` (dependency-audit CI job) failure — high/critical CVEs in the dependency tree. Use when asked to fix an audit finding, a CVE, a GHSA advisory, or when the "Dependency audit" GitHub check is red. Covers the deterministic pnpm-workspace.yaml override procedure, what it can't fix, and why the E1 "ask before adding/upgrading a dependency" rule doesn't block this specific case.
---

# Resolving a dependency-audit finding

This procedure is implemented as a script, not just documentation: `scripts/audit-fix.cjs`
does exactly what this page describes, and `.github/workflows/dependency-audit.yml`'s
`audit-fix` job runs it automatically on same-repo PRs when the `audit` job goes red,
pushing the fix onto the PR branch and commenting the result. Run the same script yourself
for a manual fix, a fork PR (which the bot can't push to), or a push-to-master failure
(the bot only acts on PRs) — the procedure and the guardrails are identical either way.

## Why this doesn't need E1 sign-off

Root `CLAUDE.md` E1 lists "adding or upgrading any dependency" as ask-first. This procedure
is exempt from that **only** when both hold:

1. The fix is an entry in `pnpm-workspace.yaml`'s `overrides:` block — never a
   `dependencies`/`devDependencies` edit in any `package.json`.
2. `pnpm install` followed by `pnpm audit --audit-level=high` comes back clean afterward.

That's the same mechanism every existing entry in that block already uses (see the
"Supply-chain security" comment above it) — this skill just makes running it repeatable
instead of ad hoc. Anything that doesn't fit those two constraints (below) still needs a
human, same as any other dependency change.

## Procedure

```sh
pnpm run audit:fix
```

What it does, in order (see `scripts/audit-fix.cjs` for the implementation):

1. Runs `pnpm audit --json`, keeps advisories at `high`/`critical` (matches the
   `--audit-level=high` gate).
2. For each, resolves the **lowest** published version satisfying `patched_versions` —
   smallest possible diff, not necessarily latest.
3. Writes/updates that version into `pnpm-workspace.yaml`'s `overrides:` block
   (alphabetically, matching its existing convention).
4. `pnpm install`, then re-runs `pnpm audit` to confirm the advisory is gone.

Then run the standard gate before committing:

```sh
pnpm run build && pnpm run test
```

(The audit-fix job in CI skips this — the existing `build`/`coveralls` workflows already
re-run on the commit it pushes. A manual run should still verify locally.)

Commit as `chore(deps): ...` (scope `deps`, R12) — `scripts/audit-fix-report.cjs
--format=commit <summary.json>` renders a ready message from the JSON summary if
`AUDIT_FIX_SUMMARY_PATH` was set when you ran the fix.

## What it refuses to touch, and why

- **A finding whose module is a direct `dependencies` entry of a published package**
  (currently: `@dailymotion/vast-client`, `@dailymotion/vmap` in `packages/ads`). An
  `overrides` entry only fixes *this workspace's* lockfile/audit — it does not change what
  `npm install`ing that published package resolves for a downstream consumer, because
  overrides are a pnpm/root-lockfile-only concept. This needs an actual version bump in
  that package's `package.json`, which changes what ships to consumers — ask first, same as
  any dependency change. Cross-check with `pnpm why <pkg>` to see the real path.
- **No published version satisfies the patched range yet.** Wait for the fix to ship
  upstream; there's nothing to pin to.
- **The resolved version is blocked by `minimumReleaseAge`** (the 5-day supply-chain
  cooldown in `pnpm-workspace.yaml`). This surfaces as a `pnpm install` failure. Do **not**
  add the package to `minimumReleaseAgeExclude` to work around it — that list is a
  deliberate, reviewed exception, not a bypass valve. Wait for the cooldown to pass, or ask
  the user if it's urgent enough to warrant a reviewed exclusion.

Any advisory in one of these buckets stays unfixed by design — the `audit` CI job stays red
until a human resolves it, which is the correct outcome, not a bug in the automation.
