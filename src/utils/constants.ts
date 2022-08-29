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

const navigator = (): NavigatorExtended | null => (typeof window !== 'undefined' ? window.navigator : null);

const getUserAgent = (): string | null => navigator()?.userAgent?.toLowerCase() || null;

export const isMobile = (): boolean => false;

export const isIPhone = (): boolean => /iphone/i.test(getUserAgent() || '') && !window.MSStream;

export const isIOS = (): boolean => /ipad|iphone|ipod/i.test(getUserAgent() || '') && !window.MSStream;

export const isAndroid = (): boolean => /android/i.test(getUserAgent() || '');

const isChrome = (): boolean => /chrome/i.test(getUserAgent() || '');

export const isSafari = (): boolean => /safari/i.test(getUserAgent() || '') && !isChrome();

export const hasMSE = (): boolean => (typeof window !== 'undefined' ? 'MediaSource' in window : false);

// @see https://github.com/video-dev/hls.js/blob/master/src/is-supported.js
export const supportsHLS = (): boolean => {
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
    return !!isTypeSupported && !!sourceBufferValidAPI && !isSafari();
};

export const DVR_THRESHOLD = 120;

export const EVENT_OPTIONS = { passive: false };
