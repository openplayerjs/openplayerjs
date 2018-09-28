/**
 * M(PEG)-DASH options
 *
 * @description An object that stores configuration settings for M(PEG)-DASH player
 * @interface DashOptions
 * @export
 */
export default interface DashOptions {
    /**
     * @type string
     */
    robustnessLevel: string;
    /**
     * Digital rights management object to allow play restricted media.
     *
     * @type object
     * @memberof Source
     */
    drm?: object;
}
