/** @jest-environment jsdom */

/**
 * Unit tests for SimidRpcChannel (packages/ads/src/simid-rpc.ts)
 *
 * Tests the wire-protocol layer in isolation: message counter, target origin
 * detection, pending promise map, and inbound message parsing.
 *
 * We subclass SimidRpcChannel (which uses protected methods) so we can call the
 * protected API directly without going through the full SimidSession.
 */

import type { SimidMessage } from '../src/simid-protocol';
import { SimidRpcChannel } from '../src/simid-rpc';

// ─── Concrete test subclass ───────────────────────────────────────────────────

class TestChannel extends SimidRpcChannel {
  public received: SimidMessage[] = [];
  public lastEvent: MessageEvent | null = null;

  constructor(iframe: HTMLIFrameElement) {
    super(iframe, (data, event) => {
      this.received.push(data);
      this.lastEvent = event;
    });
  }

  // Expose protected methods for testing
  public callNextMsgId() {
    return this.nextMsgId();
  }
  public callGetTargetOrigin() {
    return this.getTargetOrigin();
  }
  public callPostMsg(payload: Record<string, unknown>) {
    return this.postMsg(payload);
  }
  public callSend(type: string, args?: Record<string, unknown>) {
    return this.send(type as any, args);
  }
  public callSendResolve(id: number, value?: Record<string, unknown>) {
    return this.sendResolve(id, value);
  }
  public callSendReject(id: number, code: number, msg: string) {
    return this.sendReject(id, code, msg);
  }
  public callParseMessageData(raw: unknown) {
    return this.parseMessageData(raw);
  }
  public callResolvePending(data: SimidMessage) {
    return this.resolvePending(data);
  }
  public getSessionId() {
    return this.sessionId;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://creative.example.com/simid';
  document.body.appendChild(iframe);
  return iframe;
}

function dispatchMessageEvent(data: unknown, origin = 'https://creative.example.com') {
  window.dispatchEvent(new MessageEvent('message', { data, origin }));
}

beforeEach(() => {
  document.body.innerHTML = '';
});

// ─── Message counter ──────────────────────────────────────────────────────────

describe('SimidRpcChannel: message counter', () => {
  it('increments from 1 on each call', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    expect(ch.callNextMsgId()).toBe(1);
    expect(ch.callNextMsgId()).toBe(2);
    expect(ch.callNextMsgId()).toBe(3);
    ch.destroyChannel();
  });
});

// ─── Target origin ────────────────────────────────────────────────────────────

describe('SimidRpcChannel: target origin', () => {
  it('derives origin from iframe.src before first message', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    expect(ch.callGetTargetOrigin()).toBe('https://creative.example.com');
    ch.destroyChannel();
  });

  it('falls back to * for data: URLs', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'data:text/html,<p>test</p>';
    document.body.appendChild(iframe);
    const ch = new TestChannel(iframe);
    expect(ch.callGetTargetOrigin()).toBe('*');
    ch.destroyChannel();
  });

  it('pins target origin from first incoming message', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    dispatchMessageEvent({ type: 'SIMID:Creative:ready' }, 'https://pinned.example.com');
    expect(ch.callGetTargetOrigin()).toBe('https://pinned.example.com');
    ch.destroyChannel();
  });
});

// ─── parseMessageData ─────────────────────────────────────────────────────────

describe('SimidRpcChannel: parseMessageData()', () => {
  it('returns plain object messages directly', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    const msg = { type: 'SIMID:Creative:ready' };
    expect(ch.callParseMessageData(msg)).toBe(msg);
    ch.destroyChannel();
  });

  it('parses JSON string messages', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    const result = ch.callParseMessageData(JSON.stringify({ type: 'SIMID:Creative:ready' }));
    expect(result).toEqual({ type: 'SIMID:Creative:ready' });
    ch.destroyChannel();
  });

  it('returns null for invalid JSON strings', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    expect(ch.callParseMessageData('not-json{')).toBeNull();
    ch.destroyChannel();
  });

  it('returns null for JSON strings without a type field', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    expect(ch.callParseMessageData(JSON.stringify({ foo: 'bar' }))).toBeNull();
    ch.destroyChannel();
  });

  it('returns null for numbers and booleans', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    expect(ch.callParseMessageData(42)).toBeNull();
    expect(ch.callParseMessageData(true)).toBeNull();
    ch.destroyChannel();
  });
});

