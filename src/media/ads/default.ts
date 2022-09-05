import AdsDecorator from '../decorator';
import MediaManager from '../manager';

export default class Ads extends AdsDecorator {
    #media: MediaManager;

    constructor(media: MediaManager) {
        super();
        this.#media = media;
    }

    async load(): Promise<void> {
        if (!this.#media.loaded) {
            await this.#media.load();
        }
        this.type = 'ads';
    }

    destroy(): void {
        this.type = '';
    }

    get loaded(): string {
        return `${this.#media.loaded}${this.type ? `:${this.type}` : ''}`;
    }
}
