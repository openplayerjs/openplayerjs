#!/usr/bin/env node
'use strict';
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
 *   node scripts/orchestrate-release.cjs [options]
 *
 * Options:
 *   --dry-run               Preview without writing anything
 *   --increment major|minor|patch
 *                           Override the conventional-commit bump (applies to
 *                           core; dependents always lock to the resulting version)
 */

const { execSync, spawnSync } = require('child_process');
const { existsSync, readFileSync, rmSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');

// TYPE_SECTIONS and SECTION_ORDER are the single source of truth — shared with
// split-changelog.cjs.  Do not duplicate them here.
const { TYPE_SECTIONS, SECTION_ORDER, SCOPE_TO_PACKAGE } = require('./changelog-config.cjs');

// ─── Commit body helpers ──────────────────────────────────────────────────────

/**
 * Extract meaningful bullet-point lines from a raw git commit body.
 * Strips squash-commit headers ("* type: …"), co-author lines, separator
 * lines, and changelog/deps sub-commit markers that add no value.
 * Returns an indented markdown string, or '' when nothing is worth showing.
 */
function cleanBody(raw) {
  if (!raw?.trim()) return '';
  const lines = raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .filter(l => !/^co-authored-by:/i.test(l))
    .filter(l => !/^-{5,}$/.test(l))
    // squash-commit subject lines inside the body ("* feat: …", "* fix(x): …")
    .filter(l => !/^\* \w+(\([^)]+\))?(!)?:/.test(l))
    // auto-generated sub-entries
    .filter(l => !/^\* docs\(changelog\):/.test(l))
    .filter(l => !/^\* chore\(deps\):/.test(l));

  const bullets = lines.filter(l => l.startsWith('- ')).slice(0, 5);
  return bullets.length ? bullets.map(l => `  ${l}`).join('\n') : '';
}

/**
 * If `commit` is a squash-merge commit whose body contains sub-commit headers
 * ("* type(scope): description"), expand it into one virtual commit per
 * sub-commit header, each carrying only that sub-header's bullet lines as its
 * body.  The PR reference is preserved via the outer commit's hash so the
 * generated link resolves correctly.
 *
 * When no sub-commit headers are found the original commit is returned as-is,
 * so regular (non-squash) commits are unaffected.
 */
function expandSquashCommit(commit) {
  const { hash, author, body } = commit;
  if (!body?.trim()) return [commit];

  const subjectRe = /^\* \w+(\([^)]+\))?(!)?:/;
  const lines = body.split('\n');

  const sections = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (subjectRe.test(trimmed)) {
      if (current) sections.push(current);
      current = { subject: trimmed.slice(2), bullets: [] };
    } else if (current && trimmed.startsWith('- ')) {
      current.bullets.push(trimmed);
    }
  }
  if (current) sections.push(current);

  if (sections.length === 0) return [commit];

  return sections.map(({ subject, bullets }) => ({
    hash,
    subject,
    author,
    body: bullets.join('\n'),
  }));
}

/**
 * Parse the \x1e-delimited git log output produced by the format string
 *   "%H\x1f%s\x1f%an\x1f%b\x1e"
 * and return an array of { hash, subject, author, body } objects.
 */
function parseLog(raw) {
  if (!raw?.trim()) return [];
  return raw
    .split('\x1e')
    .map(r => r.trim())
    .filter(Boolean)
    .map(r => {
      const [hash, subject, author, ...bodyParts] = r.split('\x1f');
      return { hash: hash?.trim(), subject: subject?.trim(), author: author?.trim(), body: bodyParts.join('\x1f').trim() };
    })
    .filter(c => c.hash && c.subject);
}

const ROOT = resolve(__dirname, '..');

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

/**
 * @param {string}                     version      - Version being released (e.g. "3.1.0")
 * @param {string[]}                   pkgs         - Packages included in this release
 * @param {Record<string,string|null>} prevTags     - Last tag for each pkg BEFORE this release
 * @param {Set<string>}                [lockedToCore] - Dependents bumped in lockstep with core
 */
