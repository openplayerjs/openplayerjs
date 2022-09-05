import AdsDecorator from '../decorator';
import Manager from '../manager';

export default class LiveAds extends AdsDecorator {
    #media: Manager;

    constructor(media: Manager) {
        super();
        this.#media = media;
    }

    async load(): Promise<void> {
        if (!this.#media.loaded) {
            await this.#media.load();
        }
        this.type = 'liveads';
    }

    destroy(): void {
        this.type = '';
    }

    get loaded(): string {
        return `${this.#media.loaded}${this.type ? `:${this.type}` : ''}`;
    }
}
