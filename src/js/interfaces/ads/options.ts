/**
 * Ads options
 *
 * @description An object that stores configuration for Google IMA SDK
 * @interface Options
 * @export
 */
export default interface Options {
    /**
     * @type boolean
     */
    autoPlayAdBreaks: boolean;
    /**
     * @type boolean
     */
    debug: boolean;
    /**
     * @type number
     */
    numRedirects: number;
    /**
     * @type boolean
     */
    loop: boolean;
    /**
     * @type string
     */
    url: string;
}
