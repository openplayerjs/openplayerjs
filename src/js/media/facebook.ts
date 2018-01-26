import Iframe from '../components/iframe';
import {loadScript} from '../utils/dom';

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

    public canPlayType(mimeType) {
        return mimeType === 'application/x-facebook';
    }

    public load() {
        console.log(this);
    }

    public play() {

    }

    public pause() {

    }

    public destroy() {
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

    get paused() {
        return true;
    }

    get ended() {
        return true;
    }
}

export default FacebookMedia;
