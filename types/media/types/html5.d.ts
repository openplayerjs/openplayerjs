import { Source } from '../../interfaces';
import Implementation from './implementation';
declare class HTML5Media extends Implementation {
    #private;
    constructor(element: HTMLMediaElement, mediaFile?: Source);
    canPlayType(mimeType: string): boolean;
    load(): void;
    destroy(): void;
    set src(media: Source);
    get src(): Source;
    private _isDvrEnabled;
    private _readMediadataInfo;
    private _setTimeout;
    private _clearTimeout;
    private _dispatchError;
}
export default HTML5Media;
