import {SUPPORTS_NATIVE_HLS} from '../utils/constants';
import {loadScript} from '../utils/dom';
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
        // We need this only if browser doesn't support HLS natively
        if (SUPPORTS_NATIVE_HLS) {
            throw new TypeError('Browsers supports natively Hls... using native approach instead');
        }

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

    canPlayType(mimeType) {
        return mimeType === 'application/x-mpegURL' && this.media.type === mimeType;
    }

    load() {
        this.hlsPlayer.detachMedia();
        this.hlsPlayer.loadSource(this.media.src);
        this.hlsPlayer.attachMedia(this.element);
    }
}

export default HlsMedia;
