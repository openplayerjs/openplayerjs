import Source from '../interfaces/source';
import { isAudio, isVideo } from '../utils/general';
import Native from './native';

/**
 * HTML5 Media.
 *
 * @description Class that wraps the native HTML5 media methods
 * @class NativeMedia
 */
class HTML5Media extends Native  {
    private currentLevel: object;

    /**
     * Creates an instance of NativeMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaFile
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element: HTMLMediaElement, mediaFile: Source) {
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
        super(element, mediaFile);
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
        return this.levels;
    }

    set level(level: any) {
        const idx = this.levels.findIndex((item: any) => item.label === level.label);
        if (idx > -1) {
            this.currentLevel = this.levels[idx];
        }
    }

    get level(): any {
        return this.currentLevel;
    }

    /**
     *
     * @type number
     * @memberof Media
     */
    public qualityLevels(): any {
        const sources = this.element.querySelectorAll('sources');
        for (let i = 0, total = sources.length; i < total; ++i) {
            const current = (sources[i] as HTMLSourceElement);
            if (current.type && this.canPlayType(current.type) && current.getAttribute('label')) {
                this.levels.push({
                    label: current.getAttribute('label'),
                    src: current.src,
                });
            }
        }

        return this.levels;
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
