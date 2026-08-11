#!/usr/bin/env node
'use strict';
/**
 * scripts/test-gap-check.cjs
 *
 * Heuristic PR-diff scanner used by .github/workflows/test-gap-check.yml to flag new
 * player controls, media engines, plugins, and public exports/events that landed
 * without an apparent matching test — the shapes this repo's own gates (G2/G4/G5 in
 * CLAUDE.md) already require tests for.
 *
 * This is deliberately a HEURISTIC, not a coverage tool: it pattern-matches added
 * lines for known shapes, then checks whether the same diff also touches a test file
 * in the same package whose added lines mention the element's name. It errs toward
 * flagging — false positives are cheap (a reviewer double-checks a checklist item);
 * false negatives silently ship untested code, which is the worse failure mode.
 *
 * It NEVER fails the build and NEVER writes test files itself. Output is a markdown
 * checklist (or a single "OK" line) printed to stdout for a PR comment.
 *
 * Usage: node scripts/test-gap-check.cjs <base-ref> <head-ref>
 */

const { execFileSync } = require('child_process');
const { resolve } = require('path');

const ROOT = resolve(__dirname, '..');

function sh(cmd, args) {
  return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const [, , baseRef, headRef] = process.argv;
if (!baseRef || !headRef) {
  process.stderr.write('Usage: node scripts/test-gap-check.cjs <base-ref> <head-ref>\n');
  process.exit(2);
}

const mergeBase = sh('git', ['merge-base', baseRef, headRef]).trim();

function diffNameOnly() {
  return sh('git', ['diff', '--name-only', `${mergeBase}..${headRef}`])
    .split('\n')
    .filter(Boolean);
}

function diffFor(...pathspecs) {
  if (pathspecs.length === 0) return '';
  try {
    return sh('git', ['diff', `${mergeBase}..${headRef}`, '--', ...pathspecs]);
  } catch {
    return '';
  }
}

function addedLines(diffText) {
  return diffText.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));
}

const changedFiles = diffNameOnly();
const testFiles = changedFiles.filter(f => /__tests__\/.*\.test\.ts$/.test(f) || /e2e\/.*\.spec\.ts$/.test(f));
const testDiffText = diffFor(...testFiles);

function packageOf(file) {
  const m = file.match(/^packages\/([^/]+)\//);
  return m ? m[1] : null;
}

/** @type {{kind: 'control'|'engine'|'plugin'|'export'|'event', name: string, file: string, pkg: string}[]} */
const findings = [];
const seen = new Set();

function add(kind, name, file, pkg) {
  const key = `${kind}:${name}:${file}`;
  if (seen.has(key)) return;
  seen.add(key);
  findings.push({ kind, name, file, pkg });
}

for (const file of changedFiles) {
  if (!file.startsWith('packages/') || !file.endsWith('.ts')) continue;
  if (file.includes('__tests__/')) continue;
  const pkg = packageOf(file);
  if (!pkg) continue;

  const added = addedLines(diffFor(file));
  if (added.length === 0) continue; // deleted/renamed-only file

  // (a) New player controls: `class XControl extends BaseControl` or the
  // `export default function createXControl(` factory this repo pairs it with.
  if (pkg === 'player' && file.includes('/controls/')) {
    for (const line of added) {
      const cls = line.match(/export\s+class\s+(\w+)\s+extends\s+BaseControl/);
      if (cls) add('control', cls[1], file, pkg);
      const factory = line.match(/export\s+default\s+function\s+(create\w+)\s*\(/);
      if (factory) add('control', factory[1], file, pkg);
    }
  }

  // (b) New media engines
  for (const line of added) {
    const m = line.match(/export\s+class\s+(\w+)\s+extends\s+BaseMediaEngine/);
    if (m) add('engine', m[1], file, pkg);
  }

  // (d) New plugins
  for (const line of added) {
    const m = line.match(/export\s+class\s+(\w+)\s+implements\s+(?:[\w<>]+\s*,\s*)*PlayerPlugin\b/);
    if (m) add('plugin', m[1], file, pkg);
  }

  // (c) New public exports (index.ts) and new events (events.ts, declaration-merged)
  if (/\/index\.ts$/.test(file)) {
    for (const line of added) {
      const named = line.match(/export\s*\{([^}]+)\}/);
      if (named) {
        for (const raw of named[1].split(',')) {
          const name = raw.trim().split(/\s+as\s+/).pop();
          if (name) add('export', name, file, pkg);
        }
      }
      const decl = line.match(/export\s+(?:class|function|const|type)\s+(\w+)/);
      if (decl) add('export', decl[1], file, pkg);
    }
  }
  if (/\/events\.ts$/.test(file)) {
    for (const line of added) {
      const m = line.match(/^\+\s*'([\w:]+)':/);
      if (m) add('event', m[1], file, pkg);
    }
  }
}

function looksTested(finding) {
  const pkgTestFiles = testFiles.filter(f => f.startsWith(`packages/${finding.pkg}/`));
  if (pkgTestFiles.length === 0) return false;
  const bareName = finding.name.replace(/^create/, '').replace(/Control$/, '');
  return testDiffText.includes(finding.name) || (bareName.length > 2 && testDiffText.includes(bareName));
}

const untested = findings.filter(f => !looksTested(f));

if (untested.length === 0) {
  console.log('OK: no new controls/engines/plugins/exports/events without an apparent matching test.');
  process.exit(0);
}

const byKind = { control: [], engine: [], plugin: [], export: [], event: [] };
for (const f of untested) byKind[f.kind].push(f);

const sections = [
  ['control', 'New player controls — CLAUDE.md gate G4: needs `*.test.ts`, `defaultLabels` (R15), disposables (R9), an a11y label'],
  ['engine', 'New media engines — gate G5: needs `attach()`/`detach()` symmetry tests and a deliberate `priority`'],
  ['plugin', 'New plugins — needs lifecycle + disposal tests (see the `write-tests` skill)'],
  ['export', 'New public exports — gate G2: needs happy-path AND branch tests'],
  ['event', 'New events — see the `add-event` skill: needs an emission test and the `import \'./events\'` side-effect import (R1)'],
];

const lines = ['<!-- test-gap-check-bot -->', '### 🧪 Test coverage checklist (heuristic — verify manually)', ''];
lines.push(
  'This PR appears to add the following without an obvious matching test. This is a',
  'pattern-match heuristic on the diff, not a real coverage check — false positives',
  'happen; use judgment, and check off what\'s actually covered.',
  '',
  'Controls and plugins with user-visible behavior also need an `e2e/*.spec.ts` per',
  'gate G2/G4 — this heuristic only checks whether the element\'s name appears in any',
  'changed test file\'s added lines, it does not distinguish unit from e2e coverage.',
  '',
);

for (const [kind, heading] of sections) {
  if (byKind[kind].length === 0) continue;
  lines.push(`- [ ] **${heading}**`);
  for (const f of byKind[kind]) lines.push(`  - [ ] \`${f.name}\` — ${f.file}`);
}

console.log(lines.join('\n'));
process.exit(0); // advisory only — never fails the build
