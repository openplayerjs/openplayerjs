/**
 * Media source
 *
 * @description Object that contains the defaut elements for a media source.
 * @interface Source
 * @export
 */
export default interface Source {
    /**
     * The path/URL to the media source.
     *
     * @type string
     * @memberof Source
     */
    src: string;

    /**
     * The MIME type of the media.
     *
     * @type string
     * @memberof Source
     */
    type: string;

    /**
     * Digital rights management object to allow play restricted media.
     *
     * @type object
     * @memberof Source
     */
    drm?: object;
}
