#!/usr/bin/env node
'use strict';
/**
 * scripts/audit-fix.cjs
 *
 * Deterministic remediation for `pnpm audit` findings. No AI/network calls beyond the
 * npm registry. Used by:
 *   - the `audit-fix` job in .github/workflows/dependency-audit.yml (auto-commits the
 *     fix onto same-repo PR branches)
 *   - the `audit-fix` skill (.claude/skills/audit-fix/SKILL.md), for manual/agentic runs
 *   - `pnpm run audit:fix`, for local use
 *
 * What it does:
 *   1. Runs `pnpm audit --json`, collects advisories at severity high/critical (matches
 *      the `pnpm audit --audit-level=high` gate in dependency-audit.yml).
 *   2. For each, resolves the LOWEST published version satisfying `patched_versions`
 *      (smallest possible diff), via `npm view <pkg> versions --json`.
 *   3. Refuses to auto-fix (reports, does not touch the file) any advisory whose module
 *      is itself a direct `dependencies` entry (not `devDependencies`) of a published
 *      package. An `overrides` entry only fixes THIS workspace's own lockfile/audit — it
 *      does not change what `npm install`ing that published package resolves for a
 *      downstream consumer. Those need a real version bump in that package's
 *      package.json, which is left for a human (E1 in CLAUDE.md).
 *   4. Writes/updates the resolved version into the `overrides:` block of
 *      pnpm-workspace.yaml (line-based edit — preserves comments/ordering; the block
 *      stays alphabetically sorted, matching its current convention).
 *   5. Runs `pnpm install`, then re-runs `pnpm audit` to confirm the advisory is gone.
 *      If pnpm's `minimumReleaseAge` supply-chain cooldown blocks the resolved version,
 *      that surfaces as an install failure here — this script does NOT add cooldown
 *      exclusions itself; that policy is a deliberate human decision (see
 *      pnpm-workspace.yaml `minimumReleaseAgeExclude`).
 *
 * Never touches `dependencies`/`devDependencies` in any package.json — only
 * pnpm-workspace.yaml `overrides`, consistent with this repo's existing convention
 * (every current override entry exists for exactly this reason).
 *
 * If AUDIT_FIX_SUMMARY_PATH is set, a JSON summary `{ clean, fixed[], skipped[] }` is
 * always written there (see scripts/audit-fix-report.cjs for turning it into a commit
 * message / PR comment).
 *
 * Exit codes:
 *   0 — clean (nothing to fix) or every high/critical advisory was fixed and verified
 *   1 — one or more advisories could not be safely auto-fixed (details on stderr)
 */

const { execFileSync } = require('child_process');
const { readFileSync, writeFileSync, readdirSync } = require('fs');
const { join, resolve } = require('path');

const ROOT = resolve(__dirname, '..');
const WORKSPACE_YAML = join(ROOT, 'pnpm-workspace.yaml');
const PACKAGES_DIR = join(ROOT, 'packages');
const SEVERITY_GATE = new Set(['high', 'critical']);

