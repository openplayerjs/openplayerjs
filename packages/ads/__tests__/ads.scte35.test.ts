/** @jest-environment jsdom */

/**
 * packages/ads/__tests__/ads.scte35.test.ts
 *
 * Unit tests for the decodeSplice() SCTE-35 parser.
 * Covers: ArrayBuffer input, Uint8Array input, base64-string input,
 * splice_insert with/without duration, time_signal, unknown command type,
 * and error/null cases.
 */

import { decodeSplice } from '../src/strategies/scte35';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal splice_info_section as a Uint8Array.
 *
 * Layout (byte offsets from the 0xFC start):
 *   0        table_id           = 0xFC
 *   1-12     ignored fields
 *   13       splice_command_type
 *   14       flags (splice_insert only)
 *   15-18    ignored
 *   19       break_duration byte 0 (bits: auto_return[7], reserved[6..1], dur_33[0])
 *   20-23    break_duration bytes 1-4 (28 low bits of 33-bit tick count)
 */
function makeSpliceInsert(opts: {
  outOfNetwork?: boolean;
  hasDuration?: boolean;
  durationTicks?: number;
  autoReturn?: boolean;
}): Uint8Array {
  const {
    outOfNetwork = true,
    hasDuration = false,
    durationTicks = 0,
    autoReturn = false,
  } = opts;

  const buf = new Uint8Array(32);
  buf[0] = 0xfc; // table_id
  buf[13] = 0x05; // splice_insert command

  let flags = 0;
  if (outOfNetwork) flags |= 0x80;
  if (hasDuration)  flags |= 0x02;
  buf[14] = flags;

  if (hasDuration) {
    // 33-bit ticks split: bit 32 in d0[0], bits 31..0 in bytes 20-23
    const hi = (durationTicks / 2 ** 32) & 0x01;
    const lo = durationTicks >>> 0;
    buf[19] = (autoReturn ? 0x80 : 0x00) | hi;
    buf[20] = (lo >>> 24) & 0xff;
    buf[21] = (lo >>> 16) & 0xff;
    buf[22] = (lo >>> 8)  & 0xff;
    buf[23] =  lo         & 0xff;
  }

  return buf;
}

function toBase64(buf: Uint8Array): string {
  let binary = '';
  for (const b of buf) binary += String.fromCharCode(b);
  return btoa(binary);
}

// ─── splice_insert — basic ────────────────────────────────────────────────────

describe('decodeSplice — splice_insert', () => {
  test('detects out-of-network splice without duration (Uint8Array)', () => {
    const buf = makeSpliceInsert({ outOfNetwork: true, hasDuration: false });
    const cmd = decodeSplice(buf);
    expect(cmd).toEqual({ type: 'splice_insert', outOfNetwork: true, durationSecs: null, autoReturn: false });
  });

  test('detects in-network splice (splice-in)', () => {
    const buf = makeSpliceInsert({ outOfNetwork: false, hasDuration: false });
    const cmd = decodeSplice(buf);
    expect(cmd).toEqual({ type: 'splice_insert', outOfNetwork: false, durationSecs: null, autoReturn: false });
  });

  test('decodes break_duration in seconds (30s = 2_700_000 ticks)', () => {
    const ticks = 30 * 90_000; // 2_700_000
    const buf = makeSpliceInsert({ outOfNetwork: true, hasDuration: true, durationTicks: ticks, autoReturn: true });
    const cmd = decodeSplice(buf);
    expect(cmd).toEqual({ type: 'splice_insert', outOfNetwork: true, durationSecs: 30, autoReturn: true });
  });

  test('decodes 60-second break', () => {
    const ticks = 60 * 90_000;
    const buf = makeSpliceInsert({ outOfNetwork: true, hasDuration: true, durationTicks: ticks });
    const cmd = decodeSplice(buf);
    expect(cmd?.type).toBe('splice_insert');
    expect((cmd as any).durationSecs).toBeCloseTo(60, 4);
  });

  test('autoReturn flag is preserved', () => {
    const buf = makeSpliceInsert({ hasDuration: true, durationTicks: 90_000, autoReturn: true });
    const cmd = decodeSplice(buf);
    expect((cmd as any).autoReturn).toBe(true);
  });

  test('autoReturn defaults to false when not set', () => {
    const buf = makeSpliceInsert({ hasDuration: true, durationTicks: 90_000, autoReturn: false });
    const cmd = decodeSplice(buf);
    expect((cmd as any).autoReturn).toBe(false);
  });
});

// ─── Input format variants ────────────────────────────────────────────────────

describe('decodeSplice — input formats', () => {
  test('accepts Uint8Array', () => {
    const buf = makeSpliceInsert({ outOfNetwork: true });
    expect(decodeSplice(buf)?.type).toBe('splice_insert');
  });

  test('accepts ArrayBuffer', () => {
    const buf = makeSpliceInsert({ outOfNetwork: true });
    expect(decodeSplice(buf.buffer)?.type).toBe('splice_insert');
  });

  test('accepts base64 string', () => {
    const buf = makeSpliceInsert({ outOfNetwork: true });
    const b64 = toBase64(buf);
    expect(decodeSplice(b64)?.type).toBe('splice_insert');
  });

  test('accepts base64 string with 0x prefix', () => {
    const buf = makeSpliceInsert({ outOfNetwork: true });
    const b64 = '0x' + toBase64(buf);
    expect(decodeSplice(b64)?.type).toBe('splice_insert');
  });

  test('accepts base64 string with 0X prefix', () => {
    const buf = makeSpliceInsert({ outOfNetwork: true });
    const b64 = '0X' + toBase64(buf);
    expect(decodeSplice(b64)?.type).toBe('splice_insert');
  });

  test('scans past prefix bytes to find 0xFC', () => {
    // Simulate an ID3 frame header before the splice_info_section.
    const splice = makeSpliceInsert({ outOfNetwork: true });
    const withPrefix = new Uint8Array(10 + splice.length);
    withPrefix.set([0x49, 0x44, 0x33, 0, 0, 0, 0, 0, 0, 0]); // fake ID3 header
    withPrefix.set(splice, 10);
    expect(decodeSplice(withPrefix)?.type).toBe('splice_insert');
  });
});

// ─── Other command types ──────────────────────────────────────────────────────

describe('decodeSplice — other command types', () => {
  test('returns { type: "time_signal" } for command 0x06', () => {
    const buf = new Uint8Array(16);
    buf[0] = 0xfc;
    buf[13] = 0x06;
    expect(decodeSplice(buf)).toEqual({ type: 'time_signal' });
  });

  test('returns { type: "unknown" } for unrecognised command', () => {
    const buf = new Uint8Array(16);
    buf[0] = 0xfc;
    buf[13] = 0xff;
    expect(decodeSplice(buf)).toEqual({ type: 'unknown', commandType: 0xff });
  });
});

// ─── Null / error cases ───────────────────────────────────────────────────────

describe('decodeSplice — null cases', () => {
  test('returns null for empty buffer', () => {
    expect(decodeSplice(new Uint8Array(0))).toBeNull();
  });

  test('returns null for buffer shorter than 14 bytes after table_id', () => {
    const buf = new Uint8Array(10);
    buf[0] = 0xfc;
    expect(decodeSplice(buf)).toBeNull();
  });

  test('returns null when no 0xFC byte is found', () => {
    const buf = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    expect(decodeSplice(buf)).toBeNull();
  });

  test('returns null for invalid base64 string', () => {
    expect(decodeSplice('not-valid-base64!!!')).toBeNull();
  });
});
