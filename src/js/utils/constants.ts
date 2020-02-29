/**
 * Reference of Window.Navigator to obtain browser's information.
 *
 * @type Navigator
 * @default
 */
export const NAV = typeof window !== 'undefined' ? (window as any).navigator : null;

/**
 * Browser's user agent.
 *
 * @type string
 * @default
 */
export const UA = NAV ? NAV.userAgent.toLowerCase() : null;

/**
 * Check if browser's user agent is related to an iPad.
 *
 * @type boolean
 * @default
 */
export const IS_IPAD = UA ? /ipad/i.test(UA) && !(window as any).MSStream : false;

/**
 * Check if browser's user agent is related to an iPhone.
 *
 * @type boolean
 * @default
 */
export const IS_IPHONE = UA ? /iphone/i.test(UA) && !(window as any).MSStream : false;

/**
 * Check if browser's user agent is related to an iPod.
 *
 * @type boolean
 * @default
 */
export const IS_IPOD = UA ? /ipod/i.test(UA) && !(window as any).MSStream : false;

/**
 * Check if browser's user agent is related to an iOS device (iPhone, iPad, iPod).
 *
 * @type boolean
 * @default
 */
export const IS_IOS = UA ? /ipad|iphone|ipod/i.test(UA) && !(window as any).MSStream : false;

/**
 * Check if browser's user agent is related to an Android device.
 *
 * @type boolean
 * @default
 */
export const IS_ANDROID = UA ? /android/i.test(UA) : false;

/**
 * Check if current browser is Internet Explorer (any version).
 *
 * @type boolean
 * @default
 */
export const IS_IE = UA ? /(trident|microsoft)/i.test(NAV.appName) : false;

/**
 * Check if current browser is Microsoft Edge (any version).
 *
 * @type boolean
 * @default
 */
export const IS_EDGE = NAV ? ('msLaunchUri' in NAV && !('documentMode' in document)) : false;

/**
 * Check if current browser is Chrome (any version).
 *
 * @type boolean
 * @default
 */
export const IS_CHROME = UA ? /chrome/i.test(UA) : false;

/**
 * Check if current browser is Mozilla Firefox (any version).
 *
 * @type boolean
 * @default
 */
export const IS_FIREFOX = UA ? /firefox/i.test(UA) : false;

/**
 * Check if current browser is WebKit Safari (any version).
 *
 * @type boolean
 * @default
 */
export const IS_SAFARI = UA ? /safari/i.test(UA) && !IS_CHROME : false;

/**
 * Check if current browser is Android's Stock browser (any version).
 *
 * @type boolean
 * @default
 */
export const IS_STOCK_ANDROID = UA ? /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(UA) : false;

/**
 * Check if current browser supports MediaSource API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
 * @type boolean
 * @default
 */
export const HAS_MSE = typeof window !== 'undefined' ? ('MediaSource' in (window as any)) : false;

/**
 * Check if current browser supports HLS streaming.
 *
 * @see https://github.com/video-dev/hls.js/blob/master/src/is-supported.js
 * @type boolean
 * @default
 */
export const SUPPORTS_HLS = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    const mediaSource = (window as any).MediaSource || (window as any).WebKitMediaSource;
    const sourceBuffer = (window as any).SourceBuffer || (window as any).WebKitSourceBuffer;
    const isTypeSupported = mediaSource &&
        typeof mediaSource.isTypeSupported === 'function' &&
        mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');

    const sourceBufferValidAPI = !sourceBuffer ||
        (sourceBuffer.prototype &&
        typeof sourceBuffer.prototype.appendBuffer === 'function' &&
        typeof sourceBuffer.prototype.remove === 'function');

    // Safari is still an exception since it has built-in HLS support; currently HLS.js
    // is still in beta to support Safari
    return !!isTypeSupported && !!sourceBufferValidAPI && !IS_SAFARI;
};
