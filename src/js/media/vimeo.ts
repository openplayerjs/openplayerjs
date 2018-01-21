import {loadScript} from '../utils/dom';
import Iframe from "../components/iframe";

/**
 *
 * @class VimeoMedia
 * @description Class that handles the Vimeo API within the player
 */
class VimeoMedia extends Iframe {
    /**
     * Creates an instance of VimeoMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {object} mediaFile
     * @returns {VimeoMedia}
     * @memberof VimeoMedia
     */
    constructor(element, mediaFile) {
        super(element, mediaFile);
        this.promise = (typeof Vimeo === 'undefined') ?
            loadScript('https://player.vimeo.com/api/player.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    canPlayType(mimeType) {
        return mimeType === 'application/x-vimeo' && this.media.type === mimeType;
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

export default VimeoMedia;
