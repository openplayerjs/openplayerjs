#!/usr/bin/env node
/**
 * Monorepo release orchestrator.
 *
 * Rules:
 *   • Core changed  → release core first, then release ALL dependents at the
 *                     same version (lockstep), so consumers always pin one
 *                     version number across the whole family.
 *   • Core unchanged → release only packages that have their own changes since
 *                     their last per-package tag.
 *
 * Usage:
 *   node scripts/orchestrate-release.mjs [options]
 *
 * Options:
 *   --dry-run               Preview without writing anything
 *   --increment major|minor|patch
 *                           Override the conventional-commit bump (applies to
 *                           core; dependents always lock to the resulting version)
 */

import { execSync, spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ─── CLI args ────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const isDryRun = argv.includes('--dry-run');
const incIdx = argv.indexOf('--increment');
const increment = incIdx !== -1 ? argv[incIdx + 1] : null;

if (increment && !['major', 'minor', 'patch'].includes(increment)) {
  console.error(`Invalid --increment value: "${increment}". Use major, minor or patch.`);
  process.exit(1);
}

// ─── Package graph ───────────────────────────────────────────────────────────

/** Packages that must follow core's version whenever core releases. */
const CORE_DEPENDENTS = ['player', 'hls', 'ads', 'youtube'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readVersion(pkg) {
  return JSON.parse(
    readFileSync(join(ROOT, 'packages', pkg, 'package.json'), 'utf8'),
  ).version;
}

function getLastTag(pkg) {
  try {
    // --tags includes lightweight tags (bootstrap tags are lightweight by default).
    return execSync(`git describe --tags --match "@openplayerjs/${pkg}@*" --abbrev=0`, {
      encoding: 'utf8',
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

function hasChangesSince(pkg, ref) {
  if (!ref) return true; // no baseline tag → treat as changed
  try {
    const out = execSync(`git diff --name-only "${ref}" -- packages/${pkg}/`, {
      encoding: 'utf8',
      cwd: ROOT,
    }).trim();
    return out.length > 0;
  } catch {
    return true;
  }
}

/**
 * Run `pnpm run release` in a package directory.
 * Extra positional args (version, --dry-run, --increment) are forwarded after `--`.
 */
function releasePackage(pkg, forcedVersion) {
  const pkgDir = join(ROOT, 'packages', pkg);

  // Invoke release-it directly via `pnpm exec` to avoid pnpm's `--` forwarding
  // bug: `pnpm run release -- --dry-run` embeds an extra `--` into the script
  // string, causing yargs to treat `--dry-run` as a positional version arg.
  const releaseArgs = [
    'exec', 'dotenv', '-e', '../../.env', '-o', '--',
    'release-it', '--config', '.release-it.cjs', '--ci',
    ...(forcedVersion ? [forcedVersion] : []),
    ...(isDryRun ? ['--dry-run'] : []),
    ...(increment && !forcedVersion ? ['--increment', increment] : []),
  ];

  const label = `@openplayerjs/${pkg}${forcedVersion ? ` @ ${forcedVersion}` : ''}`;
  console.log(`\n▸ ${label}${isDryRun ? ' [dry-run]' : ''}`);
  console.log(`  pnpm ${releaseArgs.join(' ')}`);

  const result = spawnSync('pnpm', releaseArgs, { cwd: pkgDir, stdio: 'inherit' });

  if (result.status !== 0) {
    if (!isDryRun) {
      console.error(`\n✖ Release failed for ${label}`);
      process.exit(result.status ?? 1);
    }
    // In dry-run, a non-zero exit (e.g. "nothing to release") is not fatal.
  }
}

/**
 * Restore package.json version fields and the root CHANGELOG after a dry-run.
 * release-it dry-run still executes `npm version` (bumps the version field in
 * package.json) and writes the CHANGELOG. We revert only those two side-effects
 * using `git restore --worktree` so that other uncommitted changes (e.g. added
 * scripts) are not lost.
 *
 * For package.json we restore only the "version" field in-place using node, so
 * we don't wipe any uncommitted changes to other fields.
 */
function restoreDryRunSideEffects(pkgs) {
  // Restore each package.json's version to what it was before the dry-run by
  // reading the committed version from git and writing only that field back.
  for (const pkg of pkgs) {
    try {
      const pkgJsonPath = join(ROOT, 'packages', pkg, 'package.json');
      const committedJson = execSync(
        `git show HEAD:packages/${pkg}/package.json`,
        { encoding: 'utf8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] },
      );
      const committedVersion = JSON.parse(committedJson).version;
      const current = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
      if (current.version !== committedVersion) {
        current.version = committedVersion;
        writeFileSync(pkgJsonPath, JSON.stringify(current, null, 2) + '\n', 'utf8');
      }
    } catch { /* package may not be tracked yet (first release) */ }
  }
  // Restore the root CHANGELOG wholesale — it is stable and has no pending edits.
  try {
    execSync('git restore --source=HEAD -- CHANGELOG.md', {
      cwd: ROOT,
      stdio: 'pipe',
    });
  } catch { /* nothing to restore */ }
}

/**
 * Capture core's dry-run output and extract the planned next version.
 * Returns null if it cannot be determined.
 */
function getPlannedCoreVersion() {
  const pkgDir = join(ROOT, 'packages', 'core');
  const args = [
    ...(increment ? [`--increment`, increment] : []),
    '--config', '.release-it.cjs',
    '--ci', '--dry-run',
  ];
  try {
    const out = execSync(`pnpm exec dotenv -e ../../.env -o -- release-it ${args.join(' ')} 2>&1`, {
      encoding: 'utf8',
      cwd: pkgDir,
    });
    // Matches "3.0.2...3.1.0)" in the "Let's release" line
    const match = out.match(/\.\.\.([\d]+\.[\d]+\.[\d]+)\)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  } finally {
    // release-it dry-run still executes `npm version` (writes package.json) and writes
    // CHANGELOG. Restore both so the subsequent interactive dry-run starts clean.
    restoreDryRunSideEffects(['core']);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const coreTag = getLastTag('core');
const coreChanged = hasChangesSince('core', coreTag);

if (coreChanged) {
  console.log('Core has changes → releasing core, then all dependents at the same version.\n');

  if (isDryRun) {
    // Determine the planned next core version from a silent dry-run, so we can
    // show each dependent dry-run with the same explicit version.
    const planned = getPlannedCoreVersion();
    console.log(
      `Planned version: ${readVersion('core')} → ${planned ?? '(auto-detect)'}`,
    );
    releasePackage('core');
    for (const dep of CORE_DEPENDENTS) {
      // First-ever release: use the package's own version rather than core's.
      const isFirstRelease = getLastTag(dep) === null;
      releasePackage(dep, isFirstRelease ? readVersion(dep) : (planned ?? undefined));
    }
    // Restore all package.json files and CHANGELOG modified by release-it dry-runs.
    restoreDryRunSideEffects(['core', ...CORE_DEPENDENTS]);
    console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
  } else {
    // 1. Release core (it bumps its own package.json).
    releasePackage('core');
    // 2. Read the freshly-written version and lock all dependents to it.
    const newVersion = readVersion('core');
    console.log(`\nCore released at ${newVersion} → releasing dependents at same version.\n`);
    for (const dep of CORE_DEPENDENTS) {
      // First-ever release: use the package's own version rather than core's.
      const isFirstRelease = getLastTag(dep) === null;
      releasePackage(dep, isFirstRelease ? readVersion(dep) : newVersion);
    }
  }
} else {
  console.log('Core unchanged → releasing only packages with their own changes.\n');

  const released = [];
  for (const pkg of CORE_DEPENDENTS) {
    const tag = getLastTag(pkg);
    if (hasChangesSince(pkg, tag)) {
      releasePackage(pkg);
      released.push(pkg);
    } else {
      console.log(
        `▸ @openplayerjs/${pkg}: no changes since ${tag ?? 'start'} — skipping`,
      );
    }
  }
  if (isDryRun && released.length) {
    restoreDryRunSideEffects(released);
    console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
  }
}
