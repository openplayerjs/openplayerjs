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
var _HTML5Media_currentLevel, _HTML5Media_levelList, _HTML5Media_isStreaming, _HTML5Media_retryCount, _HTML5Media_started, _HTML5Media_timer;
import { DVR_THRESHOLD, EVENT_OPTIONS } from '../utils/constants';
import { addEvent } from '../utils/events';
import { isAudio, isVideo } from '../utils/general';
import { isHlsSource } from '../utils/media';
import Native from './native';
class HTML5Media extends Native {
    constructor(element, mediaFile) {
        super(element, mediaFile);
        _HTML5Media_currentLevel.set(this, null);
        _HTML5Media_levelList.set(this, []);
        _HTML5Media_isStreaming.set(this, false);
        _HTML5Media_retryCount.set(this, 0);
        _HTML5Media_started.set(this, false);
        _HTML5Media_timer.set(this, void 0);
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
        __classPrivateFieldSet(this, _HTML5Media_isStreaming, isHlsSource(mediaFile), "f");
        this.element.addEventListener('playing', this._clearTimeout.bind(this), EVENT_OPTIONS);
        this.element.addEventListener('stalled', this._setTimeout.bind(this), EVENT_OPTIONS);
        this.element.addEventListener('error', this._dispatchError.bind(this), EVENT_OPTIONS);
        this.element.addEventListener('loadeddata', this._isDvrEnabled.bind(this), EVENT_OPTIONS);
        this.element.textTracks.addEventListener('addtrack', this._readMediadataInfo.bind(this), EVENT_OPTIONS);
        return this;
    }
    canPlayType(mimeType) {
        return !!(this.element.canPlayType(mimeType).replace('no', ''));
    }
    load() {
        this.element.load();
    }
    destroy() {
        this.element.removeEventListener('playing', this._clearTimeout.bind(this));
        this.element.removeEventListener('stalled', this._setTimeout.bind(this));
        this.element.removeEventListener('error', this._dispatchError.bind(this));
        this.element.removeEventListener('loadeddata', this._isDvrEnabled.bind(this));
        this.element.textTracks.removeEventListener('addtrack', this._readMediadataInfo.bind(this));
        return this;
    }
    get levels() {
        if (!__classPrivateFieldGet(this, _HTML5Media_levelList, "f").length) {
            const levels = this.element.querySelectorAll('source[title]');
            for (let i = 0, total = levels.length; i < total; ++i) {
                const level = {
                    height: 0,
                    id: `${i}`,
                    label: levels[i].getAttribute('title'),
                };
                __classPrivateFieldGet(this, _HTML5Media_levelList, "f").push(level);
            }
        }
        return __classPrivateFieldGet(this, _HTML5Media_levelList, "f");
    }
    set level(level) {
        const idx = __classPrivateFieldGet(this, _HTML5Media_levelList, "f").findIndex((item) => parseInt(item.id, 10) === level);
        if (idx > -1) {
            __classPrivateFieldSet(this, _HTML5Media_currentLevel, this.levels[idx], "f");
            const levels = this.element.querySelectorAll('source[title]');
            for (let i = 0, total = levels.length; i < total; ++i) {
                const source = levels[i].getAttribute('src');
                if (source && parseInt(__classPrivateFieldGet(this, _HTML5Media_currentLevel, "f").id, 10) === i) {
                    this.element.src = source;
                }
            }
        }
    }
    get level() {
        return __classPrivateFieldGet(this, _HTML5Media_currentLevel, "f") ? __classPrivateFieldGet(this, _HTML5Media_currentLevel, "f").id : '-1';
    }
    set src(media) {
        this.element.src = media.src;
    }
    _isDvrEnabled() {
        const time = this.element.seekable.end(this.element.seekable.length - 1) - this.element.seekable.start(0);
        if (__classPrivateFieldGet(this, _HTML5Media_isStreaming, "f") && time > DVR_THRESHOLD && !this.element.getAttribute('op-dvr__enabled')) {
            this.element.setAttribute('op-dvr__enabled', 'true');
            const timeEvent = addEvent('timeupdate');
            this.element.dispatchEvent(timeEvent);
        }
    }
    _readMediadataInfo(e) {
        const target = e;
        if (target.track.kind === 'metadata') {
            target.track.mode = 'hidden';
            target.track.addEventListener('cuechange', (event) => {
                const track = event.target;
                const cue = track.activeCues ? track.activeCues[0] : null;
                if (cue) {
                    const metaDataEvent = addEvent('metadataready', { detail: cue });
                    this.element.dispatchEvent(metaDataEvent);
                }
            }, EVENT_OPTIONS);
        }
    }
    _setTimeout() {
        if (!__classPrivateFieldGet(this, _HTML5Media_started, "f")) {
            __classPrivateFieldSet(this, _HTML5Media_started, true, "f");
            __classPrivateFieldSet(this, _HTML5Media_timer, setInterval(() => {
                if (__classPrivateFieldGet(this, _HTML5Media_retryCount, "f") >= 30) {
                    clearInterval(__classPrivateFieldGet(this, _HTML5Media_timer, "f"));
                    const message = 'Media download failed part-way due to a network error';
                    const details = {
                        detail: {
                            data: { message, error: 2 },
                            message,
                            type: 'HTML5',
                        },
                    };
                    const errorEvent = addEvent('playererror', details);
                    this.element.dispatchEvent(errorEvent);
                    __classPrivateFieldSet(this, _HTML5Media_retryCount, 0, "f");
                    __classPrivateFieldSet(this, _HTML5Media_started, false, "f");
                }
                else {
                    __classPrivateFieldSet(this, _HTML5Media_retryCount, +__classPrivateFieldGet(this, _HTML5Media_retryCount, "f") + 1, "f");
                }
            }, 1000), "f");
        }
    }
    _clearTimeout() {
        if (__classPrivateFieldGet(this, _HTML5Media_timer, "f")) {
            clearInterval(__classPrivateFieldGet(this, _HTML5Media_timer, "f"));
            __classPrivateFieldSet(this, _HTML5Media_retryCount, 0, "f");
            __classPrivateFieldSet(this, _HTML5Media_started, false, "f");
        }
    }
    _dispatchError(e) {
        let defaultMessage;
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                defaultMessage = 'Media playback aborted';
                break;
            case e.target.error.MEDIA_ERR_NETWORK:
                defaultMessage = 'Media download failed part-way due to a network error';
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                defaultMessage = 'Media playback aborted due to a corruption problem or because the media used features your browser did not support.';
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                defaultMessage = 'Media could not be loaded, either because the server or network failed or because the format is not supported.';
                break;
            default:
                defaultMessage = 'Unknown error occurred.';
                break;
        }
        const details = {
            detail: {
                data: Object.assign(Object.assign({}, e), { message: e.message || defaultMessage, error: e.target.error.code }),
                message: e.message || defaultMessage,
                type: 'HTML5',
            },
        };
        const errorEvent = addEvent('playererror', details);
        this.element.dispatchEvent(errorEvent);
    }
}
_HTML5Media_currentLevel = new WeakMap(), _HTML5Media_levelList = new WeakMap(), _HTML5Media_isStreaming = new WeakMap(), _HTML5Media_retryCount = new WeakMap(), _HTML5Media_started = new WeakMap(), _HTML5Media_timer = new WeakMap();
export default HTML5Media;