// ─── Inbound message dispatch ─────────────────────────────────────────────────

describe('SimidRpcChannel: inbound message routing', () => {
  it('calls onMessage for valid plain-object messages', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    dispatchMessageEvent({ type: 'SIMID:Creative:ready' });
    expect(ch.received).toHaveLength(1);
    expect(ch.received[0].type).toBe('SIMID:Creative:ready');
    ch.destroyChannel();
  });

  it('calls onMessage for valid JSON-string messages', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    dispatchMessageEvent(JSON.stringify({ type: 'SIMID:Creative:ready' }));
    expect(ch.received).toHaveLength(1);
    ch.destroyChannel();
  });

  it('ignores messages with no type', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    dispatchMessageEvent({ foo: 'bar' });
    expect(ch.received).toHaveLength(0);
    ch.destroyChannel();
  });

  it('ignores non-object messages', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    dispatchMessageEvent(42);
    expect(ch.received).toHaveLength(0);
    ch.destroyChannel();
  });
});

// ─── send() and resolvePending() ─────────────────────────────────────────────

describe('SimidRpcChannel: send() promise resolution', () => {
  it('resolves the promise when a matching resolve message arrives (spec format)', async () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);

    // Intercept postMsg so we know the messageId used
    const promise = ch.callSend('SIMID:Player:init', {});
    // The messageId is 1 (first send)
    const sentId = 1;

    // Simulate creative resolving that message (spec format)
    const resolveData: SimidMessage = {
      type: 'resolve',
      messageId: 99,
      args: { messageId: sentId, value: { ok: true } },
    };
    ch.callResolvePending(resolveData);

    const result = await promise;
    expect(result).toEqual({ ok: true });
    ch.destroyChannel();
  });

  it('rejects the promise when a matching reject message arrives', async () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    const promise = ch.callSend('SIMID:Player:init', {});

    const rejectData: SimidMessage = {
      type: 'reject',
      messageId: 99,
      args: { messageId: 1, value: { errorCode: 400, message: 'bad request' } },
    };
    ch.callResolvePending(rejectData);

    await expect(promise).rejects.toMatchObject({ errorCode: 400 });
    ch.destroyChannel();
  });

  it('returns false from resolvePending when no matching pending promise exists', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    const result = ch.callResolvePending({ type: 'resolve', args: { messageId: 999 } });
    expect(result).toBe(false);
    ch.destroyChannel();
  });

  it('returns true from resolvePending when the promise was settled', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    ch.callSend('SIMID:Player:init', {}); // queues messageId=1
    const result = ch.callResolvePending({ type: 'resolve', args: { messageId: 1, value: {} } });
    expect(result).toBe(true);
    ch.destroyChannel();
  });
});

// ─── destroyChannel() ─────────────────────────────────────────────────────────

describe('SimidRpcChannel: destroyChannel()', () => {
  it('stops receiving messages after destroyChannel()', () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    ch.destroyChannel();
    dispatchMessageEvent({ type: 'SIMID:Creative:ready' });
    expect(ch.received).toHaveLength(0);
  });

  it('rejects pending promises with errorCode 900 on destroy', async () => {
    const iframe = makeIframe();
    const ch = new TestChannel(iframe);
    const promise = ch.callSend('SIMID:Player:init', {});
    ch.destroyChannel();
    await expect(promise).rejects.toMatchObject({ errorCode: 900 });
  });
});
