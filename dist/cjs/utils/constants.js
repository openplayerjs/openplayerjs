"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_OPTIONS = exports.DVR_THRESHOLD = exports.SUPPORTS_HLS = exports.HAS_MSE = exports.IS_STOCK_ANDROID = exports.IS_SAFARI = exports.IS_FIREFOX = exports.IS_CHROME = exports.IS_EDGE = exports.IS_ANDROID = exports.IS_IOS = exports.IS_IPOD = exports.IS_IPHONE = exports.IS_IPAD = exports.UA = exports.NAV = void 0;
exports.NAV = typeof window !== 'undefined' ? window.navigator : null;
exports.UA = exports.NAV ? exports.NAV.userAgent.toLowerCase() : null;
exports.IS_IPAD = exports.UA ? /ipad/i.test(exports.UA) && !window.MSStream : false;
exports.IS_IPHONE = exports.UA ? /iphone/i.test(exports.UA) && !window.MSStream : false;
exports.IS_IPOD = exports.UA ? /ipod/i.test(exports.UA) && !window.MSStream : false;
exports.IS_IOS = exports.UA ? /ipad|iphone|ipod/i.test(exports.UA) && !window.MSStream : false;
exports.IS_ANDROID = exports.UA ? /android/i.test(exports.UA) : false;
exports.IS_EDGE = exports.NAV ? 'msLaunchUri' in exports.NAV && !('documentMode' in document) : false;
exports.IS_CHROME = exports.UA ? /chrome/i.test(exports.UA) : false;
exports.IS_FIREFOX = exports.UA ? /firefox/i.test(exports.UA) : false;
exports.IS_SAFARI = exports.UA ? /safari/i.test(exports.UA) && !exports.IS_CHROME : false;
exports.IS_STOCK_ANDROID = exports.UA ? /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(exports.UA) : false;
exports.HAS_MSE = typeof window !== 'undefined' ? 'MediaSource' in window : false;
const SUPPORTS_HLS = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    const mediaSource = window.MediaSource || window.WebKitMediaSource;
    const sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
    const isTypeSupported = mediaSource &&
        typeof mediaSource.isTypeSupported === 'function' &&
        mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
    const sourceBufferValidAPI = !sourceBuffer ||
        (sourceBuffer.prototype &&
            typeof sourceBuffer.prototype.appendBuffer === 'function' &&
            typeof sourceBuffer.prototype.remove === 'function');
    return !!isTypeSupported && !!sourceBufferValidAPI && !exports.IS_SAFARI;
};
exports.SUPPORTS_HLS = SUPPORTS_HLS;
exports.DVR_THRESHOLD = 120;
exports.EVENT_OPTIONS = { passive: false };
