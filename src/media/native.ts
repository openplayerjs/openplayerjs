/* eslint-disable @typescript-eslint/no-explicit-any */
import { Level, Source } from '../interfaces';
import { predictMimeType } from '../utils/media';

export default abstract class Native {
    element: HTMLMediaElement;

    media: Source;

    promise: Promise<unknown>;

    #customPlayer: any;

    constructor(element: HTMLMediaElement, media?: Source) {
        this.element = element;
        const src = element.src || element.querySelector('source')?.src || '';
        const type = src ? predictMimeType(src, element) : element.querySelector('source')?.type || 'video/mp4';
        this.media = media || { src, type };
        this.promise = new Promise<void>((resolve) => {
            resolve();
        });
    }

    abstract canPlayType(mimeType: string): boolean;

    abstract load(): void;

    abstract destroy(): void;

    abstract set src(media: Source);

    abstract get src(): Source;

    abstract set level(value: number | string | Record<string, unknown>);

    abstract get level(): number | string;

    abstract get levels(): Level[];

    set instance(customPlayer: any) {
        this.#customPlayer = customPlayer;
    }

    get instance(): any {
        return this.#customPlayer;
    }

    play(): Promise<void> {
        return this.element.play();
    }

    pause(): void {
        this.element.pause();
    }

    set volume(value: number) {
        this.element.volume = value;
    }

    get volume(): number {
        return this.element.volume;
    }

    set muted(value: boolean) {
        this.element.muted = value;
    }

    get muted(): boolean {
        return this.element.muted;
    }

    set playbackRate(value: number) {
        this.element.playbackRate = value;
    }

    get playbackRate(): number {
        return this.element.playbackRate;
    }

    set defaultPlaybackRate(value: number) {
        this.element.defaultPlaybackRate = value;
    }

    get defaultPlaybackRate(): number {
        return this.element.defaultPlaybackRate;
    }

    set currentTime(value: number) {
        this.element.currentTime = value;
    }

    get currentTime(): number {
        return this.element.currentTime;
    }

    get duration(): number {
        return this.element.duration;
    }

    get paused(): boolean {
        return this.element.paused;
    }

    get ended(): boolean {
        return this.element.ended;
    }
}
