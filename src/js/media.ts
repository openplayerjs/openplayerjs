import IEvent from './components/interfaces/general/event';
import IFile from './components/interfaces/media/file';
import DashMedia from './media/dash';
import HlsMedia from './media/hls';
import NativeMedia from './media/native';
import * as source from './utils/media';

/**
 *
 * @class Media
 * @description Class that creates the Media Component in the player.
 * The `Media` is the visual/audio area that results from playing
 * a valid source (MP4, MP3, M3U8, MPD, etc.)
 */
class Media {
    public element: any;
    public media: any;
    public mediaFiles: IFile[];
    private promisePlay: Promise<void>;
    private events: IEvent;

    /**
     * Creates an instance of Media.
     * @param {HTMLMediaElement|HTMLIFrameElement} element
     * @param {object?} ads
     * @memberof Media
     */
    constructor(element: any) {
        this.element = element;
        this.mediaFiles = this._getMediaFiles();
        this.promisePlay = null;
        this.events = {};
        return this;
    }

    /**
     * Check if player can play the current media type (MIME type)
     *
     * @param {string} mimeType
     * @returns {boolean}
     */
    public canPlayType(mimeType: string) {
        return this.media.canPlayType(mimeType);
    }

    /**
     * Check media associated and process it according to its type.
     *
     * It requires to run with Promises to avoid racing errors between execution of the action
     * and the time the potential libraries are loaded completely.
     *
     * It will loop the media list found until it reached the first element that can be played.
     *
     */
    public load() {
        this.loadSources(this.mediaFiles);
    }

    public play() {
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

    public pause() {
        if (this.promisePlay) {
            this.promisePlay.then(() => {
                this.media.pause();
            });
        } else {
            this.media.pause();
        }
    }
    /**
     * Set one or more media sources
     *
     * @param {string|object|object[]} media
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

        // Save copy of original file
        if (this.element.src) {
            this.element.setAttribute('data-om-file', this.mediaFiles[0].src);
        }
        this.element.src = this.mediaFiles[0].src;
        this.media.src = this.mediaFiles[0];
    }
    /**
     * Get all media associated with element
     *
     * @returns {object[]}
     * @readonly
     * @memberof Media
     */
    get src() {
        return this.mediaFiles;
    }

    set volume(value) {
        this.media.volume = value;
    }

    get volume() {
        return this.media.volume;
    }

    set muted(value) {
        this.media.muted = value;
    }

    get muted() {
        return this.media.muted;
    }

    get playbackRate() {
        return this.media.playbackRate;
    }

    set playbackRate(value) {
        this.media.playbackRate = value;
    }

    set currentTime(value: number) {
        this.media.currentTime = value;
    }
    get currentTime() {
        return this.media.currentTime;
    }

    get duration() {
        return this.media.duration;
    }

    get paused() {
        return this.media.paused;
    }

    get ended() {
        return this.media.ended;
    }

    public destroy() {
        this.media.destroy();
    }

    public loadSources(sources: IFile[]) {
        if (!sources.length) {
            throw new TypeError('Media not set');
        }

        // Loop until first playable source is found
        sources.some(media => {
            try {
                this.media = this._invoke(media);
            } catch (e) {
                this.media = new NativeMedia(this.element, media);
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

    public addEventListener(eventName: string, callback: (event: any) => any) {
        // create or find the array of callbacks for this eventName
        if (typeof this.events[eventName] === 'undefined') {
            this.events[eventName] = [];
        }

        // push the callback into the stack
        this.events[eventName].push(callback);
    }

    public removeEventListener(eventName: string, callback: (event: any) => any) {
        if (!this.events[eventName]) {
          return;
        }
        const stack = this.events[eventName];
        for (let i = 0, total = stack.length; i < total; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    }

    public dispatchEvent(event: any) {
        if (!this.events[event.type]) {
          return true;
        }
        const stack = this.events[event.type];

        for (let i = 0, total = stack.length; i < total; i++) {
          stack[i].call(this, event);
        }
        return !event.defaultPrevented;
    }

    /**
     * Gather all media sources within the video/audio/iframe tags
     *
     * It will be grouped inside the `mediaFiles` array. This method basically mimics
     * the native behavior when multiple sources are associated with an element, and
     * the browser takes care of selecting the most appropriate one
     * @returns {Object[]}
     * @memberof Media
     */
    private _getMediaFiles() {
        const mediaFiles: IFile[] = [];
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
     * Assign class to play iframe (third-party APIs) or "native" media (without the use of iframes)
     *
     * @param {Object} media
     * @returns {*}
     * @memberof Media
     */
    private _invoke(media: IFile) {
        if (source.isHlsSource(media.src)) {
            return new HlsMedia(this.element, media);
        } else if (source.isDashSource(media.src)) {
            return new DashMedia(this.element, media);
        }

        return new NativeMedia(this.element, media);
    }
}

export default Media;
