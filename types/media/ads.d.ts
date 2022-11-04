import { AdsOptions } from '../interfaces';
import Media from '../media';
export default class Ads {
    #private;
    constructor(
        media: Media,
        ads: string | string[],
        autostart?: boolean,
        autostartMuted?: boolean,
        options?: AdsOptions
    );
    load(force?: boolean): Promise<void>;
    play(): Promise<void>;
    pause(): void;
    resizeAds(width?: number, height?: number): void;
    getAdsManager(): unknown;
    getAdsLoader(): any;
    started(): boolean;
    destroy(): void;
    set src(source: string | string[]);
    set volume(value: number);
    get volume(): number;
    set muted(value: boolean);
    get muted(): boolean;
    set currentTime(value: number);
    get currentTime(): number;
    get duration(): number;
    get paused(): boolean;
    get ended(): boolean;
    private _loadIMA;
    private _setAdSettings;
    private _loadAdsContainer;
    private _loadAdsLoader;
    private _handleClickInContainer;
    private _requestAds;
    private _setMediaVolume;
    private _handleResizeAds;
    private _createCustomClick;
    private _createSkipElement;
    private _handleSkipAds;
    private _onError;
    private _onAdsManagerLoaded;
    private _onEvent;
    private _onPreloadContent;
    private _onMetadataLoaded;
    private _loadAds;
    private _onPlay;
    private _onPause;
    private _onEnded;
}
