import IFile from '../components/interfaces/media/file';
import Native from '../components/native';
import { isAudio, isVideo } from '../utils/general';

/**
 *
 * @class NativeMedia
 * @description Class that wraps the native HTML5 video/audio tags
 */
class NativeMedia extends Native {
    /**
     * Creates an instance of NativeMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {IFile} mediaFile
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element: HTMLMediaElement, mediaFile: IFile) {
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

    set src(media: IFile) {
        this.element.src = media.src;
    }
}

export default NativeMedia;
