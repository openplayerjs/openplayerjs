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
var _DashMedia_player, _DashMedia_events, _DashMedia_options;
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const general_1 = require("../utils/general");
const media_1 = require("../utils/media");
const native_1 = __importDefault(require("./native"));
class DashMedia extends native_1.default {
    constructor(element, mediaSource, options) {
        super(element, mediaSource);
        _DashMedia_player.set(this, void 0);
        _DashMedia_events.set(this, {});
        _DashMedia_options.set(this, {});
        __classPrivateFieldSet(this, _DashMedia_options, options, "f");
        this._assign = this._assign.bind(this);
        this._preparePlayer = this._preparePlayer.bind(this);
        this.promise =
            typeof dashjs === 'undefined'
                ?
                    (0, general_1.loadScript)('https://cdn.dashjs.org/latest/dash.all.min.js')
                : new Promise((resolve) => {
                    resolve({});
                });
        this.promise.then(() => {
            __classPrivateFieldSet(this, _DashMedia_player, dashjs.MediaPlayer().create(), "f");
            this.instance = __classPrivateFieldGet(this, _DashMedia_player, "f");
        });
    }
    canPlayType(mimeType) {
        return constants_1.HAS_MSE && mimeType === 'application/dash+xml';
    }
    load() {
        this._preparePlayer();
        __classPrivateFieldGet(this, _DashMedia_player, "f").attachSource(this.media.src);
        const e = (0, general_1.addEvent)('loadedmetadata');
        this.element.dispatchEvent(e);
        if (!__classPrivateFieldGet(this, _DashMedia_events, "f")) {
            __classPrivateFieldSet(this, _DashMedia_events, dashjs.MediaPlayer.events, "f");
            Object.keys(__classPrivateFieldGet(this, _DashMedia_events, "f")).forEach((event) => {
                __classPrivateFieldGet(this, _DashMedia_player, "f").on(__classPrivateFieldGet(this, _DashMedia_events, "f")[event], this._assign);
            });
        }
    }
    destroy() {
        if (__classPrivateFieldGet(this, _DashMedia_events, "f")) {
            Object.keys(__classPrivateFieldGet(this, _DashMedia_events, "f")).forEach((event) => {
                __classPrivateFieldGet(this, _DashMedia_player, "f").off(__classPrivateFieldGet(this, _DashMedia_events, "f")[event], this._assign);
            });
            __classPrivateFieldSet(this, _DashMedia_events, [], "f");
        }
        __classPrivateFieldGet(this, _DashMedia_player, "f").reset();
    }
    set src(media) {
        if ((0, media_1.isDashSource)(media)) {
            this.destroy();
            __classPrivateFieldSet(this, _DashMedia_player, dashjs.MediaPlayer().create(), "f");
            this._preparePlayer();
            __classPrivateFieldGet(this, _DashMedia_player, "f").attachSource(media.src);
            __classPrivateFieldSet(this, _DashMedia_events, dashjs.MediaPlayer.events, "f");
            Object.keys(__classPrivateFieldGet(this, _DashMedia_events, "f")).forEach((event) => {
                __classPrivateFieldGet(this, _DashMedia_player, "f").on(__classPrivateFieldGet(this, _DashMedia_events, "f")[event], this._assign);
            });
        }
    }
    get levels() {
        const levels = [];
        if (__classPrivateFieldGet(this, _DashMedia_player, "f")) {
            const bitrates = __classPrivateFieldGet(this, _DashMedia_player, "f").getBitrateInfoListFor('video');
            if (bitrates.length) {
                bitrates.forEach((item) => {
                    if (bitrates[item]) {
                        const { height, name } = bitrates[item];
                        const level = {
                            height,
                            id: `${item}`,
                            label: name || null,
                        };
                        levels.push(level);
                    }
                });
            }
        }
        return levels;
    }
    set level(level) {
        if (level === '0') {
            __classPrivateFieldGet(this, _DashMedia_player, "f").setAutoSwitchQuality(true);
        }
        else {
            __classPrivateFieldGet(this, _DashMedia_player, "f").setAutoSwitchQuality(false);
            __classPrivateFieldGet(this, _DashMedia_player, "f").setQualityFor('video', level);
        }
    }
    get level() {
        return __classPrivateFieldGet(this, _DashMedia_player, "f") ? __classPrivateFieldGet(this, _DashMedia_player, "f").getQualityFor('video') : '-1';
    }
    _assign(event) {
        if (event.type === 'error') {
            const details = {
                detail: {
                    message: event,
                    type: 'M(PEG)-DASH',
                },
            };
            const errorEvent = (0, general_1.addEvent)('playererror', details);
            this.element.dispatchEvent(errorEvent);
        }
        else {
            const e = (0, general_1.addEvent)(event.type, { detail: event });
            this.element.dispatchEvent(e);
        }
    }
    _preparePlayer() {
        __classPrivateFieldGet(this, _DashMedia_player, "f").updateSettings(Object.assign({ debug: {
                logLevel: dashjs.Debug.LOG_LEVEL_NONE,
            }, streaming: {
                fastSwitchEnabled: true,
                scheduleWhilePaused: false,
            } }, (__classPrivateFieldGet(this, _DashMedia_options, "f") || {})));
        __classPrivateFieldGet(this, _DashMedia_player, "f").initialize();
        __classPrivateFieldGet(this, _DashMedia_player, "f").attachView(this.element);
        __classPrivateFieldGet(this, _DashMedia_player, "f").setAutoPlay(false);
    }
}
_DashMedia_player = new WeakMap(), _DashMedia_events = new WeakMap(), _DashMedia_options = new WeakMap();
exports.default = DashMedia;
