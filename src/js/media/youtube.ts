import Iframe from '../components/iframe';
import IFile from '../components/interfaces/media/file';
import {loadScript} from '../utils/dom';

declare const YT: any;
/**
 *
 * @class YouTubeMedia
 * @description Class that handles the YouTube API within the player
 */
class YouTubeMedia extends Iframe {
    /**
     * Creates an instance of YouTubeMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {IFile} mediaFile
     * @returns {YouTubeMedia}
     * @memberof YouTubeMedia
     */
    constructor(element: HTMLIFrameElement, mediaFile: IFile) {
        super(element, mediaFile);
        this.promise = (typeof YT === 'undefined' || !YT.loaded) ?
            loadScript('https://www.youtube.com/player_api') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    public canPlayType(mimeType: string) {
        return mimeType === 'application/x-youtube';
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

export default YouTubeMedia;
