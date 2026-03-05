/**
 * @openplayerjs/ui
 *
 * UI layer: player wrapper, center overlay, controls grid, and all built-in controls.
 * Peer dependency: @openplayerjs/core
 *
 * Stylesheet: import the CSS separately –
 *   import '@openplayerjs/player/openplayer.css';      // bundler
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

// Auto-register built-in controls so buildControls() works in ESM without
// manual registerControl() calls (UMD does this lazily in Player.init).
import createCaptionsControlImpl from './controls/captions';
import createCurrentTimeControlImpl from './controls/currentTime';
import createDurationControlImpl from './controls/duration';
import createFullscreenControlImpl from './controls/fullscreen';
import createPlayControlImpl from './controls/play';
import createProgressControlImpl from './controls/progress';
import createSettingsControlImpl from './controls/settings';
import createTimeControlImpl from './controls/time';
import createVolumeControlImpl from './controls/volume';
import { registerControl } from './control';

registerControl('captions', createCaptionsControlImpl);
registerControl('currentTime', createCurrentTimeControlImpl);
registerControl('duration', createDurationControlImpl);
registerControl('fullscreen', createFullscreenControlImpl);
registerControl('play', createPlayControlImpl);
registerControl('progress', createProgressControlImpl);
registerControl('settings', createSettingsControlImpl);
registerControl('time', createTimeControlImpl);
registerControl('volume', createVolumeControlImpl);

// ─── Built-in Accessibility utilities ────────────────────────────────────────
export { setA11yLabel } from './a11y';
