/**
 * SimidSession — Full IAB SIMID (Secure Interactive Media Interface Definition) implementation.
 *
 * Protocol overview:
 *  - Player sends messages to the creative iframe via postMessage.
 *  - Creative sends messages back, handled by the player's message listener.
 *  - Each player→creative message carries a unique msgId. The creative responds
 *    with SIMID:Creative:resolve or SIMID:Creative:reject referencing that msgId.
 *
 * Spec: https://iabtechlab.com/standards/simid/
 */

// ─── Message type constants ───────────────────────────────────────────────────

export const SIMID_PLAYER = {
  INIT: 'SIMID:Player:init',
  START_AD: 'SIMID:Player:startAd',
  AD_PROGRESS: 'SIMID:Player:adProgress',
  AD_PAUSED: 'SIMID:Player:adPaused',
  AD_PLAYING: 'SIMID:Player:adPlaying',
  AD_STOPPED: 'SIMID:Player:adStopped',
  AD_SKIPPED: 'SIMID:Player:adSkipped',
  AD_VOLUME: 'SIMID:Player:adVolume',
  RESIZE: 'SIMID:Player:resize',
  FATAL: 'SIMID:Player:fatal',
  LOG: 'SIMID:Player:log',
} as const;

export const SIMID_CREATIVE = {
  READY: 'SIMID:Creative:ready',
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
  FATAL: 'SIMID:Creative:fatal',
  LOG: 'SIMID:Creative:log',
} as const;

type SimidPlayerMessage = typeof SIMID_PLAYER[keyof typeof SIMID_PLAYER];
type SimidCreativeMessage = typeof SIMID_CREATIVE[keyof typeof SIMID_CREATIVE];

type SimidMessage = {
  type: string;
  msgId: number;
  args?: Record<string, unknown>;
  resolves?: number;
  rejects?: number;
  errorCode?: number;
  reason?: string;
}

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
}

export class SimidSession {
  private msgId = 0;
  private pending = new Map<number, PendingResolve>();
  private messageListener: (e: MessageEvent) => void;
  private started = false;
  private destroyed = false;

