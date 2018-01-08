export function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
            script.remove();
            resolve();
        };
        script.onerror = () => {
            script.remove();
            reject();
        };
        document.head.appendChild(script);
    });
}

export const NAV = window.navigator;
export const UA = NAV.userAgent.toLowerCase();
export const IS_IPAD = /ipad/i.test(UA) && !window.MSStream;
export const IS_IPHONE = /iphone/i.test(UA) && !window.MSStream;
export const IS_IPOD = /ipod/i.test(UA) && !window.MSStream;
export const IS_IOS = /ipad|iphone|ipod/i.test(UA) && !window.MSStream;
export const IS_ANDROID = /android/i.test(UA);
export const IS_IE = /(trident|microsoft)/i.test(NAV.appName);
export const IS_EDGE = ('msLaunchUri' in NAV && !('documentMode' in document));
export const IS_CHROME = /chrome/i.test(UA);
export const IS_FIREFOX = /firefox/i.test(UA);
export const IS_SAFARI = /safari/i.test(UA) && !IS_CHROME;
export const IS_STOCK_ANDROID = /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(UA);
export const HAS_MSE = ('MediaSource' in window);
export const SUPPORTS_NATIVE_HLS = (IS_SAFARI || (IS_ANDROID && (IS_CHROME || IS_STOCK_ANDROID)) || (IS_IE && /edge/i.test(UA)));
