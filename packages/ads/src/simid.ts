/**
 * SimidSession — IAB SIMID 1.2 (Secure Interactive Media Interface Definition) implementation.
 *
 * SIMID 1.2 session initialization sequence:
 *  1. Creative → Player : createSession  (with sessionId)
 *  2. Player  → Creative: resolve        (acks createSession)
 *  3. Player  → Creative: SIMID:Player:init (environmentData + creativeData)
 *  4. Creative → Player : resolve        (acks init)
 *  5. Creative → Player : SIMID:Creative:ready
 *  6. Player  → Creative: SIMID:Player:startCreative
 *  7. Creative → Player : resolve        (acks startCreative)
 *
 * Message format notes:
 *  - Some SIMID creatives post messages as JSON-encoded strings rather than plain objects.
 *    handleMessage() handles both via parseMessageData().
 *  - The outgoing format mirrors the incoming format: if the creative sends JSON strings
 *    (i.e. JSON.parse(event.data) is used on the creative side), the player also sends
 *    JSON strings so they parse correctly. Format is auto-detected on the first message.
 *  - Older creatives may skip createSession and go straight to SIMID:Creative:ready.
 *    onCreativeReady() falls back to sending init + startCreative in that case.
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

type SimidPlayerMessage = (typeof SIMID_PLAYER)[keyof typeof SIMID_PLAYER];

// ─── Types ───────────────────────────────────────────────────────────────────

type SimidMessage = {
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

type PendingResolve = { resolve: (v: any) => void; reject: (e: any) => void };

export type SimidCallbacks = {
  onSkip: () => void;
  onStop: () => void;
  onPause: () => void;
  onPlay: () => void;
  onClickThrough: (url: string) => void;
  onTrackingEvent: (event: string, data?: any) => void;
  onFatal: (errorCode: number, reason: string) => void;
  onLog?: (data: any) => void;
  /**
   * Called when the creative requests a duration change (SIMID:Creative:requestChangeAdDuration).
   * The handler receives the requested delta in seconds and resolve/reject callbacks.
   * If omitted the player auto-rejects the request.
   */
  onRequestChangeAdDuration?: (
    durationChange: number,
    resolve: () => void,
    reject: (errorCode: number, reason: string) => void
  ) => void;
};

/** Creative-specific metadata extracted from the VAST creative object. */
export type SimidCreativeInfo = {
  /** VAST <AdParameters> content (required by spec, use '' when absent). */
  adParameters?: string;
  /** VAST <ClickThrough> URL for the ad. */
  clickThruUri?: string;
};

// ─── SimidSession ─────────────────────────────────────────────────────────────

export class SimidSession {
  private msgCounter = 0;
  private pending = new Map<number, PendingResolve>();
  private messageListener: (e: MessageEvent) => void;
  private sessionId = '';
  private initSent = false;
  private initPromise: Promise<any> | null = null;
  private started = false;
  private destroyed = false;
  private mediaListeners: { event: string; handler: EventListener }[] = [];
  private visibilityHandler: (() => void) | null = null;
  /**
   * Detected outgoing message format.
   * 'plain'       — post plain JS objects (spec default, works with most creatives)
   * 'json-string' — post JSON.stringify(payload) as the message value; used when the
   *                 creative calls JSON.parse(event.data) to deserialise incoming messages
   *                 (e.g. Google's compiled SIMID sample creative)
   */
  private outgoingFormat: 'plain' | 'json-string' = 'plain';

