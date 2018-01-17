// import {loadScript} from '../utils/dom';
/**
 *
 * @class DailyMotionMedia
 * @description Class that handles the DailyMotion API within the player
 */
class DailyMotionMedia {
    /**
     * Creates an instance of DailyMotionMedia.
     *
     * @param {HTMLElement} element
     * @param {object} mediaFile
     * @returns {DailyMotionMedia}
     * @memberof DailyMotionMedia
     */
    constructor(element, mediaFile) {
        this.element = element;
        this.media = mediaFile;
        this.promise = new Promise(resolve => {
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
}

export default DailyMotionMedia;
