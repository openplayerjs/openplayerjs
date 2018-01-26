import Iframe from '../components/iframe';
import IFile from '../components/interfaces/media/file';
import {loadScript} from '../utils/dom';

declare const DM: any;

/**
 *
 * @class DailyMotionMedia
 * @description Class that handles the DailyMotion API within the player
 */
class DailyMotionMedia extends Iframe {
    /**
     * Creates an instance of DailyMotionMedia.
     *
     * @param {HTMLIFrameElement} element
     * @param {IFile} mediaFile
     * @returns {DailyMotionMedia}
     * @memberof DailyMotionMedia
     */
    constructor(element: HTMLIFrameElement, mediaFile: IFile) {
        super(element, mediaFile);
        this.promise = (typeof DM === 'undefined') ?
            loadScript('https://api.dmcdn.net/all.js') :
            new Promise(resolve => {
                resolve();
            });
        return this;
    }

    public canPlayType(mimeType: string) {
        return mimeType === 'application/x-dailymotion';
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

export default DailyMotionMedia;
