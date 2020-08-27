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
     * Native video/audio tag.
     *
     * @type HTMLMediaElement
     * @memberof Native
     */
    public element: HTMLMediaElement;

    /**
     * The current media source element.
     *
     * @type Source
     * @memberof Native
     */
    public media: Source;

    /**
     * Promise to be resolved once media starts playing to avoid race issues.
     *
     * @type Promise<any>
     * @memberof Native
     */
    public promise: Promise<any>;

    /**
     * The instance of a custom player.
     *
     * HLS/Dash have more methods that are related to their custom libraries.
     *
     * @type {any}
     * @memberof Native
     */
    private customPlayer: any;

    /**
     * Create an instance of Native.
     *
     * @param {HTMLMediaElement} element The `video/audio` source.
     * @param {Source} media The `Media` instance.
     * @memberof Native
     */
    constructor(element: HTMLMediaElement, media: Source) {
        this.element = element;
        this.media = media;
        this.promise = new Promise(resolve => {
            resolve();
        });
    }

    /**
     * Check if player can play the current media type (MIME type).
     *
     * @abstract
     * @param {string} mimeType
     * @returns {boolean}
     * @memberof Native
     */
    public abstract canPlayType(mimeType: string): boolean;

    /**
     * Prepare current media to be played.
     *
     * @abstract
     * @memberof Native
     */
    public abstract load(): void;

    /**
     * Execute any callbacks to destroy the current media element.
     *
     * @abstract
     * @returns {any}
     * @memberof Native
     */
    public abstract destroy(): any;

    /**
     * Set a new media source.
     *
     * @abstract
     * @memberof Native
     */
    public abstract set src(media: Source);

    /**
     * Return the current media source.
     *
     * @abstract
     * @returns {Source}
     * @memberof Native
     */
    public abstract get src(): Source;

    /**
     *
     * @abstract
     * @memberof Media
     */
    public abstract set level(value: number|string|object);

    /**
     *
     * @abstract
     * @memberof Media
     */
    public abstract get level(): number|string|object;

    /**
     *
     * @abstract
     * @memberof Media
     */
    public abstract get levels(): object[];

    /**
     *
     * @memberof Media
     */
    public set instance(customPlayer: any) {
        this.customPlayer = customPlayer;
    }

    /**
     *
     * @returns {any}
     * @memberof Media
     */
    public get instance(): any {
        return this.customPlayer;
    }

    /**
     * Play current media.
     *
     * @memberof Native
     */
    public play(): Promise<void> {
        return this.element.play();
    }

    /**
     * Pause current media.
     *
     * @memberof Native
     */
    public pause(): void {
        this.element.pause();
    }

    /**
     * Set the current media's volume level.
     *
     * @memberof Native
     */
    set volume(value: number) {
        this.element.volume = value;
    }

    /**
     * Retrieve current media's volume level.
     *
     * @returns {number}
     * @memberof Native
     */
    get volume(): number {
        return this.element.volume;
    }

    /**
     * Set the current media's muted status.
     *
     * @memberof Native
     */
    set muted(value: boolean) {
        this.element.muted = value;
    }

    /**
     * Retrieve the current media's muted status.
     *
     * @returns {boolean}
     * @memberof Native
     */
    get muted(): boolean {
        return this.element.muted;
    }

    /**
     * Set the current media's playback rate.
     *
     * @memberof Native
     */
    set playbackRate(value: number) {
        this.element.playbackRate = value;
    }

    /**
     * Retrieve the current media's playback rate.
     *
     * @returns {number}
     * @memberof Native
     */
    get playbackRate(): number {
        return this.element.playbackRate;
    }

    /**
     * Set the current media's playback rate.
     *
     * @memberof Native
     */
    set defaultPlaybackRate(value: number) {
        this.element.defaultPlaybackRate = value;
    }

    /**
     * Retrieve the current media's playback rate.
     *
     * @returns {number}
     * @memberof Native
     */
    get defaultPlaybackRate(): number {
        return this.element.defaultPlaybackRate;
    }

    /**
     * Set the current media's current time position.
     *
     * @memberof Native
     */
    set currentTime(value: number) {
        this.element.currentTime = value;
    }

    /**
     * Retrieve the current media's current time position.
     *
     * @returns {number}
     * @memberof Native
     */
    get currentTime(): number {
        return this.element.currentTime;
    }

    /**
     * Retrieve the current media's current duration.
     *
     * @returns {number}
     * @memberof Native
     */
    get duration(): number {
        return this.element.duration;
    }

    /**
     * Retrieve the current media's paused status.
     *
     * @returns {boolean}
     * @memberof Native
     */
    get paused(): boolean {
        return this.element.paused;
    }

    /**
     * * Retrieve the current media's ended status.
     *
     * @returns {boolean}
     * @memberof Native
     */
    get ended(): boolean {
        return this.element.ended;
    }
}

export default Native;
