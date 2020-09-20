/**
 * Playlist item
 *
 * @description Object that contains the defaut elements for a playlist.
 * @see https://siptv.eu/howto/playlist.html
 * @interface PlaylistItem
 * @export
 */
export default interface PlaylistItem {
    name: string;
    src: string;
    altName?: string;
    logo?: string;
    thumbnail?: string;
    id?: string | number;
    language?: string;
    country?: string;
    group?: string;
    code?: string;
    audioTrack?: string;
    default?: boolean;
}
