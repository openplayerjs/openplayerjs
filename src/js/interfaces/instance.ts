import Player from '../player';

/**
 * Player instance list
 *
 * @export
 * @interface PlayerInstanceList
 */
export default interface PlayerInstanceList {
    /**
     * @type object
     */
    [id: string]: Player;
}
