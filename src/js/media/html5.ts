import Source from '../interfaces/source';
import { DVR_THRESHOLD } from '../utils/constants';
import { addEvent } from '../utils/events';
import { isAudio, isVideo } from '../utils/general';
import { isHlsSource } from '../utils/media';
import Native from './native';

/**
 * HTML5 Media.
 *
 * @description Class that wraps the native HTML5 media methods
 * @class NativeMedia
 */
class HTML5Media extends Native  {
    private currentLevel: any = null;

    private levelList: any[] = [];

    private isStreaming: boolean = false;

    /**
     * Creates an instance of NativeMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaFile
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element: HTMLMediaElement, mediaFile: Source) {
        super(element, mediaFile);
        element.addEventListener('error', (e: any) => {
            const details = {
                detail: {
                    data: e,
                    message: e.message,
                    type: 'HTML5',
                },
            };
            const errorEvent = addEvent('playererror', details);
            element.dispatchEvent(errorEvent);
        });
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }

        this.isStreaming = isHlsSource(mediaFile);
        this.element.addEventListener('loadeddata', this._isDvrEnabled.bind(this));
        this.element.textTracks.addEventListener('addtrack', this._readMediadataInfo.bind(this));

        return this;
    }

    /**
     *
     * @inheritDoc
     * @memberof NativeMedia
     */
    public canPlayType(mimeType: string): boolean {
        return !!(this.element.canPlayType(mimeType).replace('no', ''));
    }

    /**
     *
     * @inheritDoc
     * @memberof HTML5Media
     */
    public load(): void {
        this.element.load();
    }

    /**
     *
     * @inheritDoc
     * @returns {HTML5Media}
     * @memberof HTML5Media
     */
    public destroy(): HTML5Media {
        this.element.removeEventListener('loadeddata', this._isDvrEnabled.bind(this));
        this.element.textTracks.removeEventListener('addtrack', this._readMediadataInfo.bind(this));
        return this;
    }

    get levels(): object[] {
        if (!this.levelList.length) {
            const levels = this.element.querySelectorAll('source[title]');
            for (let i = 0, total = levels.length; i < total; ++i) {
                const level = {
                    height: 0,
                    id: `${i}`,
                    label: levels[i].getAttribute('title'),
                };
                this.levelList.push(level);
            }
        }
        return this.levelList;
    }

    set level(level: any) {
        const idx = this.levelList.findIndex((item: any) => parseInt(item.id, 10) === level);
        if (idx > -1) {
            this.currentLevel = this.levels[idx];
            const levels = this.element.querySelectorAll('source[title]');
            for (let i = 0, total = levels.length; i < total; ++i) {
                if (parseInt(this.currentLevel.id, 10) === i) {
                    this.element.src = levels[i].getAttribute('src');
                }
            }
        }
    }

    get level(): any {
        return this.currentLevel ? this.currentLevel.id : '-1';
    }

    /**
     *
     * @inheritDoc
     */
    set src(media: Source) {
        this.element.src = media.src;
    }

    private _isDvrEnabled(): void {
        const time = this.element.seekable.end(this.element.seekable.length - 1) - this.element.seekable.start(0);
        if (this.isStreaming && time > DVR_THRESHOLD && !this.element.getAttribute('op-dvr__enabled')) {
            this.element.setAttribute('op-dvr__enabled', 'true');
            const timeEvent = addEvent('timeupdate');
            this.element.dispatchEvent(timeEvent);
        }
    }

    private _readMediadataInfo(target: HTMLTrackElement): void {
        if (target.track.kind === 'metadata') {
            target.track.mode = 'hidden';
            target.track.addEventListener('cuechange', (e) => {
                const cue = (e.target as TextTrack).activeCues[0];
                if (cue) {
                    const e = addEvent('metadataready', { detail: cue });
                    this.element.dispatchEvent(e);
                }
            });
        }
        
    }
}

export default HTML5Media;
