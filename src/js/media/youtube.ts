import {loadScript} from '../utils/dom';
import Iframe from '../components/iframe';

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

    canPlayType(mimeType) {
        return mimeType === 'application/x-youtube' && this.media.type === mimeType;
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

export default YouTubeMedia;
