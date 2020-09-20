/**
 * Ads options
 *
 * @description An object that stores configuration for Google IMA SDK
 * @interface Options
 * @export
 */
export default interface Options {
    /**
     * Flag to interrupt automatic ad breaks and give end user control over it.
     */
    readonly autoPlayAdBreaks: boolean;
    /**
     * If `true`, enables the IMA SDK URL in debug mode.
     */
    readonly debug: boolean;
    /**
     * Number of redirection to play Ad (by default, `4`).
     */
    readonly numRedirects: number;
    /**
     * Play Ad endlessly (mostly used for text Ads).
     */
    readonly loop: boolean;
    /**
     * The IMA SDK URL to load the plugin.
     */
    readonly sdkPath: string;
    /**
     * Ad or collection of Ads to be played.
     */
    readonly src: string | string[];
}
