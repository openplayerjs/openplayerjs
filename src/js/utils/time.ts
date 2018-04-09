/**
 * Generate a human-readable time based on media current time.
 *
 * @export
 * @param {number} seconds  The time to be converted to a human-readbable format (STMPE).
 * @param {?number} frameRate  The numbers of frames per second.
 * @returns {string}
 */
export function formatTime(seconds: number, frameRate?: number) {
    const f = Math.floor((seconds % 1) * (frameRate || 0));
    let s = Math.floor(seconds);
    let m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const wrap = (value: number) => value < 10 ? `0${value}` : value;
    m = m % 60;
    s = s % 60;
    return `${h > 0 ? `${wrap(h)}:` : ''}${wrap(m)}:${wrap(s)}${(f ? `:${wrap(f)}` : '')}`;
}
/**
 * Convert STMPE string into seconds
 *
 * @see https://en.wikipedia.org/wiki/SMPTE_timecode
 * @export
 * @param {string} timecode  The STMPE string to be converted.
 * @returns {number}
 */
export function timeToSeconds(timecode: string) {
    const time = timecode.replace(/;/g, ':').split(':');
    let seconds = parseFloat(time[0]) * 60 * 60;
    seconds += parseFloat(time[1]) * 60;
    seconds += parseFloat(time[2]);
    return seconds;
}