function sh(cmd, args) {
  return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function fail(msg) {
  process.stderr.write(`  ✖ ${msg}\n`);
}
function pass(msg) {
  process.stdout.write(`  ✔ ${msg}\n`);
}
function info(msg) {
  process.stdout.write(`  · ${msg}\n`);
}

// ─── pnpm audit ────────────────────────────────────────────────────────────

function runAudit() {
  try {
    return JSON.parse(sh('pnpm', ['audit', '--json']));
  } catch (err) {
    // pnpm audit exits non-zero when vulnerabilities are found; stdout still has the JSON.
    const out = /** @type {any} */ (err).stdout;
    if (out) {
      try {
        return JSON.parse(out);
      } catch {
        // fall through to throw below
      }
    }
    throw new Error(`pnpm audit did not return parseable JSON: ${err.message}`);
  }
}

function highOrCriticalAdvisories(auditResult) {
  return Object.values(auditResult.advisories || {}).filter(a => SEVERITY_GATE.has(a.severity));
}

// ─── Minimal semver (no prerelease/build metadata support — not needed here) ──

function parseVersion(v) {
  const core = String(v).split(/[-+]/, 1)[0];
  const parts = core.split('.').map(n => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts;
}
function isPrerelease(v) {
  return /[-+]/.test(String(v));
}
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

/** One AND-clause of comparators, e.g. ">=4.3.1 <5.0.0". */
function satisfiesClause(version, clause) {
  const comparators = clause.trim().split(/\s+/).filter(Boolean);
  if (comparators.length === 0) return true;
  return comparators.every(comp => {
    const m = comp.match(/^(>=|<=|>|<|=)?(.+)$/);
    if (!m) return true;
    const [, op = '=', target] = m;
    const cmp = compareVersions(version, target);
    switch (op) {
      case '>=':
        return cmp >= 0;
      case '<=':
        return cmp <= 0;
      case '>':
        return cmp > 0;
      case '<':
        return cmp < 0;
      default:
        return cmp === 0;
    }
  });
}

/** Full range, possibly with `||` OR-branches. */
function satisfiesRange(version, range) {
  return String(range)
    .split('||')
    .some(clause => satisfiesClause(version, clause));
}

function listPublishedVersions(pkgName) {
  const out = sh('npm', ['view', pkgName, 'versions', '--json']);
  const versions = JSON.parse(out);
  return (Array.isArray(versions) ? versions : [versions]).filter(v => !isPrerelease(v));
}

function resolvePatchedVersion(pkgName, patchedRange) {
  const versions = listPublishedVersions(pkgName).sort(compareVersions);
  return versions.find(v => satisfiesRange(v, patchedRange)) || null;
}

// ─── Guard: published-package `dependencies` need a real bump, not an override ────

function directPublishedDependents(pkgName) {
  const hits = [];
  for (const dir of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    let json;
    try {
      json = JSON.parse(readFileSync(join(PACKAGES_DIR, dir.name, 'package.json'), 'utf8'));
    } catch {
      continue;
    }
    if (json.dependencies && Object.prototype.hasOwnProperty.call(json.dependencies, pkgName)) {
      hits.push(json.name || dir.name);
    }
  }
  return hits;
}

// ─── pnpm-workspace.yaml overrides — line-based edit, preserves comments/order ────

function updateOverrides(updates) {
  const text = readFileSync(WORKSPACE_YAML, 'utf8');
  const lines = text.split('\n');
  const startIdx = lines.findIndex(l => l.trim() === 'overrides:');
  if (startIdx === -1) throw new Error('pnpm-workspace.yaml has no `overrides:` block');

  let endIdx = startIdx + 1;
  while (endIdx < lines.length && /^  \S/.test(lines[endIdx])) endIdx++;
  const blockLines = lines.slice(startIdx + 1, endIdx);

  const entryRe = /^ {2}(['"]?)([^'":]+)\1:\s*(.+)$/;

  for (const [pkg, version] of updates) {
    // Scoped packages (`@scope/name`) must be quoted — `@` is a reserved YAML indicator.
    const quote = pkg.startsWith('@') ? "'" : '';
    const newLine = `  ${quote}${pkg}${quote}: ${version}`;
    const existingIdx = blockLines.findIndex(l => l.match(entryRe)?.[2] === pkg);
    if (existingIdx !== -1) {
      blockLines[existingIdx] = newLine;
      continue;
    }
    let insertAt = blockLines.findIndex(l => {
      const m = l.match(entryRe);
      return m ? m[2] > pkg : false;
    });
    if (insertAt === -1) insertAt = blockLines.length;
    blockLines.splice(insertAt, 0, newLine);
  }

  lines.splice(startIdx + 1, endIdx - (startIdx + 1), ...blockLines);
  writeFileSync(WORKSPACE_YAML, lines.join('\n'));
}

// ─── Main ──────────────────────────────────────────────────────────────────

function writeSummary(summary) {
  const summaryPath = process.env.AUDIT_FIX_SUMMARY_PATH;
  if (summaryPath) writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
}

function main() {
  info('Running pnpm audit...');
  const advisories = highOrCriticalAdvisories(runAudit());

  if (advisories.length === 0) {
    pass('No high/critical advisories found — nothing to fix.');
    writeSummary({ clean: true, fixed: [], skipped: [] });
    process.exit(0);
  }

  info(`Found ${advisories.length} high/critical advisor${advisories.length === 1 ? 'y' : 'ies'}.`);

  const updates = new Map();
  const fixed = [];
  const skipped = [];

  for (const advisory of advisories) {
    const pkgName = advisory.module_name;
    const patchedRange = advisory.patched_versions;
    const from = advisory.findings && advisory.findings[0] && advisory.findings[0].version;
    const meta = { pkgName, id: advisory.id, title: advisory.title, url: advisory.url, from };

    if (!pkgName || !patchedRange || patchedRange === '<0.0.0') {
      skipped.push({ ...meta, reason: 'no patched version has been published yet' });
      continue;
    }

    const dependents = directPublishedDependents(pkgName);
    if (dependents.length > 0) {
      skipped.push({
        ...meta,
        reason: `direct "dependencies" entry of published package(s) ${dependents.join(', ')} — needs a package.json version bump there, an override alone won't reach downstream consumers`,
      });
      continue;
    }

    const target = resolvePatchedVersion(pkgName, patchedRange);
    if (!target) {
      skipped.push({ ...meta, reason: `no published version satisfies "${patchedRange}"` });
      continue;
    }

    updates.set(pkgName, target);
    fixed.push({ ...meta, to: target });
  }

  if (updates.size === 0) {
    fail('No advisory could be auto-fixed via pnpm-workspace.yaml overrides:');
    for (const s of skipped) fail(`${s.pkgName}: ${s.reason}`);
    writeSummary({ clean: false, fixed: [], skipped });
    process.exit(1);
  }

  info(`Updating overrides for: ${[...updates.entries()].map(([k, v]) => `${k}@${v}`).join(', ')}`);
  updateOverrides(updates);

  info('Reinstalling...');
  try {
    sh('pnpm', ['install']);
  } catch (err) {
    fail(
      'pnpm install failed after applying overrides. A resolved version may be blocked by ' +
        'the minimumReleaseAge supply-chain cooldown in pnpm-workspace.yaml — that is ' +
        'intentional and must be resolved by a human (do not add a cooldown exclusion to ' +
        'bypass it), not auto-overridden.',
    );
    process.stderr.write(String(err.stdout || err.message) + '\n');
    writeSummary({ clean: false, fixed: [], skipped: [...skipped, ...fixed.map(f => ({ ...f, reason: 'pnpm install failed post-override (see job log)' }))] });
    process.exit(1);
  }

  info('Re-auditing...');
  const remaining = highOrCriticalAdvisories(runAudit());
  if (remaining.length > 0) {
    fail(`${remaining.length} high/critical advisor${remaining.length === 1 ? 'y' : 'ies'} remain after the fix attempt:`);
    for (const a of remaining) fail(`  ${a.module_name} (${a.id}): ${a.title}`);
    writeSummary({ clean: false, fixed, skipped });
    process.exit(1);
  }

  pass(`Fixed ${fixed.length} advisor${fixed.length === 1 ? 'y' : 'ies'} via pnpm-workspace.yaml overrides:`);
  for (const f of fixed) pass(`  ${f.pkgName} ${f.from ? `${f.from} → ` : '→ '}${f.to}  (${f.url || f.id})`);

  if (skipped.length > 0) {
    info(`${skipped.length} advisor${skipped.length === 1 ? 'y' : 'ies'} left for manual review:`);
    for (const s of skipped) info(`  ${s.pkgName}: ${s.reason}`);
  }

  writeSummary({ clean: false, fixed, skipped });
  process.exit(skipped.length > 0 ? 1 : 0);
}

main();
