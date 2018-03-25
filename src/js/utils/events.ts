/**
 *
 * @param {string} event
 * @return {CustomEvent}
 */
export function addEvent(event: string, details?: object): CustomEvent {
    if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
    }

    return new CustomEvent(event, details);
}

export const events: string[] = [
    'loadstart', 'durationchange', 'loadedmetadata', 'loadeddata',
    'progress', 'canplay', 'canplaythrough', 'suspend', 'abort', 'error',
    'emptied', 'stalled', 'play', 'playing',  'pause', 'waiting', 'seeking',
    'seeked', 'timeupdate', 'ended', 'ratechange', 'volumechange',
];
