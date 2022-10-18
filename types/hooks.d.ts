declare class Hook {
    #private;
    register(key: string, callback: (...params: any[]) => void): void;
    get(key: string): ((...params: any[]) => void)[] | null;
    list(): Record<string, ((...params: any[]) => void)[]>;
    execute(key: string, ...params: any[]): void;
    clear(key?: string): void;
}
declare const instance: Readonly<Hook>;
export default instance;
