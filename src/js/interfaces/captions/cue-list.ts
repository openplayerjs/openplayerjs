import Cue from './cue';

/**
 * Cue List
 *
 * @export
 * @interface Cue
 */
export default interface CueList {
    [language: string]: Cue[];
}
