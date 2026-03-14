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
import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs';
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

// ─── Changelog generation ────────────────────────────────────────────────────

/** Maps conventional-commit types to human-readable section headers. */
const TYPE_SECTIONS = {
  feat:     'Features',
  fix:      'Bug Fixes',
  perf:     'Performance Improvements',
  revert:   'Reverts',
  refactor: 'Refactoring',
  docs:     'Documentation',
  build:    'Build System',
  chore:    'Chores',
  test:     'Tests',
  style:    'Styles',
  ci:       'CI',
};

/** Display order for sections (most visible first). */
const SECTION_ORDER = [
  'Breaking Changes',
  'Features',
  'Bug Fixes',
  'Performance Improvements',
  'Refactoring',
  'Documentation',
  'Build System',
  'Chores',
  'Tests',
  'Styles',
  'CI',
  'Reverts',
];

/**
 * Generate release notes from git commits, grouped per package and
 * per section type (Features, Bug Fixes, …).
 *
 * @param {string}            version   - Version being released (e.g. "3.1.0")
 * @param {string[]}          pkgs      - Packages included in this release
 * @param {Record<string,string|null>} prevTags - Last tag for each pkg BEFORE this release
 */
function generateReleaseNotes(version, pkgs, prevTags) {
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const packageSections = [];

  for (const pkg of pkgs) {
    const prevTag = prevTags[pkg];
    // After release-it runs the new tag exists on HEAD; use prevTag..HEAD to get
    // only the commits that belong to this release.
    const range = prevTag ? `${prevTag}..HEAD` : 'HEAD';

    let rawLog = '';
    try {
      rawLog = execSync(
        `git log "${range}" --pretty=format:"%H\x1f%s\x1f%an" -- packages/${pkg}/`,
        { encoding: 'utf8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] },
      ).trim();
    } catch { /* package has no history yet */ }

    if (!rawLog) continue;

    const bySection = {};

    for (const line of rawLog.split('\n')) {
      if (!line.trim()) continue;
      const [hash, subject, author] = line.split('\x1f');
      if (!subject) continue;

      // Skip merge commits and release-it's own release commits.
      if (/^Merge /.test(subject) || /^chore\(release\):/.test(subject)) continue;

      const ccMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)/);
      if (!ccMatch) continue;

      const [, type, scope, breaking, rawDesc] = ccMatch;
      const sectionName = breaking ? 'Breaking Changes' : TYPE_SECTIONS[type];
      if (!sectionName) continue;

      // Extract PR number appended by GitHub as "(#N)" in squash/merge commits.
      const prMatch = rawDesc.match(/\(#(\d+)\)/) || subject.match(/\(#(\d+)\)/);
      const pr = prMatch?.[1];
      const desc = rawDesc.replace(/\s*\(#\d+\)\s*$/, '').trim();

      if (!bySection[sectionName]) bySection[sectionName] = [];

      const scopePrefix = scope ? `**[${scope}]** ` : '';
      const ref = pr
        ? `([#${pr}](https://github.com/openplayerjs/openplayerjs/pull/${pr}))`
        : `(${hash.slice(0, 7)})`;
      bySection[sectionName].push(`- ${scopePrefix}${desc} ${ref} @${author}`);
    }

    if (Object.keys(bySection).length === 0) continue;

    let section = `### \`@openplayerjs/${pkg}@${version}\`\n`;
    for (const sectionName of SECTION_ORDER) {
      const items = bySection[sectionName];
      if (items?.length) {
        section += `\n#### ${sectionName}\n\n${items.join('\n')}\n`;
      }
    }
    packageSections.push(section);
  }

  if (packageSections.length === 0) {
    // Nothing parseable — fall back to per-package CHANGELOG links.
    return pkgs
      .map(p => `- [\`@openplayerjs/${p}\`](packages/${p}/CHANGELOG.md)`)
      .join('\n');
  }

  let notes = `_${date}_\n`;
  notes += `\n${packageSections.join('\n')}`;

  return notes.trim();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Compare semver strings. Returns 1 if a > b, -1 if a < b, 0 if equal. */
function semverCompare(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

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

/**
 * Verify that each package's latest tag points to a commit reachable from HEAD.
 * A tag that is NOT an ancestor of HEAD was made on a branch that was never
 * merged (or was force-pushed away), which indicates a past botched release.
 * Logs a warning for each offending tag; does not abort (may be intentional for
 * hotfix branches).
 */
function checkTagAncestry() {
  const allPkgs = ['core', ...CORE_DEPENDENTS];
  for (const pkg of allPkgs) {
    const tag = getLastTag(pkg);
    if (!tag) continue;
    try {
      const tagCommit = execSync(`git rev-list -n 1 "${tag}"`, {
        encoding: 'utf8',
        cwd: ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      execSync(`git merge-base --is-ancestor "${tagCommit}" HEAD`, {
        cwd: ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch {
      console.warn(
        `\n⚠ WARNING: ${tag} points to a commit that is NOT reachable from HEAD.\n` +
        `  It may have been published from a non-master branch — investigate before releasing.\n`,
      );
    }
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
 * Restore package.json version fields and CHANGELOG files after a dry-run.
 * release-it dry-run still executes `npm version` (bumps the version field in
 * package.json) and writes the per-package CHANGELOG. We revert only those
 * side-effects so that other uncommitted changes are not lost.
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

    // Restore per-package CHANGELOG.md written by release-it dry-run.
    try {
      execSync(`git restore --source=HEAD -- packages/${pkg}/CHANGELOG.md`, {
        cwd: ROOT,
        stdio: 'pipe',
      });
    } catch { /* file may not exist in HEAD yet */ }
  }
  // NOTE: root CHANGELOG.md is not written by release-it (infile points to
  // per-package paths), so it does not need to be restored here.
}

/**
 * After a real release, prepend a versioned entry to the root CHANGELOG.md
 * and commit it.
 *
 * Content priority:
 *   1. RELEASE_NOTES.md at the repo root (used for major releases with
 *      hand-crafted highlights — deleted after merging so it can't carry over).
 *   2. Auto-generated MUI-style notes from git commits grouped per package and
 *      section type (Features, Bug Fixes, …).
 *
 * @param {string}                     version   - Version just released (e.g. "3.1.1")
 * @param {string[]}                   pkgs      - Packages included in this release
 * @param {Record<string,string|null>} prevTags  - Per-package tag snapshot taken BEFORE releasing
 */
function mergeReleaseNotesToChangelog(version, pkgs, prevTags = {}) {
  const notesPath = join(ROOT, 'RELEASE_NOTES.md');
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  const date = new Date().toISOString().slice(0, 10);
  const tagUrl = `https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%40${version}`;

  let content;
  if (existsSync(notesPath)) {
    // Hand-crafted notes take precedence (used for major releases).
    content = readFileSync(notesPath, 'utf8').trim();
  } else {
    content = generateReleaseNotes(version, pkgs, prevTags);
  }

  const existing = existsSync(changelogPath)
    ? readFileSync(changelogPath, 'utf8')
    : '# Changelog\n';

  // Strip the leading "# Changelog" header so we can prepend cleanly.
  const body = existing.replace(/^#\s+Changelog\s*\n+/, '').trimStart();
  const entry = `## [${version}](${tagUrl}) (${date})\n\n${content}\n\n`;

  writeFileSync(changelogPath, `# Changelog\n\n${entry}${body}`, 'utf8');

  execSync('git add CHANGELOG.md', { cwd: ROOT });

  // Remove RELEASE_NOTES.md after its content has been merged into CHANGELOG.md
  // so it doesn't accidentally carry over into the next release's entry.
  if (existsSync(notesPath)) {
    rmSync(notesPath);
    execSync('git rm RELEASE_NOTES.md', { cwd: ROOT });
  }

  execSync(`git commit -m "docs(changelog): v${version}"`, { cwd: ROOT });
  console.log(`\n✔ CHANGELOG.md updated to v${version} and committed.`);
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

// Verify existing tags are reachable from HEAD before touching anything.
checkTagAncestry();

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
      const isFirstRelease = getLastTag(dep) === null;
      const targetVersion = isFirstRelease ? readVersion(dep) : (planned ?? undefined);
      // Skip dependents already at or beyond the target version (avoids npm downgrade error).
      if (targetVersion && semverCompare(readVersion(dep), targetVersion) >= 0) {
        const cur = readVersion(dep).split('.').map(Number);
        const tgt = targetVersion.split('.').map(Number);
        if (cur[0] === tgt[0] && cur[1] > tgt[1] + 1) {
          console.warn(`  ⚠ WARNING: @openplayerjs/${dep} is ${readVersion(dep)}, which is ${cur[1] - tgt[1]} minor versions ahead of target ${targetVersion}. This indicates a past botched release — investigate.`);
        }
        console.log(`▸ @openplayerjs/${dep}: already at ${readVersion(dep)} (≥ ${targetVersion}) — skipping`);
        continue;
      }
      releasePackage(dep, targetVersion);
    }
    // Restore all package.json files and CHANGELOGs modified by release-it dry-runs.
    restoreDryRunSideEffects(['core', ...CORE_DEPENDENTS]);
    console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
  } else {
    // Snapshot tags BEFORE releasing so generateReleaseNotes can compute the
    // correct commit range (prevTag..HEAD) after release-it creates new tags.
    const prevTags = Object.fromEntries(
      ['core', ...CORE_DEPENDENTS].map(p => [p, getLastTag(p)]),
    );

    // 1. Release core (it bumps its own package.json).
    releasePackage('core');
    // 2. Read the freshly-written version and lock all dependents to it.
    const newVersion = readVersion('core');
    console.log(`\nCore released at ${newVersion} → releasing dependents at same version.\n`);
    for (const dep of CORE_DEPENDENTS) {
      const isFirstRelease = getLastTag(dep) === null;
      const targetVersion = isFirstRelease ? readVersion(dep) : newVersion;
      // Skip dependents already at or beyond the target version (avoids npm downgrade error).
      if (!isFirstRelease && semverCompare(readVersion(dep), targetVersion) >= 0) {
        const cur = readVersion(dep).split('.').map(Number);
        const tgt = targetVersion.split('.').map(Number);
        if (cur[0] === tgt[0] && cur[1] > tgt[1] + 1) {
          console.warn(`  ⚠ WARNING: @openplayerjs/${dep} is ${readVersion(dep)}, which is ${cur[1] - tgt[1]} minor versions ahead of target ${targetVersion}. This indicates a past botched release — investigate.`);
        }
        console.log(`▸ @openplayerjs/${dep}: already at ${readVersion(dep)} (≥ ${targetVersion}) — skipping`);
        continue;
      }
      releasePackage(dep, targetVersion);
    }
    // 3. Update root CHANGELOG.md (auto-generated or from RELEASE_NOTES.md).
    mergeReleaseNotesToChangelog(newVersion, ['core', ...CORE_DEPENDENTS], prevTags);
  }
} else {
  console.log('Core unchanged → releasing only packages with their own changes.\n');

  // Snapshot tags BEFORE releasing for the same reason as in the core-changed path.
  const prevTags = Object.fromEntries(
    CORE_DEPENDENTS.map(p => [p, getLastTag(p)]),
  );

  const released = [];
  for (const pkg of CORE_DEPENDENTS) {
    const tag = prevTags[pkg];
    if (hasChangesSince(pkg, tag)) {
      releasePackage(pkg);
      released.push(pkg);
    } else {
      console.log(
        `▸ @openplayerjs/${pkg}: no changes since ${tag ?? 'start'} — skipping`,
      );
    }
  }

  if (!isDryRun && released.length) {
    // For dependent-only releases, use the version of the first released package.
    const version = readVersion(released[0]);
    mergeReleaseNotesToChangelog(version, released, prevTags);
  }

  if (isDryRun && released.length) {
    restoreDryRunSideEffects(released);
    console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
  }
}
