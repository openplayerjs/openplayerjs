import { Source } from '../../interfaces';
import Implementation from './implementation';
declare class HlsMedia extends Implementation {
    #private;
    constructor(element: HTMLMediaElement, options?: Record<string, unknown>);
    canPlayType(mimeType: string): boolean;
    load(): Promise<void>;
    destroy(): void;
    set src(media: Source);
    private _assign;
    private _play;
    private _pause;
}
export default HlsMedia;
