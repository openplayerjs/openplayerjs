// import {loadScript} from '../utils/dom';
/**
 *
 * @class FacebookMedia
 * @description Class that handles the Facebook API within the player
 */
class FacebookMedia {
    /**
     * Creates an instance of FacebookMedia.
     *
     * @param {HTMLElement} element
     * @param {object} mediaFile
     * @returns {FacebookMedia}
     * @memberof FacebookMedia
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
        return mimeType === 'application/x-facebook' && this.media.type === mimeType;
    }

    load() {
        console.log(this);
    }
}

export default FacebookMedia;
