#!/usr/bin/env node
import fs from "node:fs";

const path = "RELEASE_NOTES.md";

if (fs.existsSync(path)) {
  process.exit(0);
}

const template = `## Highlights
- 

## Migration guide
- 

## Notes
- 
`;

fs.writeFileSync(path, template);
console.log("✔ created RELEASE_NOTES.md");