import {isAudio, isVideo} from '../utils/mediaHelpers';
/**
 * Class that wraps the native HTML5 video/audio tags
 *
 * @class NativeMedia
 */
class NativeMedia {
    /**
     * Creates an instance of NativeMedia.
     * @param {HTMLElement} element
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element) {
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
        this.element = element;
        this.promise = new Promise(resolve => {
            resolve();
        });
        return this;
    }

    load() {
        this.element.load();
    }
}

export default NativeMedia;
