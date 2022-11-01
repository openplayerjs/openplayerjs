declare global {
    interface Window {
        MSStream: any;
        WebKitMediaSource: any;
        WebKitSourceBuffer: any;
    }
    type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g';
    interface NavigatorExtended extends Navigator {
        connection?: EventTarget & {
            effectiveType?: NetworkEffectiveType;
        };
        mozConnection?: EventTarget & {
            effectiveType?: NetworkEffectiveType;
        };
        webkitConnection?: EventTarget & {
            effectiveType?: NetworkEffectiveType;
        };
    }
}
export declare const navigator: () => NavigatorExtended | null;
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
