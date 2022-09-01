/* eslint-disable @typescript-eslint/no-explicit-any */
class Hook {
    #queue: Record<string, ((...params: any[]) => void)[]> = {};

    register(key: string, callback: (...params: any[]) => void): void {
        if (!this.#queue[key]) {
            this.#queue[key] = [];
        }
        this.#queue[key].push(callback);
    }

    get(key: string): ((...params: any[]) => void)[] | null {
        return this.#queue[key] || null;
    }

    list(): Record<string, ((...params: any[]) => void)[]> {
        return this.#queue;
    }

    execute(key: string, ...params: any[]): void {
        if (!this.#queue[key]) {
            return;
        }

        this.#queue[key].forEach((callback) => callback(params));
    }

    clear(key?: string): void {
        if (key && this.#queue[key]) {
            this.#queue[key] = [];
        } else {
            this.#queue = {};
        }
    }
}

const instance = Object.freeze(new Hook());
export default instance;
