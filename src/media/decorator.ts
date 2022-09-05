import MediaManager from './manager';

abstract class AdsDecorator extends MediaManager {
    abstract load(): Promise<void>;

    abstract destroy(): void;

    abstract set loaded(type: string);

    abstract get loaded(): string;
}

export default AdsDecorator;
