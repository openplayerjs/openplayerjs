import Player from '../player';

/**
 * Player instance list
 *
 * @export
 * @interface PlayerInstanceList
 */
export default interface PlayerInstanceList {
    [id: string]: Player;
}