  constructor(
    private iframe: HTMLIFrameElement,
    private adVideo: HTMLVideoElement,
    private callbacks: SimidCallbacks
  ) {
    this.messageListener = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageListener);
  }

  // ─── Internal send/receive ────────────────────────────────────────────────

  private nextMsgId(): number {
    return ++this.msgId;
  }

  private send(type: SimidPlayerMessage, args?: Record<string, unknown>, id?: number): Promise<any> {
    const msgId = id ?? this.nextMsgId();
    const msg: SimidMessage = { type, msgId, args: args ?? {} };

    return new Promise((resolve, reject) => {
      this.pending.set(msgId, { resolve, reject });
      try {
        this.iframe.contentWindow?.postMessage(msg, '*');
      } catch (e) {
        this.pending.delete(msgId);
        reject(e);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    if (this.destroyed) return;
    const data = event.data as SimidMessage;
    if (!data || typeof data.type !== 'string') return;

    switch (data.type as SimidCreativeMessage) {
      case SIMID_CREATIVE.READY:
        this.onCreativeReady(data);
        break;

      case SIMID_CREATIVE.RESOLVE: {
        const pending = data.resolves != null ? this.pending.get(data.resolves) : undefined;
        if (pending) {
          this.pending.delete(data.resolves!);
          pending.resolve(data.args);
        }
        break;
      }

      case SIMID_CREATIVE.REJECT: {
        const pending = data.rejects != null ? this.pending.get(data.rejects) : undefined;
        if (pending) {
          this.pending.delete(data.rejects!);
          pending.reject({ errorCode: data.errorCode, reason: data.reason });
        }
        break;
      }

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

      case SIMID_CREATIVE.REQUEST_FULLSCREEN:
        try {
          const container = this.iframe.closest('.op-ads') as HTMLElement ?? this.iframe.parentElement;
          container?.requestFullscreen?.().catch(() => undefined);
        } catch { /* ignore */ }
        break;

      case SIMID_CREATIVE.REQUEST_RESIZE:
        // Best-effort: notify the creative of current dimensions.
        void this.resize(
          this.iframe.offsetWidth || window.innerWidth,
          this.iframe.offsetHeight || window.innerHeight
        );
        break;

      case SIMID_CREATIVE.FATAL:
        this.callbacks.onFatal(data.errorCode ?? 901, data.reason ?? 'Creative fatal error');
        break;

      case SIMID_CREATIVE.LOG:
        this.callbacks.onLog?.(data.args);
        break;
    }
  }

  // ─── Creative-ready handshake ─────────────────────────────────────────────

  private async onCreativeReady(msg: SimidMessage) {
    if (this.started) return;
    this.started = true;

    const v = this.adVideo;
    const rect = this.iframe.getBoundingClientRect();

    const creativeData: Record<string, unknown> = {};
    const environmentData: Record<string, unknown> = {
      playerWidth: rect.width || v.offsetWidth || 640,
      playerHeight: rect.height || v.offsetHeight || 360,
      videoDuration: Number.isFinite(v.duration) ? v.duration : 0,
      videoVolume: v.muted ? 0 : (Number.isFinite(v.volume) ? v.volume : 1),
      fullscreen: !!(document.fullscreenElement),
      fullscreenAllowed: true,
    };

    try {
      await this.send(SIMID_PLAYER.INIT, { creativeData, environmentData }, msg.msgId ? undefined : this.nextMsgId());
      await this.send(SIMID_PLAYER.START_AD);
    } catch { /* Creative may reject — continue ad playback regardless */ }
  }

  // ─── Player → Creative API ────────────────────────────────────────────────

  init(creativeData: Record<string, unknown>, environmentData: Record<string, unknown>): Promise<any> {
    return this.send(SIMID_PLAYER.INIT, { creativeData, environmentData });
  }

  start(): Promise<any> {
    return this.send(SIMID_PLAYER.START_AD);
  }

  progress(currentTime: number, duration: number): void {
    if (this.destroyed) return;
    const msg: SimidMessage = {
      type: SIMID_PLAYER.AD_PROGRESS,
      msgId: this.nextMsgId(),
      args: { currentTime, duration, remainingTime: Math.max(0, duration - currentTime) },
    };
    try { this.iframe.contentWindow?.postMessage(msg, '*'); } catch { /* ignore */ }
  }

  pause(): void {
    if (this.destroyed) return;
    try { this.iframe.contentWindow?.postMessage({ type: SIMID_PLAYER.AD_PAUSED, msgId: this.nextMsgId() }, '*'); } catch { /* ignore */ }
  }

  resume(): void {
    if (this.destroyed) return;
    try { this.iframe.contentWindow?.postMessage({ type: SIMID_PLAYER.AD_PLAYING, msgId: this.nextMsgId() }, '*'); } catch { /* ignore */ }
  }

  stop(): Promise<any> {
    if (this.destroyed) return Promise.resolve();
    return this.send(SIMID_PLAYER.AD_STOPPED).catch(() => undefined);
  }

  skip(): void {
    if (this.destroyed) return;
    try { this.iframe.contentWindow?.postMessage({ type: SIMID_PLAYER.AD_SKIPPED, msgId: this.nextMsgId() }, '*'); } catch { /* ignore */ }
  }

  volumeChange(volume: number, muted: boolean): void {
    if (this.destroyed) return;
    try {
      this.iframe.contentWindow?.postMessage({
        type: SIMID_PLAYER.AD_VOLUME,
        msgId: this.nextMsgId(),
        args: { volume, muted },
      }, '*');
    } catch { /* ignore */ }
  }

  resize(width: number, height: number): Promise<any> {
    return this.send(SIMID_PLAYER.RESIZE, { width, height });
  }

  fatal(errorCode: number, reason: string): void {
    if (this.destroyed) return;
    try {
      this.iframe.contentWindow?.postMessage({
        type: SIMID_PLAYER.FATAL,
        msgId: this.nextMsgId(),
        args: { errorCode, reason },
      }, '*');
    } catch { /* ignore */ }
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    window.removeEventListener('message', this.messageListener);
    // Reject all pending promises.
    for (const [, p] of this.pending) {
      p.reject({ errorCode: 900, reason: 'SimidSession destroyed' });
    }
    this.pending.clear();
  }
}
