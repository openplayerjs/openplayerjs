import IFile from './interfaces/media/file';
import IType from './interfaces/media/type';

export default class Native implements IType {
    public element: HTMLMediaElement;
    public media: IFile;
    public promise: Promise<any>;

    constructor(element: HTMLMediaElement, media: IFile) {
        this.element = element;
        this.media = media;
        this.promise = new Promise(resolve => {
            resolve();
        });
    }

    public play() {
        this.element.play();
    }

    public pause() {
        this.element.pause();
    }

    get src() {
        return this.media;
    }

    set volume(value) {
        this.element.volume = value;
    }

    get volume() {
        return this.element.volume;
    }

    set muted(value) {
        this.element.muted = value;
    }

    get muted() {
        return this.element.muted;
    }

    get paused() {
        return this.element.paused;
    }

    get ended() {
        return this.element.ended;
    }
}
