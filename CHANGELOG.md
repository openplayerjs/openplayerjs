# Changelog

## [3.3.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.3.0) (2026-03-24)

_March 24, 2026_

### `@openplayerjs/core@3.3.0`

#### Bug Fixes

- **[core]** iframe engine polling and ended-state fixes (3b7ccd8) @Rafael Miranda
  - Added equality guards in `applyVolume`, `applyDuration`, and `applyRate` to suppress no-op events during the 250 ms poll tick
  - Consolidated volume/muted reads into a single `applyVolume` call per tick instead of two
  - Suppressed `timeupdate` emission when iframe media is paused or ended
  - Guarded `onAdapterState('ended')` against spurious end events fired by YouTube when seeking within the last ~2 seconds of the video
  - Added `_playIntentAfterEnd` flag so adapter-initiated `playing` transitions after end are suppressed unless the user explicitly called `play()`
  - Suppressed `buffering`/`loading` states after end to prevent loader flicker during YouTube's auto-restart cycle
  - Calls `adapter.pause()` when a genuine ended state is accepted to stop YouTube's automatic replay

### `@openplayerjs/player@3.3.0`

#### Features

- **[player]** WCAG 2.2 enhancements for controls (180a140) @Rafael Miranda
  - Added wrapper and factory to generate a single shared ARIA live region for screen-reader announcements
  - Integrated announcer and `aria-live` attributes across all interactive controls
  - Added missing label from configurations for the Settings control
  - Disabled `aria-live` on current-time controls to prevent announcements on every `timeupdate`
  - Added `aria-hidden` on the time-delimiter element to avoid it being read by screen readers
  - Added unit tests for the enhancements

#### Bug Fixes

- **[player]** shared a11y announcer, event cleanup, and volume control loop fix (d2df296) @Rafael Miranda
  - Refactored announcer to generate a single pair of ARIA live regions instead of one per control
  - Refactored event listeners to return their `off` callback so all are cleaned up on `destroy`
  - Removed unexpected re-entrancy loop in `VolumeControl.syncActiveMedia` caused by interactions between core, ads, and the control itself
  - Fixed `syncActiveMedia` to not write `el.volume` when muted (volume-change path vs. mute-click path)
  - Restored direct overlay-media sync for keyboard `ArrowUp` / `ArrowDown` / `M` handlers
- **[player]** expanded unit test coverage in player package (990690a) @Rafael Miranda

### `@openplayerjs/hls@3.3.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.3.0`

### `@openplayerjs/ads@3.3.0`

#### Bug Fixes

- **[ads]** added new labels configuration for ads and expanded coverage (0ded85c) @Rafael Miranda
- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]

### `@openplayerjs/youtube@3.3.0`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.3.0`

### General

#### Bug Fixes

- **[release]** CHANGELOG fixes and script improvements (ac09425) @Rafael Miranda
  - Modified split-changelog script to include commit descriptions in generated notes
  - Removed per-package CHANGELOG files in favour of the consolidated root changelog
- **[release]** added `changelog` as a valid scope (69891eb) @Rafael Miranda

#### Chores

- **[release]** adjustments for release workflow (2935ad8) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify release readiness
  - Removed inline configuration from per-package `.release-it.cjs` files in favour of the root config
