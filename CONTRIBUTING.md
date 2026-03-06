# Contributing guidelines

We appreciate the time you are spending to contribute to this project!

---

## Before you start

### Environment requirements

- **pnpm 10+** — this repo uses `pnpm workspaces`; npm and yarn are not supported
- **Node ≥ 24** — enforced in CI; use a version manager (e.g. `nvm`, `fnm`) to match

Install dependencies from the repo root:

```bash
pnpm install
```

To watch all packages and rebuild on change during development:

```bash
pnpm run watch
```

---

## Checklist before opening a pull request

Run both of these locally — they mirror exactly what CI checks:

```bash
pnpm lint   # ESLint + stylelint
pnpm test   # Jest with coverage thresholds
```

A PR will not be merged if either command fails.

---

## Tests

1. **Every change must pass all existing tests.** New features and bug fixes must include new tests.
2. Coverage thresholds are enforced by Jest and will fail CI if not met:

   | Metric     | Minimum |
   | ---------- | ------- |
   | Lines      | 85%     |
   | Functions  | 85%     |
   | Statements | 85%     |
   | Branches   | 67%     |

3. Test files live in `packages/*/__tests__/`, never inside `src/`.
4. Name test files using the pattern `[package].[feature-scope].test.ts`
   (e.g. `ads.scheduling.test.ts`, `player.controls.progress.branches.test.ts`).
5. Every test file must open with the jsdom environment directive:
   ```ts
   /** @jest-environment jsdom */
   ```
6. Reset the DOM between tests:
   ```ts
   beforeEach(() => {
     document.body.innerHTML = '';
   });
   ```
7. Use `jest.useFakeTimers()` / `jest.useRealTimers()` for any time-dependent logic.
8. Build small factory helpers (`makeCtx()`, `makeMedia()`) instead of large `beforeEach` blocks — it keeps tests readable and composable.
9. Mocks for `@dailymotion/vast-client` and `@dailymotion/vmap` are shared in
   `packages/ads/__tests__/mocks/` — use those files; do not create inline module mocks
   for these dependencies.

---

## TypeScript

- `strict: true` is on globally — no implicit `any`, no loose null checks.
- Use **`type` aliases**, not `interface` — ESLint's `consistent-type-definitions` rule enforces this.
- Use **`import type`** for type-only imports — `consistent-type-imports` is an error.
- Prefix unused parameters and variables with `_` to silence the unused-vars rule
  (e.g. `_err`, `_unused`). Unused private class members must be removed entirely.
- Do not use deprecated APIs — `@typescript-eslint/no-deprecated` is set to error.

### Cross-package imports

Always use the workspace path aliases, never relative paths across packages:

```ts
// correct
import { Core } from '@openplayerjs/core';

// wrong
import { Core } from '../../core/src/index';
```

The aliases are defined in `tsconfig.json` and resolved at build time by the Rollup
`workspaceAlias()` plugin.

---

## Code style

Prettier and ESLint are configured to enforce consistent style. Do not bypass ESLint rules —
any suppression (`// eslint-disable`) must be justified in a code comment.

Key rules to be aware of:

| Rule                                | What it means                                                               |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `consistent-type-definitions`       | Use `type`, not `interface`                                                 |
| `consistent-type-imports`           | Use `import type` for type-only imports                                     |
| `no-unused-private-class-members`   | Remove dead private members                                                 |
| `import/no-cycle`                   | Circular dependencies between packages are not allowed                      |
| `import/no-extraneous-dependencies` | Only declared `dependencies` / `peerDependencies` may be imported in `src/` |
| `no-console`                        | Wrap `console.*` calls in a debug guard (e.g. `if (cfg.debug)`)             |

Prettier settings in brief: single quotes, semicolons, trailing commas (ES5), 120-character print width, LF line endings.

### CSS

- All styles go in `packages/player/src/style.css` — the `dist/` file is generated.
- Properties must be in **alphabetical order** (stylelint enforces this).
- Use short hex values (`#fff` not `#ffffff`) and unitless zero (`0` not `0px`).
- Class names follow the `op-` prefix BEM pattern (e.g. `.op-controls__progress--played`).

---

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/). The changelog is generated
from commit messages, so the type prefix matters:

| Prefix      | Changelog section                       |
| ----------- | --------------------------------------- |
| `feat:`     | Features                                |
| `fix:`      | Bug Fixes                               |
| `perf:`     | Performance Improvements                |
| `refactor:` | Refactoring                             |
| `chore:`    | Internal / tooling (not shown to users) |

Example: `fix(ads): correct VMAP parsing for non-linear breaks`

---

## Build

```bash
pnpm run build        # full build: types + bundles + CSS
pnpm run build:types  # TypeScript declarations only
pnpm run build:bundles # Rollup ESM + UMD bundles
pnpm run build:css    # PostCSS → dist/openplayer.css
```

**ESM packages** (`core`, `player`, `hls`, `ads`) keep `@openplayerjs/core` as an external
peer dependency — do not import it in a way that would cause it to be bundled into ESM output.

**UMD builds** for `hls` and `ads` also keep core external; only the player UMD bundles
everything for standalone CDN use.

---

Thanks again for contributing!
