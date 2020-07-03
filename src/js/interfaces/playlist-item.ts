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
    altName?: string; // tvg-name
    logo?: string; // tvg-logo
    thumbnail?: string; // tvg-logo-small
    id?: string | number; // tvg-id
    language?: string; // tvg-language
    country?: string; // tvg-country
    group?: string; // group-title
    code?: string; // parent-code
    audioTrack?: string; // audio-track
}
