import EventsList from '../interfaces/events-list';
import Source from '../interfaces/source';
import { SUPPORTS_HLS } from '../utils/constants';
import { addEvent } from '../utils/events';
import { loadScript } from '../utils/general';
import { isHlsSource } from '../utils/media';
import Native from './native';

declare const Hls: any;

/**
 * HLS Media.
 *
 * @description Class that handles M3U8 files using hls.js within the player
 * @see https://github.com/video-dev/hls.js/
 * @class HlsMedia
 */
class HlsMedia extends Native {
    /**
     * Instance of hls.js player.
     *
     * @type Hls
     * @memberof HlsMedia
     */
    private player: any;

    /**
     * Hls events that will be triggered in Player.
     *
     * @see https://github.com/video-dev/hls.js/blob/master/src/events.js
     * @type EventsList
     * @memberof HlsMedia
     */
    private events: EventsList = {};

    /**
     * Time in milliseconds to attempt to recover media after an error.
     *
     * @type number
     * @memberof HlsMedia
     */
    private recoverDecodingErrorDate: number;

    /**
     * Time in milliseconds to attempt to swap audio codec after an error.
     *
     * @type number
     * @memberof HlsMedia
     */
    private recoverSwapAudioCodecDate: number;

    /**
     * Hls options to be passed to the Hls instance.
     *
     * @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
     * @private
     * @type object
     * @memberof HlsMedia
     */
    private options: object;

    /**
     * Flag to indicate if `autoplay` attribute was set
     *
     * @private
     * @type boolean
     * @memberof HlsMedia
     */
    private autoplay: boolean;

    /**
     * Creates an instance of HlsMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaSource
     * @memberof HlsMedia
     */
    constructor(element: HTMLMediaElement, mediaSource: Source, autoplay: boolean = false, options: {}) {
        super(element, mediaSource);
        this.options = options;
        this.element = element;
        this.media = mediaSource;
        this.autoplay = autoplay;
        this.promise = (typeof Hls === 'undefined') ?
            // Ever-green script
            loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest') :
            new Promise(resolve => {
                resolve();
            });

        this.promise.then(this._create.bind(this));
        return this;
    }

    /**
     * Provide support via hls.js if browser does not have native support for HLS
     *
     * @inheritDoc
     * @memberof HlsMedia
     */
    public canPlayType(mimeType: string) {
        return SUPPORTS_HLS() && mimeType === 'application/x-mpegURL';
    }

    /**
     *
     * @inheritDoc
     * @memberof HlsMedia
     */
    public load(): void {
        this.player.detachMedia();
        this.player.loadSource(this.media.src);
        this.player.attachMedia(this.element);

        if (!this.events) {
            this.events = Hls.Events;
            Object.keys(this.events).forEach(event => {
                this.player.on(this.events[event], (...args: any[]) => this._assign(this.events[event], args));
            });
        }
    }

    /**
     *
     * @inheritDoc
     * @memberof HlsMedia
     */
    public destroy(): void {
        this._revoke();
    }

    /**
     *
     * @inheritDoc
     * @memberof HlsMedia
     */
    set src(media: Source) {
        if (isHlsSource(media.src)) {
            this._revoke();
            this.player = new Hls(this.options);
            this.player.loadSource(this.media.src);
            this.player.attachMedia(this.element);

            this.events = Hls.Events;
            Object.keys(this.events).forEach(event => {
                this.player.on(this.events[event], (...args: any[]) => this._assign(this.events[event], args));
            });
        }
    }

    /**
     * Setup Hls player with options.
     *
     * Some of the options/events will be overriden to improve performance and user's experience.
     *
     * @private
     * @memberof HlsMedia
     */
    private _create() {
        let { options } = this;
        if (!options) {
            options = {};
        }
        const autoplay = !!(this.element.preload === 'auto' || this.autoplay);
        (options as any).autoStartLoad = autoplay;

        this.player = new Hls(this.options);
        this.events = Hls.Events;
        Object.keys(this.events).forEach(event => {
            this.player.on(this.events[event], (...args: any[]) => this._assign(this.events[event], args));
        });

        if (!autoplay) {
            this.element.addEventListener('play', () => {
                if (this.player) {
                    this.player.startLoad();
                }
            });

            this.element.addEventListener('pause', () => {
                if (this.player) {
                    this.player.stopLoad();
                }
            });
        }
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
     * @param {string} event The name of the HLS event
     * @param {any} data The data passed to the event, could be an object or an array
     * @memberof HlsMedia
     */
    private _assign(event: string, data: any): void {
        if (event === 'hlsError') {
            console.warn(data);
            data = data[1];

            // borrowed from https://video-dev.github.io/hls.js/demo
            const { type, fatal, ...details } = data;
            if (fatal) {
                switch (type) {
                    case 'mediaError':
                        const now = new Date().getTime();
                        if (!this.recoverDecodingErrorDate || (now - this.recoverDecodingErrorDate) > 3000) {
                            this.recoverDecodingErrorDate = new Date().getTime();
                            this.player.recoverMediaError();
                        } else if (!this.recoverSwapAudioCodecDate || (now - this.recoverSwapAudioCodecDate) > 3000) {
                            this.recoverSwapAudioCodecDate = new Date().getTime();
                            console.warn('Attempting to swap Audio Codec and recover from media error');
                            this.player.swapAudioCodec();
                            this.player.recoverMediaError();
                        } else {
                            const msg = 'Cannot recover, last media error recovery failed';
                            console.error(msg);
                            const mediaEvent = addEvent(type, details);
                            this.element.dispatchEvent(mediaEvent);
                        }
                        break;
                    case 'networkError':
                        const message = 'Network error';
                        console.error(message);
                        const networkEvent = addEvent(type, details);
                        this.element.dispatchEvent(networkEvent);
                        break;
                    default:
                        this.player.destroy();
                        const fatalEvent = addEvent(type, details);
                        this.element.dispatchEvent(fatalEvent);
                        break;
                }
            } else {
                const errorEvent = addEvent(type, details);
                this.element.dispatchEvent(errorEvent);
            }
        } else {
            const e = addEvent(event, data[1]);
            this.element.dispatchEvent(e);
        }
    }
    /**
     * Remove all hls.js events and destroy hlsjs player instance.
     *
     * @memberof HlsMedia
     */
    private _revoke(): void {
        this.player.stopLoad();
        if (this.events) {
            Object.keys(this.events).forEach(event => {
                this.player.off(this.events[event], (...args: any[]) => this._assign(this.events[event], args));
            });
        }
        this.element.removeEventListener('play', () => {
            if (this.player) {
                this.player.startLoad();
            }
        });

        this.element.removeEventListener('pause', () => {
            if (this.player) {
                this.player.stopLoad();
            }
        });
        this.player.destroy();
    }
}

export default HlsMedia;
