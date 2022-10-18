import AdsDecorator from '../decorator';
import MediaManager from '../manager';
export default class Ads extends AdsDecorator {
    #private;
    constructor(media: MediaManager);
    load(): Promise<void>;
    destroy(): void;
    get loaded(): string;
}
