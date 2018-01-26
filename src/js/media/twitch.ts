import Iframe from '../components/iframe';
import IFile from '../components/interfaces/media/file';
import {loadScript} from '../utils/dom';

declare const Twitch: any;

/**
 *
 * @class TwitchMedia
 * @description Class that handles the Twitch API within the player
 */
class TwitchMedia extends Iframe {
    /**
     * Creates an instance of TwitchMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {File} mediaFile
     * @returns {TwitchMedia}
     * @memberof TwitchMedia
     */
    constructor(element: HTMLIFrameElement, mediaFile: IFile) {
        super(element, mediaFile);
        this.promise = (typeof Twitch === 'undefined') ?
            loadScript('https://player.twitch.tv/js/embed/v1.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    public canPlayType(mimeType: string) {
        return mimeType === 'application/x-twitch';
    }

    public load() {
        console.log(this);
    }

    public play() {

    }

    public pause() {

    }

    public destroy() {
    }

    set src(media) {
        console.log(media);
    }

    get src() {
        return 'aaaaa';
    }

    set volume(value: number) {
        console.log(value);
    }

    get volume() {
        return 1;
    }

    set muted(value: boolean) {
        console.log(value);
    }

    get muted() {
        return true;
    }

    get paused() {
        return true;
    }

    get ended() {
        return true;
    }
}

export default TwitchMedia;
