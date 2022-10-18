declare abstract class MediaManager {
    protected type: string;
    abstract load(): void;
    destroy(): void;
    get loaded(): string;
}
export default MediaManager;
