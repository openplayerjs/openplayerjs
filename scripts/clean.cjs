'use strict';

const fs = require('fs');
const path = require('path');

const rm = (x) => fs.rmSync(x, { recursive: true, force: true });

if (fs.existsSync('packages')) {
  for (const d of fs.readdirSync('packages', { withFileTypes: true })) {
    if (d.isDirectory()) rm(path.join('packages', d.name, 'dist'));
  }
}
