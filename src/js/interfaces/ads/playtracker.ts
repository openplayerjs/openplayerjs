/**
 * Ads playhead tracker
 *
 * @description An object that stores the duration and current time of media, used to solve seeking issues
 * @interface PlayheadTracker
 * @export
 */
export default interface PlayheadTracker {
    /**
     * @type number
     */
    currentTime: number;
    /**
     * @type number
     */
    previousTime: number;
    /**
     * @type number
     */
    duration: number;
    /**
     * @type boolean
     */
    seeking: boolean;
}
