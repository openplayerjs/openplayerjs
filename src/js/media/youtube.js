// import {loadScript} from '../utils/dom';
/**
 * Class that handles the YouTube API within the player
 *
 * @class YouTubeMedia
 */
class YouTubeMedia {
    /**
     * Creates an instance of YouTubeMedia.
     *
     * @param {HTMLElement} element
     * @param {object} media
     * @returns {YouTubeMedia}
     * @memberof YouTubeMedia
     */
    constructor(element, media) {
        this.element = element;
        this.media = media;
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
