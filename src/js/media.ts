import Source from './interfaces/source';
import DashMedia from './media/dash';
import HlsMedia from './media/hls';
import HTML5Media from './media/html5';
import * as source from './utils/media';

/**
 * Media element.
 *
 * @description Class that creates the Media Component in the player.
 * `Media` is the visual/audio entity that results from playing  a valid source (MP4, MP3, M3U8, MPD, etc.)
 * @class Media
 */
class Media {
    /**
     * The video/audio tag that contains media to be played.
     *
     * @type HTMLMediaElement
     * @memberof Media
     */
    public element: HTMLMediaElement;

    /**
     * Object that instantiates class of current media.
     *
     * @type (HTML5Media|HlsMedia|DashMedia)
     * @memberof Media
     */
    public media: HTML5Media|HlsMedia|DashMedia;

    /**
     * Collection of media sources available within the video/audio tag.
     *
     * @type Source[]
     * @memberof Media
     */
    public mediaFiles: Source[];

    /**
     * Promise to be resolved once media starts playing to avoid race issues.
     *
     * @see [[Media.play]]
     * @see [[Media.pause]]
     * @private
     * @type {Promise<void>}
     * @memberof Media
     */
    private promisePlay: Promise<void>;

    /**
     * Create an instance of Media.
     *
     * @param {HTMLMediaElement} element
     * @returns {Media}
     * @memberof Media
     */
    constructor(element: HTMLMediaElement) {
        this.element = element;
        this.mediaFiles = this._getMediaFiles();
        this.promisePlay = null;
        return this;
    }

    /**
     * Check if player can play the current media type (MIME type).
     *
     * @param {string} mimeType  A valid MIME type, that can include codecs.
     * @see [[Native.canPlayType]]
     * @returns {boolean}
     */
    public canPlayType(mimeType: string): boolean {
        return this.media.canPlayType(mimeType);
    }

    /**
     * Check media associated and process it according to its type.
     *
     * It requires to run with Promises to avoid racing errors between execution of the action
     * and the time the potential libraries are loaded completely.
     * It will loop the media list found until it reached the first element that can be played.
     * @see [[Native.load]]
     */
    public load(): void {
        this._loadSources(this.mediaFiles);
    }

    /**
     * Wrapper for `play` method.
     *
     * It returns a Promise to avoid browser's race issues when attempting to pause media.
     * @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
     * @see [[Native.play]]
     * @returns {Promise}
     * @memberof Media
     */
    public play(): Promise<void> {
        this.promisePlay = new Promise(resolve => {
            resolve();
        }).then(() => {
            // Wait until any other Promise is resolved to execute the Play action
            this.media.promise.then(() => {
                this.media.play();
            });
        });

        return this.promisePlay;
    }

    /**
     * Wrapper for `pause` method.
     *
     * It checks if play Promise has been resolved in order to trigger pause
     * to avoid browser's race issues.
     * @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
     * @see [[Native.pause]]
     * @memberof Media
     */
    public pause(): void {
        if (this.promisePlay) {
            this.promisePlay.then(() => {
                this.media.pause();
            });
        } else {
            this.media.pause();
        }
    }

    /**
     * Set one or more media sources.
     *
     * @param {string|object|object[]} media
     * @see [[Native.src]]
     * @memberof Media
     */
    set src(media) {
        if (typeof media === 'string') {
            this.mediaFiles.push({
                src: media,
                type: source.predictType(media),
            });
        } else if (Array.isArray(media)) {
            this.mediaFiles = media;
        } else if (typeof media === 'object') {
            this.mediaFiles.push(media);
        }

        this.mediaFiles.some(file => {
            return this.canPlayType(file.type);
        });

        // Save copy of original file to restore it when player is destroyed
        if (this.element.src) {
            this.element.setAttribute('data-om-file', this.mediaFiles[0].src);
        }
        this.element.src = this.mediaFiles[0].src;
        this.media.src = this.mediaFiles[0];
    }

    /**
     * Get all media associated with element
     *
     * @readonly
     * @see [[Native.src]]
     * @type {Source[]}
     * @memberof Media
     */
    get src(): Source[] {
        return this.mediaFiles;
    }

    /**
     *
     * @see [[Native.volume]]
     * @memberof Media
     */
    set volume(value) {
        this.media.volume = value;
    }

