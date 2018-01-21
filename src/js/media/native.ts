import { isAudio, isVideo } from '../utils/dom';
import Native from "../components/native";

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
     * @param {object} mediaFile
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element, mediaFile) {
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
    canPlayType(mimeType) {
        return !!(this.element.canPlayType(mimeType).replace('no', ''));
    }

    load() {
        this.element.load();
    }

    play() {
        this.element.play();
    }

    pause() {
        this.element.pause();
    }

    destroy() {
        console.log(this.element);
    }

    set src(value) {
        this.element.src = value;
    }

    get src() {
        return this.element.src;
    }

    set volume(value) {
        this.element.volume = value;
    }

    get volume() {
        return this.element.volume;
    }

    set muted(value) {
        this.element.muted = value;
    }

    get muted() {
        return this.element.muted;
    }
}

export default NativeMedia;
