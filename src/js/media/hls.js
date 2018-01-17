import { SUPPORTS_NATIVE_HLS, HAS_MSE } from '../utils/constants';
import { loadScript } from '../utils/dom';
import { addEvent } from '../events';
/**
 *
 * @class HlsMedia
 * @description Class that handles the hls.js API within the player
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
        this.events = null;
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

        if (!this.events) {
            this.events = Hls.Events;
            Object.keys(this.events).forEach(event => {
                this.hlsPlayer.on(this.events[event], this._assign.bind(this));
            });
        }
    }

    destroy() {
        this._revoke();
    }

    set src(media) {
        this._revoke();
        this.hlsPlayer = new Hls();
    }
    /**
     * Custom HLS events
     *
     * These events can be attached to the original node using addEventListener and the name of the event,
     * using or not Hls.Events object
     * @see https://github.com/video-dev/hls.js/blob/master/src/events.js
     * @see https://github.com/video-dev/hls.js/blob/master/src/errors.js
     * @see https://github.com/video-dev/hls.js/blob/master/doc/API.md#runtime-events
     * @see https://github.com/video-dev/hls.js/blob/master/doc/API.md#errors
     */
    _assign(event, data) {
        if (name === 'hlsError') {
            console.warn(data);
            data = data[1];

            // borrowed from https://video-dev.github.io/hls.js/demo
            if (data.fatal) {
                switch (data.type) {
                    case 'mediaError':
                        const now = new Date().getTime();
                        if (!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
                            recoverDecodingErrorDate = new Date().getTime();
                            this.hlsPlayer.recoverMediaError();
                        } else if (!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
                            recoverSwapAudioCodecDate = new Date().getTime();
                            console.warn('Attempting to swap Audio Codec and recover from media error');
                            this.hlsPlayer.swapAudioCodec();
                            this.hlsPlayer.recoverMediaError();
                        } else {
                            const message = 'Cannot recover, last media error recovery failed';
                            // mediaElement.generateError(message, node.src);
                            console.error(message);
                        }
                        break;
                    case 'networkError':
                        const message = 'Network error';
                        // mediaElement.generateError(message, mediaFiles);
                        console.error(message);
                        break;
                    default:
                        this.hlsPlayer.destroy();
                        break;
                }
            }
        } else {
            const e = addEvent(event);
            e.data = data;
            this.element.dispatchEvent(e);
        }
    }
    /**
     *
     *
     * @memberof HlsMedia
     */
    _revoke() {
        if (this.events) {
            Object.keys(this.events).forEach(event => {
                this.hlsPlayer.off(this.events[event], this._assign.bind(this));
            });
            this.events = null;
        }
        this.hlsPlayer.destroy();
    }
}

export default HlsMedia;
