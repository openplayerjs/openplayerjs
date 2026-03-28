/**
 * Minimal SCTE-35 splice_info_section decoder.
 *
 * Accepts the three forms a splice_info_section can arrive in:
 *   - ArrayBuffer  (DataCue.data from enableID3MetadataCues)
 *   - Uint8Array   (same, already sliced)
 *   - base64 string (EXT-X-DATERANGE X-SCTE35 attribute value)
 *
 * Only splice_insert (0x05) and time_signal (0x06) are decoded.
 * All other command types are returned as { type: 'unknown' }.
 */

export type SpliceCommand =
  | { type: 'splice_insert'; outOfNetwork: boolean; durationSecs: number | null; autoReturn: boolean }
  | { type: 'time_signal' }
  | { type: 'unknown'; commandType: number };

/**
 * Decode a SCTE-35 splice_info_section.
 * Returns `null` if the buffer cannot be parsed as a valid section.
 */
export function decodeSplice(source: ArrayBufferLike | Uint8Array | string): SpliceCommand | null {
  let buf: Uint8Array;

  if (typeof source === 'string') {
    // Base64 string from EXT-X-DATERANGE X-SCTE35 attribute.
    // Strip any "0x" prefix that some encoders add before base64.
    const b64 = source.startsWith('0x') || source.startsWith('0X') ? source.slice(2) : source;
    try {
      const binary = atob(b64);
      buf = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    } catch {
      return null;
    }
  } else {
    buf = source instanceof Uint8Array ? source : new Uint8Array(source);
  }

  // Locate the splice_info_section — table_id byte must be 0xFC.
  // ID3 frames prefix the binary with a frame header so we scan forward.
  let start = 0;
  while (start < buf.length && buf[start] !== 0xfc) start++;
  if (start + 14 > buf.length) return null;

  const commandType = buf[start + 13];

  if (commandType === 0x05) {
    // splice_insert
    if (start + 15 > buf.length) return null;
    const flags = buf[start + 14];
    const outOfNetwork = !!(flags & 0x80);
    const hasDuration = !!(flags & 0x02);

    if (!hasDuration) {
      return { type: 'splice_insert', outOfNetwork, durationSecs: null, autoReturn: false };
    }

    if (start + 24 > buf.length) return null;
    const d0 = buf[start + 19];
    const autoReturn = !!(d0 & 0x80);
    // break_duration is a 33-bit value in 90 kHz ticks.
    const ticks =
      ((d0 & 0x01) * 2 ** 32) +
      (buf[start + 20] * 2 ** 24) +
      (buf[start + 21] * 2 ** 16) +
      (buf[start + 22] * 2 ** 8) +
       buf[start + 23];

    return { type: 'splice_insert', outOfNetwork, durationSecs: ticks / 90_000, autoReturn };
  }

  if (commandType === 0x06) return { type: 'time_signal' };

  return { type: 'unknown', commandType };
}
