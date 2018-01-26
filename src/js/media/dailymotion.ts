import Iframe from '../components/iframe';
import {loadScript} from '../utils/dom';

declare const DM: any;

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

    public canPlayType(mimeType) {
        return mimeType === 'application/x-dailymotion';
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

export default DailyMotionMedia;
