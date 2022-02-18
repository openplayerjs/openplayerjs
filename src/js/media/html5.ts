import { Level, Source } from '../interfaces';
import { DVR_THRESHOLD, EVENT_OPTIONS } from '../utils/constants';
import { addEvent, isAudio, isVideo } from '../utils/general';
import { isHlsSource } from '../utils/media';
import Native from './native';

class HTML5Media extends Native {
    #currentLevel: Level;

    #levelList: Level[] = [];

    #isStreaming = false;

    #retryCount = 0;

    #started = false;

    #timer: number;

    constructor(element: HTMLMediaElement, mediaFile: Source) {
        super(element, mediaFile);

        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }

        this._clearTimeout = this._clearTimeout.bind(this);
        this._setTimeout = this._setTimeout.bind(this);
        this._dispatchError = this._dispatchError.bind(this);
        this._isDvrEnabled = this._isDvrEnabled.bind(this);
        this._readMediadataInfo = this._readMediadataInfo.bind(this);

        this.#isStreaming = isHlsSource(mediaFile);
        this.element.addEventListener('playing', this._clearTimeout, EVENT_OPTIONS);
        this.element.addEventListener('stalled', this._setTimeout, EVENT_OPTIONS);
        this.element.addEventListener('error', this._dispatchError, EVENT_OPTIONS);
        this.element.addEventListener('loadeddata', this._isDvrEnabled, EVENT_OPTIONS);
        this.element.textTracks.addEventListener('addtrack', this._readMediadataInfo, EVENT_OPTIONS);
        return this;
    }

    canPlayType(mimeType: string): boolean {
        return !!this.element.canPlayType(mimeType).replace('no', '');
    }

    load(): void {
        this.element.load();
    }

    destroy(): HTML5Media {
        this.element.removeEventListener('playing', this._clearTimeout);
        this.element.removeEventListener('stalled', this._setTimeout);
        this.element.removeEventListener('error', this._dispatchError);
        this.element.removeEventListener('loadeddata', this._isDvrEnabled);
        this.element.textTracks.removeEventListener('addtrack', this._readMediadataInfo);
        return this;
    }

    get levels(): Level[] {
        if (!this.#levelList.length) {
            const levels = this.element.querySelectorAll('source[title]');
            for (let i = 0, total = levels.length; i < total; ++i) {
                const level = {
                    height: 0,
                    id: `${i}`,
                    label: levels[i].getAttribute('title') || '',
                };
                this.#levelList.push(level);
            }
        }
        return this.#levelList;
    }

    set level(level: string) {
        const idx = this.#levelList.findIndex((item) => item.id === level);
        if (idx > -1) {
            this.#currentLevel = this.levels[idx];
            const levels = this.element.querySelectorAll('source[title]');
            for (let i = 0, total = levels.length; i < total; ++i) {
                const source = levels[i].getAttribute('src');
                if (source && parseInt(this.#currentLevel.id, 10) === i) {
                    this.element.src = source;
                }
            }
        }
    }

    get level(): string {
        return this.#currentLevel?.id || '-1';
    }

    set src(media: Source) {
        this.element.src = media.src;
    }

    private _isDvrEnabled(): void {
        const time = this.element.seekable.end(this.element.seekable.length - 1) - this.element.seekable.start(0);
        if (this.#isStreaming && time > DVR_THRESHOLD && !this.element.getAttribute('op-dvr__enabled')) {
            this.element.setAttribute('op-dvr__enabled', 'true');
            const timeEvent = addEvent('timeupdate');
            this.element.dispatchEvent(timeEvent);
        }
    }

    private _readMediadataInfo(e: TrackEvent): void {
        const target = e;
        if (target?.track?.kind === 'metadata') {
            target.track.mode = 'hidden';
            target.track.addEventListener(
                'cuechange',
                (event) => {
                    const track = event.target as TextTrack;
                    const cue = track.activeCues ? track.activeCues[0] : null;
                    if (cue) {
                        const metaDataEvent = addEvent('metadataready', { detail: cue });
                        this.element.dispatchEvent(metaDataEvent);
                    }
                },
                EVENT_OPTIONS
            );
        }
    }

    private _setTimeout(): void {
        if (!this.#started && window !== undefined) {
            this.#started = true;
            this.#timer = window.setInterval(() => {
                if (this.#retryCount >= 30) {
                    clearInterval(this.#timer);
                    const message = 'Media download failed part-way due to a network error';
                    const details = {
                        detail: {
                            data: { message, error: 2 },
                            message,
                            type: 'HTML5',
                        },
                    };
                    const errorEvent = addEvent('playererror', details);
                    this.element.dispatchEvent(errorEvent);
                    this.#retryCount = 0;
                    this.#started = false;
                } else {
                    this.#retryCount++;
                }
            }, 1000);
        }
    }

    private _clearTimeout(): void {
        if (this.#timer) {
            clearInterval(this.#timer);
            this.#retryCount = 0;
            this.#started = false;
        }
    }

    private _dispatchError(e: Event): void {
        let defaultMessage;
        const target = e.target as HTMLMediaElement;
        const error = target?.error;
        switch (error?.code) {
            case error?.MEDIA_ERR_ABORTED:
                defaultMessage = 'Media playback aborted';
                break;
            case error?.MEDIA_ERR_NETWORK:
                defaultMessage = 'Media download failed part-way due to a network error';
                break;
            case error?.MEDIA_ERR_DECODE:
                defaultMessage = `Media playback aborted due to a corruption problem or because the
                    media used features your browser did not support.`;
                break;
            case error?.MEDIA_ERR_SRC_NOT_SUPPORTED:
                defaultMessage = `Media could not be loaded, either because the server or network failed
                    or because the format is not supported.`;
                break;
            default:
                defaultMessage = 'Unknown error occurred.';
                break;
        }
        const details = {
            detail: {
                data: { ...e, message: defaultMessage, error: error?.code },
                message: defaultMessage,
                type: 'HTML5',
            },
        };
        const errorEvent = addEvent('playererror', details);
        this.element.dispatchEvent(errorEvent);
    }
}

export default HTML5Media;
