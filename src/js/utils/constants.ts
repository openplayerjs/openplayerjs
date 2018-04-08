/**
 * Reference of Window.Navigator to obtain browser's information.
 *
 * @type Navigator
 * @default
 */
export const NAV = (window as any).navigator;

/**
 * Browser's user agent.
 *
 * @type string
 * @default
 */
export const UA = NAV.userAgent.toLowerCase();

/**
 * Check if browser's user agent is related to an iPad.
 *
 * @type boolean
 * @default
 */
export const IS_IPAD = /ipad/i.test(UA) && !(window as any).MSStream;

/**
 * Check if browser's user agent is related to an iPhone.
 *
 * @type boolean
 * @default
 */
export const IS_IPHONE = /iphone/i.test(UA) && !(window as any).MSStream;

/**
 * Check if browser's user agent is related to an iPod.
 *
 * @type boolean
 * @default
 */
export const IS_IPOD = /ipod/i.test(UA) && !(window as any).MSStream;

/**
 * Check if browser's user agent is related to an iOS device (iPhone, iPad, iPod).
 *
 * @type boolean
 * @default
 */
export const IS_IOS = /ipad|iphone|ipod/i.test(UA) && !(window as any).MSStream;

/**
 * Check if browser's user agent is related to an Android device.
 *
 * @type boolean
 * @default
 */
export const IS_ANDROID = /android/i.test(UA);

/**
 * Check if current browser is Internet Explorer (any version).
 *
 * @type boolean
 * @default
 */
export const IS_IE = /(trident|microsoft)/i.test(NAV.appName);

/**
 * Check if current browser is Microsoft Edge (any version).
 *
 * @type boolean
 * @default
 */
export const IS_EDGE = ('msLaunchUri' in NAV && !('documentMode' in document));

/**
 * Check if current browser is Chrome (any version).
 *
 * @type boolean
 * @default
 */
export const IS_CHROME = /chrome/i.test(UA);

/**
 * Check if current browser is Mozilla Firefox (any version).
 *
 * @type boolean
 * @default
 */
export const IS_FIREFOX = /firefox/i.test(UA);

/**
 * Check if current browser is WebKit Safari (any version).
 *
 * @type boolean
 * @default
 */
export const IS_SAFARI = /safari/i.test(UA) && !IS_CHROME;

/**
 * Check if current browser is Android's Stock browser (any version).
 *
 * @type boolean
 * @default
 */
export const IS_STOCK_ANDROID = /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(UA);

/**
 * Check if current browser supports MediaSource API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
 * @type boolean
 * @default
 */
export const HAS_MSE = ('MediaSource' in (window as any));

/**
 * Check if current browser supports natively HLS streaming.
 *
 * @see https://developer.jwplayer.com/articles/html5-report/adaptive-streaming/hls.html
 * @type boolean
 * @default
 */
export const SUPPORTS_NATIVE_HLS = (IS_SAFARI || (IS_ANDROID && (IS_CHROME || IS_STOCK_ANDROID)) || (IS_IE && /edge/i.test(UA)));
