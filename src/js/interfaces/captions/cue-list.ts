import Cue from './cue';

/**
 * Cue List
 *
 * @export
 * @interface Cue
 */
export default interface CueList {
    /**
     * @type object
     */
    [language: string]: Cue[];
}