    /**
     *
     * @see [[Native.volume]]
     * @readonly
     * @type {number}
     * @memberof Media
     */
    get volume(): number {
        return this.media.volume;
    }

    /**
     *
     * @see [[Native.muted]]
     * @memberof Media
     */
    set muted(value) {
        this.media.muted = value;
    }

    /**
     *
     * @see [[Native.muted]]
     * @readonly
     * @type {boolean}
     * @memberof Media
     */
    get muted(): boolean {
        return this.media.muted;
    }

    /**
     *
     * @see [[Native.playbackRate]]
     * @readonly
     * @type {number}
     * @memberof Media
     */
    get playbackRate(): number {
        return this.media.playbackRate;
    }

    /**
     *
     * @see [[Native.playbackRate]]
     * @memberof Media
     */
    set playbackRate(value) {
        this.media.playbackRate = value;
    }

    /**
     *
     * @see [[Native.currentTime]]
     * @memberof Media
     */
    set currentTime(value: number) {
        this.media.currentTime = value;
    }

    /**
     *
     * @see [[Native.currentTime]]
     * @readonly
     * @type {number}
     * @memberof Media
     */
    get currentTime(): number {
        return this.media.currentTime;
    }

    /**
     *
     * @see [[Native.duration]]
     * @readonly
     * @type {number}
     * @memberof Media
     */
    get duration(): number {
        return this.media.duration;
    }

    /**
     *
     * @see [[Native.paused]]
     * @readonly
     * @type {boolean}
     * @memberof Media
     */
    get paused(): boolean {
        return this.media.paused;
    }

    /**
     *
     * @see [[Native.boolean]]
     * @readonly
     * @type {boolean}
     * @memberof Media
     */
    get ended(): boolean {
        return this.media.ended;
    }

    /**
     * Invoke `destroy` method of current media type.
     *
     * Streaming that uses hls.js or dash.js libraries require to destroy their players and
     * their custom events.
     * @memberof Media
     */
    public destroy(): void {
        this.media.destroy();
    }

    /**
     * Load the first playable source from one or many sources available in the video/audio tag.
     *
     * If none of them can be played, automatically the method destroys the `Media` object.
     * @param {Source[]} sources
     * @private
     * @memberof Media
     */
    private _loadSources(sources: Source[]): void {
        if (!sources.length) {
            throw new TypeError('Media not set');
        }

        // Loop until first playable source is found
        sources.some(media => {
            try {
                this.media = this._invoke(media);
            } catch (e) {
                this.media = new HTML5Media(this.element, media);
            }

            return this.canPlayType(media.type);
        });

        try {
            if (this.media === null) {
                throw new TypeError('Media cannot be played with any valid media type');
            }

            this.media.promise.then(() => {
                this.media.load();
            });
        } catch (e) {
            // destroy media
            this.media.destroy();
            throw e;
        }
    }

    /**
     * Gather all media sources within the video/audio/iframe tags.
     *
     * It will be grouped inside the `mediaFiles` array. This method basically mimics
     * the native behavior when multiple sources are associated with an element, and
     * the browser takes care of selecting the most appropriate one.
     * @returns {Source[]}
     * @memberof Media
     */
    private _getMediaFiles(): Source[] {
        const mediaFiles = [];
        const sourceTags = this.element.querySelectorAll('source');
        const nodeSource = this.element.src;

        // Consider if node contains the `src` and `type` attributes
        if (nodeSource) {
            mediaFiles.push({
                src: nodeSource,
                type: this.element.getAttribute('type') || source.predictType(nodeSource),
            });
        }

        // test <source> types to see if they are usable
        for (let i = 0, total = sourceTags.length; i < total; i++) {
            const item = sourceTags[i];
            const src = item.src;
            mediaFiles.push({
                src,
                type: item.getAttribute('type') || source.predictType(src),
            });
        }

        return mediaFiles;
    }

    /**
     * Instantiate media object according to current media type.
     *
     * @param {Source} media
     * @returns {(HlsMedia|DashMedia|HTML5Media)}
     * @memberof Media
     */
    private _invoke(media: Source): HlsMedia|DashMedia|HTML5Media {
        if (source.isHlsSource(media.src)) {
            return new HlsMedia(this.element, media);
        } else if (source.isDashSource(media.src)) {
            return new DashMedia(this.element, media);
        }

        return new HTML5Media(this.element, media);
    }
}

export default Media;
