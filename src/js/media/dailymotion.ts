import {loadScript} from '../utils/dom';
import Iframe from '../components/iframe';


/**
 *
 * @class DailyMotionMedia
 * @description Class that handles the DailyMotion API within the player
 */
class DailyMotionMedia extends Iframe {
    /**
     * Creates an instance of DailyMotionMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {File} mediaFile
     * @returns {DailyMotionMedia}
     * @memberof DailyMotionMedia
     */
    constructor(element, mediaFile) {
        super(element, mediaFile);
        this.promise = (typeof DM === 'undefined') ?
            loadScript('https://api.dmcdn.net/all.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    canPlayType(mimeType) {
        return mimeType === 'application/x-dailymotion' && this.media.type === mimeType;
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

export default DailyMotionMedia;
