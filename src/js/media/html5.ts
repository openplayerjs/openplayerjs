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
        element.addEventListener('error', (e: any) => {
            const details = {
                detail: {
                    type: `HTML5`,
                    message: e.message,
                    data: e,
                },
            };
            const errorEvent = addEvent('playererror', { ...details });
            this.element.dispatchEvent(errorEvent);
        })
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

    /**
     *
     * @inheritDoc
     */
    set src(media: Source) {
        this.element.src = media.src;
    }
}

export default HTML5Media;
