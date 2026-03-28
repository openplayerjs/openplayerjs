#!/usr/bin/env node
'use strict';
/**
 * scripts/split-changelog.cjs
 *
 * Reads the root CHANGELOG.md, extracts the latest release section, and:
 *   1. Writes RELEASE_NOTES.generated.md (used by the GitHub Release body).
 *   2. Prepends the scoped entries to each per-package CHANGELOG.md.
 *
 * SCOPE_TO_PACKAGE is imported from scripts/changelog-config.cjs — the
 * single source of truth shared with orchestrate-release.cjs.
 */

const fs   = require('node:fs');
const path = require('node:path');
const { SCOPE_TO_PACKAGE } = require('./changelog-config.cjs');

const ROOT = process.cwd();
const ROOT_CHANGELOG = path.join(ROOT, 'CHANGELOG.md');
const GENERATED_NOTES = path.join(ROOT, 'RELEASE_NOTES.generated.md');

// Matches typical angular preset bullets:
//   - **scope:** message
//   - * **scope:** message
const SCOPE_BULLET_RE = /^\s*[-*]\s+(?:\*\s+)?\*\*([^*]+)\*\*:\s+/;

function readIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function writeFile(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
}

function extractLatestReleaseSection(changelog) {
  const start = changelog.indexOf('\n## ');
  if (start === -1) return null;
  const next = changelog.indexOf('\n## ', start + 4);
  const section = next === -1 ? changelog.slice(start + 1) : changelog.slice(start + 1, next + 1);
  return section.trimEnd();
}

function ensureHeader(filePath, header) {
  if (!fs.existsSync(filePath)) {
    writeFile(filePath, `${header}\n\n`);
    return;
  }
  const existing = readIfExists(filePath);
  if (!existing.startsWith(header)) {
    writeFile(filePath, `${header}\n\n${existing}`);
  }
}

function prependRelease(changelogPath, releaseSection) {
  const existing = readIfExists(changelogPath);
  const firstNl = existing.indexOf('\n');
  if (firstNl === -1) {
    writeFile(changelogPath, `${existing}\n\n${releaseSection}\n`);
    return;
  }
  const header = existing.slice(0, firstNl).trimEnd();
  const rest = existing.slice(firstNl + 1).replace(/^\s+/, '');
  writeFile(changelogPath, `${header}\n\n${releaseSection}\n\n${rest}`);
}

function filterSectionForScope(section, scope) {
  const lines = section.split('\n');
  const out = [];
  let current = [];
  let keepCurrent = false;

  const flush = () => {
    if (!current.length) return;
    if (out.length === 0) out.push(...current);
    else if (keepCurrent) out.push(...current);
    current = [];
    keepCurrent = false;
  };

  for (const line of lines) {
    const isReleaseHeading = line.startsWith('## ');
    const isGroupHeading   = line.startsWith('### ');

    if (isReleaseHeading) {
      flush();
      current = [line];
      keepCurrent = true;
      continue;
    }

    if (isGroupHeading) {
      flush();
      current = [line];
      keepCurrent = false;
      continue;
    }

    const m = line.match(SCOPE_BULLET_RE);
    if (m) {
      const lineScope = m[1].trim();
      if (lineScope === scope) {
        current.push(line);
        keepCurrent = true;
      }
      continue;
    }

    if (keepCurrent) current.push(line);
  }

  flush();
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}

function main() {
  const rootChangelog = readIfExists(ROOT_CHANGELOG);
  if (!rootChangelog) {
    writeFile(GENERATED_NOTES, '');
    process.exit(0);
  }

  const latest = extractLatestReleaseSection(rootChangelog);
  if (!latest) {
    writeFile(GENERATED_NOTES, '');
    process.exit(0);
  }

  const rnParts = [];
  rnParts.push(latest.split('\n')[0]);
  rnParts.push('');

  let any = false;
  for (const [scope, pkg] of Object.entries(SCOPE_TO_PACKAGE)) {
    const filtered = filterSectionForScope(latest, scope);
    if (!filtered) continue;

    const body = filtered.split('\n').slice(1).join('\n').trim();
    if (!body) continue;

    any = true;
    rnParts.push(`### ${pkg.name}`);
    rnParts.push('');
    rnParts.push(body);
    rnParts.push('');
  }

  if (!any) {
    rnParts.push(latest.split('\n').slice(1).join('\n').trim());
    rnParts.push('');
  }

  writeFile(GENERATED_NOTES, rnParts.join('\n').trimEnd() + '\n');

  for (const [scope, pkg] of Object.entries(SCOPE_TO_PACKAGE)) {
    const filtered = filterSectionForScope(latest, scope);
    if (!filtered) continue;

    const pkgChangelogPath = path.join(ROOT, pkg.dir, 'CHANGELOG.md');
    ensureHeader(pkgChangelogPath, '# Changelog');
    prependRelease(pkgChangelogPath, filtered);
  }

  console.log(`✔ wrote ${path.relative(ROOT, GENERATED_NOTES)}`);
}

main();
