// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    value: { addEventListener: () => true, removeEventListener: () => false },
});
