import Source from '../interfaces/source';
import { addEvent } from '../utils/events';
import { isAudio, isVideo } from '../utils/general';
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
            this.element.dispatchEvent(errorEvent);
        });
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
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
}

export default HTML5Media;
