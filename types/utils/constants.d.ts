declare global {
    interface Window {
        MSStream: any;
        WebKitMediaSource: any;
        WebKitSourceBuffer: any;
    }
    interface NavigatorExtended extends Navigator {
        connection: NetworkInformation & {
            effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
        };
        mozConnection?: NetworkInformation & {
            effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
        };
        webkitConnection?: NetworkInformation & {
            effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
        };
    }
}
export declare const isMobile: () => boolean;
export declare const isIPhone: () => boolean;
export declare const isIOS: () => boolean;
export declare const isAndroid: () => boolean;
export declare const isSafari: () => boolean;
export declare const hasMSE: () => boolean;
export declare const supportsHLS: () => boolean;
export declare const DVR_THRESHOLD = 120;
export declare const EVENT_OPTIONS: {
    passive: boolean;
};
