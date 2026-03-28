#!/usr/bin/env node
'use strict';

const fs = require('node:fs');

function readIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8').trim();
  } catch {
    return '';
  }
}

const notes = readIfExists('RELEASE_NOTES.md');
if (!notes) process.exit(0);

const changelogPath = 'CHANGELOG.md';
const changelog = readIfExists(changelogPath);
if (!changelog) process.exit(0);

const idx = changelog.indexOf('\n## ');
if (idx === -1) process.exit(0);

const start = idx + 1;
const nextLine = changelog.indexOf('\n', start);
if (nextLine === -1) process.exit(0);

const before = changelog.slice(0, nextLine + 1);
const after = changelog.slice(nextLine + 1);

const markerStart = '<!-- release-notes:start -->';
const markerEnd = '<!-- release-notes:end -->';

const block = `\n${markerStart}\n${notes}\n${markerEnd}\n\n`;

const sectionEnd = changelog.indexOf('\n## ', nextLine + 1);
const latestSection = sectionEnd === -1 ? changelog.slice(nextLine + 1) : changelog.slice(nextLine + 1, sectionEnd);

let newAfter;
const s = latestSection.indexOf(markerStart);
const e = latestSection.indexOf(markerEnd);

if (s !== -1 && e !== -1 && e > s) {
  const latestRebuilt =
    latestSection.slice(0, s) +
    block.trimStart() +
    latestSection.slice(e + markerEnd.length);

  newAfter = sectionEnd === -1 ? latestRebuilt : latestRebuilt + changelog.slice(sectionEnd + 1);
} else {
  newAfter = block + after;
}

fs.writeFileSync(changelogPath, before + newAfter);
console.log('✔ injected RELEASE_NOTES.md into CHANGELOG.md');
