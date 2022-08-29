const navigator = () => (typeof window !== 'undefined' ? window.navigator : null);
const getUserAgent = () => { var _a, _b; return ((_b = (_a = navigator()) === null || _a === void 0 ? void 0 : _a.userAgent) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || null; };
export const isMobile = () => false;
export const isIPhone = () => /iphone/i.test(getUserAgent() || '') && !window.MSStream;
export const isIOS = () => /ipad|iphone|ipod/i.test(getUserAgent() || '') && !window.MSStream;
export const isAndroid = () => /android/i.test(getUserAgent() || '');
const isChrome = () => /chrome/i.test(getUserAgent() || '');
export const isSafari = () => /safari/i.test(getUserAgent() || '') && !isChrome();
export const hasMSE = () => (typeof window !== 'undefined' ? 'MediaSource' in window : false);
export const supportsHLS = () => {
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
    return !!isTypeSupported && !!sourceBufferValidAPI && !isSafari();
};
export const DVR_THRESHOLD = 120;
export const EVENT_OPTIONS = { passive: false };
