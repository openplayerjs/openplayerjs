/**
 * SimidRpcChannel — low-level SIMID postMessage RPC layer.
 *
 * Handles the wire-protocol details for a single SIMID creative session:
 *   - Outgoing message counter and pending-promise map
 *   - Format auto-detection ('plain' objects vs JSON-string encoding)
 *   - Target-origin pinning from the first valid message
 *   - send() / sendResolve() / sendReject() / postMsg()
 *   - Inbound message parsing (handles both plain objects and JSON strings)
 *   - Window message listener lifecycle
 *
 * `SimidSession` composes this class and provides the higher-level
 * protocol logic (session init, creative ready, media bridging, lifecycle).
 */

import { SIMID_PLAYER } from './simid-protocol';
import type { PendingResolve, SimidMessage, SimidPlayerMessage } from './simid-protocol';

export class SimidRpcChannel {
  private msgCounter = 0;
  private pending = new Map<number, PendingResolve>();
  private messageListener: (e: MessageEvent) => void;
  /**
   * Detected outgoing message format.
   * 'plain'       — post plain JS objects (spec default, works with most creatives)
   * 'json-string' — post JSON.stringify(payload) as the message value; used when the
   *                 creative calls JSON.parse(event.data) to deserialise incoming messages
   *                 (e.g. Google's compiled SIMID sample creative)
   */
  private outgoingFormat: 'plain' | 'json-string' = 'plain';
  private _targetOrigin: string | null = null;
  /** Authoritative window to postMessage to — pinned from event.source on first valid message. */
  private creativeWindow: Window | null = null;

  protected sessionId = '';

  constructor(
    protected iframe: HTMLIFrameElement,
    private onMessage: (data: SimidMessage, event: MessageEvent) => void
  ) {
    this.messageListener = (e: MessageEvent) => this.handleRawMessage(e);
    window.addEventListener('message', this.messageListener);
  }

  // ─── Message counter ────────────────────────────────────────────────────────

  protected nextMsgId(): number {
    return ++this.msgCounter;
  }

  // ─── Target origin ──────────────────────────────────────────────────────────

  /**
   * Returns the target origin for postMessage calls to the creative iframe.
   * Prefer the origin captured from the first incoming message (event.origin),
   * which reflects where the iframe actually landed after any redirects.
   * Falls back to deriving from iframe.src until the first message arrives.
   */
  protected getTargetOrigin(): string {
    if (this._targetOrigin !== null) return this._targetOrigin;
    try {
      const origin = new URL(this.iframe.src, window.location.href).origin;
      // data: and blob: URLs produce the string "null" as their origin — treat as wildcard.
      return origin === 'null' ? '*' : origin;
    } catch /* istanbul ignore next */ {
      return '*';
    }
  }

  // ─── Message sending ────────────────────────────────────────────────────────

  /**
   * Post a payload to the creative's iframe using the detected outgoing format.
   * - 'plain': postMessage(payload, origin)
   * - 'json-string': postMessage(JSON.stringify(payload), origin)
   */
  protected postMsg(payload: Record<string, unknown>): void {
    const target = this.creativeWindow ?? this.iframe.contentWindow;
    if (!target) return;
    const data = this.outgoingFormat === 'json-string' ? JSON.stringify(payload) : payload;
    target.postMessage(data, this.getTargetOrigin());
  }

  /**
   * Send a player→creative message that expects a resolve/reject response.
   * Returns a promise that resolves/rejects when the creative responds.
   */
  protected send(type: SimidPlayerMessage, args?: Record<string, unknown>): Promise<any> {
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
  protected sendResolve(resolvedMessageId: number, value?: Record<string, unknown>): void {
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
  protected sendReject(resolvedMessageId: number, errorCode: number, message: string): void {
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

  // ─── Inbound message parsing ─────────────────────────────────────────────────

  /**
   * Parse a raw postMessage payload into a SimidMessage.
   * Handles both plain objects and JSON-encoded strings.
   * Auto-detects the outgoing format from the first valid message received.
   */
  protected parseMessageData(raw: unknown): SimidMessage | null {
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

  // ─── Pending promise resolution (called by SimidSession.handleMessage) ───────

  /**
   * Resolve or reject a pending send() promise based on a creative resolve/reject message.
   * Returns true if the message was handled (the pending promise was found and settled).
   */
  protected resolvePending(data: SimidMessage): boolean {
    const isResolve = data.type === 'resolve' || data.type === 'SIMID:Creative:resolve';
    const isReject = data.type === 'reject' || data.type === 'SIMID:Creative:reject';

    if (isResolve) {
      const resolvedId = data.resolves ?? (data.args?.messageId as number | undefined);
      const p = resolvedId != null ? this.pending.get(resolvedId) : undefined;
      if (p) {
        this.pending.delete(resolvedId!);
        p.resolve(data.args?.value ?? data.args);
        return true;
      }
    }

    if (isReject) {
      const rejectedId = data.rejects ?? (data.args?.messageId as number | undefined);
      const p = rejectedId != null ? this.pending.get(rejectedId) : undefined;
      if (p) {
        this.pending.delete(rejectedId!);
        p.reject({
          errorCode: data.errorCode ?? (data.args?.value as any)?.errorCode,
          reason: data.reason ?? (data.args?.value as any)?.message,
        });
        return true;
      }
    }

    return false;
  }

  // ─── Raw message dispatch ────────────────────────────────────────────────────

  private handleRawMessage(event: MessageEvent): void {
    const data = this.parseMessageData(event.data);
    if (!data || !data.type) return;

    // Pin the target window and origin from event.source/event.origin on the
    // first valid message. Using event.source (rather than iframe.contentWindow)
    // is resilient to redirects and click-through navigations that replace the
    // iframe's content after the session starts.
    /* istanbul ignore next — event.source is always null for synthetic MessageEvents in jsdom */
    if (this.creativeWindow === null && event.source instanceof Window) {
      this.creativeWindow = event.source;
    }
    if (this._targetOrigin === null && event.origin && event.origin !== 'null') {
      this._targetOrigin = event.origin;
    }

    this.onMessage(data, event);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  destroyChannel(): void {
    window.removeEventListener('message', this.messageListener);
    for (const [, p] of this.pending) {
      p.reject({ errorCode: 900, reason: 'SimidSession destroyed' });
    }
    this.pending.clear();
  }
}
