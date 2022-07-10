"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _HlsMedia_player, _HlsMedia_events, _HlsMedia_recoverDecodingErrorDate, _HlsMedia_recoverSwapAudioCodecDate, _HlsMedia_options, _HlsMedia_autoplay;
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const general_1 = require("../utils/general");
const media_1 = require("../utils/media");
const native_1 = __importDefault(require("./native"));
class HlsMedia extends native_1.default {
    constructor(element, mediaSource, autoplay, options) {
        super(element, mediaSource);
        _HlsMedia_player.set(this, void 0);
        _HlsMedia_events.set(this, {});
        _HlsMedia_recoverDecodingErrorDate.set(this, 0);
        _HlsMedia_recoverSwapAudioCodecDate.set(this, 0);
        _HlsMedia_options.set(this, void 0);
        _HlsMedia_autoplay.set(this, void 0);
        __classPrivateFieldSet(this, _HlsMedia_options, options || {}, "f");
        this.element = element;
        this.media = mediaSource;
        __classPrivateFieldSet(this, _HlsMedia_autoplay, autoplay, "f");
        this._create = this._create.bind(this);
        this._play = this._play.bind(this);
        this._pause = this._pause.bind(this);
        this._assign = this._assign.bind(this);
        this.promise =
            typeof Hls === 'undefined'
                ?
                    (0, general_1.loadScript)('https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js')
                : new Promise((resolve) => {
                    resolve({});
                });
        this.promise.then(this._create);
    }
    canPlayType(mimeType) {
        return (0, constants_1.SUPPORTS_HLS)() && mimeType === 'application/x-mpegURL';
    }
    load() {
        if (__classPrivateFieldGet(this, _HlsMedia_player, "f")) {
            __classPrivateFieldGet(this, _HlsMedia_player, "f").detachMedia();
            __classPrivateFieldGet(this, _HlsMedia_player, "f").loadSource(this.media.src);
            __classPrivateFieldGet(this, _HlsMedia_player, "f").attachMedia(this.element);
        }
        const e = (0, general_1.addEvent)('loadedmetadata');
        this.element.dispatchEvent(e);
        if (!__classPrivateFieldGet(this, _HlsMedia_events, "f")) {
            __classPrivateFieldSet(this, _HlsMedia_events, Hls.Events, "f");
            Object.keys(__classPrivateFieldGet(this, _HlsMedia_events, "f")).forEach((event) => {
                __classPrivateFieldGet(this, _HlsMedia_player, "f").on(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], (...args) => this._assign(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], args));
            });
        }
    }
    destroy() {
        if (__classPrivateFieldGet(this, _HlsMedia_player, "f")) {
            __classPrivateFieldGet(this, _HlsMedia_player, "f").stopLoad();
        }
        if (__classPrivateFieldGet(this, _HlsMedia_events, "f")) {
            Object.keys(__classPrivateFieldGet(this, _HlsMedia_events, "f")).forEach((event) => {
                __classPrivateFieldGet(this, _HlsMedia_player, "f").off(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], (...args) => this._assign(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], args));
            });
        }
        this.element.removeEventListener('play', this._play);
        this.element.removeEventListener('pause', this._pause);
        if (__classPrivateFieldGet(this, _HlsMedia_player, "f")) {
            __classPrivateFieldGet(this, _HlsMedia_player, "f").destroy();
            __classPrivateFieldSet(this, _HlsMedia_player, null, "f");
        }
    }
    set src(media) {
        if ((0, media_1.isHlsSource)(media)) {
            this.destroy();
            __classPrivateFieldSet(this, _HlsMedia_player, new Hls(__classPrivateFieldGet(this, _HlsMedia_options, "f")), "f");
            __classPrivateFieldGet(this, _HlsMedia_player, "f").loadSource(media.src);
            __classPrivateFieldGet(this, _HlsMedia_player, "f").attachMedia(this.element);
            __classPrivateFieldSet(this, _HlsMedia_events, Hls.Events, "f");
            Object.keys(__classPrivateFieldGet(this, _HlsMedia_events, "f")).forEach((event) => {
                __classPrivateFieldGet(this, _HlsMedia_player, "f").on(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], (...args) => this._assign(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], args));
            });
        }
    }
    get levels() {
        const levels = [];
        if (__classPrivateFieldGet(this, _HlsMedia_player, "f") && __classPrivateFieldGet(this, _HlsMedia_player, "f").levels && __classPrivateFieldGet(this, _HlsMedia_player, "f").levels.length) {
            Object.keys(__classPrivateFieldGet(this, _HlsMedia_player, "f").levels).forEach((item) => {
                const { height, name } = __classPrivateFieldGet(this, _HlsMedia_player, "f").levels[item];
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
        __classPrivateFieldGet(this, _HlsMedia_player, "f").currentLevel = level;
    }
    get level() {
        return __classPrivateFieldGet(this, _HlsMedia_player, "f") ? __classPrivateFieldGet(this, _HlsMedia_player, "f").currentLevel : -1;
    }
    _create() {
        const autoplay = !!(this.element.preload === 'auto' || __classPrivateFieldGet(this, _HlsMedia_autoplay, "f"));
        __classPrivateFieldGet(this, _HlsMedia_options, "f").autoStartLoad = autoplay;
        __classPrivateFieldSet(this, _HlsMedia_player, new Hls(__classPrivateFieldGet(this, _HlsMedia_options, "f")), "f");
        this.instance = __classPrivateFieldGet(this, _HlsMedia_player, "f");
        __classPrivateFieldSet(this, _HlsMedia_events, Hls.Events, "f");
        Object.keys(__classPrivateFieldGet(this, _HlsMedia_events, "f")).forEach((event) => {
            __classPrivateFieldGet(this, _HlsMedia_player, "f").on(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], (...args) => this._assign(__classPrivateFieldGet(this, _HlsMedia_events, "f")[event], args));
        });
        if (!autoplay) {
            this.element.addEventListener('play', this._play, constants_1.EVENT_OPTIONS);
            this.element.addEventListener('pause', this._pause, constants_1.EVENT_OPTIONS);
        }
    }
    _assign(event, data) {
        if (event === 'hlsError') {
            const errorDetails = {
                detail: {
                    data,
                    message: data[1].details,
                    type: 'HLS',
                },
            };
            const errorEvent = (0, general_1.addEvent)('playererror', errorDetails);
            this.element.dispatchEvent(errorEvent);
            const type = data[1].type;
            const { fatal } = data[1];
            const details = data[1];
            if (fatal) {
                switch (type) {
                    case 'mediaError':
                        const now = new Date().getTime();
                        if (!__classPrivateFieldGet(this, _HlsMedia_recoverDecodingErrorDate, "f") || now - __classPrivateFieldGet(this, _HlsMedia_recoverDecodingErrorDate, "f") > 3000) {
                            __classPrivateFieldSet(this, _HlsMedia_recoverDecodingErrorDate, new Date().getTime(), "f");
                            __classPrivateFieldGet(this, _HlsMedia_player, "f").recoverMediaError();
                        }
                        else if (!__classPrivateFieldGet(this, _HlsMedia_recoverSwapAudioCodecDate, "f") || now - __classPrivateFieldGet(this, _HlsMedia_recoverSwapAudioCodecDate, "f") > 3000) {
                            __classPrivateFieldSet(this, _HlsMedia_recoverSwapAudioCodecDate, new Date().getTime(), "f");
                            console.warn('Attempting to swap Audio Codec and recover from media error');
                            __classPrivateFieldGet(this, _HlsMedia_player, "f").swapAudioCodec();
                            __classPrivateFieldGet(this, _HlsMedia_player, "f").recoverMediaError();
                        }
                        else {
                            const msg = 'Cannot recover, last media error recovery failed';
                            console.error(msg);
                            const mediaEvent = (0, general_1.addEvent)(type, { detail: { data: details } });
                            this.element.dispatchEvent(mediaEvent);
                        }
                        break;
                    case 'networkError':
                        const message = 'Network error';
                        console.error(message);
                        const networkEvent = (0, general_1.addEvent)(type, { detail: { data: details } });
                        this.element.dispatchEvent(networkEvent);
                        break;
                    default:
                        __classPrivateFieldGet(this, _HlsMedia_player, "f").destroy();
                        const fatalEvent = (0, general_1.addEvent)(type, { detail: { data: details } });
                        this.element.dispatchEvent(fatalEvent);
                        break;
                }
            }
            else {
                const err = (0, general_1.addEvent)(type, { detail: { data: details } });
                this.element.dispatchEvent(err);
            }
        }
        else {
            const details = data[1];
            if (event === 'hlsLevelLoaded' && details.live === true) {
                this.element.setAttribute('op-live__enabled', 'true');
                const timeEvent = (0, general_1.addEvent)('timeupdate');
                this.element.dispatchEvent(timeEvent);
            }
            else if (event === 'hlsLevelUpdated' &&
                details.live === true &&
                details.totalduration > constants_1.DVR_THRESHOLD) {
                this.element.setAttribute('op-dvr__enabled', 'true');
                const timeEvent = (0, general_1.addEvent)('timeupdate');
                this.element.dispatchEvent(timeEvent);
            }
            else if (event === 'hlsFragParsingMetadata') {
                const metaEvent = (0, general_1.addEvent)('metadataready', { detail: { data: data[1] } });
                this.element.dispatchEvent(metaEvent);
            }
            const e = (0, general_1.addEvent)(event, { detail: { data: data[1] } });
            this.element.dispatchEvent(e);
        }
    }
    _play() {
        if (__classPrivateFieldGet(this, _HlsMedia_player, "f")) {
            __classPrivateFieldGet(this, _HlsMedia_player, "f").startLoad();
        }
    }
    _pause() {
        if (__classPrivateFieldGet(this, _HlsMedia_player, "f")) {
            __classPrivateFieldGet(this, _HlsMedia_player, "f").stopLoad();
        }
    }
}
_HlsMedia_player = new WeakMap(), _HlsMedia_events = new WeakMap(), _HlsMedia_recoverDecodingErrorDate = new WeakMap(), _HlsMedia_recoverSwapAudioCodecDate = new WeakMap(), _HlsMedia_options = new WeakMap(), _HlsMedia_autoplay = new WeakMap();
exports.default = HlsMedia;
