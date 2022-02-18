export function formatTime(seconds: number, frameRate?: number): string {
    const f = Math.floor((seconds % 1) * (frameRate || 0));
    let s = Math.floor(seconds);
    let m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const wrap = (value: number): string => {
        if (value < 10) {
            if (value <= 0) {
                return '00';
            }
            return `0${value.toString()}`;
        }
        return value.toString();
    };
    m %= 60;
    s %= 60;
    return `${h > 0 ? `${wrap(h)}:` : ''}${wrap(m)}:${wrap(s)}${f ? `:${wrap(f)}` : ''}`;
}

// @see https://en.wikipedia.org/wiki/SMPTE_timecode
export function timeToSeconds(timeCode: string): number {
    const time = timeCode.replace(/;/g, ':').split(':');
    let seconds = 0;
    // Hours found; use different calculation
    if (time.length === 3) {
        seconds += parseFloat(time[0]) * 60 * 60;
        seconds += parseFloat(time[1]) * 60;
        seconds += parseFloat(time[2]);
    } else {
        seconds += parseFloat(time[0]) * 60;
        seconds += parseFloat(time[1]);
    }
    return seconds;
}
