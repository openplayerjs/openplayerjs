import NativeMedia from './media/native';
import HlsMedia from './media/hls';
import DashMedia from './media/dash';
import DailymotionMedia from './media/dailymotion';
import FacebookMedia from './media/facebook';
import TwitchMedia from './media/twitch';
import VimeoMedia from './media/vimeo';
import YouTubeMedia from './media/youtube';
import Ads from './media/ads';
import { isIframe } from './utils/dom';
import * as source from './utils/url';
import Controls from './controls';
import File from './components/interfaces/media/file';

/**
 *
 * @class Media
 * @description Class that creates the Media Component in the player.
 * The `Media` is the visual/audio area that results from playing
 * a valid source (MP4, MP3, M3U8, MPD, etc.)
 */
class Media {
    element: HTMLMediaElement;
    ads: object;
    media: Ads|DailymotionMedia|FacebookMedia|TwitchMedia|VimeoMedia|YouTubeMedia|HlsMedia|DashMedia|NativeMedia;
    promisePlay: Promise<void>;
    promise: Promise<void>;
    mediaFiles: File[];

    /**
     * Creates an instance of Media.
     * @param {HTMLMediaElement} element
     * @memberof Media
     */
    constructor(element, ads) {
        this.element = element;
        this.ads = ads;
        this.mediaFiles = this._getMediaFiles();
        this.promisePlay = null;
        return this;
    }

    /**
     * Check if player can play the current media type (MIME type)
     *
     * @param {string} mimeType
     * @returns {boolean}
     */
    canPlayType(mimeType) {
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
    load() {
        this._loaded(this.mediaFiles);
    }

    play() {
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

    pause() {
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
                type: source.predictType(media)
            });
        } else if (Array.isArray(media)) {
            this.mediaFiles = media;
        } else if (typeof media === 'object') {
            this.mediaFiles.push(media);
        }

        if (typeof this.media.src === 'function') {
            this.media.src(this.mediaFiles);
        }
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

    destroy() {
        this.media.destroy();
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
    _getMediaFiles() {
        const mediaFiles = [];

        if (isIframe(this.element)) {
            mediaFiles.push({
                type: source.predictType(this.element.src),
                src: this.element.src
            });
        } else {
            const sourceTags = this.element.querySelectorAll('source');
            const nodeSource = this.element.src;

            // Consider if node contains the `src` and `type` attributes
            if (nodeSource) {
                mediaFiles.push({
                    type: this.element.getAttribute('type') || source.predictType(nodeSource),
                    nodeSource
                });
            }

            // test <source> types to see if they are usable
            sourceTags.forEach(item => {
                const src = item.src;
                mediaFiles.push({
                    type: item.getAttribute('type') || source.predictType(src),
                    src
                });
            });
        }

        return mediaFiles;
    }
    /**
     * Assign class to play iframe (third-party APIs) or "native" media (without the use of iframes)
     *
     * @param {Object} media
     * @returns {Ads|DailymotionMedia|FacebookMedia|TwitchMedia|VimeoMedia|YouTubeMedia|HlsMedia|DashMedia|NativeMedia}
     * @memberof Media
     */
    _loadSource(media) {
        if (this.ads) {
            return new Ads(this, media.src);
        } else if (source.isDailymotionSource(media.src)) {
            return new DailymotionMedia(this.element, media);
        } else if (source.isFacebookSource(media.src)) {
            return new FacebookMedia(this.element, media);
        } else if (source.isTwitchSource(media.src)) {
            return new TwitchMedia(this.element, media);
        } else if (source.isVimeoSource(media.src)) {
            return new VimeoMedia(this.element, media);
        } else if (source.isYouTubeSource(media.src)) {
            return new YouTubeMedia(this.element, media);
        } else if (source.isHlsSource(media.src)) {
            return new HlsMedia(this.element, media);
        } else if (source.isDashSource(media.src)) {
            return new DashMedia(this.element, media);
        }

        return new NativeMedia(this.element, media);
    }
    _loaded(files) {
        if (!files.length) {
            throw new TypeError('Media not set');
        }

        console.log(files);

        // Loop until first playable source is found
        files.some(media => {
            try {
                this.media = this._loadSource(media);
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
}

export default Media;
