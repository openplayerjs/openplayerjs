import Source from '../interfaces/source';
/**
 * Native Media.
 *
 * @description Class that mimics the HTML5 MediaElement's standard methods.
 * All the methods are availabe for the different types of media; the exceptions
 * are the getter/setter of a source, load it and determine if media can be played,
 * since each one of the media types handle those in a different way.
 *
 * @abstract
 * @class Native
 */
abstract class Native {
    /**
     *
     *
     * @type {HTMLMediaElement}
     * @memberof Native
     */
    public element: HTMLMediaElement;
    /**
     *
     *
     * @type {Source}
     * @memberof Native
     */
    public media: Source;
    /**
     *
     *
     * @type {Promise<any>}
     * @memberof Native
     */
    public promise: Promise<any>;

    constructor(element: HTMLMediaElement, media: Source) {
        this.element = element;
        this.media = media;
        this.promise = new Promise(resolve => {
            resolve();
        });
    }

    /**
     *
     *
     * @abstract
     * @param {string} mimeType
     * @returns {boolean}
     * @memberof Native
     */
    public abstract canPlayType(mimeType: string): boolean;

    /**
     *
     *
     * @abstract
     * @memberof Native
     */
    public abstract load(): void;

    /**
     *
     *
     * @abstract
     * @memberof Native
     */
    public abstract set src(media: Source);

    /**
     *
     *
     * @abstract
     * @memberof Native
     */
    public abstract get src();

    /**
     *
     *
     * @memberof Native
     */
    public play() {
        this.element.play();
    }

    /**
     *
     *
     * @memberof Native
     */
    public pause() {
        this.element.pause();
    }

    /**
     *
     *
     * @memberof Native
     */
    set volume(value) {
        this.element.volume = value;
    }

    /**
     *
     *
     * @memberof Native
     */
    get volume() {
        return this.element.volume;
    }

    /**
     *
     *
     * @memberof Native
     */
    set muted(value) {
        this.element.muted = value;
    }

    /**
     *
     *
     * @memberof Native
     */
    get muted() {
        return this.element.muted;
    }

    /**
     *
     *
     * @memberof Native
     */
    get playbackRate() {
        return this.element.playbackRate;
    }

    /**
     *
     *
     * @memberof Native
     */
    set playbackRate(value) {
        this.element.playbackRate = value;
    }

    /**
     *
     *
     * @memberof Native
     */
    set currentTime(value) {
        this.element.currentTime = value;
    }

    /**
     *
     *
     * @memberof Native
     */
    get currentTime() {
        return this.element.currentTime;
    }

    /**
     *
     *
     * @readonly
     * @memberof Native
     */
    get duration() {
        return this.element.duration;
    }

    /**
     *
     *
     * @readonly
     * @memberof Native
     */
    get paused() {
        return this.element.paused;
    }

    /**
     *
     *
     * @readonly
     * @memberof Native
     */
    get ended() {
        return this.element.ended;
    }
}

export default Native;
