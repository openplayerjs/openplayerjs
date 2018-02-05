import { addEvent } from '../events';
import Media from '../media';
import {loadScript} from '../utils/dom';

declare const google: any;
/**
 * Ads
 *
 * @description This class implements Google IMA SDK v3.0 to display VAST and VPAID advertisement
 * @see https://developers.google.com/interactive-media-ads/
 * @class Ads
 */
class Ads {
    public adEnded: boolean;
    public adsDone: boolean;
    public adsActive: boolean;
    public adsStarted: boolean;
    public intervalTimer: number;
    public adsVolume: number;
    public adsMuted: boolean;
    public adsDuration: number;
    public adsCurrentTime: number;
    public adsManager: any;
    private media: Media;
    private events: any[];
    private adsUrl: string;
    private promise: Promise<any>;
    private adsLoader: any;
    private adsContainer: HTMLDivElement;
    private adsCompany: HTMLDivElement;
    private adDisplayContainer: any;
    private adsRequest: any;

    /**
     * Creates an media of Google IMA SDK.
     *
     * @param {Media} media
     * @param {object} file
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(media: Media, adsUrl: string) {
        this.adsUrl = adsUrl;
        this.media = media;
        this.adsManager = null;
        this.events = null;
        this.adEnded = false;
        this.adsDone = false;
        this.adsActive = false;
        this.adsStarted = false;
        this.intervalTimer = 0;
        this.adsVolume = this.media.element.volume;
        this.adsMuted = false;
        this.adsDuration = 0;
        this.adsCurrentTime = 0;

        this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
            loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') :
            new Promise(resolve => {
                resolve();
            });

        this.promise.then(this.load.bind(this));

        return this;
    }

    /**
     * Create the Ads container and loader to process the Ads URL provided.
     *
     * @memberof Ads
     */
    public load() {
        // Load the company ads
        // this.adsCompany = document.createElement('div');
        // this.adsCompany.id = 'om-ads__company';
        // this.adsCompany.innerHTML = `<script type="text/javascript">
        //     googletag.cmd.push(function() { googletag.display('${this.adsCompany.id}'); });
        // </script>`;
        // this.media.element.parentNode.insertBefore(this.adsCompany, this.media.element.nextSibling);

        this.adsContainer = document.createElement('div');
        this.adsContainer.id = 'om-ads';
        this.media.element.parentNode.insertBefore(this.adsContainer, this.media.element.nextSibling);


        this.media.element.classList.add('om-ads--active');

        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
        this.adDisplayContainer =
            new google.ima.AdDisplayContainer(
                this.adsContainer,
                this.media.element,
                this.adsCompany,
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
        this.media.element.addEventListener('ended', this._contentEndedListener.bind(this));
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
            this.media.element.dispatchEvent(e);
            this.adsActive = true;
        }
    }

    public pause() {
        if (this.adsManager) {
            this.adsManager.pause();
            const e = addEvent('pause');
            this.media.element.dispatchEvent(e);
            this.adsActive = false;
        }
    }

    public destroy() {
        this.events.forEach(event => {
            this.adsManager.removeEventListener(event, this._assign.bind(this));
        });

        this.events = [];

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

        this.media.element.removeEventListener('ended', this._contentEndedListener.bind(this));
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

    set currentTime(value: number) {
        this.adsCurrentTime = value;
    }
    get currentTime() {
        return this.adsCurrentTime;
    }

    get duration() {
        return this.adsDuration;
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
                } else {
                    if (!this.media.paused) {
                        this.media.pause();
                    }
                    this.adsDuration = ad.getDuration();
                    this.adsCurrentTime = ad.getDuration();
                    setTimeout(() => {
                        const e = addEvent('loadedmetadata');
                        this.media.element.dispatchEvent(e);
                    }, 50);
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                if (ad.isLinear()) {
                    this.adsDuration = ad.getDuration();
                    this.adsCurrentTime = ad.getDuration();
                    this.intervalTimer = window.setInterval(() => {
                        this.adsCurrentTime = this.adsManager.getRemainingTime();
                        const e = addEvent('timeupdate');
                        this.media.element.dispatchEvent(e);
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
                    this.media.element.dispatchEvent(e);
                }
                break;
            case google.ima.AdEvent.ALL_ADS_COMPLETED:
                this.media.element.classList.remove('om-ads--active');
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
        this.adsManager = adsManagerLoadedEvent.getAdsManager(this.media.element, adsRenderingSettings);
        this._start(this.adsManager);
    }

    private _start(manager: any) {
        // if (manager.isCustomClickTrackingUsed()) {
        //     this.adsCompany.style.display = 'table';
        // }
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

        this.events = [
            google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            google.ima.AdEvent.Type.CLICK,
            google.ima.AdEvent.Type.COMPLETE,
            google.ima.AdEvent.Type.FIRST_QUARTILE,
            google.ima.AdEvent.Type.LOADED,
            google.ima.AdEvent.Type.MIDPOINT,
            google.ima.AdEvent.Type.PAUSED,
            google.ima.AdEvent.Type.STARTED,
            google.ima.AdEvent.Type.THIRD_QUARTILE,
            google.ima.AdEvent.Type.SKIPPED,
            google.ima.AdEvent.Type.VOLUME_CHANGED,
            google.ima.AdEvent.Type.VOLUME_MUTED,
        ];

        this.events.forEach(event => {
            manager.addEventListener(event, this._assign.bind(this));
        });

        try {
            // Initialize the ads manager. Ad rules playlist will start at this time.
            manager.init(
                this.media.element.offsetWidth,
                this.media.element.offsetHeight,
                google.ima.ViewMode.NORMAL,
            );

            const e = addEvent('play');
            this.media.element.dispatchEvent(e);
            this.adsActive = true;
            this.adsStarted = true;
            manager.start();
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
        this.media.element.removeEventListener('ended', this._contentEndedListener.bind(this));
        if (this.adsStarted) {
            this.media.pause();
        } else {
            this.adsStarted = true;
        }
        const e = addEvent('play');
        this.media.element.dispatchEvent(e);
    }

    private _onContentResumeRequested() {
        this.media.element.addEventListener('ended', this._contentEndedListener.bind(this));
        this._resumeMedia();
    }

    private _resumeMedia() {
        this.intervalTimer = 0;
        this.adsMuted = false;
        this.adsStarted = false;
        this.adsDuration = 0;
        this.adsCurrentTime = 0;
        const e = addEvent('loadedmetadata');
        this.media.element.dispatchEvent(e);

        if (!this.media.ended) {
            this.media.play();
            const event = addEvent('play');
            this.media.element.dispatchEvent(event);
        }
    }

    private _resizeAds() {
        if (this.adsManager) {
            this.adsManager.resize(
                (this.media.element.parentNode as HTMLElement).offsetWidth,
                (this.media.element.parentNode as HTMLElement).offsetHeight,
                google.ima.ViewMode.NORMAL);
        }
    }

    private _requestAds() {
        if (this.adsLoader) {
            this.adsLoader.contentComplete();
        }
        this.adsRequest = new google.ima.AdsRequest();
        this.adsRequest.adTagUrl = this.adsUrl;

        const width = (this.media.element.parentNode as HTMLElement).offsetWidth;
        const height = (this.media.element.parentNode as HTMLElement).offsetWidth;
        this.adsRequest.linearAdSlotWidth = width;
        this.adsRequest.linearAdSlotHeight = height;
        this.adsRequest.nonLinearAdSlotWidth = width;
        this.adsRequest.nonLinearAdSlotHeight = 150;

        this.adsLoader.requestAds(this.adsRequest);
    }
}

export default Ads;
