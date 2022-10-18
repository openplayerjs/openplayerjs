import AdsDecorator from '../decorator';
import Manager from '../manager';
export default class LiveAds extends AdsDecorator {
    #private;
    constructor(media: Manager);
    load(): Promise<void>;
    destroy(): void;
    get loaded(): string;
}
