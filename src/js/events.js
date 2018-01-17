class Emitter {
    constructor() {
        const delegate = document.createDocumentFragment();
        const callbacks = {
            on: 'addEventListener',
            trigger: 'dispatchEvent',
            off: 'removeEventListener'
        };
        Object.keys(callbacks).forEach(alias => {
            this[alias] = (...xs) => delegate[callback[alias]](...xs);
        });
    }
}

export default Emitter;

/**
 *
 * @param {string} event
 * @return {CustomEvent}
 */
export function addEvent(event) {
    if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
    }

    return new CustomEvent(event);
}
