/* eslint-disable @typescript-eslint/no-explicit-any */

import { Source } from '../../interfaces';
import { DVR_THRESHOLD, EVENT_OPTIONS, supportsHLS } from '../../utils/constants';
import { addEvent, loadScript } from '../../utils/general';
import { isHlsSource } from '../../utils/media';
import Implementation from './implementation';

declare const Hls: any;

// @see https://github.com/video-dev/hls.js/
// @see https://github.com/video-dev/hls.js/blob/master/src/events.js
class HlsMedia extends Implementation {
    #recoverDecodingErrorDate = 0;

    #recoverSwapAudioCodecDate = 0;

    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
    #options?: unknown;

    #autoplay: boolean;

    constructor(element: HTMLMediaElement, options?: Record<string, unknown>) {
        super(element);
        this.#options = options || {};
        this.#autoplay = this.element.autoplay;

        this._play = this._play.bind(this);
        this._pause = this._pause.bind(this);
        this._assign = this._assign.bind(this);
    }

    canPlayType(mimeType: string): boolean {
        return supportsHLS() && mimeType === 'application/x-mpegURL';
    }

    async load(): Promise<void> {
        if (!this.instance) {
            this.promise =
                typeof Hls === 'undefined'
                    ? // Ever-green script
                      loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js')
                    : new Promise<void>((resolve) => {
                          resolve();
                      });

            await this.promise;
            const autoplay = !!(this.element.preload === 'auto' || this.#autoplay);
            (this.#options as Record<string, unknown>).autoStartLoad = autoplay;

            this.instance = new Hls(this.#options);
            Object.keys(Hls?.Events).forEach((event) => {
                this.instance.on(Hls.Events[event], (...args: Record<string, unknown>[]) =>
                    this._assign(Hls.Events[event], args)
                );
            });

            if (!autoplay) {
                this.element.addEventListener('play', this._play, EVENT_OPTIONS);
                this.element.addEventListener('pause', this._pause, EVENT_OPTIONS);
            }
        }

        this.instance.detachMedia();
        this.instance.loadSource(this.media.src);
        this.instance.attachMedia(this.element);

        this.element.dispatchEvent(addEvent('loadedmetadata'));

        Object.keys(Hls?.Events).forEach((event) => {
            this.instance.on(Hls.Events[event], (...args: Record<string, unknown>[]) =>
                this._assign(Hls.Events[event], args)
            );
        });
    }

    destroy(): void {
        if (Hls?.Events) {
            Object.keys(Hls.Events).forEach((event) => {
                this.instance.off(Hls.Events[event], (...args: Record<string, unknown>[]) =>
                    this._assign(Hls.Events[event], args)
                );
            });
        }

        this.element.removeEventListener('play', this._play);
        this.element.removeEventListener('pause', this._pause);

        this.element.removeAttribute('data-op-dvr__enabled');
        this.element.removeAttribute('data-op-live__enabled');

        if (this.instance) {
            this.instance.stopLoad();
            this.instance.destroy();
            this.instance = null;
        }
    }

    set src(media: Source) {
        if (isHlsSource(media)) {
            this.destroy();
            this.load();
        }
    }

    // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
    // @see https://github.com/video-dev/hls.js/blob/master/src/errors.js
    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events
    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors
    private _assign(event: string, data: Record<string, unknown>[]): void {
        if (event === 'hlsError') {
            const errorDetails = {
                detail: {
                    data,
                    message: data[1].details,
                    type: 'HLS',
                },
            };
            const errorEvent = addEvent('playererror', errorDetails);
            this.element.dispatchEvent(errorEvent);

            // borrowed from https://video-dev.github.io/hls.js/demo
            const type = data[1].type as string;
            const { fatal } = data[1];
            const details = data[1];
            if (fatal) {
                switch (type) {
                    case 'mediaError':
                        const now = new Date().getTime();
                        if (!this.#recoverDecodingErrorDate || now - this.#recoverDecodingErrorDate > 3000) {
                            this.#recoverDecodingErrorDate = new Date().getTime();
                            this.instance.recoverMediaError();
                        } else if (!this.#recoverSwapAudioCodecDate || now - this.#recoverSwapAudioCodecDate > 3000) {
                            this.#recoverSwapAudioCodecDate = new Date().getTime();
                            console.warn('Attempting to swap Audio Codec and recover from media error');
                            this.instance.swapAudioCodec();
                            this.instance.recoverMediaError();
                        } else {
                            const msg = 'Cannot recover, last media error recovery failed';
                            console.error(msg);
                            const mediaEvent = addEvent(type, { detail: { data: details } });
                            this.element.dispatchEvent(mediaEvent);
                        }
                        break;
                    case 'networkError':
                        const message = 'Network error';
                        console.error(message);
                        const networkEvent = addEvent(type, { detail: { data: details } });
                        this.element.dispatchEvent(networkEvent);
                        break;
                    default:
                        this.instance.destroy();
                        const fatalEvent = addEvent(type, { detail: { data: details } });
                        this.element.dispatchEvent(fatalEvent);
                        break;
                }
            } else {
                const err = addEvent(type, { detail: { data: details } });
                this.element.dispatchEvent(err);
            }
        } else {
            const details: Record<string, unknown> = data[1] as Record<string, unknown>;
            if (event === 'hlsLevelLoaded' && details.live === true) {
                this.element.setAttribute('data-op-live__enabled', 'true');
                const timeEvent = addEvent('timeupdate');
                this.element.dispatchEvent(timeEvent);
            } else if (
                event === 'hlsLevelUpdated' &&
                details.live === true &&
                (details.totalduration as number) > DVR_THRESHOLD
            ) {
                this.element.setAttribute('data-op-dvr__enabled', 'true');
                const timeEvent = addEvent('timeupdate');
                this.element.dispatchEvent(timeEvent);
            } else if (event === 'hlsFragParsingMetadata') {
                const metaEvent = addEvent('metadataready', { detail: { data: data[1] } });
                this.element.dispatchEvent(metaEvent);
            }
            const e = addEvent(event, { detail: { data: data[1] } });
            this.element.dispatchEvent(e);
        }
    }

    private _play(): void {
        if (this.instance) {
            this.instance.startLoad();
        }
    }

    private _pause(): void {
        if (this.instance) {
            this.instance.stopLoad();
        }
    }
}

export default HlsMedia;
