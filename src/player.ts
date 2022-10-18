/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ElementItem, MediaMethods, PlayerOptions, Track } from './interfaces';
import Media from './media/index';
import { EVENT_OPTIONS } from './utils/constants';
import { isVideo } from './utils/general';

class Player {
    static instances: { [id: string]: MediaMethods } = {};

    #element: HTMLMediaElement;

    #options: PlayerOptions;

    #initialized = false;

    #uid = '';

    constructor(element: HTMLMediaElement | string, options: PlayerOptions = {}) {
        this.#element =
            element instanceof HTMLMediaElement ? element : (document.getElementById(element) as HTMLMediaElement);
        this.#options = options;
    }

    async init(): Promise<void> {
        if (!this._isValid()) {
            return;
        }
        await this.prepareMedia();
        this._generateUID();
        this.#initialized = true;
        Player.instances[this.#uid] = this;
    }

    async load(): Promise<void> {}

    async prepareMedia(): Promise<void> {
        try {
            if (this.#options?.onError) {
                this.#element.removeEventListener('playererror', this.#options.onError);
                this.#element.addEventListener('playererror', this.#options.onError, EVENT_OPTIONS);
            }
            if (this.#element.autoplay && isVideo(this.#element)) {
                // this.#element.addEventListener('canplay', this._autoplay, EVENT_OPTIONS);
            }
            // eslint-disable-next-line no-new
            new Media(this.#element, this.#options);
        } catch (e) {
            console.error(e);
        }
    }

    async play(): Promise<void> {}

    pause(): void {}

    stop(): void {}

    destroy(): void {
        this.#element.id = this.#uid;
        this.#initialized = false;
        delete Player.instances[this.#uid];
    }

    initialized(): boolean {
        return this.#initialized;
    }

    addCaptions(args: Track): void {
        console.log(args);
    }

    addControl(args: ElementItem): void {
        console.log(args);
    }

    addElement(args: ElementItem): void {
        console.log(args);
    }

    removeElement(element: string): void {
        console.log(element);
    }

    removeControl(element: string): void {
        console.log(element);
    }

    getElement(): HTMLMediaElement {
        return this.#element;
    }

    get id(): string {
        return this.#uid;
    }

    private _isValid(): boolean {
        const el = this.#element;

        if (el instanceof HTMLMediaElement === false) {
            return false;
        }

        if (!el.classList.contains('op-player__media')) {
            return false;
        }

        return true;
    }

    private _generateUID(): void {
        if (this.#element.id) {
            this.#uid = this.#element.id;
            this.#element.removeAttribute('id');
        } else {
            const cryptoLib = crypto as any;
            const encryption =
                typeof cryptoLib.getRandomBytes === 'function' ? cryptoLib.getRandomBytes : cryptoLib.getRandomValues;
            this.#uid = `op_${encryption(new Uint32Array(1))[0].toString(36).substr(2, 9)}`;
        }

        if (this.#element.parentElement) {
            this.#element.parentElement.id = this.#uid;
        }
    }
}

export default Player;

// Expose element globally.
if (typeof window !== 'undefined') {
    (window as any).OpenPlayer = Player;
    (window as any).OpenPlayerJS = Player;
}