function generateReleaseNotes(version, pkgs, prevTags, lockedToCore = new Set()) {
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const packageSections = [];

  // Tracks (hash:subject) pairs already attributed to a package section so the
  // General section doesn't double-count them.  Using the composite key allows
  // different sub-commits inside the same squash commit to land in different
  // sections (e.g. feat(ads) → ads, chore(repo) → General).
  const covered = new Set();

  const earliestTag = Object.values(prevTags)
    .filter(Boolean)
    .sort()
    .at(0) ?? null;
  const generalRange = earliestTag ? `${earliestTag}..HEAD` : 'HEAD';

  for (const pkg of pkgs) {
    const prevTag = prevTags[pkg];
    const range = prevTag ? `${prevTag}..HEAD` : 'HEAD';

    let rawLog = '';
    try {
      rawLog = execSync(
        `git log "${range}" --pretty=format:"%H\x1f%s\x1f%an\x1f%b\x1e" -- packages/${pkg}/`,
        { encoding: 'utf8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] },
      ).trim();
    } catch { /* package has no history yet */ }

    if (!rawLog && !lockedToCore.has(pkg)) continue;

    const bySection = {};

    for (const rawCommit of parseLog(rawLog)) {
      for (const { hash, subject, author, body } of expandSquashCommit(rawCommit)) {
      covered.add(`${hash}:${subject}`);

      if (/^Merge /.test(subject) || /^chore\(release\):/.test(subject)) continue;

      const ccMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)/);
      if (!ccMatch) continue;

      const [, type, scope, breaking, rawDesc] = ccMatch;

      if (scope && SCOPE_TO_PACKAGE[scope] && SCOPE_TO_PACKAGE[scope].dir !== `packages/${pkg}`) continue;

      const sectionName = breaking ? 'Breaking Changes' : TYPE_SECTIONS[type];
      if (!sectionName) continue;

      const prMatch = rawDesc.match(/\(#(\d+)\)/) || subject.match(/\(#(\d+)\)/);
      const pr = prMatch?.[1];
      const desc = rawDesc.replace(/\s*\(#\d+\)\s*$/, '').trim();

      if (!bySection[sectionName]) bySection[sectionName] = [];

      const scopePrefix = scope ? `**[${scope}]** ` : '';
      const ref = pr
        ? `([#${pr}](https://github.com/openplayerjs/openplayerjs/pull/${pr}))`
        : `(${hash.slice(0, 7)})`;
      const bodyLines = cleanBody(body);
      const entry = bodyLines
        ? `- ${scopePrefix}${desc} ${ref} @${author}\n${bodyLines}`
        : `- ${scopePrefix}${desc} ${ref} @${author}`;
      bySection[sectionName].push(entry);
      } // end expandSquashCommit loop
    } // end parseLog loop

    if (Object.keys(bySection).length === 0 && lockedToCore.has(pkg)) {
      bySection['Version Bump'] = [
        `- Version bump to stay in sync with \`@openplayerjs/core@${version}\``,
      ];
    }

    if (Object.keys(bySection).length === 0) continue;

    let section = `### \`@openplayerjs/${pkg}@${version}\`\n`;
    for (const sectionName of SECTION_ORDER) {
      const items = bySection[sectionName];
      if (items?.length) {
        section += `\n#### ${sectionName}\n\n${items.join('\n')}\n`;
      }
    }
    if (bySection['Version Bump']) {
      section += `\n#### Version Bump\n\n${bySection['Version Bump'].join('\n')}\n`;
    }
    packageSections.push(section);
  }

  let rootLog = '';
  try {
    rootLog = execSync(
      `git log "${generalRange}" --pretty=format:"%H\x1f%s\x1f%an\x1f%b\x1e" -- . ":(exclude)packages/"`,
      { encoding: 'utf8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
  } catch { /* no root-level history */ }

  const rootBySection = {};
  for (const rawCommit of parseLog(rootLog)) {
    for (const { hash, subject, author, body } of expandSquashCommit(rawCommit)) {
      if (covered.has(`${hash}:${subject}`)) continue;
      covered.add(`${hash}:${subject}`);
      if (
        /^Merge /.test(subject) ||
        /^chore\(release\):/.test(subject) ||
        /^docs\(changelog\):/.test(subject)
      ) continue;

      const ccMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)/);
      if (!ccMatch) continue;

      const [, type, scope, breaking, rawDesc] = ccMatch;
      const sectionName = breaking ? 'Breaking Changes' : TYPE_SECTIONS[type];
      if (!sectionName) continue;

      const prMatch = rawDesc.match(/\(#(\d+)\)/) || subject.match(/\(#(\d+)\)/);
      const pr = prMatch?.[1];
      const desc = rawDesc.replace(/\s*\(#\d+\)\s*$/, '').trim();

      if (!rootBySection[sectionName]) rootBySection[sectionName] = [];

      const scopePrefix = scope ? `**[${scope}]** ` : '';
      const ref = pr
        ? `([#${pr}](https://github.com/openplayerjs/openplayerjs/pull/${pr}))`
        : `(${hash.slice(0, 7)})`;
      const bodyLines = cleanBody(body);
      const entry = bodyLines
        ? `- ${scopePrefix}${desc} ${ref} @${author}\n${bodyLines}`
        : `- ${scopePrefix}${desc} ${ref} @${author}`;
      rootBySection[sectionName].push(entry);
    }
  }

  if (Object.keys(rootBySection).length > 0) {
    let section = `### General\n`;
    for (const sectionName of SECTION_ORDER) {
      const items = rootBySection[sectionName];
      if (items?.length) section += `\n#### ${sectionName}\n\n${items.join('\n')}\n`;
    }
    packageSections.push(section);
  }

  if (packageSections.length === 0) {
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
    return execSync(`git describe --tags --match "@openplayerjs/${pkg}@*" --abbrev=0`, {
      encoding: 'utf8',
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

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
  if (!ref) return true;
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

function releasePackage(pkg, forcedVersion) {
  const pkgDir = join(ROOT, 'packages', pkg);

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
  }
}

function restoreDryRunSideEffects(pkgs) {
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
    } catch { /* package may not be tracked yet */ }

    try {
      execSync(`git restore --source=HEAD -- packages/${pkg}/CHANGELOG.md`, {
        cwd: ROOT,
        stdio: 'pipe',
      });
    } catch { /* file may not exist in HEAD yet */ }
  }
}

function mergeReleaseNotesToChangelog(version, pkgs, prevTags = {}, lockedToCore = new Set()) {
  const notesPath = join(ROOT, 'RELEASE_NOTES.md');
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  const date = new Date().toISOString().slice(0, 10);

  const leadPkg = pkgs.includes('core') ? 'core' : pkgs[0];
  const tagUrl = `https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/${leadPkg}%40${version}`;

  let content;
  if (existsSync(notesPath)) {
    content = readFileSync(notesPath, 'utf8').trim();
  } else {
    content = generateReleaseNotes(version, pkgs, prevTags, lockedToCore);
  }

  const existing = existsSync(changelogPath)
    ? readFileSync(changelogPath, 'utf8')
    : '# Changelog\n';

  const body = existing.replace(/^#\s+Changelog\s*\n+/, '').trimStart();
  const entry = `## [${version}](${tagUrl}) (${date})\n\n${content}\n\n`;

  writeFileSync(changelogPath, `# Changelog\n\n${entry}${body}`, 'utf8');

  execSync('git add CHANGELOG.md', { cwd: ROOT });

  if (existsSync(notesPath)) {
    rmSync(notesPath);
    execSync('git rm RELEASE_NOTES.md', { cwd: ROOT });
  }

  execSync(`git commit -m "docs(changelog): v${version}"`, { cwd: ROOT });
  console.log(`\n✔ CHANGELOG.md updated to v${version} and committed.`);
}

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
    const match = out.match(/\.\.\.([\d]+\.[\d]+\.[\d]+)\)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  } finally {
    restoreDryRunSideEffects(['core']);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

checkTagAncestry();

const coreTag = getLastTag('core');
const coreChanged = hasChangesSince('core', coreTag);

if (coreChanged) {
  console.log('Core has changes → releasing core, then all dependents at the same version.\n');

  if (isDryRun) {
    const planned = getPlannedCoreVersion();
    console.log(`Planned version: ${readVersion('core')} → ${planned ?? '(auto-detect)'}`);
    releasePackage('core');
    for (const dep of CORE_DEPENDENTS) {
      const isFirstRelease = getLastTag(dep) === null;
      const targetVersion = isFirstRelease ? readVersion(dep) : (planned ?? undefined);
      if (targetVersion && semverCompare(readVersion(dep), targetVersion) >= 0) {
        console.log(`▸ @openplayerjs/${dep}: already at ${readVersion(dep)} (≥ ${targetVersion}) — skipping`);
        continue;
      }
      releasePackage(dep, targetVersion);
    }
    restoreDryRunSideEffects(['core', ...CORE_DEPENDENTS]);
    console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
  } else {
    const prevTags = Object.fromEntries(
      ['core', ...CORE_DEPENDENTS].map(p => [p, getLastTag(p)]),
    );

    const plannedVersion = getPlannedCoreVersion() ?? readVersion('core');
    mergeReleaseNotesToChangelog(plannedVersion, ['core', ...CORE_DEPENDENTS], prevTags, new Set(CORE_DEPENDENTS));

    releasePackage('core');
    const newVersion = readVersion('core');
    console.log(`\nCore released at ${newVersion} → releasing dependents at same version.\n`);
    for (const dep of CORE_DEPENDENTS) {
      const isFirstRelease = getLastTag(dep) === null;
      const targetVersion = isFirstRelease ? readVersion(dep) : newVersion;
      if (!isFirstRelease && semverCompare(readVersion(dep), targetVersion) >= 0) {
        const cur = readVersion(dep).split('.').map(Number);
        const tgt = targetVersion.split('.').map(Number);
        if (cur[0] === tgt[0] && cur[1] > tgt[1] + 1) {
          console.warn(`  ⚠ WARNING: @openplayerjs/${dep} is ${readVersion(dep)}, which is ${cur[1] - tgt[1]} minor versions ahead of target ${targetVersion}. Investigate.`);
        }
        console.log(`▸ @openplayerjs/${dep}: already at ${readVersion(dep)} (≥ ${targetVersion}) — skipping`);
        continue;
      }
      releasePackage(dep, targetVersion);
    }
  }
} else {
  console.log('Core unchanged → releasing only packages with their own changes.\n');

  const prevTags = Object.fromEntries(
    CORE_DEPENDENTS.map(p => [p, getLastTag(p)]),
  );

  const released = [];
  for (const pkg of CORE_DEPENDENTS) {
    const tag = prevTags[pkg];
    if (hasChangesSince(pkg, tag)) {
      released.push(pkg);
    } else {
      console.log(`▸ @openplayerjs/${pkg}: no changes since ${tag ?? 'start'} — skipping`);
    }
  }

  if (!isDryRun && released.length) {
    const version = readVersion(released[0]);
    mergeReleaseNotesToChangelog(version, released, prevTags);

    for (const pkg of released) {
      releasePackage(pkg);
    }
  }

  if (isDryRun) {
    for (const pkg of released) {
      releasePackage(pkg);
    }
    if (released.length) {
      restoreDryRunSideEffects(released);
      console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
    }
  }
}
