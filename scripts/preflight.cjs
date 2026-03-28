#!/usr/bin/env node
'use strict';
/**
 * scripts/preflight.cjs
 *
 * Pre-release validation gate.  Run via `pnpm run preflight` or as the first
 * step inside orchestrate-release.cjs before any version bump occurs.
 *
 * Checks:
 *   1. Every package under packages/ carries the @openplayerjs/ scope.
 *   2. Every workspace:^ peerDependency resolves to a known sibling package.
 *   3. No sibling package is referenced with a non-workspace range.
 *   4. Every package exposes the required `test` and `release` scripts.
 *   5. Every package has a .release-it.cjs file present.
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed (details printed to stderr)
 */

const { readdirSync, readFileSync, existsSync } = require('fs');
const { join, resolve } = require('path');

const ROOT = resolve(__dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const REQUIRED_SCRIPTS = ['test', 'release'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const failures = [];

function fail(msg) {
  process.stderr.write(`  ✖ ${msg}\n`);
  failures.push(msg);
}

function pass(msg) {
  process.stdout.write(`  ✔ ${msg}\n`);
}

// ─── Discover packages ───────────────────────────────────────────────────────

const pkgDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

/** @type {Map<string, any>} dir → parsed package.json */
const pkgJsonMap = new Map();
for (const dir of pkgDirs) {
  const json = readJson(join(PACKAGES_DIR, dir, 'package.json'));
  if (json) pkgJsonMap.set(dir, json);
}

const knownNames = new Set([...pkgJsonMap.values()].map(j => j.name));

// ─── Run checks ──────────────────────────────────────────────────────────────

process.stdout.write('\nRunning preflight checks…\n\n');

for (const [dir, json] of pkgJsonMap.entries()) {
  const label = json.name ?? dir;
  let pkgOk = true;

  // 1. Scope check
  if (!json.name?.startsWith('@openplayerjs/')) {
    fail(`[${dir}] package.name "${json.name}" must start with @openplayerjs/`);
    pkgOk = false;
  }

  // 2. Required scripts
  for (const script of REQUIRED_SCRIPTS) {
    if (!json.scripts?.[script]) {
      fail(`[${label}] missing required script: "${script}"`);
      pkgOk = false;
    }
  }

  // 3. .release-it.cjs present
  if (!existsSync(join(PACKAGES_DIR, dir, '.release-it.cjs'))) {
    fail(`[${label}] missing .release-it.cjs`);
    pkgOk = false;
  }

  // 4. workspace:^ peer deps resolve to known siblings
  for (const [dep, range] of Object.entries(json.peerDependencies ?? {})) {
    if (range.startsWith('workspace:') && !knownNames.has(dep)) {
      fail(`[${label}] peerDependency "${dep}" (${range}) not found in packages/`);
      pkgOk = false;
    }
  }

  // 5. No sibling referenced outside workspace protocol
  for (const [dep, range] of Object.entries({ ...json.dependencies, ...json.devDependencies })) {
    if (knownNames.has(dep) && !String(range).startsWith('workspace:')) {
      fail(`[${label}] sibling dep "${dep}" uses "${range}" instead of "workspace:^"`);
      pkgOk = false;
    }
  }

  if (pkgOk) pass(`${label}`);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

process.stdout.write('\n');
if (failures.length === 0) {
  process.stdout.write('✔ All preflight checks passed.\n\n');
  process.exit(0);
} else {
  process.stderr.write(`✖ ${failures.length} check(s) failed — fix before releasing.\n\n`);
  process.exit(1);
}
