/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const matchers = require('jest-extended');

expect.extend(matchers);

window.HTMLMediaElement.prototype.play = () =>
    new Promise((resolve) => {
        resolve(true);
    });
window.HTMLMediaElement.prototype.pause = () => {
    /* do nothing */
};
