/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        MSStream: any;
        WebKitMediaSource: any;
        WebKitSourceBuffer: any;
    }

    interface NavigatorExtended extends Navigator {
        connection: NetworkInformation & { effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' };
        mozConnection?: NetworkInformation & { effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' };
        webkitConnection?: NetworkInformation & { effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' };
    }
}

export const NAV: NavigatorExtended | null = typeof window !== 'undefined' ? window.navigator : null;

export const UA: string | null = NAV ? NAV.userAgent.toLowerCase() : null;

export const IS_IPAD = UA ? /ipad/i.test(UA) && !window.MSStream : false;

export const IS_IPHONE = UA ? /iphone/i.test(UA) && !window.MSStream : false;

export const IS_IPOD = UA ? /ipod/i.test(UA) && !window.MSStream : false;

export const IS_IOS = UA ? /ipad|iphone|ipod/i.test(UA) && !window.MSStream : false;

export const IS_ANDROID = UA ? /android/i.test(UA) : false;

export const IS_EDGE = NAV ? 'msLaunchUri' in NAV && !('documentMode' in document) : false;

export const IS_CHROME = UA ? /chrome/i.test(UA) : false;

export const IS_FIREFOX = UA ? /firefox/i.test(UA) : false;

export const IS_SAFARI = UA ? /safari/i.test(UA) && !IS_CHROME : false;

export const IS_STOCK_ANDROID = UA ? /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(UA) : false;

export const HAS_MSE = typeof window !== 'undefined' ? 'MediaSource' in window : false;

// @see https://github.com/video-dev/hls.js/blob/master/src/is-supported.js
export const SUPPORTS_HLS = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }
    const mediaSource = window.MediaSource || window.WebKitMediaSource;
    const sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
    const isTypeSupported =
        mediaSource &&
        typeof mediaSource.isTypeSupported === 'function' &&
        mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');

    const sourceBufferValidAPI =
        !sourceBuffer ||
        (sourceBuffer.prototype &&
            typeof sourceBuffer.prototype.appendBuffer === 'function' &&
            typeof sourceBuffer.prototype.remove === 'function');

    // Safari is still an exception since it has built-in HLS support; currently HLS.js
    // is still in beta to support Safari
    return !!isTypeSupported && !!sourceBufferValidAPI && !IS_SAFARI;
};

export const DVR_THRESHOLD = 120;

export const EVENT_OPTIONS = { passive: false };
