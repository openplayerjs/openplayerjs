import { PlayerOptions, Source } from '../interfaces';
import MediaManager from './manager';
export default class Media extends MediaManager {
    #private;
    constructor(element: HTMLMediaElement, options?: PlayerOptions);
    load(): Promise<void>;
    get src(): Source;
    destroy(): void;
    private _invoke;
}
