/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const matchers = require('jest-extended');

expect.extend(matchers);

Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    value: () =>
        new Promise((resolve) => {
            resolve(true);
        }),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    value: () => null,
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    value: () => null,
});

Object.defineProperty(HTMLMediaElement.prototype, 'textTracks', {
    value: {
        addEventListener: () => true,
        removeEventListener: () => false,
        '-1': {
            addEventListener: () => true,
            removeEventListener: () => false,
            dispatchEvent: () => false,
        },
    },
});

Object.defineProperty(HTMLMediaElement.prototype, 'addTextTrack', {
    value(vals) {
        const keys = Object.keys(HTMLMediaElement.prototype.textTracks)
            .filter((key) => !Number.isNaN(Number(key)))
            .map((key) => Number(key));
        const nextKey = keys[keys.length - 1] + 1;
        this.textTracks[nextKey] = {
            kind: vals,
            addEventListener: () => true,
            removeEventListener: () => false,
            dispatchEvent: () => false,
        };
        return this.textTracks[nextKey];
    },
});
