// import {loadScript} from '../utils/dom';
/**
 *
 * @class VimeoMedia
 * @description Class that handles the Vimeo API within the player
 */
class VimeoMedia {
    /**
     * Creates an instance of VimeoMedia.
     *
     * @param {HTMLElement} element
     * @param {object} mediaFile
     * @returns {VimeoMedia}
     * @memberof VimeoMedia
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
        return mimeType === 'application/x-vimeo' && this.media.type === mimeType;
    }

    load() {
        console.log(this);
    }
}

export default VimeoMedia;
