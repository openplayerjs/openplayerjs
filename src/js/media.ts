import CustomMedia from './interfaces/custom-media';
import PlayerOptions from './interfaces/player-options';
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
     * @type (HTML5Media|HlsMedia|DashMedia|any)
     * @memberof Media
     */
    public media: HTML5Media | HlsMedia | DashMedia | any;

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
     * @type Promise<void>
     * @memberof Media
     */
    private promisePlay: Promise<void>;

    /**
     * Media options to be passed to Hls and/or Dash players.
     *
     * @private
     * @type PlayerOptions
     * @memberof Media
     */
    private options: PlayerOptions;

    /**
     * Flag to indicate if `autoplay` attribute was set
     *
     * @private
     * @type boolean
     * @memberof HlsMedia
     */
    private autoplay: boolean;

    /**
     * Flag that indicates if initial load has occurred.
     *
     * @type boolean
     * @memberof Player
     */
    private mediaLoaded: boolean = false;

    /**
     * Collection of additional (non-native) media
     *
     * @type CustomMedia
     * @memberof Player
     */
    private customMedia: CustomMedia = {
        media: {},
        optionsKey: {},
        rules: [],
    };

    /**
     * Create an instance of Media.
     *
     * @param {HTMLMediaElement} element
     * @param {object} options
     * @param {boolean} autoplay
     * @param {CustomMedia} customMedia
     * @returns {Media}
     * @memberof Media
     */
    constructor(element: HTMLMediaElement, options?: PlayerOptions, autoplay: boolean = false, customMedia?: CustomMedia) {
        this.element = element;
        this.options = options;
        this.mediaFiles = this._getMediaFiles();
        this.customMedia = customMedia;
        this.autoplay = autoplay;
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
     *
     * If none of them can be played, automatically the method destroys the `Media` object.
     *
     * @see [[Native.load]]
     */
    public load(): Promise<void>|void {
        if (!this.mediaFiles.length) {
            throw new TypeError('Media not set');
        }

        // Remove previous media if any is detected and it's different from current one
        if (this.media && typeof this.media.destroy === 'function') {
            const sameMedia = this.mediaFiles.length === 1 && this.mediaFiles[0].src === this.media.media.src;
            if (!sameMedia) {
                this.media.destroy();
            }
        }

        // Loop until first playable source is found
        this.mediaFiles.some(media => {
            try {
                this.media = this._invoke(media);
            } catch (e) {
                this.media = new HTML5Media(this.element, media);
            }

            // If not valid, make one last attempt to check if it plays with native HTML5
            const canPlay = this.canPlayType(media.type);
            if (!canPlay) {
                this.media = new HTML5Media(this.element, media);
                return this.canPlayType(media.type);
            }
            return canPlay;
        });

        try {
            if (this.media === null) {
                throw new TypeError('Media cannot be played with any valid media type');
            }

            return this.media.promise.then(() => {
                this.media.load();
            });
        } catch (e) {
            // destroy media
            this.media.destroy();
            throw e;
        }
    }

    /**
     * Wrapper for `play` method.
     *
     * It returns a Promise to avoid browser's race issues when attempting to pause media.
     * @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
     * @see [[Native.play]]
     * @returns {Promise<void>}
     * @memberof Media
     */
    public play(): Promise<void> {
        if (!this.loaded) {
            this.loaded = true;
            const promiseLoad = this.load();
            if (promiseLoad) {
                this.loaded = true;
                return promiseLoad.then(() => {
                    this.media.play();
                });
            }
        }

        // Wait until any other Promise is resolved to execute the Play action
        this.promisePlay = new Promise(resolve => {
            resolve();
        }).then(this.media.promise.then(this.media.play()));

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
        if (this.promisePlay !== undefined) {
            this.promisePlay.then(() => {
                this.media.pause();
            });
        } else {
            this.media.pause();
        }
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
            this.element.setAttribute('data-op-file', this.mediaFiles[0].src);
        }

        this.element.src = this.mediaFiles[0].src;
        this.media.src = this.mediaFiles[0];
    }

    /**
     * Get all media associated with element
     *
     * @see [[Native.src]]
     * @type Source[]
     * @memberof Media
     * @readonly
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
     * @type number
     * @memberof Media
     * @readonly
     */
    get volume(): number {
        return this.media ? this.media.volume : this.element.volume;
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
     * @type boolean
     * @memberof Media
     * @readonly
     */
    get muted(): boolean {
        return this.media ? this.media.muted : this.element.muted;
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
     * @see [[Native.playbackRate]]
     * @type number
     * @memberof Media
     * @readonly
     */
    get playbackRate(): number {
        return this.media ? this.media.playbackRate : this.element.playbackRate;
    }

    /**
     *
     * @see [[Native.defaultPlaybackRate]]
     * @memberof Media
     */
    set defaultPlaybackRate(value) {
        this.media.defaultPlaybackRate = value;
    }

    /**
     *
     * @see [[Native.defaultPlaybackRate]]
     * @type number
     * @memberof Media
     * @readonly
     */
    get defaultPlaybackRate(): number {
        return this.media ? this.media.defaultPlaybackRate : this.element.defaultPlaybackRate;
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
     * @type number
     * @memberof Media
     * @readonly
     */
    get currentTime(): number {
        return this.media ? this.media.currentTime : this.element.currentTime;
    }

    /**
     *
     * @see [[Native.duration]]
     * @type number
     * @memberof Media
     * @readonly
     */
    get duration(): number {
        const duration = this.media ? this.media.duration : this.element.duration;
        // To seek backwards in a live streaming (mobile devices)
        if (duration === Infinity && this.element.seekable && this.element.seekable.length) {
            return this.element.seekable.end(0);
        }
        return duration;
    }

    /**
     *
     * @see [[Native.paused]]
     * @type boolean
     * @memberof Media
     * @readonly
     */
    get paused(): boolean {
        return this.media ? this.media.paused : this.element.paused;
    }

    /**
     *
     * @see [[Native.ended]]
     * @type boolean
     * @memberof Media
     * @readonly
     */
    get ended(): boolean {
        return this.media ? this.media.ended : this.element.ended;
    }

    /**
     *
     * @memberof Media
     */
    set loaded(loaded: boolean) {
        this.mediaLoaded = loaded;
    }

    /**
     *
     * @type boolean
     * @memberof Media
     */
    get loaded(): boolean {
        return this.mediaLoaded;
    }

    /**
     *
     * @memberof Media
     */
    set level(value: number|string|object) {
        this.media.level = value;
    }

    /**
     *
     * @memberof Media
     * @readonly
     */
    get level(): number|string|object {
        return this.media ? this.media.level : -1;
    }

    /**
     *
     * @memberof Media
     * @readonly
     */
    get levels() {
        return this.media ? this.media.levels : [];
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

        if (!mediaFiles.length) {
            mediaFiles.push({
                src: '',
                type: source.predictType(''),
            });
        }

        return mediaFiles;
    }

    /**
     * Instantiate media object according to current media type.
     *
     * @param {Source} media
     * @returns {(HlsMedia|DashMedia|HTML5Media|any)}
     * @memberof Media
     */
    private _invoke(media: Source): HlsMedia | DashMedia | HTML5Media | any {
        const playHLSNatively = this.element.canPlayType('application/vnd.apple.mpegurl') ||
            this.element.canPlayType('application/x-mpegURL');

        if (Object.keys(this.customMedia.media).length) {
            let customRef: any;
            this.customMedia.rules.forEach((rule: any) => {
                const type = rule(media.src);
                if (type) {
                    const customMedia = this.customMedia.media[type] as any;
                    const customOptions = this.options[this.customMedia.optionsKey[type]] || undefined;
                    customRef = customMedia(this.element, media, this.autoplay, customOptions);
                }
            });
            if (customRef) {
                customRef.create();
                return customRef;
            } else {
                return new HTML5Media(this.element, media);
            }
        } else if (!playHLSNatively && source.isHlsSource(media)) {
            const hlsOptions = this.options && this.options.hls ? this.options.hls : undefined;
            return new HlsMedia(this.element, media, this.autoplay, hlsOptions);
        } else if (source.isDashSource(media)) {
            const dashOptions = this.options && this.options.dash ? this.options.dash : undefined;
            return new DashMedia(this.element, media, dashOptions);
        }

        return new HTML5Media(this.element, media);
    }
}

export default Media;
