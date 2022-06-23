import DashMedia from './media/dash';
import FlvMedia from './media/flv';
import HlsMedia from './media/hls';
import HTML5Media from './media/html5';
import * as source from './utils/media';
class Media {
    #element;
    #media;
    #files;
    #promisePlay;
    #options;
    #autoplay;
    #mediaLoaded = false;
    #customMedia = {
        media: {},
        optionsKey: {},
        rules: [],
    };
    #currentSrc;
    constructor(element, options, autoplay, customMedia) {
        this.#element = element;
        this.#options = options;
        this.#files = this._getMediaFiles();
        this.#customMedia = customMedia;
        this.#autoplay = autoplay;
    }
    canPlayType(mimeType) {
        return this.#media.canPlayType(mimeType);
    }
    async load() {
        if (this.#mediaLoaded) {
            return;
        }
        this.#mediaLoaded = true;
        if (!this.#files.length) {
            throw new TypeError('Media not set');
        }
        if (this.#media && typeof this.#media.destroy === 'function') {
            const sameMedia = this.#files.length === 1 && this.#files[0].src === this.#media.media.src;
            if (!sameMedia) {
                this.#media.destroy();
            }
        }
        this.#files.some((media) => {
            try {
                this.#media = this._invoke(media);
            }
            catch (e) {
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
        }
        catch (e) {
            if (this.#media) {
                this.#media.destroy();
            }
            throw e;
        }
    }
    async play() {
        if (!this.#mediaLoaded) {
            this.#mediaLoaded = true;
            await this.load();
            this.#mediaLoaded = false;
        }
        else {
            await this.#media.promise;
        }
        this.#promisePlay = this.#media.play();
        return this.#promisePlay;
    }
    async pause() {
        if (this.#promisePlay !== undefined) {
            await this.#promisePlay;
        }
        this.#media.pause();
    }
    destroy() {
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
        }
        else if (Array.isArray(media)) {
            this.#files = media;
        }
        else if (typeof media === 'object') {
            this.#files.push(media);
        }
        this.#files = this.#files.filter((file) => file.src);
        if (this.#files.length > 0) {
            const [file] = this.#files;
            if (this.#element.src) {
                this.#element.setAttribute('data-op-file', this.#files[0].src);
            }
            this.#element.src = file.src;
            this.#currentSrc = file;
            if (this.#media) {
                this.#media.src = file;
            }
        }
        else {
            this.#element.src = '';
        }
    }
    get src() {
        return this.#files;
    }
    get current() {
        return this.#currentSrc;
    }
    set mediaFiles(sources) {
        this.#files = sources;
    }
    get mediaFiles() {
        return this.#files;
    }
    set volume(value) {
        if (this.#media) {
            this.#media.volume = value;
        }
    }
    get volume() {
        return this.#media ? this.#media.volume : this.#element.volume;
    }
    set muted(value) {
        if (this.#media) {
            this.#media.muted = value;
        }
    }
    get muted() {
        return this.#media ? this.#media.muted : this.#element.muted;
    }
    set playbackRate(value) {
        if (this.#media) {
            this.#media.playbackRate = value;
        }
    }
    get playbackRate() {
        return this.#media ? this.#media.playbackRate : this.#element.playbackRate;
    }
    set defaultPlaybackRate(value) {
        if (this.#media) {
            this.#media.defaultPlaybackRate = value;
        }
    }
    get defaultPlaybackRate() {
        return this.#media ? this.#media.defaultPlaybackRate : this.#element.defaultPlaybackRate;
    }
    set currentTime(value) {
        if (this.#media) {
            this.#media.currentTime = value;
        }
    }
    get currentTime() {
        return this.#media ? this.#media.currentTime : this.#element.currentTime;
    }
    get duration() {
        const duration = this.#media ? this.#media.duration : this.#element.duration;
        if (duration === Infinity && this.#element.seekable && this.#element.seekable.length) {
            return this.#element.seekable.end(0);
        }
        return duration;
    }
    get paused() {
        return this.#media ? this.#media.paused : this.#element.paused;
    }
    get ended() {
        return this.#media ? this.#media.ended : this.#element.ended;
    }
    set loaded(loaded) {
        this.#mediaLoaded = loaded;
    }
    get loaded() {
        return this.#mediaLoaded;
    }
    set level(value) {
        if (this.#media) {
            this.#media.level = value;
        }
    }
    get level() {
        return this.#media ? this.#media.level : -1;
    }
    get levels() {
        return this.#media ? this.#media.levels : [];
    }
    get instance() {
        return this.#media ? this.#media.instance : null;
    }
    _getMediaFiles() {
        const mediaFiles = [];
        const sourceTags = this.#element.querySelectorAll('source');
        const nodeSource = this.#element.src;
        if (nodeSource) {
            mediaFiles.push({
                src: nodeSource,
                type: this.#element.getAttribute('type') || source.predictMimeType(nodeSource, this.#element),
            });
        }
        for (let i = 0, total = sourceTags.length; i < total; i++) {
            const item = sourceTags[i];
            const { src } = item;
            mediaFiles.push({
                src,
                type: item.getAttribute('type') || source.predictMimeType(src, this.#element),
            });
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
    _invoke(media) {
        const playHLSNatively = this.#element.canPlayType('application/vnd.apple.mpegurl') ||
            this.#element.canPlayType('application/x-mpegURL');
        this.#currentSrc = media;
        const { layers } = this.#options.controls || {};
        let activeLevels = false;
        if (layers) {
            Object.keys(layers).forEach((layer) => {
                const current = layers ? layers[layer] : null;
                if (current && current.indexOf('levels') > -1) {
                    activeLevels = true;
                }
            });
        }
        if (Object.keys(this.#customMedia.media).length) {
            let customRef;
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
