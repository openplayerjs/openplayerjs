import Iframe from '../components/iframe';
import {loadScript} from '../utils/dom';

declare const Twitch: any;

/**
 *
 * @class TwitchMedia
 * @description Class that handles the Twitch API within the player
 */
class TwitchMedia extends Iframe {
    /**
     * Creates an instance of TwitchMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {File} mediaFile
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

    public canPlayType(mimeType) {
        return mimeType === 'application/x-twitch';
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

export default TwitchMedia;
