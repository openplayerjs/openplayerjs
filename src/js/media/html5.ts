import Source from '../interfaces/source';
import { isAudio, isVideo } from '../utils/general';
import Native from './native';

/**
 *
 * @class NativeMedia
 * @description Class that wraps the native HTML5 video/audio tags
 */
class HTML5Media extends Native  {
    /**
     * Creates an instance of NativeMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaFile
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element: HTMLMediaElement, mediaFile: Source) {
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
        super(element, mediaFile);
        return this;
    }
    /**
     *
     *
     * @param {string} mimeType
     * @returns {boolean}
     * @memberof NativeMedia
     */
    public canPlayType(mimeType: string) {
        return !!(this.element.canPlayType(mimeType).replace('no', ''));
    }

    public load() {
        this.element.load();
    }

    public destroy() {
        return this;
    }

    set src(media: Source) {
        this.element.src = media.src;
    }
}

export default HTML5Media;