  constructor(
    private iframe: HTMLIFrameElement,
    private adVideo: HTMLVideoElement,
    private callbacks: SimidCallbacks,
    private creativeInfo?: SimidCreativeInfo
  ) {
    this.messageListener = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageListener);
    this.bindMediaEvents();
  }

  // ─── Internal messaging helpers ───────────────────────────────────────────

  private nextMsgId(): number {
    return ++this.msgCounter;
  }

  /**
   * Post a payload to the creative's iframe using the detected outgoing format.
   * - 'plain': postMessage(payload, '*')
   * - 'json-string': postMessage(JSON.stringify(payload), '*')
   */
  private postMsg(payload: Record<string, unknown>): void {
    const data = this.outgoingFormat === 'json-string' ? JSON.stringify(payload) : payload;
    this.iframe.contentWindow?.postMessage(data, '*');
  }

  /**
   * Send a player→creative message that expects a resolve/reject response.
   * Returns a promise that resolves/rejects when the creative responds.
   */
  private send(type: SimidPlayerMessage, args?: Record<string, unknown>): Promise<any> {
    const messageId = this.nextMsgId();
    const payload: Record<string, unknown> = {
      type,
      messageId,
      sessionId: this.sessionId || undefined,
      timestamp: Date.now(),
      args: args ?? {},
    };
    return new Promise((resolve, reject) => {
      this.pending.set(messageId, { resolve, reject });
      try {
        this.postMsg(payload);
      } catch (e) {
        this.pending.delete(messageId);
        reject(e);
      }
    });
  }

  /**
   * Send a resolve response to the creative for a message it sent us.
   * Per spec: type="resolve", args={ messageId: <original>, value: <payload> }
   */
  private sendResolve(resolvedMessageId: number, value?: Record<string, unknown>): void {
    try {
      this.postMsg({
        type: SIMID_PLAYER.RESOLVE,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: { messageId: resolvedMessageId, value: value ?? {} },
      });
    } catch {
      /* ignore */
    }
  }

  /**
   * Send a reject response to the creative for a message it sent us.
   */
  private sendReject(resolvedMessageId: number, errorCode: number, message: string): void {
    try {
      this.postMsg({
        type: SIMID_PLAYER.REJECT,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: { messageId: resolvedMessageId, value: { errorCode, message } },
      });
    } catch {
      /* ignore */
    }
  }

  // ─── Message parsing ──────────────────────────────────────────────────────

  /**
   * Parse a raw postMessage payload into a SimidMessage.
   * Handles both plain objects and JSON-encoded strings.
   * Auto-detects the outgoing format from the first valid message received.
   */
  private parseMessageData(raw: unknown): SimidMessage | null {
    if (typeof raw === 'string') {
      let parsed: SimidMessage;
      try {
        parsed = JSON.parse(raw) as SimidMessage;
      } catch {
        return null;
      }
      if (!parsed?.type) return null;
      // Creative sends JSON strings → it expects JSON strings back.
      if (this.outgoingFormat === 'plain') this.outgoingFormat = 'json-string';
      return parsed;
    }
    if (raw && typeof raw === 'object') return raw as SimidMessage;
    return null;
  }

  // ─── Message dispatch ─────────────────────────────────────────────────────

  private handleMessage(event: MessageEvent) {
    if (this.destroyed) return;
    const data = this.parseMessageData(event.data);
    if (!data || !data.type) return;

    // Support both SIMID 1.2 (messageId) and legacy (msgId) fields.
    const incomingId = data.messageId ?? data.msgId ?? 0;

    switch (data.type) {
      // ── SIMID 1.2 session init ───────────────────────────────────────────

      case 'createSession':
        this.onCreateSession(incomingId, data.sessionId || '');
        break;

      case SIMID_CREATIVE.GET_MEDIA_STATE:
        this.sendResolve(incomingId, this.getMediaState());
        break;

      case SIMID_CREATIVE.READY:
        void this.onCreativeReady();
        break;

      // ── Promise resolution ───────────────────────────────────────────────
      // IAB reference creatives (simid_protocol.js) and Google's compiled sample send
      // type="resolve" / type="reject" when acknowledging player messages.
      // Some third-party implementations send type="SIMID:Creative:resolve" / "SIMID:Creative:reject".
      // Both forms are handled here.

      case 'resolve':           // IAB reference implementation pattern
      // falls through
      case SIMID_CREATIVE.RESOLVE: {
        // `resolves` (top-level) or args.messageId both point to our outgoing messageId.
        const resolvedId = data.resolves ?? (data.args?.messageId as number | undefined);
        const pending = resolvedId != null ? this.pending.get(resolvedId) : undefined;
        if (pending) {
          this.pending.delete(resolvedId!);
          pending.resolve(data.args?.value ?? data.args);
        }
        break;
      }

      case 'reject':            // IAB reference implementation pattern
      // falls through
      case SIMID_CREATIVE.REJECT: {
        const rejectedId = data.rejects ?? (data.args?.messageId as number | undefined);
        const pending = rejectedId != null ? this.pending.get(rejectedId) : undefined;
        if (pending) {
          this.pending.delete(rejectedId!);
          pending.reject({
            errorCode: data.errorCode ?? (data.args?.value as any)?.errorCode,
            reason: data.reason ?? (data.args?.value as any)?.message,
          });
        }
        break;
      }

      // ── Creative → Player commands ───────────────────────────────────────

      case SIMID_CREATIVE.REQUEST_SKIP:
        this.callbacks.onSkip();
        break;

      case SIMID_CREATIVE.REQUEST_STOP:
        this.callbacks.onStop();
        break;

      case SIMID_CREATIVE.REQUEST_PAUSE:
        this.callbacks.onPause();
        break;

      case SIMID_CREATIVE.REQUEST_PLAY:
        this.callbacks.onPlay();
        break;

      case SIMID_CREATIVE.CLICK_THROUGH: {
        const url = String(data.args?.url || data.args?.clickThroughUrl || '');
        if (url) this.callbacks.onClickThrough(url);
        break;
      }

      case SIMID_CREATIVE.REPORT_TRACKING: {
        const trackingEvent = String(data.args?.event || data.args?.trackingEvent || '');
        this.callbacks.onTrackingEvent(trackingEvent, data.args);
        break;
      }

      case SIMID_CREATIVE.REQUEST_FULLSCREEN: {
        const container = (this.iframe.closest('.op-ads') as HTMLElement) ?? this.iframe.parentElement;
        if (container?.requestFullscreen) {
          container.requestFullscreen().catch(() => this.sendReject(incomingId, 403, 'Fullscreen denied'));
        } else {
          this.sendReject(incomingId, 403, 'Fullscreen not supported');
        }
        break;
      }

      case SIMID_CREATIVE.REQUEST_RESIZE:
        void this.resize(this.iframe.offsetWidth || window.innerWidth, this.iframe.offsetHeight || window.innerHeight);
        break;

      case SIMID_CREATIVE.REQUEST_CHANGE_AD_DURATION: {
        const durationChange = Number(data.args?.durationChange ?? data.args?.duration ?? 0);
        if (this.callbacks.onRequestChangeAdDuration) {
          this.callbacks.onRequestChangeAdDuration(
            durationChange,
            () => this.sendResolve(incomingId, {}),
            (errorCode, reason) => this.sendReject(incomingId, errorCode, reason)
          );
        } else {
          this.sendReject(incomingId, 403, 'requestChangeAdDuration not supported');
        }
        break;
      }

      case SIMID_CREATIVE.FATAL:
        this.callbacks.onFatal(data.errorCode ?? 901, data.reason ?? 'Creative fatal error');
        break;

      case SIMID_CREATIVE.LOG:
        this.callbacks.onLog?.(data.args);
        break;

      default:
        break;
    }
  }

  // ─── Session initialization ───────────────────────────────────────────────

  /**
   * SIMID 1.2: creative sends createSession first.
   * Player responds with resolve, then immediately sends init.
   */
  private onCreateSession(messageId: number, sessionId: string): void {
    if (sessionId) this.sessionId = sessionId;
    this.sendResolve(messageId);
    if (!this.initSent) {
      this.initSent = true;
      this.initPromise = this.send(SIMID_PLAYER.INIT, {
        creativeData: this.buildCreativeData(),
        environmentData: this.buildEnvironmentData(),
      }).then(() => {
        // Creative resolved SIMID:Player:init → send startCreative immediately.
        // Creatives that never send SIMID:Creative:ready (e.g. Google's compiled sample)
        // rely on this path to trigger the interactive content.
        if (!this.started && !this.destroyed) {
          this.started = true;
          return this.send(SIMID_PLAYER.START_CREATIVE).catch(() => undefined);
        }
      }).catch(() => undefined);
    }
  }

  /**
   * Creative signals it is ready for startCreative.
   * If no createSession was received (older creatives), init is sent here as a fallback.
   */
  private async onCreativeReady(): Promise<void> {
    if (this.started) return;
    this.started = true;
    try {
      if (!this.initSent) {
        // Fallback: older creatives that skip createSession.
        this.initSent = true;
        await this.send(SIMID_PLAYER.INIT, {
          creativeData: this.buildCreativeData(),
          environmentData: this.buildEnvironmentData(),
        });
      } else if (this.initPromise) {
        // Wait for the in-flight init to be acknowledged before startCreative.
        await this.initPromise;
      }
      await this.send(SIMID_PLAYER.START_CREATIVE);
    } catch {
      /* Creative may reject — continue ad playback regardless */
    }
  }

  // ─── Data builders ────────────────────────────────────────────────────────

  private buildEnvironmentData(): Record<string, unknown> {
    const v = this.adVideo;
    const playerRect = this.iframe.getBoundingClientRect();
    const videoRect = v.getBoundingClientRect();
    const pw = Math.round(playerRect.width) || v.offsetWidth || 640;
    const ph = Math.round(playerRect.height) || v.offsetHeight || 360;
    const vw = Math.round(videoRect.width) || pw;
    const vh = Math.round(videoRect.height) || ph;
    const vol = v.muted ? 0 : Number.isFinite(v.volume) ? v.volume : 1;

    return {
      // ── SIMID 1.2 required fields ────────────────────────────────────────
      videoDimensions: {
        x: Math.round(videoRect.left),
        y: Math.round(videoRect.top),
        width: vw,
        height: vh,
      },
      creativeDimensions: {
        x: Math.round(playerRect.left),
        y: Math.round(playerRect.top),
        width: pw,
        height: ph,
      },
      fullscreen: !!document.fullscreenElement,
      fullscreenAllowed: true,
      variableDurationAllowed: typeof this.callbacks.onRequestChangeAdDuration === 'function',
      skippableState: 'notSkippable',
      version: '1.2',
      // ── SIMID 1.2 optional fields ────────────────────────────────────────
      siteUrl: typeof window !== 'undefined' ? window.location.href : '',
      muted: v.muted,
      volume: vol,
      // ── Legacy compatibility (older SIMID creatives) ─────────────────────
      playerWidth: pw,
      playerHeight: ph,
      videoDuration: Number.isFinite(v.duration) ? v.duration : 0,
      videoVolume: vol,
    };
  }

  private buildCreativeData(): Record<string, unknown> {
    return {
      adParameters: this.creativeInfo?.adParameters ?? '',
      clickThruUrl: this.creativeInfo?.clickThruUri ?? '',
      clickThruUri: this.creativeInfo?.clickThruUri ?? '',
    };
  }

  /** Current media state snapshot, used to respond to SIMID:Creative:getMediaState. */
  private getMediaState(): Record<string, unknown> {
    const v = this.adVideo;
    return {
      currentSrc: v.currentSrc || (v as any).src || '',
      currentTime: v.currentTime,
      duration: Number.isFinite(v.duration) ? v.duration : 0,
      ended: v.ended,
      muted: v.muted,
      paused: v.paused,
      volume: v.volume,
      fullscreen: !!document.fullscreenElement,
    };
  }

  // ─── Player → Creative public API ─────────────────────────────────────────

  /** Manually send SIMID:Player:init (e.g. when not using the automatic handshake). */
  init(creativeData: Record<string, unknown>, environmentData: Record<string, unknown>): Promise<any> {
    return this.send(SIMID_PLAYER.INIT, { creativeData, environmentData });
  }

  /** Manually send SIMID:Player:startCreative. */
  start(): Promise<any> {
    return this.send(SIMID_PLAYER.START_CREATIVE);
  }

  progress(currentTime: number, duration: number): void {
    if (this.destroyed) return;
    try {
      this.postMsg({
        type: SIMID_PLAYER.AD_PROGRESS,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: { currentTime, duration, remainingTime: Math.max(0, duration - currentTime) },
      });
    } catch {
      /* ignore */
    }
  }

  pause(): void {
    if (this.destroyed) return;
    try {
      this.postMsg({
        type: SIMID_PLAYER.AD_PAUSED,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: {},
      });
    } catch {
      /* ignore */
    }
  }

  resume(): void {
    if (this.destroyed) return;
    try {
      this.postMsg({
        type: SIMID_PLAYER.AD_PLAYING,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: {},
      });
    } catch {
      /* ignore */
    }
  }

  stop(): Promise<any> {
    if (this.destroyed) return Promise.resolve();
    return this.send(SIMID_PLAYER.AD_STOPPED).catch(() => undefined);
  }

  skip(): void {
    if (this.destroyed) return;
    try {
      this.postMsg({
        type: SIMID_PLAYER.AD_SKIPPED,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: {},
      });
    } catch {
      /* ignore */
    }
  }

  volumeChange(volume: number, muted: boolean): void {
    if (this.destroyed) return;
    try {
      this.postMsg({
        type: SIMID_PLAYER.AD_VOLUME,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: { volume, muted },
      });
    } catch {
      /* ignore */
    }
  }

  adDurationChange(duration: number): void {
    if (this.destroyed) return;
    try {
      this.postMsg({
        type: SIMID_PLAYER.AD_DURATION_CHANGE,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: { duration },
      });
    } catch {
      /* ignore */
    }
  }

  resize(width: number, height: number): Promise<any> {
    return this.send(SIMID_PLAYER.RESIZE, { width, height });
  }

  fatal(errorCode: number, reason: string): void {
    if (this.destroyed) return;
    try {
      this.postMsg({
        type: SIMID_PLAYER.FATAL,
        messageId: this.nextMsgId(),
        sessionId: this.sessionId || undefined,
        timestamp: Date.now(),
        args: { errorCode, reason },
      });
    } catch {
      /* ignore */
    }
  }

  // ─── Media event bridging ─────────────────────────────────────────────────

  /**
   * Bridge ad video DOM events to SIMID:Media:* postMessages and
   * document visibility changes to SIMID:Player:appBackgrounded/Foregrounded.
   * Called once from the constructor; listeners are cleaned up in destroy().
   */
  private bindMediaEvents(): void {
    const v = this.adVideo;
    const mediaEventMap: [string, string][] = [
      ['durationchange', SIMID_MEDIA.DURATION_CHANGE],
      ['ended', SIMID_MEDIA.ENDED],
      ['error', SIMID_MEDIA.ERROR],
      ['pause', SIMID_MEDIA.PAUSE],
      ['play', SIMID_MEDIA.PLAY],
      ['playing', SIMID_MEDIA.PLAYING],
      ['seeked', SIMID_MEDIA.SEEKED],
      ['seeking', SIMID_MEDIA.SEEKING],
      ['stalled', SIMID_MEDIA.STALLED],
      ['timeupdate', SIMID_MEDIA.TIME_UPDATE],
      ['volumechange', SIMID_MEDIA.VOLUME_CHANGE],
    ];
    for (const [domEvent, simidType] of mediaEventMap) {
      const handler: EventListener = () => {
        if (this.destroyed) return;
        try {
          this.postMsg({
            type: simidType,
            messageId: this.nextMsgId(),
            sessionId: this.sessionId || undefined,
            timestamp: Date.now(),
            args: this.getMediaState(),
          });
        } catch { /* ignore */ }
      };
      v.addEventListener(domEvent, handler);
      this.mediaListeners.push({ event: domEvent, handler });
    }

    this.visibilityHandler = () => {
      if (this.destroyed) return;
      const type = document.hidden ? SIMID_PLAYER.APP_BACKGROUNDED : SIMID_PLAYER.APP_FOREGROUNDED;
      try {
        this.postMsg({
          type,
          messageId: this.nextMsgId(),
          sessionId: this.sessionId || undefined,
          timestamp: Date.now(),
          args: {},
        });
      } catch { /* ignore */ }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    window.removeEventListener('message', this.messageListener);
    for (const { event, handler } of this.mediaListeners) {
      this.adVideo.removeEventListener(event, handler);
    }
    this.mediaListeners = [];
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    for (const [, p] of this.pending) {
      p.reject({ errorCode: 900, reason: 'SimidSession destroyed' });
    }
    this.pending.clear();
  }
}
