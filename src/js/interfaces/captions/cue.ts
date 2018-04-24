/**
 * Cue
 *
 * @description Object that mimics the native HTML5 Cue.
 * @interface Cue
 * @export
 */
export default interface Cue {
    /**
     * Time in STMP format to indicate when cue must be hidden.
     *
     * @type number
     * @memberof Cue
     */
    endTime: number;

    /**
     * Cue ID set in VTT file.
     *
     * @type string
     * @memberof Cue
     */
    identifier: string;

    /**
     * Extra attributes detected in cue (generally empty).
     *
     * @type object
     * @memberof Cue
     */
    settings: object;

    /**
     * Time in STMP format to indicate when cue must be displayed.
     *
     * @type number
     * @memberof Cue
     */
    startTime: number;

    /**
     * Text in cue to be displayed.
     *
     * @type string
     * @memberof Cue
     */
    text: string;
}
