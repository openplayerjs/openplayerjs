import Source from '../interfaces/source';
/**
 * Class that mimics the HTML5 MediaElement's standard methods.
 *
 * All the methods are availabe for the different types of media; the exceptions
 * are the getter/setter of a source, load it and determine if media can be played,
 * since each one of the media types handle those in a different way.
 *
 * @abstract
 * @class Native
 */
abstract class Native {
    public element: HTMLMediaElement;
    public media: Source;
    public promise: Promise<any>;

    constructor(element: HTMLMediaElement, media: Source) {
        this.element = element;
        this.media = media;
        this.promise = new Promise(resolve => {
            resolve();
        });
    }

    public abstract canPlayType(mimeType: string): boolean;

    public abstract load(): void;

    public abstract set src(media: Source);

    public abstract get src();

    public play() {
        this.element.play();
    }

    public pause() {
        this.element.pause();
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

    get playbackRate() {
        return this.element.playbackRate;
    }

    set playbackRate(value) {
        this.element.playbackRate = value;
    }

    set currentTime(value) {
        this.element.currentTime = value;
    }
    get currentTime() {
        return this.element.currentTime;
    }

    get duration() {
        return this.element.duration;
    }

    get paused() {
        return this.element.paused;
    }

    get ended() {
        return this.element.ended;
    }
}

export default Native;
