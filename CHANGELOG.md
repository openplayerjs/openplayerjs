# Changelog

## [3.6.3](https://github.com/openplayerjs/openplayerjs/releases/tag/v3.6.3) (2026-08-18)

_August 18, 2026_

### `@openplayerjs/ads@3.6.3`

#### Performance Improvements

- **[ads]** hoist setSafeHTMLFn's blocked-tags Set to module scope ([#651](https://github.com/openplayerjs/openplayerjs/pull/651)) @rafa8626

### General

#### Bug Fixes

- **[ci]** revert overrides edit when audit-fix's pnpm install fails ([#640](https://github.com/openplayerjs/openplayerjs/pull/640)) @rafa8626

#### Chores

- **[deps]** update node.js to v26.7.0 ([#650](https://github.com/openplayerjs/openplayerjs/pull/650)) @renovate[bot]
- **[deps]** update eslint ([#649](https://github.com/openplayerjs/openplayerjs/pull/649)) @renovate[bot]
- **[deps]** update dependency ip-address to v10.5.0 ([#648](https://github.com/openplayerjs/openplayerjs/pull/648)) @renovate[bot]
- **[deps]** update github/codeql-action action to v4.37.6 ([#647](https://github.com/openplayerjs/openplayerjs/pull/647)) @renovate[bot]
- **[deps]** update dependency ws to v8.21.3 ([#646](https://github.com/openplayerjs/openplayerjs/pull/646)) @renovate[bot]
- **[deps]** update dependency turbo to v2.10.9 ([#645](https://github.com/openplayerjs/openplayerjs/pull/645)) @renovate[bot]
- **[deps]** update dependency postcss to v8.5.26 ([#644](https://github.com/openplayerjs/openplayerjs/pull/644)) @renovate[bot]
- **[deps]** update dependency hls.js to v1.6.18 ([#643](https://github.com/openplayerjs/openplayerjs/pull/643)) @renovate[bot]
- **[deps]** Fixed vulnerability GHSA-2v37-7h3g-55p8 (fce0897) @rafa8626

## [3.6.2](https://github.com/openplayerjs/openplayerjs/releases/tag/v3.6.2) (2026-08-16)

_August 16, 2026_

### `@openplayerjs/player@3.6.2`

#### Performance Improvements

- **[player]** cache SettingsRegistry.list()'s sorted result ([#642](https://github.com/openplayerjs/openplayerjs/pull/642)) @rafa8626

#### Refactoring

- **[player]** dedupe redundant textTracks reads in CaptionsControl ([#641](https://github.com/openplayerjs/openplayerjs/pull/641)) @rafa8626

### General

#### Bug Fixes

- **[ci]** revert overrides edit when audit-fix's pnpm install fails ([#640](https://github.com/openplayerjs/openplayerjs/pull/640)) @rafa8626

#### Chores

- **[deps]** Fixed vulnerability GHSA-2v37-7h3g-55p8 (fce0897) @rafa8626

## [3.6.2](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/ads%403.6.2) (2026-08-12)

_August 12, 2026_

### `@openplayerjs/ads@3.6.2`

#### Refactoring

- **[ads]** dedupe SCTE35-IN break-id resolution in SsaiAdStrategy ([#639](https://github.com/openplayerjs/openplayerjs/pull/639)) @rafa8626
  - All 44 existing ads.ssai.test.ts tests pass unmodified; two of them
  - Added one new regression test for the third call site (the legacy
  - Full G0 gate green: type-check, lint, build, test (1154 tests,
  - No new as any/@ts-ignore/@ts-expect-error/eslint-disable.
  - dist/types/ diffed master vs. this branch: packages/ads/dist/types/
- **[ads]** avoid redundant getVastInputFromBreak calls in AdScheduler ([#638](https://github.com/openplayerjs/openplayerjs/pull/638)) @rafa8626
  - New regression tests spy on AdScheduler.getVastInputFromBreak and
  - Full G0 gate green: type-check, lint, build, test (1152 tests,
  - No new as any/@ts-ignore/@ts-expect-error/eslint-disable.
  - dist/types/ diffed master vs. this branch: packages/ads/dist/types/
  - Touched files: packages/ads/src/schedule.ts and its __tests__ file

### General

#### Features

- **[ci,repo]** auto-resolve audit findings and flag missing tests on PRs (e370277) @rafa8626
  - scripts/audit-fix.cjs + the `audit-fix` job in dependency-audit.yml: when
  - scripts/test-gap-check.cjs + test-gap-check.yml: diffs each PR against its
- **[repo]** add on-demand optimize skill (no CI wiring) (e370277) @rafa8626

#### Bug Fixes

- **[release]** verify github token before publishing and credit real handles ([#629](https://github.com/openplayerjs/openplayerjs/pull/629)) @rafa8626

#### Chores

- **[deps]** update dependency @playwright/test to v1.62.1 ([#630](https://github.com/openplayerjs/openplayerjs/pull/630)) @renovate[bot]
- **[deps]** update dependency postcss to v8.5.25 ([#632](https://github.com/openplayerjs/openplayerjs/pull/632)) @renovate[bot]
- **[deps]** update dependency rollup to v4.62.4 ([#633](https://github.com/openplayerjs/openplayerjs/pull/633)) @renovate[bot]
- **[deps]** bump js-yaml and nanoid overrides for security fixes ([#634](https://github.com/openplayerjs/openplayerjs/pull/634)) @rafa8626
  - js-yaml 4.3.0 -> 4.3.1: patches CVE-2026-59870, quadratic CPU
  - nanoid: pin override to 3.3.17 (was resolving to 3.3.16 via

#### Tests

- **[player]** debounce clickPlay's class check past the ad-intercept flash ([#636](https://github.com/openplayerjs/openplayerjs/pull/636)) @rafa8626

#### CI

- **[ci]** skip unit-test run in Test + Coveralls when no .ts files changed (e370277) @rafa8626
- **[ci]** skip Build and ESLint jobs when the diff can't affect them (e370277) @rafa8626
  - build.yml gates on: *.ts, *.css, tsconfig*.json, rollup.config.mjs,
  - linter.yml gates on the narrower set `pnpm run lint` actually touches:

## [3.6.1](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/player%403.6.1) (2026-08-12)

_August 12, 2026_

### `@openplayerjs/player@3.6.1`

#### Performance Improvements

- **[player]** cache root offset in progress tooltip pointermove handler ([#637](https://github.com/openplayerjs/openplayerjs/pull/637)) @rafa8626
  - New regression test spies on root.getBoundingClientRect and asserts
  - Full G0 gate green: type-check, lint, build, test (1150 tests,
  - No new as any/@ts-ignore/@ts-expect-error/eslint-disable.
  - dist/types/ diffed before vs after: controls/progress.d.ts is
  - Touched files: packages/player/src/controls/progress.ts and its

### General

#### Features

- **[ci,repo]** auto-resolve audit findings and flag missing tests on PRs (e370277) @rafa8626
  - scripts/audit-fix.cjs + the `audit-fix` job in dependency-audit.yml: when
  - scripts/test-gap-check.cjs + test-gap-check.yml: diffs each PR against its
- **[repo]** add on-demand optimize skill (no CI wiring) (e370277) @rafa8626

#### Bug Fixes

- **[release]** verify github token before publishing and credit real handles ([#629](https://github.com/openplayerjs/openplayerjs/pull/629)) @rafa8626

#### Chores

- **[deps]** update dependency @playwright/test to v1.62.1 ([#630](https://github.com/openplayerjs/openplayerjs/pull/630)) @renovate[bot]
- **[deps]** update dependency postcss to v8.5.25 ([#632](https://github.com/openplayerjs/openplayerjs/pull/632)) @renovate[bot]
- **[deps]** update dependency rollup to v4.62.4 ([#633](https://github.com/openplayerjs/openplayerjs/pull/633)) @renovate[bot]
- **[deps]** bump js-yaml and nanoid overrides for security fixes ([#634](https://github.com/openplayerjs/openplayerjs/pull/634)) @rafa8626
  - js-yaml 4.3.0 -> 4.3.1: patches CVE-2026-59870, quadratic CPU
  - nanoid: pin override to 3.3.17 (was resolving to 3.3.16 via

#### Tests

- **[player]** debounce clickPlay's class check past the ad-intercept flash ([#636](https://github.com/openplayerjs/openplayerjs/pull/636)) @rafa8626

#### CI

- **[ci]** skip unit-test run in Test + Coveralls when no .ts files changed (e370277) @rafa8626
- **[ci]** skip Build and ESLint jobs when the diff can't affect them (e370277) @rafa8626
  - build.yml gates on: *.ts, *.css, tsconfig*.json, rollup.config.mjs,
  - linter.yml gates on the narrower set `pnpm run lint` actually touches:

## [3.6.1](https://github.com/openplayerjs/openplayerjs/releases/tag/v3.6.1) (2026-08-04)

_August 3, 2026_

### `@openplayerjs/ads@3.6.1`

#### Bug Fixes

- **[ads]** recover vmap breaks when the parser library throws (919ec28) @rafa8626
- **[repo]** replace dead example video and de-flake live progress assertion (919ec28) @rafa8626

### General

#### Features

- **[release]** publish a GitHub Release per version from the orchestrator ([#603](https://github.com/openplayerjs/openplayerjs/pull/603)) @rafa8626
  - lockstep / same-version cycles -> a single umbrella release tagged
  - diverged cycles -> one release per package on its existing

#### Bug Fixes

- **[deps]** Added exclusion for package to accept vulnerability (c72393f) @rafa8626
- **[deps]** Fixed vulnerabilities: GHSA-mh99-v99m-4gvg, GHSA-2p49-hgcm-8545 and GHSA-v2hh-gcrm-f6hx (13819d8) @rafa8626
- **[deps]** repair broken pnpm-lock.yaml js-yaml entry (cdb81ce) @rafa8626

#### Documentation

- **[repo]** rewrite CLAUDE.md as operating manual and add AI skills ([#602](https://github.com/openplayerjs/openplayerjs/pull/602)) @rafa8626

#### Chores

- **[deps]** update dependency postcss to v8.5.23 [security] ([#626](https://github.com/openplayerjs/openplayerjs/pull/626)) @renovate[bot]
- **[deps]** update dependency prettier to v3.9.6 (5b3cf5b) @renovate[bot]
- **[deps]** Fixed vulnerabilities: GHSA-4cwx-7wf7-3272, GHSA-7p8r-x3mc-p8w7, GHSA-mwp4-54f8-5fhr, GHSA-rgw5-rvv9-x895 (5b3cf5b) @renovate[bot]
- **[deps]** update postcss ([#617](https://github.com/openplayerjs/openplayerjs/pull/617)) @renovate[bot]
- **[deps]** update actions/checkout action to v6.1.0 ([#618](https://github.com/openplayerjs/openplayerjs/pull/618)) @renovate[bot]
- **[deps]** update dependency turbo to v2.10.7 ([#619](https://github.com/openplayerjs/openplayerjs/pull/619)) @renovate[bot]
- **[deps]** update eslint ([#620](https://github.com/openplayerjs/openplayerjs/pull/620)) @renovate[bot]
- **[deps]** update github/codeql-action action to v4.37.3 ([#621](https://github.com/openplayerjs/openplayerjs/pull/621)) @renovate[bot]
- **[deps]** update coverallsapp/github-action action to v2.3.8 ([#622](https://github.com/openplayerjs/openplayerjs/pull/622)) @renovate[bot]
- **[deps]** update dependency rollup to v4.62.3 ([#623](https://github.com/openplayerjs/openplayerjs/pull/623)) @renovate[bot]
- **[deps]** update dependency ts-jest to v29.4.12 ([#624](https://github.com/openplayerjs/openplayerjs/pull/624)) @renovate[bot]
- **[deps]** update dependency @playwright/test to v1.62.0 ([#625](https://github.com/openplayerjs/openplayerjs/pull/625)) @renovate[bot]
- **[deps]** update dependency ws to v8.21.1 ([#613](https://github.com/openplayerjs/openplayerjs/pull/613)) @renovate[bot]
- **[deps]** update actions/setup-node action to v6.5.0 ([#614](https://github.com/openplayerjs/openplayerjs/pull/614)) @renovate[bot]
- **[deps]** update dependency prettier to v3.9.5 ([#612](https://github.com/openplayerjs/openplayerjs/pull/612)) @renovate[bot]
- **[deps]** update dependency postcss to v8.5.19 ([#611](https://github.com/openplayerjs/openplayerjs/pull/611)) @renovate[bot]
- **[deps]** update dependency prettier to v3.9.4 ([#610](https://github.com/openplayerjs/openplayerjs/pull/610)) @renovate[bot]
- **[deps]** update dependency @types/node to v24.13.3 ([#609](https://github.com/openplayerjs/openplayerjs/pull/609)) @renovate[bot]
- **[deps]** update github/codeql-action action to v4.36.3 ([#608](https://github.com/openplayerjs/openplayerjs/pull/608)) @renovate[bot]
- **[deps]** update dependency picomatch to v4.0.5 ([#607](https://github.com/openplayerjs/openplayerjs/pull/607)) @renovate[bot]
- **[deps]** update dependency js-yaml to v4.3.0 ([#601](https://github.com/openplayerjs/openplayerjs/pull/601)) @renovate[bot]
- **[deps]** update postcss ([#600](https://github.com/openplayerjs/openplayerjs/pull/600)) @renovate[bot]
- **[deps]** update dependency fast-uri to v3.1.3 ([#599](https://github.com/openplayerjs/openplayerjs/pull/599)) @renovate[bot]
- **[deps]** update dependency brace-expansion to v5.0.7 ([#598](https://github.com/openplayerjs/openplayerjs/pull/598)) @renovate[bot]

## [3.6.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.6.0) (2026-07-01)

_July 1, 2026_

### `@openplayerjs/player@3.6.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.6.0`

### `@openplayerjs/hls@3.6.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.6.0`

### `@openplayerjs/ads@3.6.0`

#### Refactoring

- **[ads]** centralise constants and split SIMID transport into SimidRpcChannel (c6b238c) @rafa8626
  - Add `constants.ts` with the named thresholds/limits (skip near-end, seek delta,
  - Split the 751-line simid.ts into three files by extracting the module's own code:
  - `simid-protocol.ts` — SIMID 1.2 message constants + wire types.
  - `simid-rpc.ts` — `SimidRpcChannel`: postMessage transport (counter, pending
  - `simid.ts` — `SimidSession extends SimidRpcChannel`: session handshake, media

### `@openplayerjs/youtube@3.6.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.6.0`

### General

#### Bug Fixes

- **[repo]** Removed comments and flag from JSON file (c6b238c) @rafa8626

#### Refactoring

- **[repo]** strict typing, package event hierarchy, and tooling modernization (c6b238c) @rafa8626
  - Remove every `@typescript-eslint/no-explicit-any` in source and test files;
  - `PlayerEventPayloadMap` is now an augmentable `interface` declaring ONLY
  - Moved all `ads:*` events into `packages/ads/src/events.ts`; unified the ad
  - Removed the three HLS events (`media:duration`, `playback:error`,
  - Bump target ES2020 -> ES2022 + explicit `lib` (incl. ESNext.Disposable):

#### Chores

- **[ci]** make Coveralls report-only so small coverage decreases don't block merges (c6b238c) @rafa8626
- **[deps]** update dependency rollup to v4.62.2 ([#596](https://github.com/openplayerjs/openplayerjs/pull/596)) @renovate[bot]
- **[deps]** update dependency @playwright/test to v1.61.1 ([#595](https://github.com/openplayerjs/openplayerjs/pull/595)) @renovate[bot]
- **[deps]** update node.js to v26.3.1 ([#590](https://github.com/openplayerjs/openplayerjs/pull/590)) @renovate[bot]
- **[deps]** update jest ([#594](https://github.com/openplayerjs/openplayerjs/pull/594)) @renovate[bot]
- **[deps]** update eslint ([#593](https://github.com/openplayerjs/openplayerjs/pull/593)) @renovate[bot]
- **[deps]** update dependency @types/node to v24.13.2 ([#589](https://github.com/openplayerjs/openplayerjs/pull/589)) @renovate[bot]
- **[deps]** update postcss ([#591](https://github.com/openplayerjs/openplayerjs/pull/591)) @renovate[bot]
- **[deps]** update turbo monorepo to v2.9.18 ([#592](https://github.com/openplayerjs/openplayerjs/pull/592)) @renovate[bot]

## [3.5.6](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.5.6) (2026-06-21)

_June 21, 2026_

### `@openplayerjs/core@3.5.6`

#### Bug Fixes

- **[core]** set isLive=true immediately when config.duration is Infinity (3f5e34d) @rafa8626

#### Reverts

- **[core]** remove constructor isLive shortcut for config.duration=Infinity (3f5e34d) @rafa8626

### `@openplayerjs/player@3.5.6`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.6`

### `@openplayerjs/hls@3.5.6`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.6`

### `@openplayerjs/ads@3.5.6`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.6`

### `@openplayerjs/youtube@3.5.6`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.6`

### General

#### Features

- **[core,player]** sourceFallback on by default, isLive from Infinity, showLiveCurrentTime config (3f5e34d) @rafa8626
  - sourceFallback defaults to true so multiple <source> tags fall back
  - Core.load() and the src setter reset isLive to false on each new source;
  - PlayerUIConfig gains showLiveCurrentTime (default false); when true the
  - Unit tests updated: sourceFallback default, isLive lifecycle, showLiveCurrentTime
  - E2E: live.spec verifies isLive flag and both hidden/visible currentTime

## [3.5.5](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.5.5) (2026-06-20)

_June 19, 2026_

### `@openplayerjs/player@3.5.5`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.5`

### `@openplayerjs/hls@3.5.5`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.5`

### `@openplayerjs/ads@3.5.5`

#### Bug Fixes

- **[ads]** normalize ads.error payload to include message string and error object ([#586](https://github.com/openplayerjs/openplayerjs/pull/586)) @rafa8626

### `@openplayerjs/youtube@3.5.5`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.5`

### General

#### Bug Fixes

- **[core,ads,hls,player]** fix zero-seek bug, v() caching, and expand meaningful test coverage ([#587](https://github.com/openplayerjs/openplayerjs/pull/587)) @rafa8626
  - core: fix startTime=0 silently skipped by falsy check (if (this._currentTime) → !== 0)
  - ads/csai: cache v() getter in cmd:play/setVolume/setMuted handlers to prevent stale-ref bugs
  - tests: add startTime=0/30 seek tests, shouldForceMute (autoplay/non-autoplay) paths,
  - CLAUDE.md: update coverage gap note (csai.ts is the remaining weak spot)

#### Documentation

- **[repo]** add local dev, release workflow, ads architecture, and event extension guidance ([#585](https://github.com/openplayerjs/openplayerjs/pull/585)) @rafa8626
  - Add Local Development section with all pnpm scripts (build, watch, test, e2e, lint, type-check)
  - Add Releases section documenting the lockstep vs. independent release rules and all release:* commands
  - Add Ads Plugin Architecture section covering adSourcesMode waterfall/playlist, resumeContent opt-out, VMAP deferral, and source:set reset behavior
  - Clarify PlayerEventPayloadMap file path and how to extend typed events
  - Fix packages/player description to include package name (@openplayerjs/player)

#### Chores

- **[deps]** fix audit vulnerabilities via pnpm overrides (3d11205) @rafa8626

## [3.5.4](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.5.4) (2026-06-19)

_June 19, 2026_

### `@openplayerjs/core@3.5.4`

#### Features

- **[core]** add source fallback with source:fallback event (9c160a8) @rafa8626

### `@openplayerjs/player@3.5.4`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.4`

### `@openplayerjs/hls@3.5.4`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.4`

### `@openplayerjs/ads@3.5.4`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.4`

### `@openplayerjs/youtube@3.5.4`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.5.4`

### General

#### Bug Fixes

- **[deps]** Upgraded Node version to 26.3.0 (400e370) @renovate[bot]
- **[deps]** Updated lock (9d1e6b3) @renovate[bot]
- **[repo]** Fix lockstep version skipping packages ahead of core (ca9bb1b) @rafa8626

#### Documentation

- **[docs]** fix CDN links to use scoped packages with @latest (2ec8dca) @rafa8626

#### Chores

- **[repo]** suppress Node deprecation warnings in test and e2e scripts (4a17a5e) @rafa8626
- **[deps]** update dependency @types/node to v24.13.1 ([#583](https://github.com/openplayerjs/openplayerjs/pull/583)) @renovate[bot]
- **[deps]** update turbo monorepo to v2.9.17 ([#582](https://github.com/openplayerjs/openplayerjs/pull/582)) @renovate[bot]
- **[deps]** pin dependencies (400e370) @renovate[bot]
- **[deps]** update rollup to v4.61.1 ([#581](https://github.com/openplayerjs/openplayerjs/pull/581)) @renovate[bot]
- **[deps]** update dependency prettier to v3.8.4 ([#580](https://github.com/openplayerjs/openplayerjs/pull/580)) @renovate[bot]
- **[deps]** update rollup (9d1e6b3) @renovate[bot]
- **[deps]** update actions/checkout digest to df4cb1c ([#574](https://github.com/openplayerjs/openplayerjs/pull/574)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 8aad20d ([#575](https://github.com/openplayerjs/openplayerjs/pull/575)) @renovate[bot]
- **[deps]** update dependency turbo to v2.9.15 ([#570](https://github.com/openplayerjs/openplayerjs/pull/570)) @renovate[bot]
- **[deps]** update dependency stylelint to v17.12.0 ([#571](https://github.com/openplayerjs/openplayerjs/pull/571)) @renovate[bot]

#### Tests

- **[repo]** add source-fallback e2e spec with full player UI (7f4915a) @rafa8626

## [3.5.3](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/player%403.5.3) (2026-05-27)

_May 26, 2026_

### `@openplayerjs/player@3.5.3`

#### Features

- **[repo]** Added new GitHub Action to publish packages without access tokens (4511cd1) @rafa8626

#### Bug Fixes

- **[player]** Set flag to reset current time and dispatched event in play button when setting source; fixes #567 (9f42e64) @rafa8626
- **[repo]** Fixed release scripts to write CHANGELOG file correctly on each release, even per package (96b6ada) @rafa8626

### General

#### Bug Fixes

- **[repo]** Fix lockstep version skipping packages ahead of core (ca9bb1b) @rafa8626

## [3.4.4](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.4.4) (2026-05-27)

_May 26, 2026_

### `@openplayerjs/core@3.4.4`

#### Bug Fixes

- **[core]** Added conditional to avoid loading source when preload is `none`; fixes #562 (48ed8b1) @rafa8626

### `@openplayerjs/hls@3.4.4`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.4`

### `@openplayerjs/ads@3.4.4`

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vast-client to v6.4.5 ([#557](https://github.com/openplayerjs/openplayerjs/pull/557)) @renovate[bot]

### `@openplayerjs/youtube@3.4.4`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.4`

### General

#### Features

- **[repo]** Added new GitHub Action to publish packages without access tokens (4511cd1) @rafa8626

#### Bug Fixes

- **[repo]** Fixed release scripts to write CHANGELOG file correctly on each release, even per package (96b6ada) @rafa8626
- **[player]** Set flag to reset current time and dispatched event in play button when setting source; fixes #567 (9f42e64) @rafa8626
- **[player]** Fixed script to add CHANGELOG when releasing a version; added missing command to update stylesheet in player before release (45932b4) @rafa8626
- **[repo]** Fixed orchestrator script to avoid overriding versions (c899f29) @rafa8626

#### Chores

- **[deps]** Upgraded Node to v26.2.0 (87bdf72) @rafa8626
- **[deps]** update eslint ([#566](https://github.com/openplayerjs/openplayerjs/pull/566)) @renovate[bot]
- **[deps]** update postcss ([#565](https://github.com/openplayerjs/openplayerjs/pull/565)) @renovate[bot]
- **[deps]** update dependency rollup to v4.60.4 ([#564](https://github.com/openplayerjs/openplayerjs/pull/564)) @renovate[bot]
- **[deps]** update dependency turbo to v2.9.14 [security] ([#560](https://github.com/openplayerjs/openplayerjs/pull/560)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 7211b7c ([#555](https://github.com/openplayerjs/openplayerjs/pull/555)) @renovate[bot]
- **[deps]** update dependency ip-address to v10.2.0 ([#559](https://github.com/openplayerjs/openplayerjs/pull/559)) @renovate[bot]
- **[deps]** update dependency @playwright/test to v1.60.0 ([#558](https://github.com/openplayerjs/openplayerjs/pull/558)) @renovate[bot]
- **[deps]** update dependency @types/node to v24.12.4 ([#556](https://github.com/openplayerjs/openplayerjs/pull/556)) @renovate[bot]

## [3.5.2](https://github.com/openplayerjs/openplayerjs/compare/@openplayerjs/player@3.5.1...@openplayerjs/player@3.5.2) (2026-05-18)

### Bug Fixes

- **player:** Fixed script to add CHANGELOG when releasing a version; added missing command to update stylesheet in player before release ([45932b4](https://github.com/openplayerjs/openplayerjs/commit/45932b408d7476f9a1090f27a94ead78e067c07c))

## [3.5.1](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/player%403.5.1) (2026-05-18)

_May 17, 2026_

### `@openplayerjs/player@3.5.1`

#### Bug Fixes

- **[player]** Fixed script to add CHANGELOG when releasing a version; added missing command to update stylesheet in player before release (45932b4) @rafa8626

### General

#### Bug Fixes

- **[repo]** Fixed orchestrator script to avoid overriding versions (c899f29) @rafa8626

## [3.5.1](https://github.com/openplayerjs/openplayerjs/compare/@openplayerjs/player@3.5.0...@openplayerjs/player@3.5.1) (2026-05-18)

### Bug Fixes

- **docs:** Added missing configuration to update CHANGELOG if individual package is released ([b04d5f7](https://github.com/openplayerjs/openplayerjs/commit/b04d5f7eeb7ab51c66b6767d45343476d0cb59be))
- **player:** Fixed failing unit test; switched DOM by CSS in time delimiter to show it ([3063aec](https://github.com/openplayerjs/openplayerjs/commit/3063aeccad8ec589681dacd439aa4c82a9dc8729))
- **player:** Fixed issue when selecting speed not being checked; added missing config to set speeds manually ([8ae756c](https://github.com/openplayerjs/openplayerjs/commit/8ae756c311766f7b0ff22eeaafe719de54cb6bfe))

## [3.5.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/player%403.5.0) (2026-05-18)

_May 17, 2026_

### `@openplayerjs/player@3.5.0`

#### Bug Fixes

- **[player]** Fixed failing unit test; switched DOM by CSS in time delimiter to show it (3063aec) @rafa8626
- **[player]** Fixed issue when selecting speed not being checked; added missing config to set speeds manually (8ae756c) @rafa8626
- **[docs]** Added missing configuration to update CHANGELOG if individual package is released (b04d5f7) @rafa8626

### General

#### Bug Fixes

- **[repo]** Fixed orchestrator script to avoid overriding versions (c899f29) @rafa8626

## [3.5.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/player%403.5.0) (2026-05-17)

_May 17, 2026_

### `@openplayerjs/player@3.5.0`

#### Bug Fixes

- **[player]** Added missing `title` attributes for all controls to show tooltips (d30b35e) @rafa8626
- **[player]** Added missing export in UMD to allow for indexed controls (5b2b23b) @rafa8626
- **[docs]** Unified UMD documentation for better readability and added missing capabilities documentation (474a3be) @rafa8626
- **[docs]** Added new migration for UMD player; fixed inconsistencies (00780fb) @rafa8626
- **[docs]** Fixed UMD names; added more documentation for `registerControl` and `addControl` (c4610ca) @rafa8626
- **[docs]** Removed inconsistencies, and enhanced documentation related to `player` UMD wrapper (51566a7) @rafa8626

---

## [3.4.3](https://github.com/openplayerjs/openplayerjs/compare/@openplayerjs/youtube@3.4.2...@openplayerjs/youtube@3.4.3) (2026-05-17)

### Bug Fixes

- **docs:** Added missing configuration to update CHANGELOG if individual package is released ([b04d5f7](https://github.com/openplayerjs/openplayerjs/commit/b04d5f7eeb7ab51c66b6767d45343476d0cb59be))

## [3.4.3](https://github.com/openplayerjs/openplayerjs/compare/@openplayerjs/ads@3.4.2...@openplayerjs/ads@3.4.3) (2026-05-17)

### Bug Fixes

- **docs:** Added missing configuration to update CHANGELOG if individual package is released ([b04d5f7](https://github.com/openplayerjs/openplayerjs/commit/b04d5f7eeb7ab51c66b6767d45343476d0cb59be))

## [3.4.3](https://github.com/openplayerjs/openplayerjs/compare/@openplayerjs/hls@3.4.2...@openplayerjs/hls@3.4.3) (2026-05-17)

### Bug Fixes

- **docs:** Added missing configuration to update CHANGELOG if individual package is released ([b04d5f7](https://github.com/openplayerjs/openplayerjs/commit/b04d5f7eeb7ab51c66b6767d45343476d0cb59be))

## [3.4.3](https://github.com/openplayerjs/openplayerjs/compare/@openplayerjs/core@3.4.2...@openplayerjs/core@3.4.3) (2026-05-17)

### Bug Fixes

- **docs:** Added missing configuration to update CHANGELOG if individual package is released ([b04d5f7](https://github.com/openplayerjs/openplayerjs/commit/b04d5f7eeb7ab51c66b6767d45343476d0cb59be))

## [3.4.3](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.4.3) (2026-05-17)

_May 17, 2026_

### `@openplayerjs/hls@3.4.3`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.3`

### `@openplayerjs/ads@3.4.3`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.3`

### `@openplayerjs/youtube@3.4.3`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.3`

### General

#### Features

- **[repo]** Added new configuration flags for Renovate bot (d61b3d2) @rafa8626

#### Bug Fixes

- **[docs]** Added missing configuration to update CHANGELOG if individual package is released (b04d5f7) @rafa8626
- **[deps]** Added overrides to remove high severity vulnerabilities (ab50e69) @rafa8626
- **[docs]** Removed inconsistencies, and enhanced documentation related to `player` UMD wrapper (51566a7) @rafa8626
- **[repo]** Fixed MIME type in captions example (bffa4fe) @rafa8626
- **[docs]** Fixed CHANGELOG entry for better readability and removed typo for UMD files across project (55a8691) @rafa8626
- **[docs]** Update legacy v2 docs link to point to GitHub (de08983) @rafa8626
- **[docs]** Updated TOC for migration document to remove 404 pages; fixes #538 (33e3c61) @rafa8626
- **[docs]** Set link for labels to remove 404 page. Fixes #530 (0151389) @rafa8626
- **[docs]** Fixed typos in CHANGELOG (939bb3a) @rafa8626
- **[repo]** Updated videos for examples and increased grace period to render ads in tests (e08f4fc) @rafa8626

#### Chores

- **[deps]** update github/codeql-action digest to 68bde55 ([#544](https://github.com/openplayerjs/openplayerjs/pull/544)) @renovate[bot]
- **[deps]** update dependency brace-expansion to v5.0.6 ([#545](https://github.com/openplayerjs/openplayerjs/pull/545)) @renovate[bot]
- **[deps]** update dependency node to v24.15.0 ([#548](https://github.com/openplayerjs/openplayerjs/pull/548)) @renovate[bot]
- **[deps]** update dependency rollup to v4.60.3 ([#546](https://github.com/openplayerjs/openplayerjs/pull/546)) @renovate[bot]
- **[deps]** update postcss ([#547](https://github.com/openplayerjs/openplayerjs/pull/547)) @renovate[bot]
- **[deps]** update dependency turbo to v2.9.12 ([#549](https://github.com/openplayerjs/openplayerjs/pull/549)) @renovate[bot]
- **[deps]** update dependency basic-ftp to v5.3.1 ([#543](https://github.com/openplayerjs/openplayerjs/pull/543)) @renovate[bot]
- **[deps]** update commitlint to v20.5.3 ([#542](https://github.com/openplayerjs/openplayerjs/pull/542)) @renovate[bot]
- **[deps]** update github/codeql-action digest to e46ed2c ([#541](https://github.com/openplayerjs/openplayerjs/pull/541)) @renovate[bot]
- **[deps]** update dependency rollup to v4.60.2 ([#536](https://github.com/openplayerjs/openplayerjs/pull/536)) @renovate[bot]
- **[deps]** update postcss ([#537](https://github.com/openplayerjs/openplayerjs/pull/537)) @renovate[bot]
- **[deps]** update dependency postcss to v8.5.10 [security] ([#534](https://github.com/openplayerjs/openplayerjs/pull/534)) @renovate[bot]
- **[deps]** update dependency @commitlint/cli to v20.5.2 ([#532](https://github.com/openplayerjs/openplayerjs/pull/532)) @renovate[bot]
- **[deps]** update dependency prettier to v3.8.3 ([#533](https://github.com/openplayerjs/openplayerjs/pull/533)) @renovate[bot]
- **[deps]** update dependency @xmldom/xmldom to v0.9.10 ([#527](https://github.com/openplayerjs/openplayerjs/pull/527)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 95e58e9 ([#526](https://github.com/openplayerjs/openplayerjs/pull/526)) @renovate[bot]
- **[deps]** update actions/setup-node digest to 48b55a0 ([#528](https://github.com/openplayerjs/openplayerjs/pull/528)) @renovate[bot]
- **[deps]** update dependency hls.js to v1.6.16 ([#529](https://github.com/openplayerjs/openplayerjs/pull/529)) @renovate[bot]
- **[deps]** Upgraded basic-ftp package to remove vulnerability (354630e) @rafa8626
- **[deps]** update actions/upload-artifact digest to 043fb46 ([#522](https://github.com/openplayerjs/openplayerjs/pull/522)) @renovate[bot]
- **[deps]** update dependency undici to v7.25.0 ([#525](https://github.com/openplayerjs/openplayerjs/pull/525)) @renovate[bot]
- **[deps]** update dependency defu to v6.1.7 ([#523](https://github.com/openplayerjs/openplayerjs/pull/523)) @renovate[bot]
- **[deps]** update dependency prettier to v3.8.2 ([#524](https://github.com/openplayerjs/openplayerjs/pull/524)) @renovate[bot]
- **[repo]** Removed unnecessary overrides (a6aa8f2) @rafa8626

## [3.5.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/player%403.5.0) (2026-05-16)

_May 16, 2026_

### `@openplayerjs/player@3.5.0`

#### Bug Fixes

- **[player]** Added missing export in UMD to allow for indexed controls (5b2b23b) @rafa8626
- **[player]** Added missing `title` attributes for all controls to show tooltips (d30b35e) @rafa8626

#### Documentation

- **[docs]** Unified UMD documentation for better readability and added missing capabilities documentation (474a3be) @rafa8626
- **[docs]** Added new migration for UMD player; fixed inconsistencies (00780fb) @rafa8626
- **[docs]** Fixed UMD names; added more documentation for `registerControl` and `addControl` (c4610ca) @rafa8626
- **[docs]** Removed inconsistencies, and enhanced documentation related to `player` UMD wrapper (51566a7) @rafa8626

---

## [3.4.2](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/player%403.4.2) (2026-05-16)

_May 16, 2026_

### `@openplayerjs/player@3.4.2`

#### Bug Fixes

- **[docs]** Unified UMD documentation for better readability and added missing capabilities documentation (474a3be) @rafa8626
- **[player]** Added missing export in UMD to allow for indexed controls (5b2b23b) @rafa8626
- **[docs]** Added new migration for UMD player; fixed inconsistencies (00780fb) @rafa8626
- **[docs]** Fixed UMD names; added more documentation for `registerControl` and `addControl` (c4610ca) @rafa8626
- **[docs]** Removed inconsistencies, and enhanced documentation related to `player` UMD wrapper (51566a7) @rafa8626
- **[player]** Added missing `title` attributes for all controls to show tooltips (d30b35e) @rafa8626

### General

#### Features

- **[repo]** Added new configuration flags for Renovate bot (d61b3d2) @rafa8626

#### Bug Fixes

- **[deps]** Added overrides to remove high severity vulnerabilities (ab50e69) @rafa8626
- **[repo]** Fixed MIME type in captions example (bffa4fe) @rafa8626
- **[docs]** Fixed CHANGELOG entry for better readability and removed typo for UMD files across project (55a8691) @rafa8626
- **[docs]** Update legacy v2 docs link to point to GitHub (de08983) @rafa8626
- **[docs]** Updated TOC for migration document to remove 404 pages; fixes #538 (33e3c61) @rafa8626
- **[docs]** Set link for labels to remove 404 page. Fixes #530 (0151389) @rafa8626
- **[docs]** Fixed typos in CHANGELOG (939bb3a) @rafa8626
- **[repo]** Updated videos for examples and increased grace period to render ads in tests (e08f4fc) @rafa8626

#### Chores

- **[deps]** update github/codeql-action digest to 68bde55 ([#544](https://github.com/openplayerjs/openplayerjs/pull/544)) @renovate[bot]
- **[deps]** update dependency brace-expansion to v5.0.6 ([#545](https://github.com/openplayerjs/openplayerjs/pull/545)) @renovate[bot]
- **[deps]** update dependency node to v24.15.0 ([#548](https://github.com/openplayerjs/openplayerjs/pull/548)) @renovate[bot]
- **[deps]** update dependency rollup to v4.60.3 ([#546](https://github.com/openplayerjs/openplayerjs/pull/546)) @renovate[bot]
- **[deps]** update postcss ([#547](https://github.com/openplayerjs/openplayerjs/pull/547)) @renovate[bot]
- **[deps]** update dependency turbo to v2.9.12 ([#549](https://github.com/openplayerjs/openplayerjs/pull/549)) @renovate[bot]
- **[deps]** update dependency basic-ftp to v5.3.1 ([#543](https://github.com/openplayerjs/openplayerjs/pull/543)) @renovate[bot]
- **[deps]** update commitlint to v20.5.3 ([#542](https://github.com/openplayerjs/openplayerjs/pull/542)) @renovate[bot]
- **[deps]** update github/codeql-action digest to e46ed2c ([#541](https://github.com/openplayerjs/openplayerjs/pull/541)) @renovate[bot]
- **[deps]** update dependency rollup to v4.60.2 ([#536](https://github.com/openplayerjs/openplayerjs/pull/536)) @renovate[bot]
- **[deps]** update postcss ([#537](https://github.com/openplayerjs/openplayerjs/pull/537)) @renovate[bot]
- **[deps]** update dependency postcss to v8.5.10 [security] ([#534](https://github.com/openplayerjs/openplayerjs/pull/534)) @renovate[bot]
- **[deps]** update dependency @commitlint/cli to v20.5.2 ([#532](https://github.com/openplayerjs/openplayerjs/pull/532)) @renovate[bot]
- **[deps]** update dependency prettier to v3.8.3 ([#533](https://github.com/openplayerjs/openplayerjs/pull/533)) @renovate[bot]
- **[deps]** update dependency @xmldom/xmldom to v0.9.10 ([#527](https://github.com/openplayerjs/openplayerjs/pull/527)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 95e58e9 ([#526](https://github.com/openplayerjs/openplayerjs/pull/526)) @renovate[bot]
- **[deps]** update actions/setup-node digest to 48b55a0 ([#528](https://github.com/openplayerjs/openplayerjs/pull/528)) @renovate[bot]
- **[deps]** update dependency hls.js to v1.6.16 ([#529](https://github.com/openplayerjs/openplayerjs/pull/529)) @renovate[bot]
- **[deps]** Upgraded basic-ftp package to remove vulnerability (354630e) @rafa8626
- **[deps]** update actions/upload-artifact digest to 043fb46 ([#522](https://github.com/openplayerjs/openplayerjs/pull/522)) @renovate[bot]
- **[deps]** update dependency undici to v7.25.0 ([#525](https://github.com/openplayerjs/openplayerjs/pull/525)) @renovate[bot]
- **[deps]** update dependency defu to v6.1.7 ([#523](https://github.com/openplayerjs/openplayerjs/pull/523)) @renovate[bot]
- **[deps]** update dependency prettier to v3.8.2 ([#524](https://github.com/openplayerjs/openplayerjs/pull/524)) @renovate[bot]
- **[repo]** Removed unnecessary overrides (a6aa8f2) @rafa8626

## [3.4.2](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.4.2) (2026-04-07)

_April 7, 2026_

### `@openplayerjs/core@3.4.2`

#### Bug Fixes

- **[core]** align detach() signature with Core's calling convention and fix tsconfig deprecation (8db3f28) @rafa8626
  - BaseMediaEngine.detach() now accepts optional ctx param to match how
  - tsconfig.json: remove deprecated module/moduleResolution overrides;
  - tsconfig.jest.json: add ignoreDeprecations:"5.0" to suppress the
  - CLAUDE.md: add codebase practices, architecture, and test guide

### `@openplayerjs/player@3.4.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.2`

### `@openplayerjs/hls@3.4.2`

#### Chores

- **[hls]** Suggested improvements in HLS package (8c4a2a4) @rafa8626
  - Created variable for magic number used to check for errors, renamed private variable and consolidated play behavior across engine to improve readability
  - Renamed function in unit tests for better readability

### `@openplayerjs/ads@3.4.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.2`

### `@openplayerjs/youtube@3.4.2`

#### Bug Fixes

- **[youtube]** Renamed constants and expanded comments for better readability (c9614a4) @rafa8626
- **[youtube]** Replaced pseudo type to `video` since `x-video` is considered deprecated (c6ea561) @rafa8626

#### Chores

- **[youtube]** Added constant to replace magic number (e749f16) @rafa8626
- **[youtube]** Renamed variables/methods for better readability (6ba7a74) @rafa8626

### General

#### Bug Fixes

- **[repo]** Moved closed captions to proper position per VAST 4.1 specs (38ace49) @rafa8626
- **[repo]** Fixed typo in YT example and changed source to use YT ID (43d75ce) @rafa8626

#### Chores

- **[repo]** Removed unused import from example (1d3eb96) @rafa8626
- **[repo]** Added new script to share ad unit among examples (4e7941c) @rafa8626
- **[repo]** Fixed inconsistent spacing and added plugin in example file (28c28c6) @rafa8626
- **[repo]** Fixed script to avoid issues related to new lines (8df4459) @rafa8626
- **[repo]** Removed duplicate HLS instantiation and added missing plugin (bd8ae54) @rafa8626
- **[repo]** Added initial e2e tests using Playwright (74373c7) @rafa8626
- **[repo]** release scripts improvements (c0537a7) @rafa8626
  - Fixed orchestrator script by cleaning up regex and fixing logic to handle different package versions and avoid duplicate entries per package
  - Fixed split changelog script by changing slightly regex to avoid matching across line boundaries and using trimStart() method to avoid removing meaningful indentation from nested list items or code blocks
  - Fixed entries in CHANGELOG after changes
- **[docs]** Fixed issues in MIGRATION document adding missing links and correcting typos (8d0210f) @rafa8626
- **[deps]** update dependency @types/node to v24.12.2 ([#518](https://github.com/openplayerjs/openplayerjs/pull/518)) @renovate[bot]
- **[deps]** update dependency cssnano to v7.1.4 ([#519](https://github.com/openplayerjs/openplayerjs/pull/519)) @renovate[bot]
- **[deps]** update dependency ts-jest to v29.4.9 ([#520](https://github.com/openplayerjs/openplayerjs/pull/520)) @renovate[bot]
- **[deps]** Fixed new vulnerability CVE-2026-35209 (aaeed73) @rafa8626

## [3.4.1](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.4.1) (2026-04-02)

_April 2, 2026_

### `@openplayerjs/core@3.4.1`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.1`

### `@openplayerjs/player@3.4.1`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.1`

### `@openplayerjs/hls@3.4.1`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.1`

### `@openplayerjs/ads@3.4.1`

#### Bug Fixes

- **[repo]** Changed Renovate strategy to pin dependencies and pinned all packages versions (e635c12) @rafa8626
- **[deps]** update dependency @dailymotion/vast-client to ^6.4.4 ([#516](https://github.com/openplayerjs/openplayerjs/pull/516)) @renovate[bot]

### `@openplayerjs/youtube@3.4.1`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.1`

### General

#### Bug Fixes

- **[repo]** minor refactor and coverage increase (3750fa6) @rafa8626
  - Added new tsconfig to solve TS issues in unit tests
  - Split logic from core into 2 new utilities to split responsibilities
  - Fixed issue when checking cues for SSAI strategy using streaming engines
  - Added more unit tests based on changes
- **[deps]** Fixed high severity vulnerability related to code injection (b2c0f2f) @rafa8626
- **[repo]** Modified orchestrator script to consider squash merge commits; updated CHANGELOG (a0d1ca6) @rafa8626

#### Chores

- **[repo]** Added new workflow to scan for package vulnerabilities (b822b73) @rafa8626
- **[deps]** Fixed high severity vulnerability (ed16a03) @rafa8626
- **[docs]** Added new badge for OpenSSF Best Practices (1f2ab90) @rafa8626
- **[deps]** update dependency rollup to ^4.60.1 ([#515](https://github.com/openplayerjs/openplayerjs/pull/515)) @renovate[bot]
- **[deps]** update node.js ([#513](https://github.com/openplayerjs/openplayerjs/pull/513)) @renovate[bot]
- **[deps]** update eslint to ^8.57.2 ([#512](https://github.com/openplayerjs/openplayerjs/pull/512)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.6 ([#511](https://github.com/openplayerjs/openplayerjs/pull/511)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.21 ([#510](https://github.com/openplayerjs/openplayerjs/pull/510)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.6.0 ([#509](https://github.com/openplayerjs/openplayerjs/pull/509)) @renovate[bot]
- **[deps]** update github/codeql-action digest to c10b806 ([#508](https://github.com/openplayerjs/openplayerjs/pull/508)) @renovate[bot]

## [3.4.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.4.0) (2026-03-28)

_March 28, 2026_

### `@openplayerjs/core@3.4.0`

#### Chores

- **[docs]** Fixed wrong packages names in documentation (168724d) @rafa8626

### `@openplayerjs/player@3.4.0`

#### Features

- **[player]** WCAG 2.2 enhancements for controls ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
  - Added wrapper and factory to generate area for screen readers to announce events
  - Integrated announcer factory and aria-live attributes in all controls that have user interactions
  - Added missing label from configurations for Settings control
  - Turned off aria-live on current time related controls to avoid updates on every timeupdate event
  - Added aria-hidden for delimiter in time control to avoid screen reader to read it (more visual element)

#### Bug Fixes

- **[player]** Expanded unit test coverage in player package ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626

### `@openplayerjs/hls@3.4.0`

#### Features

- **[hls]** Enhanced support for metadata tracks in HLS ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
  - Added new HLS.js configuration to support ID3 frames and EXT-X-DATERANGE as metadata TextTrack cues so consumers can detect splice points using `cuechange` event
  - Added new method to generate a separate instance of HLS.js intended to be used for ads that render m3u8 files without interfering with main instance

#### Bug Fixes

- **[hls]** Marked edge cases to avoid decreasing coverage ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626

### `@openplayerjs/ads@3.4.0`

#### Features

- **[ads]** Support for SSAI and hybrid approaches, refactor for CSAI ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
  - Refactor ads configuration to support new server-side ads integration (SSAI) and hybrid (client-side ads integration, or CSAI, triggered by SCTE-35 OUT cues) strategies, leaving `debug` and `sources` untouched for backward compatibility
  - Created new area to contain new SSAI and hybrid strategies for better separation of concerns
  - Moved Ads client-side logic into a new strategy class to keep code readable and have better separation of concerns
  - Updated unit tests after moving logic to new class
  - Updated documentation adding more code snippets and new ways to implement strategies

#### Bug Fixes

- **[ads]** Added new labels configuration for ads and expanded coverage ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
- **[ads]** Added missing `await` to playBreakFromVast call ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
- **[ads]** Removal of deprecated method and SIMID warning ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
  - Removed deprecated method after refactor for CSAI strategy
  - Removed warning for SIMID iframe related to target origin
  - Updated unit tests after fixes
- **[ads]** Marked edge cases to avoid decreasing coverage ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626

### `@openplayerjs/youtube@3.4.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.4.0`

### General

#### Bug Fixes

- **[repo]** Replaced extension for release commands to match new extension in scripts (6017cd8) @rafa8626
- **[docs]** Updated CHANGELOG with proper entries from v3.3.0 and added scope for contributing guidelines (cf6f5dd) @rafa8626
- **[release]** CHANGELOG fixes ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
  - Modified script to add descriptions from commits, and consolidate it for improve CHANGELOG
  - Removed CHANGELOG per package to consolidate all in main one
  - Rewrote CHANGELOG to indicate changes according to new orchestrator changes
- **[repo]** Fixed vulnerabilities and issues in unit tests ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626

#### Chores

- **[deps]** Upgraded lock file (be8bce3) @rafa8626
- **[release]** Adjustments for release workflow ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- **[repo]** File conversion to CommonJS ([#507](https://github.com/openplayerjs/openplayerjs/pull/507)) @rafa8626
  - Converted Rollup configuration files to `.cjs` to make them more portable
  - Converted scripts to `.cjs` to make them more portable
  - Updated scripts in all `package.json` files to adjust to these changes
  - Removed deprecated Rollup configuration file
  - Changed build:css command to be cross-OS compatible

## [3.3.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.3.0) (2026-03-24)

_March 24, 2026_

### `@openplayerjs/core@3.3.0`

#### Bug Fixes

- **[core]** iframe engine polling and ended-state fixes (3b7ccd8) @rafa8626
  - Added equality guards in `applyVolume`, `applyDuration`, and `applyRate` to suppress no-op events during the 250 ms poll tick
  - Consolidated volume/muted reads into a single `applyVolume` call per tick instead of two
  - Suppressed `timeupdate` emission when iframe media is paused or ended
  - Guarded `onAdapterState('ended')` against spurious end events fired by YouTube when seeking within the last ~2 seconds of the video
  - Added `_playIntentAfterEnd` flag so adapter-initiated `playing` transitions after end are suppressed unless the user explicitly called `play()`
  - Suppressed `buffering`/`loading` states after end to prevent loader flicker during YouTube's auto-restart cycle
  - Calls `adapter.pause()` when a genuine ended state is accepted to stop YouTube's automatic replay

### `@openplayerjs/player@3.3.0`

#### Features

- **[player]** WCAG 2.2 enhancements for controls (180a140) @rafa8626
  - Added wrapper and factory to generate a single shared ARIA live region for screen-reader announcements
  - Integrated announcer and `aria-live` attributes across all interactive controls
  - Added missing label from configurations for the Settings control
  - Disabled `aria-live` on current-time controls to prevent announcements on every `timeupdate`
  - Added `aria-hidden` on the time-delimiter element to avoid it being read by screen readers
  - Added unit tests for the enhancements

#### Bug Fixes

- **[player]** shared a11y announcer, event cleanup, and volume control loop fix (d2df296) @rafa8626
  - Refactored announcer to generate a single pair of ARIA live regions instead of one per control
  - Refactored event listeners to return their `off` callback so all are cleaned up on `destroy`
  - Removed unexpected re-entrancy loop in `VolumeControl.syncActiveMedia` caused by interactions between core, ads, and the control itself
  - Fixed `syncActiveMedia` to not write `el.volume` when muted (volume-change path vs. mute-click path)
  - Restored direct overlay-media sync for keyboard `ArrowUp` / `ArrowDown` / `M` handlers
- **[player]** expanded unit test coverage in player package (990690a) @rafa8626

### `@openplayerjs/hls@3.3.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.3.0`

### `@openplayerjs/ads@3.3.0`

#### Bug Fixes

- **[ads]** added new labels configuration for ads and expanded coverage (0ded85c) @rafa8626
- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]

### `@openplayerjs/youtube@3.3.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.3.0`

### General

#### Bug Fixes

- **[release]** CHANGELOG fixes and script improvements (ac09425) @rafa8626
  - Modified split-changelog script to include commit descriptions in generated notes
  - Removed per-package CHANGELOG files in favour of the consolidated root changelog
- **[release]** added `changelog` as a valid scope (69891eb) @rafa8626

#### Chores

- **[release]** adjustments for release workflow (2935ad8) @rafa8626
  - Increased branch coverage to 85%
  - Added new commands to verify release readiness
  - Removed inline configuration from per-package `.release-it.cjs` files in favour of the root config
- **[deps]** update dependency rollup to ^4.60.0 ([#505](https://github.com/openplayerjs/openplayerjs/pull/505)) @renovate[bot]
- Fixed vulnerability (7facec4) @rafa8626
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]

## [3.2.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.2.0) (2026-03-16)

### `@openplayerjs/core@3.2.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/ads@3.2.0`

### `@openplayerjs/player@3.2.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.2.0`

### `@openplayerjs/hls@3.2.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.2.0`

### `@openplayerjs/ads@3.2.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @rafa8626
  - Split ads file for better maintenance and separation of concerns
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads, removed after ad ends
  - Added SIMID creative information when creating a SIMID session
  - Added `case 'resolve':` and `case 'reject':` fallthroughs to the existing `SIMID_CREATIVE` handlers

### `@openplayerjs/youtube@3.2.0` / `3.2.1` / `3.2.2`

#### Version Bump

- Version bumps (`3.2.0` → `3.2.1` → `3.2.2`) to track dependency security patches while core remained at `3.1.x`; no user-facing code changes in the youtube package itself

### General

#### Chores

- **[deps]** update eslint to ^8.57.1 ([#496](https://github.com/openplayerjs/openplayerjs/pull/496)) @renovate[bot]
- **[deps]** update github/codeql-action digest to b1bff81 ([#493](https://github.com/openplayerjs/openplayerjs/pull/493)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.4 ([#494](https://github.com/openplayerjs/openplayerjs/pull/494)) @renovate[bot]

---

## [3.1.2](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.1.2) (2026-03-15)

### `@openplayerjs/ads@3.1.2`

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vmap to >=3.3.3 ([#486](https://github.com/openplayerjs/openplayerjs/pull/486)) @renovate[bot]

### `@openplayerjs/core@3.1.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/ads@3.1.2`

### `@openplayerjs/player@3.1.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.2`

### `@openplayerjs/hls@3.1.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.2`

### General

#### Bug Fixes

- **[repo]** Updated orchestration file to skip versions if package is already at or above the target (c0bda19) @rafa8626

#### Chores

- **[deps]** initial major upgrade of dependency undici to v7 ([#489](https://github.com/openplayerjs/openplayerjs/pull/489)) @renovate[bot]
- **[deps]** update dependency undici to >=6.24.1 ([#484](https://github.com/openplayerjs/openplayerjs/pull/484)) @renovate[bot]
- **[deps]** update dependency serialize-javascript to >=7.0.4 ([#482](https://github.com/openplayerjs/openplayerjs/pull/482)) @renovate[bot]
- **[deps]** update dependency lint-staged to ^16.4.0 ([#487](https://github.com/openplayerjs/openplayerjs/pull/487)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.17 ([#483](https://github.com/openplayerjs/openplayerjs/pull/483)) @renovate[bot]
- **[deps]** update commitlint to ^20.5.0 ([#492](https://github.com/openplayerjs/openplayerjs/pull/492)) @renovate[bot]
- **[deps]** update commitlint to ^20.4.4 ([#478](https://github.com/openplayerjs/openplayerjs/pull/478)) @renovate[bot]
- **[deps]** update dependency flatted to >=3.4.1 ([#481](https://github.com/openplayerjs/openplayerjs/pull/481)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-commonjs to ^29.0.2 ([#480](https://github.com/openplayerjs/openplayerjs/pull/480)) @renovate[bot]
- **[deps]** update postcss ([#485](https://github.com/openplayerjs/openplayerjs/pull/485)) @renovate[bot]
- **[deps]** update node.js to >=24.14.0 ([#488](https://github.com/openplayerjs/openplayerjs/pull/488)) @renovate[bot]
- **[deps]** update dependency @release-it/conventional-changelog to ^10.0.6 ([#479](https://github.com/openplayerjs/openplayerjs/pull/479)) @renovate[bot]
- **[deps]** update eslint ([#462](https://github.com/openplayerjs/openplayerjs/pull/462)) @renovate[bot]
- **[deps]** update jest to v30 ([#474](https://github.com/openplayerjs/openplayerjs/pull/474)) @renovate[bot]
- **[deps]** update dependency stylelint-order to ^8.1.1 ([#490](https://github.com/openplayerjs/openplayerjs/pull/490)) @renovate[bot]
- **[deps]** update dependency stylelint-order to v8 ([#473](https://github.com/openplayerjs/openplayerjs/pull/473)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.15 ([#475](https://github.com/openplayerjs/openplayerjs/pull/475)) @renovate[bot]
- **[deps]** update pnpm to v10.32.1 ([#476](https://github.com/openplayerjs/openplayerjs/pull/476)) @renovate[bot]
- Remove vulnerabilities after upgrades (4b9d158) @rafa8626
- Removed unnecessary overrides (924d755) @rafa8626
- **[deps]** pin dependencies ([#491](https://github.com/openplayerjs/openplayerjs/pull/491)) @renovate[bot]
- Enhancements for release cycle (c5c0eff) @rafa8626
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and append them to CHANGELOG
  - Refactor renovate configuration for better dependency strategy and scheduling

---

## [3.1.1](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.1.1) (2026-03-13)

### `@openplayerjs/core@3.1.1`

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @rafa8626
  - Disabled per-package `npm` publish to resolve peer-dependency version conflicts
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG

### `@openplayerjs/player@3.1.1`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.1`

### `@openplayerjs/hls@3.1.1`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.1`

### `@openplayerjs/ads@3.1.1`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.1`

### `@openplayerjs/youtube@3.1.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.1`

### General

#### Bug Fixes

- Added missing flag on pre-commit hook invocation during release (7423955) @rafa8626
- Fixed version of YouTube package after incorrect tag (eb1e0a6) @rafa8626

#### Chores

- **[deps]** update dependency @rollup/plugin-terser to v1 ([#470](https://github.com/openplayerjs/openplayerjs/pull/470)) @renovate[bot]
- **[deps]** update dependency @types/jest to v30 ([#471](https://github.com/openplayerjs/openplayerjs/pull/471)) @renovate[bot]
- **[deps]** update commitlint monorepo to v20 ([#469](https://github.com/openplayerjs/openplayerjs/pull/469)) @renovate[bot]

---

## [3.1.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.1.0) (2026-03-13)

### `@openplayerjs/core@3.1.0`

#### Refactoring

- surface layer, Renovate integration and ads fixes ([#458](https://github.com/openplayerjs/openplayerjs/pull/458)) @rafa8626
  - Added new surface layer (`HtmlMediaSurface`, `IframeMediaSurface`) in preparation for iframe-based engines (YouTube, etc.) with a unified approach across packages and controls
  - Added new captions layer in core package to support captions across different engines via `CaptionTrackProvider`
  - Added `BaseMediaEngine` lifecycle helpers: `bindSurfaceEvents`, `bindCommands`, `unbindSurfaceEvents`
  - Added missing badges for all packages and main documentation page
  - Added new entries in `.gitignore`

### `@openplayerjs/ads@3.1.0`

#### Bug Fixes

- surface layer, Renovate integration and ads fixes ([#458](https://github.com/openplayerjs/openplayerjs/pull/458)) @rafa8626
  - Fixed multiple ad lifecycle issues following the surface-layer refactor

### `@openplayerjs/player@3.1.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.0`

### `@openplayerjs/hls@3.1.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.0`

### `@openplayerjs/youtube@3.1.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.1.0`

### General

#### Bug Fixes

- Removed release-it config flags in favor of release notes (bb8cd59) @rafa8626
- Added new commit types for releases (ec6c75f) @rafa8626
- Removing .npmrc not needed (ad5f8fe) @rafa8626
- Added fallback for NPM_TOKEN (7c74c62) @rafa8626
- Changed orchestration file to read .env from package root (6e39215) @rafa8626

#### Chores

- Configure Renovate ([#459](https://github.com/openplayerjs/openplayerjs/pull/459)) @renovate[bot]
- Added permanent `.npmrc` to use `NPM_TOKEN` automatically (5afa092) @rafa8626
- Added YouTube package to the list of supported packages in orchestrator (eb1e0a6) @rafa8626
- **[deps]** update coverallsapp/github-action action to v2.3.6 ([#466](https://github.com/openplayerjs/openplayerjs/pull/466)) @renovate[bot]
- **[deps]** update pnpm to v10.32.0 ([#467](https://github.com/openplayerjs/openplayerjs/pull/467)) @renovate[bot]
- **[config]** migrate config renovate.json ([#463](https://github.com/openplayerjs/openplayerjs/pull/463)) @renovate[bot]

---

## [3.0.2](https://github.com/openplayerjs/openplayerjs/releases/tag/v3.0.2) (2026-03-07)

Initial v3 release of the OpenPlayerJS monorepo under the `@openplayerjs/*` scoped package names.

### Packages published

- `@openplayerjs/core@3.0.2` — `Core`, `EventBus`, `BaseMediaEngine`, plugin system, state manager, overlay manager, `HtmlMediaSurface`
- `@openplayerjs/player@3.0.2` — `createUI()`, `buildControls()`, controls library (play, pause, volume, progress, time, settings, captions, fullscreen), CSS
- `@openplayerjs/hls@3.0.2` — `HlsMediaEngine` wrapping hls.js with MSE support
- `@openplayerjs/ads@3.0.2` — `AdsPlugin` with CSAI/VMAP/waterfall fallback support
- `@openplayerjs/youtube@3.0.0` — Initial `YoutubeMediaEngine` stub
