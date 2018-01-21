import {loadScript} from '../utils/dom';
import Iframe from "../components/iframe";

/**
 *
 * @class TwitchMedia
 * @description Class that handles the Twitch API within the player
 */
class TwitchMedia extends Iframe {
    /**
     * Creates an instance of TwitchMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {object} mediaFile
     * @returns {TwitchMedia}
     * @memberof TwitchMedia
     */
    constructor(element, mediaFile) {
        super(element, mediaFile);
        this.promise = (typeof Twitch === 'undefined') ?
            loadScript('https://player.twitch.tv/js/embed/v1.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    canPlayType(mimeType) {
        return mimeType === 'application/x-twitch' && this.media.type === mimeType;
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

export default TwitchMedia;
