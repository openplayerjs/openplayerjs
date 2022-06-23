import { HAS_MSE } from '../utils/constants';
import { addEvent, loadScript } from '../utils/general';
import { isFlvSource } from '../utils/media';
import Native from './native';
class FlvMedia extends Native {
    #player;
    #events = {};
    #options = {};
    constructor(element, mediaSource, options) {
        super(element, mediaSource);
        this.#options = options;
        this.element = element;
        this.media = mediaSource;
        this._create = this._create.bind(this);
        this._assign = this._assign.bind(this);
        this.promise =
            typeof flvjs === 'undefined'
                ?
                    loadScript('https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js')
                : new Promise((resolve) => {
                    resolve({});
                });
        this.promise.then(this._create);
    }
    canPlayType(mimeType) {
        return HAS_MSE && (mimeType === 'video/x-flv' || mimeType === 'video/flv');
    }
    load() {
        this.#player.unload();
        this.#player.detachMediaElement();
        this.#player.attachMediaElement(this.element);
        this.#player.load();
        const e = addEvent('loadedmetadata');
        this.element.dispatchEvent(e);
        if (!this.#events) {
            this.#events = flvjs.Events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], (...args) => this._assign(this.#events[event], args));
            });
        }
    }
    destroy() {
        this.#player.destroy();
        this.#player = null;
    }
    set src(media) {
        if (isFlvSource(media)) {
            this.destroy();
            this._create();
        }
    }
    get levels() {
        const levels = [];
        if (this.#player && this.#player.levels && this.#player.levels.length) {
            Object.keys(this.#player.levels).forEach((item) => {
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
    set level(level) {
        this.#player.currentLevel = level;
    }
    get level() {
        return this.#player ? this.#player.currentLevel : -1;
    }
    _create() {
        const { configs, ...rest } = this.#options || {};
        flvjs.LoggingControl.enableDebug = rest?.debug || false;
        flvjs.LoggingControl.enableVerbose = rest?.debug || false;
        const options = { ...rest, type: 'flv', url: this.media.src };
        this.#player = flvjs.createPlayer(options, configs || {});
        this.instance = this.#player;
        if (!this.#events) {
            this.#events = flvjs.Events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], (...args) => this._assign(this.#events[event], args));
            });
        }
    }
    _assign(event, data) {
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
        }
        else {
            const e = addEvent(event, { detail: { data } });
            this.element.dispatchEvent(e);
        }
    }
}
export default FlvMedia;
