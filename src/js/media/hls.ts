import EventsList from '../interfaces/events-list';
import Source from '../interfaces/source';
import { DVR_THRESHOLD, EVENT_OPTIONS, SUPPORTS_HLS } from '../utils/constants';
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
    #player: any;

    /**
     * Hls events that will be triggered in Player.
     *
     * @see https://github.com/video-dev/hls.js/blob/master/src/events.js
     * @type EventsList
     * @memberof HlsMedia
     */
    #events: EventsList = {};

    /**
     * Time in milliseconds to attempt to recover media after an error.
     *
     * @type number
     * @memberof HlsMedia
     */
    #recoverDecodingErrorDate: number = 0;

    /**
     * Time in milliseconds to attempt to swap audio codec after an error.
     *
     * @type number
     * @memberof HlsMedia
     */
    #recoverSwapAudioCodecDate: number = 0;

    /**
     * Hls options to be passed to the Hls instance.
     *
     * @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
     * @private
     * @type object
     * @memberof HlsMedia
     */
    #options: any = undefined;

    /**
     * Flag to indicate if `autoplay` attribute was set
     *
     * @private
     * @type boolean
     * @memberof HlsMedia
     */
    #autoplay: boolean;

    /**
     * Creates an instance of HlsMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaSource
     * @memberof HlsMedia
     */
    constructor(element: HTMLMediaElement, mediaSource: Source, autoplay: boolean = false, options?: object) {
        super(element, mediaSource);
        this.#options = options;
        this.element = element;
        this.media = mediaSource;
        this.#autoplay = autoplay;
        this.promise = (typeof Hls === 'undefined') ?
            // Ever-green script
            loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js') :
            new Promise(resolve => {
                resolve({});
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
        this.#player.detachMedia();
        this.#player.loadSource(this.media.src);
        this.#player.attachMedia(this.element);

        const e = addEvent('loadedmetadata');
        this.element.dispatchEvent(e);

        if (!this.#events) {
            this.#events = Hls.Events;
            Object.keys(this.#events).forEach(event => {
                this.#player.on(this.#events[event], (...args: any[]) => this._assign(this.#events[event], args));
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
        if (isHlsSource(media)) {
            this._revoke();
            this.#player = new Hls(this.#options);
            this.#player.loadSource(media.src);
            this.#player.attachMedia(this.element);

            this.#events = Hls.Events;
            Object.keys(this.#events).forEach(event => {
                this.#player.on(this.#events[event], (...args: any[]) => this._assign(this.#events[event], args));
            });
        }
    }

    get levels() {
        const levels: any = [];
        if (this.#player && this.#player.levels && this.#player.levels.length) {
            Object.keys(this.#player.levels).forEach(item => {
                const { height, name } = this.#player.levels[item];
                const level = {
                    height,
                    id: item,
                    label: name || null,
                };
                levels.push(level);
            });
        }
        return levels;
    }

    set level(level: number) {
        this.#player.currentLevel = level;
    }

    get level() {
        return this.#player ? this.#player.currentLevel : -1;
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
        let playerOptions = this.#options;
        if (!playerOptions) {
            playerOptions = {};
        }
        const autoplay = !!(this.element.preload === 'auto' || this.#autoplay);
        (playerOptions as any).autoStartLoad = autoplay;

        this.#player = new Hls(playerOptions);
        this.instance = this.#player;
        this.#events = Hls.Events;
        Object.keys(this.#events).forEach(event => {
            this.#player.on(this.#events[event], (...args: any[]) => this._assign(this.#events[event], args));
        });

        if (!autoplay) {
            this.element.addEventListener('play', () => {
                if (this.#player) {
                    this.#player.startLoad();
                }
            }, EVENT_OPTIONS);

            this.element.addEventListener('pause', () => {
                if (this.#player) {
                    this.#player.stopLoad();
                }
            }, EVENT_OPTIONS);
        }
    }

    /**
     * Custom HLS events
     *
     * These events can be attached to the original node using addEventListener and the name of the event,
     * using or not Hls.Events object
     * @see https://github.com/video-dev/hls.js/blob/master/src/events.js
     * @see https://github.com/video-dev/hls.js/blob/master/src/errors.js
     * @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events
     * @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors
     * @param {string} event The name of the HLS event
     * @param {any} data The data passed to the event, could be an object or an array
     * @memberof HlsMedia
     */
    private _assign(event: string, data: any): void {
        if (event === 'hlsError') {
            const errorDetails = {
                detail: {
                    data,
                    message: data[1].details,
                    type: 'HLS',
                },
            };
            const errorEvent = addEvent('playererror', errorDetails);
            this.element.dispatchEvent(errorEvent);
            data = data[1];

            // borrowed from https://video-dev.github.io/hls.js/demo
            const { type, fatal, ...details } = data;
            if (fatal) {
                switch (type) {
                    case 'mediaError':
                        const now = new Date().getTime();
                        if (!this.#recoverDecodingErrorDate || (now - this.#recoverDecodingErrorDate) > 3000) {
                            this.#recoverDecodingErrorDate = new Date().getTime();
                            this.#player.recoverMediaError();
                        } else if (!this.#recoverSwapAudioCodecDate || (now - this.#recoverSwapAudioCodecDate) > 3000) {
                            this.#recoverSwapAudioCodecDate = new Date().getTime();
                            console.warn('Attempting to swap Audio Codec and recover from media error');
                            this.#player.swapAudioCodec();
                            this.#player.recoverMediaError();
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
                        this.#player.destroy();
                        const fatalEvent = addEvent(type, details);
                        this.element.dispatchEvent(fatalEvent);
                        break;
                }
            } else {
                const err = addEvent(type, details);
                this.element.dispatchEvent(err);
            }
        } else {
            if (event === 'hlsLevelLoaded' && data[1].details.live === true) {
                this.element.setAttribute('op-live__enabled', 'true');
                const timeEvent = addEvent('timeupdate');
                this.element.dispatchEvent(timeEvent);
            } else if (event === 'hlsLevelUpdated' && data[1].details.live === true && data[1].details.totalduration > DVR_THRESHOLD) {
                this.element.setAttribute('op-dvr__enabled', 'true');
                const timeEvent = addEvent('timeupdate');
                this.element.dispatchEvent(timeEvent);
            } else if (event === 'hlsFragParsingMetadata') {
                const metaEvent = addEvent('metadataready', data[1]);
                this.element.dispatchEvent(metaEvent);
            }
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
        this.#player.stopLoad();
        if (this.#events) {
            Object.keys(this.#events).forEach(event => {
                this.#player.off(this.#events[event], (...args: any[]) => this._assign(this.#events[event], args));
            });
        }
        this.element.removeEventListener('play', () => {
            if (this.#player) {
                this.#player.startLoad();
            }
        });

        this.element.removeEventListener('pause', () => {
            if (this.#player) {
                this.#player.stopLoad();
            }
        });
        this.#player.destroy();
        this.#player = null;
    }
}

export default HlsMedia;
