import IEvent from '../components/interfaces/general/event';
import { addEvent } from '../events';
import Media from '../media';
import {loadScript} from '../utils/dom';
import { predictType } from '../utils/url';

declare const google: any;
/**
 * Ads
 *
 * @description This class implements Google IMA SDK v3.0 to display VAST and VPAID advertisement
 * @see https://developers.google.com/interactive-media-ads/
 * @class Ads
 */
class Ads {
    public element: HTMLMediaElement;
    public media: string;
    public promise: Promise<any>;
    private instance: Media;
    private events: IEvent;
    private adUrl: string;
    private adsManager: any;
    private adsLoader: any;
    private adsContainer: HTMLDivElement;
    private adDisplayContainer: any;
    private adsRequest: any;
    private adEnded: boolean;
    private adsDone: boolean;
    private adsActive: boolean;
    private adsStarted: boolean;
    private intervalTimer: number;
    private adsVolume: number;
    private adsMuted: boolean;

    /**
     * Creates an instance of Google IMA SDK.
     *
     * @param {Media} media
     * @param {object} file
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(media: Media, file: string) {
        this.element = media.element;
        this.media = file;
        this.adUrl = media.ads;
        this.instance = media;
        this.adsManager = null;
        this.events = null;
        this.adEnded = false;
        this.adsDone = false;
        this.adsActive = false;
        this.adsStarted = false;
        this.intervalTimer = 0;
        this.adsVolume = this.element.volume;
        this.adsMuted = false;

        this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
            loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') :
            new Promise(resolve => {
                resolve();
            });

        return this;
    }

    public canPlayType(mimeType: string) {
        return this.adsLoader !== null && /\.(mp[34]|m3u8|mpd)/.test(mimeType);
    }
    /**
     * Create the Ads container and loader to process the Ads URL provided.
     *
     * @memberof Ads
     */
    public load() {
        this.adsContainer = document.createElement('div');
        this.adsContainer.id = 'om-ads';
        this.element.parentNode.insertBefore(this.adsContainer, this.element.nextSibling);
        this.element.classList.add('om-ads--active');

        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
        this.adDisplayContainer =
            new google.ima.AdDisplayContainer(
                this.adsContainer,
                this.element,
            );

        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
        this.adsLoader.getSettings().setDisableCustomPlaybackForIOS10Plus(true);

        this.adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this._error.bind(this),
        );
        this.adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this._loaded.bind(this),
        );

        // Create responsive ad
        window.addEventListener('resize', this._resizeAds.bind(this));
        this.element.addEventListener('ended', this._contentEndedListener.bind(this));
        this._requestAds();
    }

    public play() {
        if (!this.adsDone) {
            this.adDisplayContainer.initialize();
            this.adsDone = true;
        }
        if (this.adsManager) {
            this.adsManager.resume();
            const e = addEvent('play');
            this.element.dispatchEvent(e);
            this.adsActive = true;
        } else {
            this.instance.play();
        }
    }

    public pause() {
        if (this.adsManager) {
            this.adsManager.pause();
            const e = addEvent('pause');
            this.element.dispatchEvent(e);
            this.adsActive = false;
        } else {
            this.instance.pause();
        }
    }

    public destroy() {
        Object.keys(this.events).forEach(event => {
            this.adsManager.removeEventListener(this.events[event], this._assign.bind(this));
        });

        this.events = {};

        this.adsLoader.removeEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this._error.bind(this),
        );
        this.adsLoader.removeEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this._loaded.bind(this),
        );

        if (this.adsManager) {
            this.adsManager.destroy();
        }

        this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
        window.removeEventListener('resize', this._resizeAds.bind(this));
        this.adsContainer.remove();
    }

    set volume(value) {
        if (value > 0) {
            this.adsVolume = value;
        }
        this.adsManager.setVolume(value);
    }

    get volume() {
        return this.adsVolume;
    }

    set muted(value) {
        if (value === true) {
            this.adsManager.setVolume(0);
            this.adsMuted = true;
        } else {
            this.adsManager.setVolume(this.adsVolume);
            this.adsMuted = false;
        }
    }

    get muted() {
        return this.adsMuted;
    }

    get paused() {
        return !this.adsActive;
    }

    get ended() {
        return this.adEnded;
    }

    private _assign(event: any) {
        const ad = event.getAd();
        switch (event.type) {
            case google.ima.AdEvent.Type.LOADED:
                if (!ad.isLinear()) {
                    this._onContentResumeRequested();
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                if (ad.isLinear()) {
                    this.intervalTimer = window.setInterval(() => {
                        const remainingTime = this.adsManager.getRemainingTime();
                        console.log(remainingTime);
                    }, 300);
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
            case google.ima.AdEvent.Type.SKIPPED:
                if (ad.isLinear()) {
                    clearInterval(this.intervalTimer);
                }
                break;
            case google.ima.AdEvent.Type.VOLUME_CHANGED:
            case google.ima.AdEvent.Type.VOLUME_MUTED:
                if (ad.isLinear()) {
                    const e = addEvent('volumechanged');
                    this.element.dispatchEvent(e);
                }
                break;
        }
    }

    private _error(event: any) {
        console.error(`Ad error: ${event.getError().toString()}`);
        if (this.adsManager) {
            this.adsManager.destroy();
        }
        this._resumeMedia();
    }

    private _loaded(adsManagerLoadedEvent: any) {
        const adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

        // Get the ads manager.
        this.adsManager = adsManagerLoadedEvent.getAdsManager(this.element, adsRenderingSettings);
        this._start(this.adsManager);
    }

    private _start(manager: any) {
        // Add listeners to the required events.
        manager.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this._error.bind(this));
        manager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
            this._onContentPauseRequested.bind(this));
        manager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
            this._onContentResumeRequested.bind(this));

        this.events = {
            0: google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            1: google.ima.AdEvent.Type.CLICK,
            2: google.ima.AdEvent.Type.COMPLETE,
            3: google.ima.AdEvent.Type.FIRST_QUARTILE,
            4: google.ima.AdEvent.Type.LOADED,
            5: google.ima.AdEvent.Type.MIDPOINT,
            6: google.ima.AdEvent.Type.PAUSED,
            7: google.ima.AdEvent.Type.STARTED,
            8: google.ima.AdEvent.Type.THIRD_QUARTILE,
            9: google.ima.AdEvent.Type.SKIPPED,
            10: google.ima.AdEvent.Type.VOLUME_CHANGED,
            11: google.ima.AdEvent.Type.VOLUME_MUTED,
        };

        Object.keys(this.events).forEach(event => {
            manager.addEventListener(this.events[event], this._assign.bind(this));
        });

        try {
            // Initialize the ads manager. Ad rules playlist will start at this time.
            manager.init(
                this.element.offsetWidth,
                this.element.offsetHeight,
                google.ima.ViewMode.NORMAL,
            );

            this.adsActive = true;
            manager.start();
            const e = addEvent('play');
            this.element.dispatchEvent(e);
        } catch (adError) {
            this._resumeMedia();
        }
    }

    private _contentEndedListener() {
        this.adEnded = true;
        this.adsActive = false;
        this.adsStarted = false;
        this.adsLoader.contentComplete();
    }

    private _onContentPauseRequested() {
        this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
        if (this.adsStarted) {
            this.instance.pause();
        } else {
            this.adsStarted = true;
        }
    }

    private _onContentResumeRequested() {
        this.element.addEventListener('ended', this._contentEndedListener.bind(this));
        this._resumeMedia();
    }

    private _resumeMedia() {
        this.adEnded = true;
        this.adsActive = false;
        this.adsStarted = false;
        this.element.classList.remove('om-ads--active');
        this.instance.ads = null;
        this.instance.loadSources([
            {
                src: this.media,
                type: predictType(this.media),
            },
        ]);
        this.instance.play();
    }

    private _resizeAds() {
        if (this.adsManager) {
            this.adsManager.resize(
                (this.element.parentNode as HTMLElement).offsetWidth,
                (this.element.parentNode as HTMLElement).offsetHeight,
                google.ima.ViewMode.NORMAL);
        }
    }

    private _requestAds() {
        if (this.adsLoader) {
            this.adsLoader.contentComplete();
        }
        this.adsRequest = new google.ima.AdsRequest();
        this.adsRequest.adTagUrl = this.adUrl;

        const width = (this.element.parentNode as HTMLElement).offsetWidth;
        const height = (this.element.parentNode as HTMLElement).offsetWidth;
        this.adsRequest.linearAdSlotWidth = width;
        this.adsRequest.linearAdSlotHeight = height;
        this.adsRequest.nonLinearAdSlotWidth = width;
        this.adsRequest.nonLinearAdSlotHeight = 150;

        this.adsLoader.requestAds(this.adsRequest);
    }
}

export default Ads;
