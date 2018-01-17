import { SUPPORTS_NATIVE_HLS, HAS_MSE } from '../utils/constants';
import { loadScript } from '../utils/dom';
/**
 * Class that handles the hls.js API within the player
 *
 * @class HlsMedia
 */
class HlsMedia {
    /**
     * Creates an instance of HlsMedia.
     *
     * @param {HTMLElement} element
     * @param {object} mediaFile
     * @memberof HlsMedia
     */
    constructor(element, mediaFile) {
        /**
         * @private
         */
        function createInstance() {
            this.hlsPlayer = new Hls();
        }
        this.element = element;
        this.media = mediaFile;
        this.hlsPlayer = null;
        this.promise = (typeof Hls === 'undefined') ?
            // Ever-green script
            loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest') :
            new Promise(resolve => {
                resolve();
            });

        this.promise.then(createInstance.bind(this));
        return this;
    }

    /**
     * Provide support via hls.js if browser does not have native support for HLS
     *
     * @param {string} mimeType
     * @returns {boolean}
     * @memberof HlsMedia
     */
    canPlayType(mimeType) {
        return !SUPPORTS_NATIVE_HLS && HAS_MSE && mimeType === 'application/x-mpegURL' &&
            this.media.type === mimeType;
    }

    /**
     *
     *
     * @memberof HlsMedia
     */
    load() {
        this.hlsPlayer.detachMedia();
        this.hlsPlayer.loadSource(this.media.src);
        this.hlsPlayer.attachMedia(this.element);
    }

    /**
     *
     *
     * @memberof HlsMedia
     */
    play() {
        this.element.play();
    }
    /**
     *
     *
     * @memberof HlsMedia
     */
    pause() {
        this.element.pause();
    }
}

export default HlsMedia;
