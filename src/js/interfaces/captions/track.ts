/**
 * Track
 *
 * @export
 * @interface Track
 */
export default interface Track {
    /**
     *
     *
     * @type {string}
     * @memberof Track
     */
    srclang: string;
    /**
     *
     *
     * @type {string}
     * @memberof Track
     */
    src: string;
    /**
     *
     *
     * @type {string}
     * @memberof Track
     */
    kind: string;
    /**
     *
     *
     * @type {string}
     * @memberof Track
     */
    label: string;
    /**
     *
     *
     * @type {boolean}
     * @memberof Track
     */
    default?: boolean;
}
