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
var _Play_player, _Play_button, _Play_position, _Play_layer;
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importDefault(require("../player"));
const constants_1 = require("../utils/constants");
const general_1 = require("../utils/general");
const hooks_1 = __importDefault(require("../hooks"));
class Play {
    constructor(player, position, layer) {
        _Play_player.set(this, void 0);
        _Play_button.set(this, void 0);
        _Play_position.set(this, void 0);
        _Play_layer.set(this, void 0);
        __classPrivateFieldSet(this, _Play_player, player, "f");
        __classPrivateFieldSet(this, _Play_position, position, "f");
        __classPrivateFieldSet(this, _Play_layer, layer, "f");
        this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
        this._handleClick = this._handleClick.bind(this);
    }
    create() {
        const { labels } = __classPrivateFieldGet(this, _Play_player, "f").getOptions();
        __classPrivateFieldSet(this, _Play_button, document.createElement('button'), "f");
        __classPrivateFieldGet(this, _Play_button, "f").type = 'button';
        __classPrivateFieldGet(this, _Play_button, "f").className = `op-controls__playpause op-control__${__classPrivateFieldGet(this, _Play_position, "f")}`;
        __classPrivateFieldGet(this, _Play_button, "f").tabIndex = 0;
        __classPrivateFieldGet(this, _Play_button, "f").title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';
        __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-controls', __classPrivateFieldGet(this, _Play_player, "f").id);
        __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-pressed', 'false');
        __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
        __classPrivateFieldGet(this, _Play_player, "f").getControls().getLayer(__classPrivateFieldGet(this, _Play_layer, "f")).appendChild(__classPrivateFieldGet(this, _Play_button, "f"));
    }
    register() {
        var _a;
        const { labels } = __classPrivateFieldGet(this, _Play_player, "f").getOptions();
        hooks_1.default.register('media.play', () => {
            var _a;
            if (__classPrivateFieldGet(this, _Play_player, "f").activeElement().ended) {
                if (__classPrivateFieldGet(this, _Play_player, "f").isMedia()) {
                    __classPrivateFieldGet(this, _Play_button, "f").classList.add('op-controls__playpause--replay');
                }
                else {
                    __classPrivateFieldGet(this, _Play_button, "f").classList.add('op-controls__playpause--pause');
                }
                __classPrivateFieldGet(this, _Play_button, "f").title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';
                __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
            }
            else {
                __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--replay');
                __classPrivateFieldGet(this, _Play_button, "f").classList.add('op-controls__playpause--pause');
                __classPrivateFieldGet(this, _Play_button, "f").title = (labels === null || labels === void 0 ? void 0 : labels.pause) || '';
                __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.pause) || '');
                if ((_a = __classPrivateFieldGet(this, _Play_player, "f").getOptions()) === null || _a === void 0 ? void 0 : _a.pauseOthers) {
                    Object.keys(player_1.default.instances).forEach((key) => {
                        if (key !== __classPrivateFieldGet(this, _Play_player, "f").id) {
                            const target = player_1.default.instances[key].activeElement();
                            target.pause();
                        }
                    });
                }
            }
        });
        hooks_1.default.register('media.loadedmetadata', () => {
            if (__classPrivateFieldGet(this, _Play_button, "f").classList.contains('op-controls__playpause--pause')) {
                __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--replay');
                __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--pause');
                __classPrivateFieldGet(this, _Play_button, "f").title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';
                __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
            }
        });
        hooks_1.default.register('media.playing', () => {
            if (!__classPrivateFieldGet(this, _Play_button, "f").classList.contains('op-controls__playpause--pause')) {
                __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--replay');
                __classPrivateFieldGet(this, _Play_button, "f").classList.add('op-controls__playpause--pause');
                __classPrivateFieldGet(this, _Play_button, "f").title = (labels === null || labels === void 0 ? void 0 : labels.pause) || '';
                __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.pause) || '');
            }
        });
        hooks_1.default.register('media.pause', () => {
            __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--pause');
            __classPrivateFieldGet(this, _Play_button, "f").title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';
            __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
        });
        hooks_1.default.register('media.ended', () => {
            if (__classPrivateFieldGet(this, _Play_player, "f").activeElement().ended && __classPrivateFieldGet(this, _Play_player, "f").isMedia()) {
                __classPrivateFieldGet(this, _Play_button, "f").classList.add('op-controls__playpause--replay');
                __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--pause');
            }
            else if (__classPrivateFieldGet(this, _Play_player, "f").getElement().currentTime >= __classPrivateFieldGet(this, _Play_player, "f").getElement().duration ||
                __classPrivateFieldGet(this, _Play_player, "f").getElement().currentTime <= 0) {
                __classPrivateFieldGet(this, _Play_button, "f").classList.add('op-controls__playpause--replay');
                __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--pause');
            }
            else {
                __classPrivateFieldGet(this, _Play_button, "f").classList.remove('op-controls__playpause--replay');
                __classPrivateFieldGet(this, _Play_button, "f").classList.add('op-controls__playpause--pause');
            }
            __classPrivateFieldGet(this, _Play_button, "f").title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';
            __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
        });
        hooks_1.default.register('media.playererror', () => {
            if ((0, general_1.isAudio)(__classPrivateFieldGet(this, _Play_player, "f").getElement())) {
                const el = __classPrivateFieldGet(this, _Play_player, "f").activeElement();
                el.pause();
            }
        });
        if ((_a = __classPrivateFieldGet(this, _Play_player, "f").getOptions().media) === null || _a === void 0 ? void 0 : _a.pauseOnClick) {
            hooks_1.default.register('media.click', this._handleClick);
        }
        hooks_1.default.register('controls.controlschanged', () => {
            if (!__classPrivateFieldGet(this, _Play_player, "f").activeElement().paused) {
                const event = (0, general_1.addEvent)('playing');
                __classPrivateFieldGet(this, _Play_player, "f").getElement().dispatchEvent(event);
            }
        });
        __classPrivateFieldGet(this, _Play_player, "f").getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, constants_1.EVENT_OPTIONS);
        __classPrivateFieldGet(this, _Play_button, "f").addEventListener('click', this._handleClick, constants_1.EVENT_OPTIONS);
    }
    destroy() {
        __classPrivateFieldGet(this, _Play_player, "f").getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);
        __classPrivateFieldGet(this, _Play_button, "f").removeEventListener('click', this._handleClick);
        __classPrivateFieldGet(this, _Play_button, "f").remove();
    }
    _handleClick(e) {
        __classPrivateFieldGet(this, _Play_button, "f").setAttribute('aria-pressed', 'true');
        const el = __classPrivateFieldGet(this, _Play_player, "f").activeElement();
        if (el.paused || el.ended) {
            if (__classPrivateFieldGet(this, _Play_player, "f").getAd()) {
                __classPrivateFieldGet(this, _Play_player, "f").getAd().playRequested = true;
            }
            el.play();
        }
        else {
            el.pause();
        }
        e.preventDefault();
        e.stopPropagation();
    }
    _enterSpaceKeyEvent(e) {
        var _a;
        const key = e.which || e.keyCode || 0;
        const playBtnFocused = (_a = document === null || document === void 0 ? void 0 : document.activeElement) === null || _a === void 0 ? void 0 : _a.classList.contains('op-controls__playpause');
        if (playBtnFocused && (key === 13 || key === 32)) {
            this._handleClick(e);
        }
    }
}
_Play_player = new WeakMap(), _Play_button = new WeakMap(), _Play_position = new WeakMap(), _Play_layer = new WeakMap();
exports.default = Play;
