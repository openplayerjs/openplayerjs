/**
 *
 * @param {string} event
 * @return {CustomEvent}
 */
export function addEvent(event, details?) {
    if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
    }

    return new CustomEvent(event, details);
}
