import { PlayerOptions, Source } from '../interfaces';
import { isHlsSource, predictMimeType } from '../utils/media';
import MediaManager from './manager';
import HlsMedia from './types/hls';
import HTML5Media from './types/html5';

export default class Media extends MediaManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #media: HTML5Media | any = null;

    #element: HTMLMediaElement;

    #options?: PlayerOptions;

    constructor(element: HTMLMediaElement, options?: PlayerOptions) {
        super();
        this.#element = element;
        this.#options = options;
    }

    async load(): Promise<void> {
        this.type = 'media';

        // Obtain the first element to be played
        const sources = new Set<Source>();
        if (this.#element.src) {
            sources.add({ src: this.#element.src, type: predictMimeType(this.#element.src, this.#element) });
        }
        (this.#element.querySelectorAll<HTMLSourceElement>('source[src]') || []).forEach((source) => {
            const { src, type } = source;
            sources.add({ src, type });
        });

        const playableSources: Source[] = [];
        sources.forEach((src) => {
            try {
                this.#media = this._invoke(src);
            } catch (err) {
                this.#media = new HTML5Media(this.#element);
            }

            if (this.#media.canPlayType(src.type)) {
                playableSources.push(src);
            }
        });
    }

    get src(): Source {
        return this.#media.src;
    }

    destroy(): void {
        // It can happen that the user hasn't set the source yet
        this.#media?.destroy();
        this.type = '';
    }

    private _invoke(media: Source): HlsMedia | HTML5Media {
        const playHLSNatively =
            this.#element.canPlayType('application/vnd.apple.mpegurl') ||
            this.#element.canPlayType('application/x-mpegURL');

        if (isHlsSource(media)) {
            if (playHLSNatively && ((this.#options || {}).forceNative || true)) {
                return new HTML5Media(this.#element, media);
            }
            return new HlsMedia(this.#element, (this.#options?.hls || {}) as Record<string, unknown>);
        }

        return new HTML5Media(this.#element, media);
    }
}
