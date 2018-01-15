import {isAudio, isVideo} from '../utils/dom';

/**
 * Class that wraps the native HTML5 video/audio tags
 *
 * @class NativeMedia
 */
class NativeMedia {
    /**
     * Creates an instance of NativeMedia.
     *
     * @param {HTMLElement} element
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element, media) {
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
        this.element = element;
        this.media = media;
        this.promise = new Promise(resolve => {
            resolve();
        });
        return this;
    }
    /**
     *
     *
     * @param {string} mimeType
     * @returns {boolean}
     * @memberof NativeMedia
     */
    canPlayType(mimeType) {
        return this.media.type === media && !!(this.element.canPlayType(mimeType).replace('no', ''));
    }

    load() {
        this.element.load();
    }
}

export default NativeMedia;
