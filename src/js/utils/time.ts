/**
 * Generate a human-readable time based on media current time
 *
 * @export
 * @param {number} seconds
 * @returns {string}
 */
export default function formatTime(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds - (hrs * 3600)) / 60);
    const secs = Math.floor(seconds - (hrs * 3600) - (min * 60));
    const showHours = hrs > 0;

    const hrsFormat = hrs < 10 ? `0${hrs}` : hrs;
    const minFormat = min < 10 && showHours ? `0${min}` : min;
    const secsFormat = secs < 10 ? `0${secs}` : secs;
    return `${(showHours ? `${hrsFormat}:` : '')}${minFormat}:${secsFormat}`;
}
