import { CustomMedia, Level, PlayerLayers, PlayerOptions, Source } from './interfaces';
import DashMedia from './media/dash';
import FlvMedia from './media/flv';
import HlsMedia from './media/hls';
import HTML5Media from './media/html5';
import * as source from './utils/media';

class Media {
    #element: HTMLMediaElement;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #media: HTML5Media | HlsMedia | DashMedia | any;

    #files: Source[];

    #promisePlay: Promise<void>;

    #options: PlayerOptions;

    #autoplay: boolean;

    #mediaLoaded = false;

    #customMedia: CustomMedia = {
        media: {},
        optionsKey: {},
        rules: [],
    };

    #currentSrc: Source;

    constructor(element: HTMLMediaElement, options: PlayerOptions, autoplay = false, customMedia: CustomMedia) {
        this.#element = element;
        this.#options = options;
        this.#files = this._getMediaFiles();
        this.#customMedia = customMedia;
        this.#autoplay = autoplay;
        return this;
    }

    canPlayType(mimeType: string): boolean {
        return this.#media.canPlayType(mimeType);
    }

    async load(): Promise<void> {
        if (this.#mediaLoaded) {
            return;
        }

        this.#mediaLoaded = true;

        if (!this.#files.length) {
            throw new TypeError('Media not set');
        }

        // Remove previous media if any is detected and it's different from current one
        if (this.#media && typeof this.#media.destroy === 'function') {
            const sameMedia = this.#files.length === 1 && this.#files[0].src === this.#media.media.src;
            if (!sameMedia) {
                this.#media.destroy();
            }
        }

        // Loop until first playable source is found
        this.#files.some((media) => {
            try {
                this.#media = this._invoke(media);
            } catch (e) {
                this.#media = new HTML5Media(this.#element, media);
            }

            return this.#media.canPlayType(media.type);
        });

        try {
            if (this.#media === null) {
                throw new TypeError('Media cannot be played with any valid media type');
            }

            await this.#media.promise;
            this.#media.load();
        } catch (e) {
            // destroy media
            if (this.#media) {
                this.#media.destroy();
            }
            throw e;
        }
    }

    // @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
    async play(): Promise<void> {
        if (!this.#mediaLoaded) {
            this.#mediaLoaded = true;
            await this.load();
            this.#mediaLoaded = false;
        } else {
            await this.#media.promise;
        }
        this.#promisePlay = this.#media.play();
        return this.#promisePlay;
    }

    // @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
    async pause(): Promise<void> {
        if (this.#promisePlay !== undefined) {
            await this.#promisePlay;
        }
        this.#media.pause();
    }

    destroy(): void {
        if (this.#media) {
            this.#media.destroy();
        }
    }

    set src(media) {
        if (typeof media === 'string') {
            this.#files.push({
                src: media,
                type: source.predictMimeType(media, this.#element),
            });
        } else if (Array.isArray(media)) {
            this.#files = media;
        } else if (typeof media === 'object') {
            this.#files.push(media);
        }

        // Remove files without source
        this.#files = this.#files.filter((file) => file.src);

        if (this.#files.length > 0) {
            const [file] = this.#files;
            // Save copy of original file to restore it when player is destroyed
            if (this.#element.src) {
                this.#element.setAttribute('data-op-file', this.#files[0].src);
            }

            this.#element.src = file.src;
            this.#currentSrc = file;
            if (this.#media) {
                this.#media.src = file;
            }
        } else {
            this.#element.src = '';
        }
    }

    get src(): Source[] {
        return this.#files;
    }

    get current(): Source {
        return this.#currentSrc;
    }

    set mediaFiles(sources: Source[]) {
        this.#files = sources;
    }

    get mediaFiles(): Source[] {
        return this.#files;
    }

    set volume(value: number) {
        if (this.#media) {
            this.#media.volume = value;
        }
    }

    get volume(): number {
        return this.#media ? this.#media.volume : this.#element.volume;
    }

    set muted(value: boolean) {
        if (this.#media) {
            this.#media.muted = value;
        }
    }

    get muted(): boolean {
        return this.#media ? this.#media.muted : this.#element.muted;
    }

    set playbackRate(value) {
        if (this.#media) {
            this.#media.playbackRate = value;
        }
    }

    get playbackRate(): number {
        return this.#media ? this.#media.playbackRate : this.#element.playbackRate;
    }

    set defaultPlaybackRate(value) {
        if (this.#media) {
            this.#media.defaultPlaybackRate = value;
        }
    }

    get defaultPlaybackRate(): number {
        return this.#media ? this.#media.defaultPlaybackRate : this.#element.defaultPlaybackRate;
    }

    set currentTime(value: number) {
        if (this.#media) {
            this.#media.currentTime = value;
        }
    }

    get currentTime(): number {
        return this.#media ? this.#media.currentTime : this.#element.currentTime;
    }

    get duration(): number {
        const duration = this.#media ? this.#media.duration : this.#element.duration;
        // To seek backwards in a live streaming (mobile devices)
        if (duration === Infinity && this.#element.seekable && this.#element.seekable.length) {
            return this.#element.seekable.end(0);
        }
        return duration;
    }

    get paused(): boolean {
        return this.#media ? this.#media.paused : this.#element.paused;
    }

    get ended(): boolean {
        return this.#media ? this.#media.ended : this.#element.ended;
    }

    set loaded(loaded: boolean) {
        this.#mediaLoaded = loaded;
    }

    get loaded(): boolean {
        return this.#mediaLoaded;
    }

    set level(value: number | string | Level) {
        if (this.#media) {
            this.#media.level = value;
        }
    }

    get level(): number | string | Level {
        return this.#media ? this.#media.level : -1;
    }

    get levels(): Level[] {
        return this.#media ? this.#media.levels : [];
    }

    get instance(): Media | null {
        return this.#media ? this.#media.instance : null;
    }

    private _getMediaFiles(): Source[] {
        const mediaFiles = [];
        const sourceTags = this.#element.querySelectorAll('source');
        const nodeSource = this.#element.src;

        // Consider if node contains the `src` and `type` attributes
        if (nodeSource) {
            mediaFiles.push({
                src: nodeSource,
                type: this.#element.getAttribute('type') || source.predictMimeType(nodeSource, this.#element),
            });
        }

        // test <source> types to see if they are usable
        for (let i = 0, total = sourceTags.length; i < total; i++) {
            const item = sourceTags[i];
            const { src } = item;
            mediaFiles.push({
                src,
                type: item.getAttribute('type') || source.predictMimeType(src, this.#element),
            });

            // If tag has the attribute `preload` set as `none`, the current media will
            // be the first one on the list of sources
            if (i === 0) {
                const [file] = mediaFiles;
                this.#currentSrc = file;
            }
        }

        if (!mediaFiles.length) {
            mediaFiles.push({
                src: '',
                type: source.predictMimeType('', this.#element),
            });
        }

        return mediaFiles;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _invoke(media: Source): HlsMedia | DashMedia | HTML5Media | any {
        const playHLSNatively =
            this.#element.canPlayType('application/vnd.apple.mpegurl') || this.#element.canPlayType('application/x-mpegURL');

        this.#currentSrc = media;

        const { layers } = this.#options.controls || {};

        let activeLevels = false;
        if (layers) {
            Object.keys(layers).forEach((layer) => {
                const current = layers ? layers[layer as keyof PlayerLayers] : null;
                if (current && current.indexOf('levels') > -1) {
                    activeLevels = true;
                }
            });
        }

        if (Object.keys(this.#customMedia.media).length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let customRef: any;
            this.#customMedia.rules.forEach((rule) => {
                const type = rule(media.src);
                if (type) {
                    const customMedia = this.#customMedia.media[type];
                    const customOptions = this.#options[this.#customMedia.optionsKey[type]] || undefined;
                    customRef = customMedia(this.#element, media, this.#autoplay, customOptions);
                }
            });
            if (customRef) {
                customRef.create();
                return customRef;
            }
            return new HTML5Media(this.#element, media);
        }
        if (source.isHlsSource(media)) {
            if (playHLSNatively && this.#options.forceNative && !activeLevels) {
                return new HTML5Media(this.#element, media);
            }
            const hlsOptions = this.#options?.hls || undefined;
            return new HlsMedia(this.#element, media, this.#autoplay, hlsOptions);
        }
        if (source.isDashSource(media)) {
            const dashOptions = this.#options?.dash || undefined;
            return new DashMedia(this.#element, media, dashOptions);
        }
        if (source.isFlvSource(media)) {
            const flvOptions = this.#options?.flv || {
                debug: false,
                type: 'flv',
                url: media.src,
            };
            return new FlvMedia(this.#element, media, flvOptions);
        }

        return new HTML5Media(this.#element, media);
    }
}

export default Media;
