import HTML5Media from 'media/types/html5';
import MediaManager from './manager';

export default class Media extends MediaManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #media: HTML5Media | any = null;

    #element: HTMLMediaElement;

    constructor(element: HTMLMediaElement) {
        super();
        this.#element = element;
    }

    async load(): Promise<void> {
        this.#media = new HTML5Media(this.#element);
        this.type = 'media';
    }

    destroy(): void {
        this.#media.destroy();
        this.type = '';
    }
}
