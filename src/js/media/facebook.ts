import Iframe from '../components/iframe';
import IFile from '../components/interfaces/media/file';
import {loadScript} from '../utils/dom';

declare const FB: any;

/**
 *
 * @class FacebookMedia
 * @description Class that handles the Facebook API within the player
 */
class FacebookMedia extends Iframe {
    /**
     * Creates an instance of FacebookMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {IFile} mediaFile
     * @returns {FacebookMedia}
     * @memberof FacebookMedia
     */
    constructor(element: HTMLIFrameElement, mediaFile: IFile) {
        super(element, mediaFile);
        this.promise = (typeof FB === 'undefined') ?
            loadScript('https://connect.facebook.net/en/sdk.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    public canPlayType(mimeType: string) {
        return mimeType === 'application/x-facebook';
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

export default FacebookMedia;
