import Iframe from '../components/iframe';
import {loadScript} from '../utils/dom';

declare const YT: any;
/**
 *
 * @class YouTubeMedia
 * @description Class that handles the YouTube API within the player
 */
class YouTubeMedia extends Iframe {
    /**
     * Creates an instance of YouTubeMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {File} mediaFile
     * @returns {YouTubeMedia}
     * @memberof YouTubeMedia
     */
    constructor(element, mediaFile) {
        super(element, mediaFile);
        this.promise = (typeof YT === 'undefined' || !YT.loaded) ?
            loadScript('https://www.youtube.com/player_api') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    public canPlayType(mimeType) {
        return mimeType === 'application/x-youtube';
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

export default YouTubeMedia;
