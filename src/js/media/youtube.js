// import {loadScript} from '../utils/dom';
/**
 *
 * @class YouTubeMedia
 * @description Class that handles the YouTube API within the player
 */
class YouTubeMedia {
    /**
     * Creates an instance of YouTubeMedia.
     *
     * @param {HTMLElement} element
     * @param {object} mediaFile
     * @returns {YouTubeMedia}
     * @memberof YouTubeMedia
     */
    constructor(element, mediaFile) {
        this.element = element;
        this.media = mediaFile;
        this.promise = (typeof YT === 'undefined' || !YT.loaded) ?
            loadScript('https://www.youtube.com/player_api') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    canPlayType(mimeType) {
        return mimeType === 'application/x-youtube' && this.media.type === mimeType;
    }

    load() {
        console.log(this);
    }
}

export default YouTubeMedia;
