var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _Player_element, _Player_initialized, _Player_uid;
class Player {
    constructor(element) {
        _Player_element.set(this, void 0);
        _Player_initialized.set(this, false);
        _Player_uid.set(this, '');
        __classPrivateFieldSet(this, _Player_element, element instanceof HTMLMediaElement ? element : document.getElementById(element), "f");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._isValid()) {
                return;
            }
            yield this.prepareMedia();
            this._generateUID();
            __classPrivateFieldSet(this, _Player_initialized, true, "f");
            Player.instances[__classPrivateFieldGet(this, _Player_uid, "f")] = this;
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    prepareMedia() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    pause() { }
    stop() { }
    destroy() {
        __classPrivateFieldGet(this, _Player_element, "f").id = __classPrivateFieldGet(this, _Player_uid, "f");
        __classPrivateFieldSet(this, _Player_initialized, false, "f");
        delete Player.instances[__classPrivateFieldGet(this, _Player_uid, "f")];
    }
    initialized() {
        return __classPrivateFieldGet(this, _Player_initialized, "f");
    }
    addCaptions(args) {
        console.log(args);
    }
    addControl(args) {
        console.log(args);
    }
    addElement(args) {
        console.log(args);
    }
    removeElement(element) {
        console.log(element);
    }
    removeControl(element) {
        console.log(element);
    }
    getElement() {
        return __classPrivateFieldGet(this, _Player_element, "f");
    }
    get id() {
        return __classPrivateFieldGet(this, _Player_uid, "f");
    }
    _isValid() {
        const el = __classPrivateFieldGet(this, _Player_element, "f");
        if (el instanceof HTMLMediaElement === false) {
            return false;
        }
        if (!el.classList.contains('op-player__media')) {
            return false;
        }
        return true;
    }
    _generateUID() {
        if (__classPrivateFieldGet(this, _Player_element, "f").id) {
            __classPrivateFieldSet(this, _Player_uid, __classPrivateFieldGet(this, _Player_element, "f").id, "f");
            __classPrivateFieldGet(this, _Player_element, "f").removeAttribute('id');
        }
        else {
            const cryptoLib = crypto;
            const encryption = typeof cryptoLib.getRandomBytes === 'function' ? cryptoLib.getRandomBytes : cryptoLib.getRandomValues;
            __classPrivateFieldSet(this, _Player_uid, `op_${encryption(new Uint32Array(1))[0].toString(36).substr(2, 9)}`, "f");
        }
        if (__classPrivateFieldGet(this, _Player_element, "f").parentElement) {
            __classPrivateFieldGet(this, _Player_element, "f").parentElement.id = __classPrivateFieldGet(this, _Player_uid, "f");
        }
    }
}
_Player_element = new WeakMap(), _Player_initialized = new WeakMap(), _Player_uid = new WeakMap();
Player.instances = {};
export default Player;
if (typeof window !== 'undefined') {
    window.OpenPlayer = Player;
    window.OpenPlayerJS = Player;
}
