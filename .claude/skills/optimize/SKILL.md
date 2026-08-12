---
name: optimize
description: Find and safely apply ONE worthwhile code optimization (reuse, simplification, efficiency, or a dead-weight cleanup) somewhere in packages/*/src, with new regression tests proving behavior is unchanged, verified against this repo's own gates. Use on demand — "run an optimization pass", "find something to optimize", "/optimize", "is there anything worth cleaning up" — for a cold, repo-wide sweep with no diff to start from. Not for reviewing an in-progress change (use the `simplify` skill) and not for fixing a known bug (that's G1's bug-fix flow in CLAUDE.md).
---

# Optimize — one safe, tested improvement per pass

This is the manual, on-demand version of a job that could otherwise run unattended on a
schedule. It stayed manual on purpose (see "Why this isn't a CI job" below) — everything else
about it is exactly what an automated version would do: same safety bar, same gates, same
one-change-per-pass discipline. Run it whenever you want a pass, not on any cadence.

## What counts as an "optimization" here

Same definition the `simplify` skill uses — reuse, simplification, efficiency, altitude
cleanups — just applied cold across the repo instead of to a diff already in front of you:

- A genuinely more efficient implementation behind an unchanged public signature (fewer
  allocations, a better algorithm, avoiding redundant work).
- Dead code, duplicated logic, or an unnecessary abstraction with no behavioral role.
- A simplification that measurably reduces bundle size or runtime cost without changing what
  callers observe.

**Not eligible for this skill:** anything that changes a public signature, event name, event
payload shape, default value, or observable behavior — that's a feature or a breaking change,
and needs the user's explicit sign-off per CLAUDE.md E1, not a solo pass.

## The bar (this is what makes it safe to hand back without asking)

All of these, every time — this list is the whole point of the skill, don't skip steps to
save time:

1. **Zero behavior change** (CLAUDE.md gate G3): public API surface identical, no existing
   test assertion touched. If a test needs to change, the candidate isn't a pure optimization
   — drop it and find another.
2. **New regression/characterization tests added** — never edits to existing ones — that
   concretely pin down the behavior around the changed code path. If that path was already
   well-covered, a test proving the optimization didn't change outputs is still required. See
   the `write-tests` skill for this repo's conventions.
3. **Full G0 gate green**: `pnpm run type-check && pnpm run lint && pnpm run build && pnpm run test`
   (coverage stays ≥85% on all four metrics).
4. **No new escape hatches** — same check as the `preship` skill's Tier 1 #3:
   ```sh
   git diff -U0 master... -- packages/ | grep -nE '^\+.*(as any|@ts-ignore|@ts-expect-error|eslint-disable)'
   ```
   Any hit must already be a sanctioned R4 pattern with its justification comment, or the
   candidate is out.
5. **Public API surface verified, not assumed** — same check as `preship` Tier 2: build once
   on a clean `master` baseline and once with the change, and diff `packages/*/dist/types/`.
   For a real optimization these are byte-identical. If they're not, this wasn't a pure
   optimization — revert and reclassify it as a feature.
6. **Touches only what it should.** Allowed: `packages/*/src/**`, `packages/*/__tests__/**`,
   `e2e/**`, `examples/**`. Never: any `package.json`, `pnpm-lock.yaml`, `tsconfig*`,
   `rollup*`, `jest.config.cjs`, `eslint.config.cjs`, `turbo.json`, `commitlint.config.cjs`,
   `CHANGELOG.md`, or anything under `dist/`/`coverage/` (R16 + the E1 shared-config list).
   Check with `git diff --name-only master...` before committing.
7. **Never `packages/youtube`** — it's excluded from the coverage gate (CLAUDE.md §5), so a
   change there can't be verified the same way the rest of this bar assumes.
8. **Exactly one self-contained change per pass.** Resist bundling a second improvement in —
   that's a second pass, with its own tests and its own verification.

## Procedure

1. **Find a candidate.** Look for what the bar above can actually clear: an inefficient hot
   path, obvious duplication, a simplification that doesn't touch signatures. Check CLAUDE.md
   §5's "Known weak spot" note (`ads/src/strategies/csai.ts`, ~74% branches — SIMID/OMID paths
   need real browsers) before picking something there; it's not off-limits, but the test-proof
   requirement (§2 above) is harder to satisfy honestly in that file.
2. **Sanity-check eligibility before writing code**: is the target part of a public export?
   If so, can the change stay purely internal (same signature, same behavior, better
   implementation)? If the improvement requires changing what callers see, stop — it's not
   for this skill.
3. **Implement it.**
4. **Add the regression tests** (bar item 2). Write them to fail on the pre-change code and
   pass on the post-change code where practical — that's what makes "zero behavior change" a
   verified claim instead of an assertion.
5. **Run the G0 gate** (bar item 3). Fix forward on any red; if it can't go green without
   touching a forbidden file (bar item 6) or a test assertion, abandon the candidate.
6. **Run the escape-hatch check** (bar item 4).
7. **Verify the public API diff** (bar item 5) — build on `master`, stash, build on the
   change, diff `dist/types/`.
8. **Check the touched-files list** (bar item 6) against the allow/deny list.
9. **Branch and commit.** Never commit to `master`. Conventional commit per R12 — `perf(scope):
   ...` for a measured efficiency win, `refactor(scope): ...` for a simplification/reuse
   cleanup with no direct perf claim. Body: what changed, why it's safe (point at the gate
   results and the new tests), and the before/after if you measured one.
10. **Stop there.** Don't push, don't open a PR — hand the branch back with a summary of what
    changed and why it's safe, and let the user review, push, and open the PR themselves when
    they're ready. (If they've asked you to push/open the PR in this conversation, that's a
    normal git-push/PR-creation request — follow the usual confirm-first flow, it's just not
    something this skill does on its own.)

## If nothing clears the bar

Say so plainly and stop — don't force a marginal or risky change just to have produced
something. A pass that finds nothing worth doing is a correct, useful outcome, not a failure.

## Why this isn't a CI job

An earlier version of this task was scoped as a scheduled GitHub Actions workflow (Claude
Code running on a weekly cron, opening PRs unattended). It needs an LLM in the loop — there's
no deterministic way to "find a code optimization" the way `audit-fix` deterministically
resolves a CVE — which means an API key or Pro/Max OAuth token wired into repo secrets, and
real API cost on every scheduled run whether or not it finds anything. That tradeoff was
deferred, not rejected: run this skill manually for now; if you want it unattended later, the
gates above are already exactly what that workflow's independent verification step would run
— the only new work at that point is the GitHub Actions wiring itself (see the `audit-fix`
job in `.github/workflows/dependency-audit.yml` for the pattern: separate the AI step from a
deterministic re-verification step, never trust the AI's own self-report).
