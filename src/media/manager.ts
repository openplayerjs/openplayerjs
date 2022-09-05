abstract class MediaManager {
    protected type = '';

    abstract load(): void;

    destroy(): void {
        this.type = '';
    }

    get loaded(): string {
        return this.type;
    }
}

export default MediaManager;
