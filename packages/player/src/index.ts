/**
 * @openplayer/ui
 *
 * UI layer: player wrapper, center overlay, controls grid, and all built-in controls.
 * Peer dependency: @openplayer/core
 *
 * Stylesheet: import the CSS separately –
 *   import '@openplayer/ui/style.css';          // bundler
 *   <link rel="stylesheet" href="openplayer.css"> // CDN / <link>
 */

// ─── Main UI factory ─────────────────────────────────────────────────────────
export { createUI } from './ui';
export type { PlayerUIContext } from './ui';

// ─── Configuration ───────────────────────────────────────────────────────────
export { defaultLabels, defaultUIConfiguration, resolveUIConfig } from './configuration';
export type { PlayerUIConfig, ResolvedUIConfig } from './configuration';

// ─── Control system ──────────────────────────────────────────────────────────
export { buildControls, createControlGrid, registerControl } from './control';
export type { Control, ControlPlacement, HorizontalSlot, VerticalSlot } from './control';

// ─── Instance-level extensions (adds player.controls) ────────────────────────
export { extendControls } from './extend';

// ─── Built-in control factories ──────────────────────────────────────────────
export { BaseControl } from './controls/base';
export { default as createCaptionsControl } from './controls/captions';
export { default as createCurrentTimeControl } from './controls/currentTime';
export { default as createDurationControl } from './controls/duration';
export { default as createFullscreenControl } from './controls/fullscreen';
export { default as createPlayControl } from './controls/play';
export { default as createProgressControl } from './controls/progress';
export { default as createSettingsControl } from './controls/settings';
export { default as createTimeControl } from './controls/time';
export { default as createVolumeControl } from './controls/volume';

// ─── Built-in Accessibility utilities ────────────────────────────────────────
export { setA11yLabel } from './a11y';
