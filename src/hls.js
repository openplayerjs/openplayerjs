import * as Utils from './utils';

class HlsMedia {
    constructor(element) {
        // We need this only if browser doesn't support HLS natively
        if (Utils.SUPPORTS_NATIVE_HLS) {
            throw new TypeError('Browsers supports natively Hls... using native approach instead');
        }

        /**
         * @private
         */
        function createInstance() {
            this._createInstance();
        }
        this.element = element;
        this.hlsPlayer = null;
        this.promise = (typeof Hls === 'undefined') ?
            // Ever-green script
            Utils.loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest') :
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

    _createInstance() {
        this.hlsPlayer = new Hls();
    }
}

export default HlsMedia;
