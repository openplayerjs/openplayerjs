/**
 * Media source
 *
 * @export
 * @interface Source
 */
export default interface Source {
    /**
     * 
     * 
     * @type string
     * @memberof Source
     */
    src: string;
    /**
     * 
     * 
     * @type string
     * @memberof Source
     */
    type: string;
    /**
     * 
     * 
     * @type object
     * @memberof Source
     */
    drm?: object;
}
