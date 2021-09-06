import EventsList from '../interfaces/events-list';
import Level from '../interfaces/level';
import Source from '../interfaces/source';
import { HAS_MSE } from '../utils/constants';
import { addEvent } from '../utils/events';
import { loadScript } from '../utils/general';
import { isFlvSource } from '../utils/media';
import Native from './native';

declare const flvjs: any;

/**
 * FLV Media.
 *
 * @description Class that handles FLV and RTMP files using flv.js within the player
 * @see https://github.com/bilibili/flv.js
 * @class FlvMedia
 */
class FlvMedia extends Native {
    /**
     * Instance of flv.js player.
     *
     * @type flvjs
     * @memberof FlvMedia
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
     * Flv options to be passed to the flvplayer instance.
     *
     * @see https://github.com/bilibili/flv.js/blob/master/docs/api.md
     * @private
     * @type object
     * @memberof FlvMedia
     */
    #options?: {
        [key: string]: unknown;
    };

    /**
     * Creates an instance of FlvMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaSource
     * @memberof FlvMedia
     */
    constructor(element: HTMLMediaElement, mediaSource: Source, options?: Record<string, unknown>) {
        super(element, mediaSource);
        this.#options = options;
        this.element = element;
        this.media = mediaSource;
        this.promise = (typeof flvjs === 'undefined')
            // Ever-green script
            ? loadScript('https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js')
            : new Promise(resolve => {
                resolve({});
            });

        this._create = this._create.bind(this);
        this.promise.then(this._create);
        return this;
    }

    /**
     * Provide support via flv.js for modern browsers only
     *
     * @inheritDoc
     * @memberof FlvMedia
     */
    public canPlayType(mimeType: string): boolean {
        return HAS_MSE && (mimeType === 'video/x-flv' || mimeType === 'video/flv');
    }

    /**
     *
     * @inheritDoc
     * @memberof FlvMedia
     */
    public load(): void {
        this.#player.unload();
        this.#player.detachMediaElement();
        this.#player.attachMediaElement(this.element);
        this.#player.load();

        const e = addEvent('loadedmetadata');
        this.element.dispatchEvent(e);

        if (!this.#events) {
            this.#events = flvjs.Events;
            Object.keys(this.#events).forEach(event => {
                this.#player.on(this.#events[event], (...args: Array<Record<string, unknown>>) => this._assign(this.#events[event], args));
            });
        }
    }

    /**
     *
     * @inheritDoc
     * @memberof FlvMedia
     */
    public destroy(): void {
        this._revoke();
    }

    /**
     *
     * @inheritDoc
     * @memberof FlvMedia
     */
    set src(media: Source) {
        if (isFlvSource(media)) {
            this._revoke();
            this._create();
        }
    }

    get levels(): Level[] {
        const levels: Level[] = [];
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

    get level(): number {
        return this.#player ? this.#player.currentLevel : -1;
    }

    /**
     * Setup Flv player with options and config.
     *
     * Some of the options/events will be overridden to improve performance and user's experience.
     *
     * @private
     * @memberof FlvMedia
     */
    private _create() {
        const configs = this.#options?.configs;
        delete this.#options?.configs;

        flvjs.LoggingControl.enableDebug = this.#options?.debug || false;
        flvjs.LoggingControl.enableVerbose = this.#options?.debug || false;
        const options = { ...this.#options || {}, type: 'flv', url: this.media.src };
        this.#player = flvjs.createPlayer(options, configs);
        this.instance = this.#player;

        if (!this.#events) {
            this.#events = flvjs.Events;
            Object.keys(this.#events).forEach(event => {
                this.#player.on(this.#events[event], (...args: Array<Record<string, unknown>>) => this._assign(this.#events[event], args));
            });
        }
    }

    /**
     * Custom FLV events
     *
     * These events can be attached to the original node using addEventListener and the name of the event,
     * using or not flvjs.Events object
     * @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjsevents
     * @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrortypes
     * @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrordetails
     * @param {string} event The name of the FLV event
     * @param {any} data The data passed to the event, could be an object or an array
     * @memberof FlvMedia
     */
    private _assign(event: string, data: Array<Record<string, unknown>>): void {
        if (event === 'error') {
            const errorDetails = {
                detail: {
                    data,
                    message: `${data[0]}: ${data[1]} ${data[2].msg}`,
                    type: 'FLV',
                },
            };
            const errorEvent = addEvent('playererror', errorDetails);
            this.element.dispatchEvent(errorEvent);
        } else {
            const e = addEvent(event, { detail: { data }});
            this.element.dispatchEvent(e);
        }
    }

    /**
     * Destroy flvjs player instance.
     *
     * @memberof FlvMedia
     */
    private _revoke(): void {
        this.#player.destroy();
        this.#player = null;
    }
}

export default FlvMedia;