- **[deps]** update dependency rollup to ^4.60.0 ([#505](https://github.com/openplayerjs/openplayerjs/pull/505)) @renovate[bot]
- Fixed vulnerability (7facec4) @Rafael Miranda
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]

## [3.2.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.2.0) (2026-03-16)

### `@openplayerjs/core@3.2.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues

### `@openplayerjs/player@3.2.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues

### `@openplayerjs/hls@3.2.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues

### `@openplayerjs/ads@3.2.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues

### `@openplayerjs/youtube@3.2.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues

### General

#### Chores

- Fixed vulnerability (7facec4) @Rafael Miranda
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]
- **[deps]** update eslint to ^8.57.1 ([#496](https://github.com/openplayerjs/openplayerjs/pull/496)) @renovate[bot]
- **[deps]** update github/codeql-action digest to b1bff81 ([#493](https://github.com/openplayerjs/openplayerjs/pull/493)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.4 ([#494](https://github.com/openplayerjs/openplayerjs/pull/494)) @renovate[bot]

## [3.2.2](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/youtube%403.2.2) (2026-03-15)

### `@openplayerjs/youtube@3.2.2`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation

### General

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]
- **[deps]** update dependency @dailymotion/vmap to >=3.3.3 ([#486](https://github.com/openplayerjs/openplayerjs/pull/486)) @renovate[bot]

#### Chores

- Fixed vulnerability (7facec4) @Rafael Miranda
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]
- **[deps]** update eslint to ^8.57.1 ([#496](https://github.com/openplayerjs/openplayerjs/pull/496)) @renovate[bot]
- **[deps]** update github/codeql-action digest to b1bff81 ([#493](https://github.com/openplayerjs/openplayerjs/pull/493)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.4 ([#494](https://github.com/openplayerjs/openplayerjs/pull/494)) @renovate[bot]
- Removed unnecessary overrides (924d755) @Rafael Miranda
- **[deps]** update commitlint to ^20.5.0 ([#492](https://github.com/openplayerjs/openplayerjs/pull/492)) @renovate[bot]
- **[deps]** pin dependencies ([#491](https://github.com/openplayerjs/openplayerjs/pull/491)) @renovate[bot]
- **[deps]** update dependency stylelint-order to ^8.1.1 ([#490](https://github.com/openplayerjs/openplayerjs/pull/490)) @renovate[bot]
- **[deps]** update dependency undici to v7 ([#489](https://github.com/openplayerjs/openplayerjs/pull/489)) @renovate[bot]
- **[deps]** update dependency undici to >=6.24.1 ([#484](https://github.com/openplayerjs/openplayerjs/pull/484)) @renovate[bot]
- **[deps]** update dependency lint-staged to ^16.4.0 ([#487](https://github.com/openplayerjs/openplayerjs/pull/487)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.17 ([#483](https://github.com/openplayerjs/openplayerjs/pull/483)) @renovate[bot]
- **[deps]** update commitlint to ^20.4.4 ([#478](https://github.com/openplayerjs/openplayerjs/pull/478)) @renovate[bot]
- **[deps]** update dependency flatted to >=3.4.1 ([#481](https://github.com/openplayerjs/openplayerjs/pull/481)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-commonjs to ^29.0.2 ([#480](https://github.com/openplayerjs/openplayerjs/pull/480)) @renovate[bot]
- **[deps]** update dependency serialize-javascript to >=7.0.4 ([#482](https://github.com/openplayerjs/openplayerjs/pull/482)) @renovate[bot]
- **[deps]** update postcss ([#485](https://github.com/openplayerjs/openplayerjs/pull/485)) @renovate[bot]
- **[deps]** update node.js to >=24.14.0 ([#488](https://github.com/openplayerjs/openplayerjs/pull/488)) @renovate[bot]
- **[deps]** update dependency @release-it/conventional-changelog to ^10.0.6 ([#479](https://github.com/openplayerjs/openplayerjs/pull/479)) @renovate[bot]
- **[deps]** update eslint ([#462](https://github.com/openplayerjs/openplayerjs/pull/462)) @renovate[bot]
- **[deps]** update jest to v30 ([#474](https://github.com/openplayerjs/openplayerjs/pull/474)) @renovate[bot]
- Remove vulnerabilities after upgrades (4b9d158) @Rafael Miranda
- **[deps]** update dependency stylelint-order to v8 ([#473](https://github.com/openplayerjs/openplayerjs/pull/473)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.15 ([#475](https://github.com/openplayerjs/openplayerjs/pull/475)) @renovate[bot]
- **[deps]** update pnpm to v10.32.1 ([#476](https://github.com/openplayerjs/openplayerjs/pull/476)) @renovate[bot]

## [3.1.2](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.1.2) (2026-03-15)

### `@openplayerjs/core@3.1.2`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda

### `@openplayerjs/player@3.1.2`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation

### `@openplayerjs/hls@3.1.2`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation

### `@openplayerjs/ads@3.1.2`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]
- **[deps]** update dependency @dailymotion/vmap to >=3.3.3 ([#486](https://github.com/openplayerjs/openplayerjs/pull/486)) @renovate[bot]

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation

### General

#### Bug Fixes

- Updated orchestration file to skip versions if already exist (c0bda19) @Rafael Miranda

#### Chores

- Fixed vulnerability (7facec4) @Rafael Miranda
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]
- **[deps]** update eslint to ^8.57.1 ([#496](https://github.com/openplayerjs/openplayerjs/pull/496)) @renovate[bot]
- **[deps]** update github/codeql-action digest to b1bff81 ([#493](https://github.com/openplayerjs/openplayerjs/pull/493)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.4 ([#494](https://github.com/openplayerjs/openplayerjs/pull/494)) @renovate[bot]
- Removed unnecessary overrides (924d755) @Rafael Miranda
- **[deps]** update commitlint to ^20.5.0 ([#492](https://github.com/openplayerjs/openplayerjs/pull/492)) @renovate[bot]
- **[deps]** pin dependencies ([#491](https://github.com/openplayerjs/openplayerjs/pull/491)) @renovate[bot]
- **[deps]** update dependency stylelint-order to ^8.1.1 ([#490](https://github.com/openplayerjs/openplayerjs/pull/490)) @renovate[bot]
- **[deps]** update dependency undici to v7 ([#489](https://github.com/openplayerjs/openplayerjs/pull/489)) @renovate[bot]
- **[deps]** update dependency undici to >=6.24.1 ([#484](https://github.com/openplayerjs/openplayerjs/pull/484)) @renovate[bot]
- **[deps]** update dependency lint-staged to ^16.4.0 ([#487](https://github.com/openplayerjs/openplayerjs/pull/487)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.17 ([#483](https://github.com/openplayerjs/openplayerjs/pull/483)) @renovate[bot]
- **[deps]** update commitlint to ^20.4.4 ([#478](https://github.com/openplayerjs/openplayerjs/pull/478)) @renovate[bot]
- **[deps]** update dependency flatted to >=3.4.1 ([#481](https://github.com/openplayerjs/openplayerjs/pull/481)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-commonjs to ^29.0.2 ([#480](https://github.com/openplayerjs/openplayerjs/pull/480)) @renovate[bot]
- **[deps]** update dependency serialize-javascript to >=7.0.4 ([#482](https://github.com/openplayerjs/openplayerjs/pull/482)) @renovate[bot]
- **[deps]** update postcss ([#485](https://github.com/openplayerjs/openplayerjs/pull/485)) @renovate[bot]
- **[deps]** update node.js to >=24.14.0 ([#488](https://github.com/openplayerjs/openplayerjs/pull/488)) @renovate[bot]
- **[deps]** update dependency @release-it/conventional-changelog to ^10.0.6 ([#479](https://github.com/openplayerjs/openplayerjs/pull/479)) @renovate[bot]
- **[deps]** update eslint ([#462](https://github.com/openplayerjs/openplayerjs/pull/462)) @renovate[bot]
- **[deps]** update jest to v30 ([#474](https://github.com/openplayerjs/openplayerjs/pull/474)) @renovate[bot]
- Remove vulnerabilities after upgrades (4b9d158) @Rafael Miranda
- **[deps]** update dependency stylelint-order to v8 ([#473](https://github.com/openplayerjs/openplayerjs/pull/473)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.15 ([#475](https://github.com/openplayerjs/openplayerjs/pull/475)) @renovate[bot]
- **[deps]** update pnpm to v10.32.1 ([#476](https://github.com/openplayerjs/openplayerjs/pull/476)) @renovate[bot]

## [3.2.1](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/youtube%403.2.1) (2026-03-13)

### `@openplayerjs/youtube@3.2.1`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG
- Fixed version of YouTube package (42cd8ad) @Rafael Miranda

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation
- Upgraded package version (d78b2ca) @Rafael Miranda

### General

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]
- **[deps]** update dependency @dailymotion/vmap to >=3.3.3 ([#486](https://github.com/openplayerjs/openplayerjs/pull/486)) @renovate[bot]
- Updated orchestration file to skip versions if already exist (c0bda19) @Rafael Miranda

#### Chores

- Fixed vulnerability (7facec4) @Rafael Miranda
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]
- **[deps]** update eslint to ^8.57.1 ([#496](https://github.com/openplayerjs/openplayerjs/pull/496)) @renovate[bot]
- **[deps]** update github/codeql-action digest to b1bff81 ([#493](https://github.com/openplayerjs/openplayerjs/pull/493)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.4 ([#494](https://github.com/openplayerjs/openplayerjs/pull/494)) @renovate[bot]
- Removed unnecessary overrides (924d755) @Rafael Miranda
- **[deps]** update commitlint to ^20.5.0 ([#492](https://github.com/openplayerjs/openplayerjs/pull/492)) @renovate[bot]
- **[deps]** pin dependencies ([#491](https://github.com/openplayerjs/openplayerjs/pull/491)) @renovate[bot]
- **[deps]** update dependency stylelint-order to ^8.1.1 ([#490](https://github.com/openplayerjs/openplayerjs/pull/490)) @renovate[bot]
- **[deps]** update dependency undici to v7 ([#489](https://github.com/openplayerjs/openplayerjs/pull/489)) @renovate[bot]
- **[deps]** update dependency undici to >=6.24.1 ([#484](https://github.com/openplayerjs/openplayerjs/pull/484)) @renovate[bot]
- **[deps]** update dependency lint-staged to ^16.4.0 ([#487](https://github.com/openplayerjs/openplayerjs/pull/487)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.17 ([#483](https://github.com/openplayerjs/openplayerjs/pull/483)) @renovate[bot]
- **[deps]** update commitlint to ^20.4.4 ([#478](https://github.com/openplayerjs/openplayerjs/pull/478)) @renovate[bot]
- **[deps]** update dependency flatted to >=3.4.1 ([#481](https://github.com/openplayerjs/openplayerjs/pull/481)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-commonjs to ^29.0.2 ([#480](https://github.com/openplayerjs/openplayerjs/pull/480)) @renovate[bot]
- **[deps]** update dependency serialize-javascript to >=7.0.4 ([#482](https://github.com/openplayerjs/openplayerjs/pull/482)) @renovate[bot]
- **[deps]** update postcss ([#485](https://github.com/openplayerjs/openplayerjs/pull/485)) @renovate[bot]
- **[deps]** update node.js to >=24.14.0 ([#488](https://github.com/openplayerjs/openplayerjs/pull/488)) @renovate[bot]
- **[deps]** update dependency @release-it/conventional-changelog to ^10.0.6 ([#479](https://github.com/openplayerjs/openplayerjs/pull/479)) @renovate[bot]
- **[deps]** update eslint ([#462](https://github.com/openplayerjs/openplayerjs/pull/462)) @renovate[bot]
- **[deps]** update jest to v30 ([#474](https://github.com/openplayerjs/openplayerjs/pull/474)) @renovate[bot]
- Remove vulnerabilities after upgrades (4b9d158) @Rafael Miranda
- **[deps]** update dependency stylelint-order to v8 ([#473](https://github.com/openplayerjs/openplayerjs/pull/473)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.15 ([#475](https://github.com/openplayerjs/openplayerjs/pull/475)) @renovate[bot]
- **[deps]** update pnpm to v10.32.1 ([#476](https://github.com/openplayerjs/openplayerjs/pull/476)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-terser to v1 ([#470](https://github.com/openplayerjs/openplayerjs/pull/470)) @renovate[bot]
- **[deps]** update dependency @types/jest to v30 ([#471](https://github.com/openplayerjs/openplayerjs/pull/471)) @renovate[bot]
- **[deps]** update commitlint monorepo to v20 ([#469](https://github.com/openplayerjs/openplayerjs/pull/469)) @renovate[bot]

## [3.1.1](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.1.1) (2026-03-13)

### `@openplayerjs/core@3.1.1`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda

### `@openplayerjs/player@3.1.1`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation

### `@openplayerjs/hls@3.1.1`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation

### `@openplayerjs/ads@3.1.1`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]
- **[deps]** update dependency @dailymotion/vmap to >=3.3.3 ([#486](https://github.com/openplayerjs/openplayerjs/pull/486)) @renovate[bot]
- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation

### General

#### Bug Fixes

- Updated orchestration file to skip versions if already exist (c0bda19) @Rafael Miranda
- Added missing flag on pre-commit operation (7423955) @Rafael Miranda

#### Chores

- Fixed vulnerability (7facec4) @Rafael Miranda
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]
- **[deps]** update eslint to ^8.57.1 ([#496](https://github.com/openplayerjs/openplayerjs/pull/496)) @renovate[bot]
- **[deps]** update github/codeql-action digest to b1bff81 ([#493](https://github.com/openplayerjs/openplayerjs/pull/493)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.4 ([#494](https://github.com/openplayerjs/openplayerjs/pull/494)) @renovate[bot]
- Removed unnecessary overrides (924d755) @Rafael Miranda
- **[deps]** update commitlint to ^20.5.0 ([#492](https://github.com/openplayerjs/openplayerjs/pull/492)) @renovate[bot]
- **[deps]** pin dependencies ([#491](https://github.com/openplayerjs/openplayerjs/pull/491)) @renovate[bot]
- **[deps]** update dependency stylelint-order to ^8.1.1 ([#490](https://github.com/openplayerjs/openplayerjs/pull/490)) @renovate[bot]
- **[deps]** update dependency undici to v7 ([#489](https://github.com/openplayerjs/openplayerjs/pull/489)) @renovate[bot]
- **[deps]** update dependency undici to >=6.24.1 ([#484](https://github.com/openplayerjs/openplayerjs/pull/484)) @renovate[bot]
- **[deps]** update dependency lint-staged to ^16.4.0 ([#487](https://github.com/openplayerjs/openplayerjs/pull/487)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.17 ([#483](https://github.com/openplayerjs/openplayerjs/pull/483)) @renovate[bot]
- **[deps]** update commitlint to ^20.4.4 ([#478](https://github.com/openplayerjs/openplayerjs/pull/478)) @renovate[bot]
- **[deps]** update dependency flatted to >=3.4.1 ([#481](https://github.com/openplayerjs/openplayerjs/pull/481)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-commonjs to ^29.0.2 ([#480](https://github.com/openplayerjs/openplayerjs/pull/480)) @renovate[bot]
- **[deps]** update dependency serialize-javascript to >=7.0.4 ([#482](https://github.com/openplayerjs/openplayerjs/pull/482)) @renovate[bot]
- **[deps]** update postcss ([#485](https://github.com/openplayerjs/openplayerjs/pull/485)) @renovate[bot]
- **[deps]** update node.js to >=24.14.0 ([#488](https://github.com/openplayerjs/openplayerjs/pull/488)) @renovate[bot]
- **[deps]** update dependency @release-it/conventional-changelog to ^10.0.6 ([#479](https://github.com/openplayerjs/openplayerjs/pull/479)) @renovate[bot]
- **[deps]** update eslint ([#462](https://github.com/openplayerjs/openplayerjs/pull/462)) @renovate[bot]
- **[deps]** update jest to v30 ([#474](https://github.com/openplayerjs/openplayerjs/pull/474)) @renovate[bot]
- Remove vulnerabilities after upgrades (4b9d158) @Rafael Miranda
- **[deps]** update dependency stylelint-order to v8 ([#473](https://github.com/openplayerjs/openplayerjs/pull/473)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.15 ([#475](https://github.com/openplayerjs/openplayerjs/pull/475)) @renovate[bot]
- **[deps]** update pnpm to v10.32.1 ([#476](https://github.com/openplayerjs/openplayerjs/pull/476)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-terser to v1 ([#470](https://github.com/openplayerjs/openplayerjs/pull/470)) @renovate[bot]
- **[deps]** update dependency @types/jest to v30 ([#471](https://github.com/openplayerjs/openplayerjs/pull/471)) @renovate[bot]
- **[deps]** update commitlint monorepo to v20 ([#469](https://github.com/openplayerjs/openplayerjs/pull/469)) @renovate[bot]

## [3.1.0](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.1.0) (2026-03-13)

### `@openplayerjs/core@3.1.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG
- Removed release-it config flags in favor of release notes (bb8cd59) @Rafael Miranda
- Added new commit types for releases (ec6c75f) @Rafael Miranda

#### Refactoring

- surface layer, Renovate integration and ads fixes ([#458](https://github.com/openplayerjs/openplayerjs/pull/458)) @Rafael Miranda
  - Added missing badges for all packages and main page
  - Added Renovate bot to keep dependencies up-to-date in all packages
  - Added new surface layer in preparation to allow iframe engines (i.e., YouTube) to be authored and unified approach among packages and controls
  - Added new captions layer in core package to support captions across different engines
  - Added new entries in .gitignore

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Configure Renovate ([#459](https://github.com/openplayerjs/openplayerjs/pull/459)) @renovate[bot]

### `@openplayerjs/player@3.1.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG
- Removed release-it config flags in favor of release notes (bb8cd59) @Rafael Miranda
- Added new commit types for releases (ec6c75f) @Rafael Miranda

#### Refactoring

- surface layer, Renovate integration and ads fixes ([#458](https://github.com/openplayerjs/openplayerjs/pull/458)) @Rafael Miranda
  - Added missing badges for all packages and main page
  - Added Renovate bot to keep dependencies up-to-date in all packages
  - Added new surface layer in preparation to allow iframe engines (i.e., YouTube) to be authored and unified approach among packages and controls
  - Added new captions layer in core package to support captions across different engines
  - Added new entries in .gitignore

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation
- Configure Renovate ([#459](https://github.com/openplayerjs/openplayerjs/pull/459)) @renovate[bot]

### `@openplayerjs/hls@3.1.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG
- Removed release-it config flags in favor of release notes (bb8cd59) @Rafael Miranda
- Added new commit types for releases (ec6c75f) @Rafael Miranda

#### Refactoring

- surface layer, Renovate integration and ads fixes ([#458](https://github.com/openplayerjs/openplayerjs/pull/458)) @Rafael Miranda
  - Added missing badges for all packages and main page
  - Added Renovate bot to keep dependencies up-to-date in all packages
  - Added new surface layer in preparation to allow iframe engines (i.e., YouTube) to be authored and unified approach among packages and controls
  - Added new captions layer in core package to support captions across different engines
  - Added new entries in .gitignore

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation
- Configure Renovate ([#459](https://github.com/openplayerjs/openplayerjs/pull/459)) @renovate[bot]

### `@openplayerjs/ads@3.1.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- **[deps]** update dependency @dailymotion/vast-client to ^6.4.3 ([#497](https://github.com/openplayerjs/openplayerjs/pull/497)) @renovate[bot]
- **[deps]** update dependency @dailymotion/vmap to >=3.3.3 ([#486](https://github.com/openplayerjs/openplayerjs/pull/486)) @renovate[bot]
- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG
- Removed release-it config flags in favor of release notes (bb8cd59) @Rafael Miranda
- Added new commit types for releases (ec6c75f) @Rafael Miranda

#### Refactoring

- surface layer, Renovate integration and ads fixes ([#458](https://github.com/openplayerjs/openplayerjs/pull/458)) @Rafael Miranda
  - Added missing badges for all packages and main page
  - Added Renovate bot to keep dependencies up-to-date in all packages
  - Added new surface layer in preparation to allow iframe engines (i.e., YouTube) to be authored and unified approach among packages and controls
  - Added new captions layer in core package to support captions across different engines
  - Added new entries in .gitignore

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation
- Configure Renovate ([#459](https://github.com/openplayerjs/openplayerjs/pull/459)) @renovate[bot]

### `@openplayerjs/youtube@3.1.0`

#### Features

- SIMID/OMID support ([#495](https://github.com/openplayerjs/openplayerjs/pull/495)) @Rafael Miranda
  - Split ads file for better maintenance
  - Generated new files to split responsibilities, including skeletons for SIMID and OMID formats
  - Added new HTML elements when parsing XML ads and removed if detected
  - Added SIMID creative information when creating a SIMID session
  - Added case 'resolve': and case 'reject': fallthroughs to the existing SIMID_CREATIVE.RESOLVE/REJECT handlers

#### Bug Fixes

- publishing packages ([#472](https://github.com/openplayerjs/openplayerjs/pull/472)) @Rafael Miranda
  - Disabled `npm` publish per package to resolve peer-dependencies version
  - Modified orchestration script to populate root CHANGELOG
  - Added v3.1.0 changes in root CHANGELOG

#### Chores

- adjustments for release workflow (cb382ed) @Rafael Miranda
  - Increased branch coverage to 85%
  - Added new commands to verify that release is ready and more in sync to what MUI does
  - Removed inline elements from each package's release-it config file to merge everything into main one
  - Minor formatting issues
- Fix document links (d89a0b9) @Rafael Miranda
- Enhancements for release cycle (c5c0eff) @Rafael Miranda
  - Fixed release-it hook to publish to NPM after git push has succeeded
  - Enhanced orchestrator script to generate release notes and appends them to CHANGELOG, check each package's latest tag to avoid botched releases
  - Removed unnecessary element from turbo configuration
  - Refactor renovate configuration to better handle third-party library types by changing version handling, grouping and scheduling for a better strategy
  - Fixed merge issue on documentation
- Upgraded package version (d78b2ca) @Rafael Miranda

### General

#### Bug Fixes

- Updated orchestration file to skip versions if already exist (c0bda19) @Rafael Miranda
- Added missing flag on pre-commit operation (7423955) @Rafael Miranda
- Removing .npmrc not needed (ad5f8fe) @Rafael Miranda
- Added fallback for NPM_TOKEN (7c74c62) @Rafael Miranda
- Changed orchestration file to read .env from package root (6e39215) @Rafael Miranda

#### Chores

- Fixed vulnerability (7facec4) @Rafael Miranda
- **[deps]** update dependency rollup to ^4.59.1 ([#500](https://github.com/openplayerjs/openplayerjs/pull/500)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.20 ([#501](https://github.com/openplayerjs/openplayerjs/pull/501)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.5 ([#502](https://github.com/openplayerjs/openplayerjs/pull/502)) @renovate[bot]
- **[deps]** update github/codeql-action digest to 3869755 ([#499](https://github.com/openplayerjs/openplayerjs/pull/499)) @renovate[bot]
- **[deps]** update dependency eslint to ^10.1.0 ([#503](https://github.com/openplayerjs/openplayerjs/pull/503)) @renovate[bot]
- **[deps]** update dependency stylelint to ^17.5.0 ([#504](https://github.com/openplayerjs/openplayerjs/pull/504)) @renovate[bot]
- **[deps]** update pnpm/action-setup action to v5 ([#498](https://github.com/openplayerjs/openplayerjs/pull/498)) @renovate[bot]
- **[deps]** update eslint to ^8.57.1 ([#496](https://github.com/openplayerjs/openplayerjs/pull/496)) @renovate[bot]
- **[deps]** update github/codeql-action digest to b1bff81 ([#493](https://github.com/openplayerjs/openplayerjs/pull/493)) @renovate[bot]
- **[deps]** update dependency undici to >=7.24.4 ([#494](https://github.com/openplayerjs/openplayerjs/pull/494)) @renovate[bot]
- Removed unnecessary overrides (924d755) @Rafael Miranda
- **[deps]** update commitlint to ^20.5.0 ([#492](https://github.com/openplayerjs/openplayerjs/pull/492)) @renovate[bot]
- **[deps]** pin dependencies ([#491](https://github.com/openplayerjs/openplayerjs/pull/491)) @renovate[bot]
- **[deps]** update dependency stylelint-order to ^8.1.1 ([#490](https://github.com/openplayerjs/openplayerjs/pull/490)) @renovate[bot]
- **[deps]** update dependency undici to v7 ([#489](https://github.com/openplayerjs/openplayerjs/pull/489)) @renovate[bot]
- **[deps]** update dependency undici to >=6.24.1 ([#484](https://github.com/openplayerjs/openplayerjs/pull/484)) @renovate[bot]
- **[deps]** update dependency lint-staged to ^16.4.0 ([#487](https://github.com/openplayerjs/openplayerjs/pull/487)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.17 ([#483](https://github.com/openplayerjs/openplayerjs/pull/483)) @renovate[bot]
- **[deps]** update commitlint to ^20.4.4 ([#478](https://github.com/openplayerjs/openplayerjs/pull/478)) @renovate[bot]
- **[deps]** update dependency flatted to >=3.4.1 ([#481](https://github.com/openplayerjs/openplayerjs/pull/481)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-commonjs to ^29.0.2 ([#480](https://github.com/openplayerjs/openplayerjs/pull/480)) @renovate[bot]
- **[deps]** update dependency serialize-javascript to >=7.0.4 ([#482](https://github.com/openplayerjs/openplayerjs/pull/482)) @renovate[bot]
- **[deps]** update postcss ([#485](https://github.com/openplayerjs/openplayerjs/pull/485)) @renovate[bot]
- **[deps]** update node.js to >=24.14.0 ([#488](https://github.com/openplayerjs/openplayerjs/pull/488)) @renovate[bot]
- **[deps]** update dependency @release-it/conventional-changelog to ^10.0.6 ([#479](https://github.com/openplayerjs/openplayerjs/pull/479)) @renovate[bot]
- **[deps]** update eslint ([#462](https://github.com/openplayerjs/openplayerjs/pull/462)) @renovate[bot]
- **[deps]** update jest to v30 ([#474](https://github.com/openplayerjs/openplayerjs/pull/474)) @renovate[bot]
- Remove vulnerabilities after upgrades (4b9d158) @Rafael Miranda
- **[deps]** update dependency stylelint-order to v8 ([#473](https://github.com/openplayerjs/openplayerjs/pull/473)) @renovate[bot]
- **[deps]** update dependency turbo to ^2.8.15 ([#475](https://github.com/openplayerjs/openplayerjs/pull/475)) @renovate[bot]
- **[deps]** update pnpm to v10.32.1 ([#476](https://github.com/openplayerjs/openplayerjs/pull/476)) @renovate[bot]
- **[deps]** update dependency @rollup/plugin-terser to v1 ([#470](https://github.com/openplayerjs/openplayerjs/pull/470)) @renovate[bot]
- **[deps]** update dependency @types/jest to v30 ([#471](https://github.com/openplayerjs/openplayerjs/pull/471)) @renovate[bot]
- **[deps]** update commitlint monorepo to v20 ([#469](https://github.com/openplayerjs/openplayerjs/pull/469)) @renovate[bot]
- Added permanent npmrc file to use NPM_TOKEN automatically (5afa092) @Rafael Miranda
- Added YouTube package in the list of supported packages (eb1e0a6) @Rafael Miranda
- **[deps]** update coverallsapp/github-action action to v2.3.6 ([#466](https://github.com/openplayerjs/openplayerjs/pull/466)) @renovate[bot]
- **[deps]** update pnpm to v10.32.0 ([#467](https://github.com/openplayerjs/openplayerjs/pull/467)) @renovate[bot]
- **[config]** migrate config renovate.json ([#463](https://github.com/openplayerjs/openplayerjs/pull/463)) @renovate[bot]

## [3.0.2](https://github.com/openplayerjs/openplayerjs/releases/tag/@openplayerjs/core%403.0.2) (2026-03-07)

### `@openplayerjs/player@3.0.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.0.2`

### `@openplayerjs/hls@3.0.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.0.2`

### `@openplayerjs/ads@3.0.2`

#### Version Bump

- Version bump to stay in sync with `@openplayerjs/core@3.0.2`
