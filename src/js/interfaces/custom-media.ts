/**
 * Custom media
 *
 * @description An object that stores additional API/players for non-native media
 * @interface CustomMedia
 * @export
 */
export default interface CustomMedia {
    /**
     * Store all the native methods to play custom media
     *
     * @type object
     */
    media: {
        [key: string]: object,
    };
    /**
     * Store name of media to be used as key for configuration options
     *
     * @type string[]
     * @memberof CustomMedia
     */
    optionsKey: {
        [key: string]: string,
    };
    /**
     * Store callbacks to determine MIME type based on URL
     *
     * @type any[]
     * @memberof CustomMedia
     */
    rules?: any[];
}
