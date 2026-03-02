/**
 * @openplayer/core
 *
 * Public API for the OpenPlayerJS core package.
 * Re-exports everything plugin and engine authors need to build on top of the player.
 */

// ─── Core ──────────────────────────────────────────────────────────────────
export { Core } from './core';

// ─── Plugin system ───────────────────────────────────────────────────────────
export { PluginRegistry } from './core/plugin';
export type { PlayerPlugin, PluginContext } from './core/plugin';

// ─── Media engine interfaces (custom engine authors) ─────────────────────────
export type { MediaEngineContext, MediaEnginePlugin, MediaSource } from './core/media';

// ─── Built-in engines ────────────────────────────────────────────────────────
export { BaseMediaEngine } from './engines/base';
export type { IEngine } from './engines/base';
export { DefaultMediaEngine } from './engines/html5';

// ─── Event system ────────────────────────────────────────────────────────────
export { EventBus } from './core/events';
export type { Listener, PlayerEvent, PlayerEventPayloadMap } from './core/events';

// ─── Overlay management (needed by ad-type plugins) ──────────────────────────
export { getOverlayManager } from './core/overlay';
export type { OverlayEvent, OverlayManager, OverlayMode, OverlayState } from './core/overlay';

// ─── Configuration ───────────────────────────────────────────────────────────
export type { PlayerConfig } from './core/configuration';

// ─── Constants (plugin / engine authors rely on EVENT_OPTIONS) ───────────────
export { DVR_THRESHOLD, EVENT_OPTIONS } from './core/constants';

// ─── Utilities ───────────────────────────────────────────────────────────────
export { formatTime, generateISODateTime, isAudio, isMobile, offset } from './core/utils';

// ─── Disposable store (used by UI controls) ───────────────────────────────────
export { DisposableStore } from './core/dispose';
export type { Disposer } from './core/dispose';

// ─── Internals exposed for testing and advanced use ───────────────────────────
export { Lease } from './core/lease';
export { StateManager } from './core/state';
