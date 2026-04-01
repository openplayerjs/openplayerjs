/**
 * Named constants for the ads package.
 *
 * Centralising magic numbers here makes thresholds and limits easy to audit
 * and change without hunting through implementation files.
 */

// ─── Skip UI ──────────────────────────────────────────────────────────────────

/** Seconds before ad end at which the skip button becomes active. */
export const SKIP_NEAR_END_THRESHOLD_S = 0.05;

/** Delta used to seek the ad video to "near end" when skip is triggered. */
export const SEEK_NEAR_END_DELTA_S = 0.001;

// ─── Non-linear ads ───────────────────────────────────────────────────────────

/** Fallback display duration (seconds) when VAST provides no minSuggestedDuration. */
export const NON_LINEAR_DEFAULT_DURATION_S = 10;

/** Polling interval (ms) used by dismissNonLinear to check whether the overlay is empty. */
export const NON_LINEAR_POLL_INTERVAL_MS = 50;

/**
 * Hard ceiling (seconds) for dismissNonLinear polling to prevent an infinite loop
 * when maxDuration is unexpectedly large or not finite.
 */
export const NON_LINEAR_DISMISS_MAX_WAIT_S = 30;

// ─── SIMID ────────────────────────────────────────────────────────────────────

/** Default iframe width (px) used as fallback when DOM layout is unavailable. */
export const SIMID_DEFAULT_WIDTH_PX = 640;

/** Default iframe height (px) used as fallback when DOM layout is unavailable. */
export const SIMID_DEFAULT_HEIGHT_PX = 360;
