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
 * After the package tags are pushed, one GitHub Release is published so the
 * repository home page reflects the current version:
 *   • Lockstep / same-version cycle → a single umbrella release tagged
 *     `v<version>` (marked "latest") carrying the combined notes.
 *   • Diverged cycle → one release per package on its own
 *     `@openplayerjs/<pkg>@<version>` tag, highest semver marked "latest".
 * The npm publish workflow triggers on `@openplayerjs/*@*` tags only, so the
 * umbrella `v*` tag never re-triggers publishing.
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
const { tmpdir } = require('os');

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

  const earliestTag = Object.values(prevTags)
    .filter(Boolean)
    .sort()
    .at(0) ?? null;
  const generalRange = earliestTag ? `${earliestTag}..HEAD` : 'HEAD';

  // ── Helper: parse one conventional commit into a renderable entry ───────────

  function parseEntry(hash, subject, author, body) {
    if (/^Merge /.test(subject) || /^chore\(release\):/.test(subject) || /^docs\(changelog\):/.test(subject)) {
      return null;
    }
    const ccMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)/);
    if (!ccMatch) return null;
    const [, type, scope, breaking, rawDesc] = ccMatch;
    const sectionName = breaking ? 'Breaking Changes' : TYPE_SECTIONS[type];
    if (!sectionName) return null;
    const prMatch = rawDesc.match(/\(#(\d+)\)/) || subject.match(/\(#(\d+)\)/);
    const pr = prMatch?.[1];
    const desc = rawDesc.replace(/\s*\(#\d+\)\s*$/, '').trim();
    const scopePrefix = scope ? `**[${scope}]** ` : '';
    const ref = pr
      ? `([#${pr}](https://github.com/openplayerjs/openplayerjs/pull/${pr}))`
      : `(${hash.slice(0, 7)})`;
    const bodyLines = cleanBody(body);
    const text = bodyLines
      ? `- ${scopePrefix}${desc} ${ref} @${author}\n${bodyLines}`
      : `- ${scopePrefix}${desc} ${ref} @${author}`;
    return { sectionName, scope, text };
  }

  // ── Pass 1: collect candidate entries per package ───────────────────────────
  // pkgCandidates: Map<pkg, Array<{key, sectionName, scope, text}>>
  // A "key" is `hash:subject` — stable identity for dedup across packages.

  const pkgCandidates = new Map();
  const pkgHasLog = new Set(); // packages that had any git history

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

    if (rawLog) pkgHasLog.add(pkg);

    const candidates = [];
    for (const rawCommit of parseLog(rawLog)) {
      for (const { hash, subject, author, body } of expandSquashCommit(rawCommit)) {
        // Skip commits that explicitly target a DIFFERENT known package.
        const ccMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:/);
        const scope = ccMatch?.[2];
        if (scope && SCOPE_TO_PACKAGE[scope] && SCOPE_TO_PACKAGE[scope].dir !== `packages/${pkg}`) continue;

        const entry = parseEntry(hash, subject, author, body);
        if (!entry) continue;
        candidates.push({ key: `${hash}:${subject}`, ...entry });
      }
    }
    pkgCandidates.set(pkg, candidates);
  }

  // ── Pass 2: identify cross-cutting entries (same key in >1 package) ─────────
  // These will be shown once in General rather than repeated under each package.

  const keyPkgs = new Map(); // key → Set<pkg>
  for (const [pkg, candidates] of pkgCandidates) {
    for (const { key } of candidates) {
      if (!keyPkgs.has(key)) keyPkgs.set(key, new Set());
      keyPkgs.get(key).add(pkg);
    }
  }
  const crossCuttingKeys = new Set(
    [...keyPkgs.entries()]
      .filter(([, set]) => set.size > 1)
      .map(([key]) => key),
  );

  // ── Pass 3: build per-package sections, routing cross-cutting to General ────

  const packageSections = [];
  // covered: keys already attributed to a section (package or General)
  const covered = new Set();
  // generalBySection: deduplicated cross-cutting entries for the General block
  const generalBySection = {};

  for (const pkg of pkgs) {
    const candidates = pkgCandidates.get(pkg) ?? [];
    const bySection = {};

    for (const { key, sectionName, text } of candidates) {
      covered.add(key);
      if (crossCuttingKeys.has(key)) {
        // Deduplicate: use a Set keyed by text so identical bullets appear once.
        if (!generalBySection[sectionName]) generalBySection[sectionName] = new Set();
        generalBySection[sectionName].add(text);
        continue;
      }
      if (!bySection[sectionName]) bySection[sectionName] = [];
      bySection[sectionName].push(text);
    }

    // Packages locked to core with no own changes get a version-bump stub.
    if (Object.keys(bySection).length === 0 && lockedToCore.has(pkg)) {
      bySection['Version Bump'] = [
        `- Version bump to stay in sync with \`@openplayerjs/core@${version}\``,
      ];
    }
    // Skip packages with no changes and no log (not locked).
    if (Object.keys(bySection).length === 0 && !pkgHasLog.has(pkg)) continue;
    // Skip packages with no changes that aren't locked and have log (cross-cutting only).
    if (Object.keys(bySection).length === 0 && !lockedToCore.has(pkg)) continue;

    let section = `### \`@openplayerjs/${pkg}@${version}\`\n`;
    for (const sectionName of SECTION_ORDER) {
      const items = bySection[sectionName];
      if (items?.length) section += `\n#### ${sectionName}\n\n${items.join('\n')}\n`;
    }
    if (bySection['Version Bump']) {
      section += `\n#### Version Bump\n\n${bySection['Version Bump'].join('\n')}\n`;
    }
    packageSections.push(section);
  }

  // ── General section: cross-cutting entries + root-level commits ──────────────

  let rootLog = '';
  try {
    rootLog = execSync(
      `git log "${generalRange}" --pretty=format:"%H\x1f%s\x1f%an\x1f%b\x1e" -- . ":(exclude)packages/"`,
      { encoding: 'utf8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
  } catch { /* no root-level history */ }

  for (const rawCommit of parseLog(rootLog)) {
    for (const { hash, subject, author, body } of expandSquashCommit(rawCommit)) {
      const key = `${hash}:${subject}`;
      if (covered.has(key)) continue;
      covered.add(key);
      const entry = parseEntry(hash, subject, author, body);
      if (!entry) continue;
      if (!generalBySection[entry.sectionName]) generalBySection[entry.sectionName] = new Set();
      generalBySection[entry.sectionName].add(entry.text);
    }
  }

  if (Object.keys(generalBySection).length > 0) {
    let section = `### General\n`;
    for (const sectionName of SECTION_ORDER) {
      const items = generalBySection[sectionName];
      if (items?.size) section += `\n#### ${sectionName}\n\n${[...items].join('\n')}\n`;
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

/** Applies a bump type (major/minor/patch) to a semver string. */
function semverBump(version, bumpType) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bumpType === 'major') return `${major + 1}.0.0`;
  if (bumpType === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * Infers the bump type implied by a version transition.
 * Used to carry the same bump magnitude (major/minor/patch) from core's
 * planned delta to the max-family-version when packages are out of lockstep.
 */
function deriveBumpType(fromVersion, toVersion) {
  const [fMaj, fMin] = fromVersion.split('.').map(Number);
  const [tMaj, tMin] = toVersion.split('.').map(Number);
  if (tMaj > fMaj) return 'major';
  if (tMin > fMin) return 'minor';
  return 'patch';
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

  // The @release-it/conventional-changelog plugin writes to infile even in
  // --dry-run mode. Although infile has been removed from all package configs
  // (so the plugin no longer writes to the root CHANGELOG), this guard ensures
  // any accidental mutation of the root CHANGELOG.md during a dry-run is undone.
  try {
    execSync('git restore --source=HEAD -- CHANGELOG.md', { cwd: ROOT, stdio: 'pipe' });
  } catch { /* file may not exist in HEAD yet */ }
}

function mergeReleaseNotesToChangelog(version, pkgs, prevTags = {}, lockedToCore = new Set(), releaseTag = null) {
  const notesPath = join(ROOT, 'RELEASE_NOTES.md');
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  const date = new Date().toISOString().slice(0, 10);

  const leadPkg = pkgs.includes('core') ? 'core' : pkgs[0];
  // Link the changelog header at the GitHub Release that will back this entry:
  // the umbrella `v<version>` tag when supplied, else the lead package tag.
  const encodedTag = releaseTag ?? `@openplayerjs/${leadPkg}%40${version}`;
  const tagUrl = `https://github.com/openplayerjs/openplayerjs/releases/tag/${encodedTag}`;

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

  // Do NOT commit here — the staged CHANGELOG is picked up by release-it's
  // addFiles config and included in the chore(release) commit.
  console.log(`\n✔ CHANGELOG.md updated to v${version} and staged for release commit.`);

  // Returned so the caller can reuse the exact notes as the GitHub Release body.
  return content;
}

// ─── GitHub Release creation ──────────────────────────────────────────────────

const REPO_SLUG = 'openplayerjs/openplayerjs';

/**
 * Resolve a GitHub token: prefer an ambient GITHUB_TOKEN, else parse it out of
 * the repo-root .env (the same file release-it reads via dotenv).
 */
function getGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  try {
    const env = readFileSync(join(ROOT, '.env'), 'utf8');
    const m = env.match(/^\s*GITHUB_TOKEN\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  } catch { /* no .env present */ }
  return null;
}

/** Current HEAD commit SHA — used as target_commitish for the umbrella tag. */
function headSha() {
  return execSync('git rev-parse HEAD', {
    cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

/**
 * Create a GitHub Release. `body` is the markdown notes. `tagName` must already
 * exist on the remote UNLESS `targetCommitish` is supplied, in which case GitHub
 * creates the tag at that commit when the release is published.
 *
 * Never throws: a failure here must not fail a release whose packages are
 * already published to npm — it logs and returns false. The token is passed to
 * curl via the environment so it never appears in the command line.
 */
function createGitHubRelease({ tagName, name, body, targetCommitish, makeLatest = true }) {
  if (isDryRun) {
    console.log(`  [dry-run] would create GitHub Release ${tagName} (latest=${makeLatest})`);
    return true;
  }
  const token = getGithubToken();
  if (!token) {
    console.warn(`\n⚠ No GITHUB_TOKEN found (env or .env) — skipping GitHub Release ${tagName}.`);
    return false;
  }

  const payload = {
    tag_name: tagName,
    name: name ?? tagName,
    body: body ?? '',
    make_latest: makeLatest ? 'true' : 'false',
    ...(targetCommitish ? { target_commitish: targetCommitish } : {}),
  };
  const tmp = join(tmpdir(), `op-gh-release-${Date.now()}.json`);
  writeFileSync(tmp, JSON.stringify(payload), 'utf8');

  try {
    const out = execSync(
      `curl -sS -w '\\n%{http_code}' -X POST ` +
      `-H "Authorization: Bearer $GH_TOKEN" ` +
      `-H "Accept: application/vnd.github+json" ` +
      `-H "X-GitHub-Api-Version: 2022-11-28" ` +
      `-H "Content-Type: application/json" ` +
      `https://api.github.com/repos/${REPO_SLUG}/releases ` +
      `--data @${JSON.stringify(tmp)}`,
      { cwd: ROOT, encoding: 'utf8', env: { ...process.env, GH_TOKEN: token } },
    );
    const nl = out.lastIndexOf('\n');
    const status = Number(out.slice(nl + 1).trim());
    const respBody = out.slice(0, nl);

    if (status >= 200 && status < 300) {
      let url = null;
      try { url = JSON.parse(respBody).html_url; } catch { /* non-JSON body */ }
      console.log(`\n✔ GitHub Release ${tagName} created${url ? `: ${url}` : ''}`);
      return true;
    }
    if (status === 422 && /already_exists/.test(respBody)) {
      console.warn(`\n⚠ GitHub Release ${tagName} already exists — leaving it as-is.`);
      return false;
    }
    console.warn(`\n⚠ GitHub Release ${tagName} not created (HTTP ${status}): ${respBody.slice(0, 300)}`);
    return false;
  } catch (err) {
    console.warn(`\n⚠ GitHub Release ${tagName} failed: ${err.message}`);
    return false;
  } finally {
    rmSync(tmp, { force: true });
  }
}

/**
 * Run a release-it --dry-run for `pkg` to determine what version it WOULD
 * bump to, then undo any side-effects (file writes) the dry-run made.
 *
 * This replaces the old getPlannedCoreVersion() and is used for EVERY package
 * so that mergeReleaseNotesToChangelog always receives the post-bump version —
 * not the pre-bump version that readVersion() would return.
 */
function getPlannedVersion(pkg) {
  const pkgDir = join(ROOT, 'packages', pkg);
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
    const match = out.match(/\.\.\.(\d+\.\d+\.\d+)\)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  } finally {
    restoreDryRunSideEffects([pkg]);
  }
}

// ─── Exports (for testing / tooling) ─────────────────────────────────────────

module.exports = { generateReleaseNotes, readVersion, getLastTag };

// ─── Main ────────────────────────────────────────────────────────────────────

if (require.main !== module) return; // allow require() without side-effects

checkTagAncestry();

const coreTag = getLastTag('core');
const coreChanged = hasChangesSince('core', coreTag);

if (coreChanged) {
  console.log('Core has changes → releasing core, then all dependents at the same version.\n');

  // ── Compute the lockstep version ─────────────────────────────────────────
  // Problem: packages can drift out of lockstep when only a subset is released
  // between core releases (e.g. player@3.5.2 while core@3.4.3).  Using core's
  // raw planned bump target (3.4.4) as the lockstep version would skip player
  // entirely (3.5.2 ≥ 3.4.4).
  //
  // Fix: take the HIGHEST version currently in the family and apply the same
  // bump magnitude that core's conventional commits imply.
  //   core@3.4.3 + patch commits → planned 3.4.4 → bump type = patch
  //   max(3.4.3, 3.5.2) = 3.5.2  → lockstepVersion = 3.5.3
  // All packages then land at 3.5.3.

  const coreCurrentVersion = readVersion('core');
  const plannedCoreVersion = getPlannedVersion('core'); // dry-run; side-effects restored inside

  const bumpType = increment
    ?? (plannedCoreVersion ? deriveBumpType(coreCurrentVersion, plannedCoreVersion) : 'patch');

  const maxFamilyVersion = ['core', ...CORE_DEPENDENTS]
    .map(p => readVersion(p))
    .reduce((max, v) => semverCompare(v, max) > 0 ? v : max, '0.0.0');

  const lockstepVersion = semverBump(maxFamilyVersion, bumpType);

  console.log(
    `Lockstep version: ${lockstepVersion}` +
    ` (bump=${bumpType}, family max=${maxFamilyVersion}, core=${coreCurrentVersion}→${plannedCoreVersion ?? '?'})\n`,
  );

  if (isDryRun) {
    releasePackage('core', lockstepVersion);
    for (const dep of CORE_DEPENDENTS) {
      const isFirstRelease = getLastTag(dep) === null;
      const targetVersion = isFirstRelease ? readVersion(dep) : lockstepVersion;
      // lockstepVersion is always > maxFamilyVersion ≥ readVersion(dep), so
      // this guard only fires in the unlikely case of a concurrent release.
      if (!isFirstRelease && semverCompare(readVersion(dep), targetVersion) >= 0) {
        console.log(`▸ @openplayerjs/${dep}: already at ${readVersion(dep)} (≥ ${targetVersion}) — skipping`);
        continue;
      }
      releasePackage(dep, targetVersion);
    }
    createGitHubRelease({ tagName: `v${lockstepVersion}`, name: lockstepVersion, makeLatest: true });
    restoreDryRunSideEffects(['core', ...CORE_DEPENDENTS]);
    console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
  } else {
    const prevTags = Object.fromEntries(
      ['core', ...CORE_DEPENDENTS].map(p => [p, getLastTag(p)]),
    );

    const releasedDeps = CORE_DEPENDENTS.filter(dep => {
      const isFirstRelease = getLastTag(dep) === null;
      // lockstepVersion > maxFamilyVersion ≥ readVersion(dep), so all deps
      // satisfy this condition — the filter is a safety net, not a skip rule.
      return isFirstRelease || semverCompare(readVersion(dep), lockstepVersion) < 0;
    });
    const umbrellaNotes = mergeReleaseNotesToChangelog(
      lockstepVersion, ['core', ...releasedDeps], prevTags, new Set(releasedDeps), `v${lockstepVersion}`,
    );

    releasePackage('core', lockstepVersion);
    console.log(`\nCore released at ${lockstepVersion} → releasing dependents at same version.\n`);
    for (const dep of CORE_DEPENDENTS) {
      const isFirstRelease = getLastTag(dep) === null;
      const targetVersion = isFirstRelease ? readVersion(dep) : lockstepVersion;
      if (!isFirstRelease && semverCompare(readVersion(dep), targetVersion) >= 0) {
        console.log(`▸ @openplayerjs/${dep}: already at ${readVersion(dep)} (≥ ${targetVersion}) — skipping`);
        continue;
      }
      releasePackage(dep, targetVersion);
    }

    // All package tags are pushed; publish one umbrella GitHub Release so the
    // repo home page shows the current version as "latest".
    createGitHubRelease({
      tagName: `v${lockstepVersion}`,
      name: lockstepVersion,
      body: umbrellaNotes,
      targetCommitish: headSha(),
      makeLatest: true,
    });
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
    const versions = released.map(pkg => readVersion(pkg));
    const allSameVersion = versions.every(v => v === versions[0]);

    if (allSameVersion) {
      // Common case: all independently-released packages landed on the same
      // version (e.g. manual bump to keep versions in sync).  Write a single
      // shared changelog entry, then release every package.
      //
      // IMPORTANT: readVersion() returns the current (pre-bump) version.  Run a
      // dry-run to discover the POST-bump version so the CHANGELOG header matches
      // what will actually be tagged.  Calling getPlannedVersion() for the first
      // package is enough — all packages in this group bump to the same version.
      const plannedVersion = getPlannedVersion(released[0]) ?? versions[0];
      const umbrellaNotes = mergeReleaseNotesToChangelog(
        plannedVersion, released, prevTags, undefined, `v${plannedVersion}`,
      );
      for (const pkg of released) {
        releasePackage(pkg);
      }
      createGitHubRelease({
        tagName: `v${plannedVersion}`,
        name: plannedVersion,
        body: umbrellaNotes,
        targetCommitish: headSha(),
        makeLatest: true,
      });
    } else {
      // Packages diverged to independent versions.  Write a separate changelog
      // entry for each package so the version header is accurate, then release
      // it immediately.  RELEASE_NOTES.md (if present) is applied to the first
      // entry and auto-deleted; subsequent entries are auto-generated from git.
      //
      // Each package may bump by a different increment, so we need a separate
      // getPlannedVersion() call per package.
      const releasedInfo = [];
      for (let i = 0; i < released.length; i++) {
        const pkg = released[i];
        const plannedVersion = getPlannedVersion(pkg) ?? versions[i];
        const notes = mergeReleaseNotesToChangelog(plannedVersion, [pkg], prevTags);
        releasePackage(pkg);
        releasedInfo.push({ pkg, version: plannedVersion, notes });
      }

      // Versions diverged: one GitHub Release per package on its own tag, with
      // the highest semver marked as the repo's "latest".
      const latestVersion = releasedInfo
        .map(r => r.version)
        .reduce((max, v) => (semverCompare(v, max) > 0 ? v : max), '0.0.0');
      for (const { pkg, version, notes } of releasedInfo) {
        createGitHubRelease({
          tagName: `@openplayerjs/${pkg}@${version}`,
          name: `@openplayerjs/${pkg}@${version}`,
          body: notes,
          makeLatest: version === latestVersion,
        });
      }
    }
  }

  if (isDryRun) {
    for (const pkg of released) {
      releasePackage(pkg);
    }
    if (released.length) {
      console.log(`  [dry-run] would create GitHub Release(s) for: ${released.join(', ')}`);
      restoreDryRunSideEffects(released);
      console.log('\n✔ Dry-run complete. Working tree restored to HEAD.');
    }
  }
}
