/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ElementItem, MediaMethods, Track } from 'interfaces';

class Player {
    static instances: { [id: string]: MediaMethods } = {};

    #element: HTMLMediaElement;

    #initialized = false;

    #uid = '';

    constructor(element: HTMLMediaElement | string) {
        this.#element =
            element instanceof HTMLMediaElement ? element : (document.getElementById(element) as HTMLMediaElement);
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

    async prepareMedia(): Promise<void> {}

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
