import {SUPPORTS_NATIVE_HLS} from '../utils/constants';
import {loadScript} from '../utils/dom';

/**
 *
 */
class HlsMedia {
    constructor(element) {
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

    load() {
        this.hlsPlayer.detachMedia();
        this.hlsPlayer.loadSource(this.element.src);
        this.hlsPlayer.attachMedia(this.element);
    }
}

export default HlsMedia;
