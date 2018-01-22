import {loadScript} from '../utils/dom';
import Iframe from '../components/iframe';

declare const FB: any;

/**
 *
 * @class FacebookMedia
 * @description Class that handles the Facebook API within the player
 */
class FacebookMedia extends Iframe {
    /**
     * Creates an instance of FacebookMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {File} mediaFile
     * @returns {FacebookMedia}
     * @memberof FacebookMedia
     */
    constructor(element, mediaFile) {
        super(element, mediaFile);
        this.promise = (typeof FB === 'undefined') ?
            loadScript('https://connect.facebook.net/en/sdk.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    canPlayType(mimeType) {
        return mimeType === 'application/x-facebook' && this.media.type === mimeType;
    }

    load() {
        console.log(this);
    }

    play() {

    }

    pause() {

    }

    destroy() {
    }

    set src(media) {
    }

    get src() {
        return 'aaaaa';
    }

    set volume(value) {

    }

    get volume() {
        return 1;
    }

    set muted(value) {

    }

    get muted() {
        return true;
    }
}

export default FacebookMedia;
