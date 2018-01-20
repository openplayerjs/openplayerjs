// import {loadScript} from '../utils/dom';
/**
 *
 * @class TwitchMedia
 * @description Class that handles the Twitch API within the player
 */
class TwitchMedia {
    /**
     * Creates an instance of TwitchMedia.
     *
     * @param {HTMLElement} element
     * @param {object} mediaFile
     * @returns {TwitchMedia}
     * @memberof TwitchMedia
     */
    constructor(element, mediaFile) {
        this.element = element;
        this.media = mediaFile;
        this.promise = (typeof Twitch === 'undefined') ?
            loadScript('https://player.twitch.tv/js/embed/v1.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    canPlayType(mimeType) {
        return mimeType === 'application/x-twitch' && this.media.type === mimeType;
    }

    load() {
        console.log(this);
    }
}

export default TwitchMedia;
