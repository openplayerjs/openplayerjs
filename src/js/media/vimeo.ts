import Iframe from '../components/iframe';
import IFile from '../components/interfaces/media/file';
import {loadScript} from '../utils/dom';

declare const Vimeo: any;

/**
 *
 * @class VimeoMedia
 * @description Class that handles the Vimeo API within the player
 */
class VimeoMedia extends Iframe {
    /**
     * Creates an instance of VimeoMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {IFile} mediaFile
     * @returns {VimeoMedia}
     * @memberof VimeoMedia
     */
    constructor(element: HTMLIFrameElement, mediaFile: IFile) {
        super(element, mediaFile);
        this.promise = (typeof Vimeo === 'undefined') ?
            loadScript('https://player.vimeo.com/api/player.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    public canPlayType(mimeType: string) {
        return mimeType === 'application/x-vimeo';
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

export default VimeoMedia;
