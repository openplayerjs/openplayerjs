import { ElementItem, MediaMethods, PlayerOptions, Track } from './interfaces';
declare class Player {
    #private;
    static instances: {
        [id: string]: MediaMethods;
    };
    constructor(element: HTMLMediaElement | string, options?: PlayerOptions);
    init(): Promise<void>;
    load(): Promise<void>;
    prepareMedia(): Promise<void>;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    destroy(): void;
    initialized(): boolean;
    addCaptions(args: Track): void;
    addControl(args: ElementItem): void;
    addElement(args: ElementItem): void;
    removeElement(element: string): void;
    removeControl(element: string): void;
    getElement(): HTMLMediaElement;
    get id(): string;
    private _isValid;
    private _generateUID;
}
export default Player;
