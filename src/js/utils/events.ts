/**
 * Create a custom event for any purpose.
 *
 * @export
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
 * @param {string} event  The name of the event
 * @param {?object} CustomEventInit  If passed, it must contain `detail` (event-dependent value associated with the event).
 * @returns {CustomEvent}
 */
export function addEvent(event: string, details?: CustomEventInit): CustomEvent {
    if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
    }

    return new CustomEvent(event, details);
}

/**
 * Media's default events.
 *
 * @type string[]
 * @default
 */
export const events: string[] = [
    'loadstart', 'durationchange', 'loadedmetadata', 'loadeddata',
    'progress', 'canplay', 'canplaythrough', 'suspend', 'abort', 'error',
    'emptied', 'stalled', 'play', 'playing',  'pause', 'waiting', 'seeking',
    'seeked', 'timeupdate', 'ended', 'ratechange', 'volumechange',
];
