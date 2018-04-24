/**
 * Track
 *
 * @description An object that mimics the `track` tag attributes.
 * @interface Track
 * @export
 */
export default interface Track {
    /**
     * The language short code of the track (`en`, `es`, `pt`, etc.)
     *
     * @type string
     * @memberof Track
     */
    srclang: string;

    /**
     * Path/URL to obtain track's content.
     *
     * @type string
     * @memberof Track
     */
    src: string;

    /**
     * Type of track.
     *
     * Possible values (although, OpenPlayer only supports the first one):
     *  - `subtitles`
     *  - `captions`
     *  - `descriptions`
     *  - `chapters`
     *  - `metadata`
     *
     * @see https://mzl.la/2HyGCbg
     * @type string
     * @memberof Track
     */
    kind: string;

    /**
     * Human-friendly name for the track to be displayed in `Settings` menu.
     *
     * @see [[Settings.addItem]]
     * @type string
     * @memberof Track
     */
    label: string;

    /**
     * Flag to indicate if player should display track's content initially or not.
     *
     * @type boolean
     * @memberof Track
     */
    default?: boolean;
}
