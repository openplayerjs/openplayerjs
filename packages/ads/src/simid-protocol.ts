/**
 * SIMID 1.2 wire-protocol constants and message types.
 *
 * Separated from the session implementation so they can be imported by tests
 * and any future custom SIMID handlers without pulling in the full SimidSession.
 *
 * Spec: https://iabtechlab.com/standards/simid/
 */

// ─── Message type constants ───────────────────────────────────────────────────

export const SIMID_PLAYER = {
  INIT: 'SIMID:Player:init',
  START_CREATIVE: 'SIMID:Player:startCreative',
  AD_PROGRESS: 'SIMID:Player:adProgress',
  AD_PAUSED: 'SIMID:Player:adPaused',
  AD_PLAYING: 'SIMID:Player:adPlaying',
  AD_STOPPED: 'SIMID:Player:adStopped',
  AD_SKIPPED: 'SIMID:Player:adSkipped',
  AD_VOLUME: 'SIMID:Player:adVolume',
  AD_DURATION_CHANGE: 'SIMID:Player:adDurationChange',
  RESIZE: 'SIMID:Player:resize',
  FATAL: 'SIMID:Player:fatal',
  LOG: 'SIMID:Player:log',
  APP_BACKGROUNDED: 'SIMID:Player:appBackgrounded',
  APP_FOREGROUNDED: 'SIMID:Player:appForegrounded',
  /** Player resolves a creative request (spec type: "resolve") */
  RESOLVE: 'resolve',
  /** Player rejects a creative request (spec type: "reject") */
  REJECT: 'reject',
} as const;

/** SIMID 1.2 media event types — player bridges ad video DOM events to these postMessages. */
export const SIMID_MEDIA = {
  DURATION_CHANGE: 'SIMID:Media:durationchange',
  ENDED: 'SIMID:Media:ended',
  ERROR: 'SIMID:Media:error',
  PAUSE: 'SIMID:Media:pause',
  PLAY: 'SIMID:Media:play',
  PLAYING: 'SIMID:Media:playing',
  SEEKED: 'SIMID:Media:seeked',
  SEEKING: 'SIMID:Media:seeking',
  STALLED: 'SIMID:Media:stalled',
  TIME_UPDATE: 'SIMID:Media:timeupdate',
  VOLUME_CHANGE: 'SIMID:Media:volumechange',
} as const;

export const SIMID_CREATIVE = {
  READY: 'SIMID:Creative:ready',
  GET_MEDIA_STATE: 'SIMID:Creative:getMediaState',
  RESOLVE: 'SIMID:Creative:resolve',
  REJECT: 'SIMID:Creative:reject',
  REQUEST_FULLSCREEN: 'SIMID:Creative:requestFullscreen',
  REQUEST_RESIZE: 'SIMID:Creative:requestResize',
  CLICK_THROUGH: 'SIMID:Creative:clickThrough',
  REPORT_TRACKING: 'SIMID:Creative:reportTracking',
  REQUEST_SKIP: 'SIMID:Creative:requestSkip',
  REQUEST_STOP: 'SIMID:Creative:requestStop',
  REQUEST_PAUSE: 'SIMID:Creative:requestPause',
  REQUEST_PLAY: 'SIMID:Creative:requestPlay',
  REQUEST_CHANGE_AD_DURATION: 'SIMID:Creative:requestChangeAdDuration',
  FATAL: 'SIMID:Creative:fatal',
  LOG: 'SIMID:Creative:log',
} as const;

// ─── Wire message types ───────────────────────────────────────────────────────

export type SimidPlayerMessage = (typeof SIMID_PLAYER)[keyof typeof SIMID_PLAYER];

export type SimidMessage = {
  type: string;
  /** SIMID 1.2 spec field name */
  messageId?: number;
  /** Legacy field used by some older creatives */
  msgId?: number;
  sessionId?: string;
  timestamp?: number;
  args?: Record<string, unknown>;
  /** messageId of the player message being resolved by the creative */
  resolves?: number;
  /** messageId of the player message being rejected by the creative */
  rejects?: number;
  errorCode?: number;
  reason?: string;
};

export type PendingResolve = { resolve: (v: any) => void; reject: (e: any) => void };
