export function formatTime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds - (hrs * 3600)) / 60);
    let secs = Math.floor(seconds - (hrs * 3600) - (min * 60));
    const showHours = hrs > 0;

    hrs = hrs < 10 ? `0${hrs}` : hrs;
    secs = secs < 10 ? `0${secs}` : secs;
    return `${(showHours ? `${hrs}:` : '')}${min}:${secs}`;
}

export const n = 1;
