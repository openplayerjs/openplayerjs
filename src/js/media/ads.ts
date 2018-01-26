import IFile from '../components/interfaces/media/file';
import { addEvent } from '../events';
import Media from '../media';
import {loadScript} from '../utils/dom';
import { predictType } from '../utils/url';

declare const google: any;
/**
 *
 *
 * @class Ads
 */
class Ads {
    public element: HTMLMediaElement;
    public media: IFile;
    public promise: Promise<any>;
    private instance: Media;
    private events: object;
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

    /**
     * Creates an instance of Google IMA SDK.
     *
     * @param {Media} media
     * @param {object} file
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(media, file) {
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

        this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
            loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') :
            new Promise(resolve => {
                resolve();
            });

        return this;
    }

    public canPlayType(mimeType) {
        return this.adsLoader !== null && /\.(mp[34]|m3u8|mpd)/.test(mimeType);
    }
    /**
     * Create the Ads container.
     *
     * @memberof Ads
     */
    public load() {
        this.adsContainer = document.createElement('div');
        this.adsContainer.id = 'om-ads';
        this.element.parentNode.insertBefore(this.adsContainer, this.element.nextSibling);
        this.element.classList.add('om-ads--active');

        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.INSECURE);
        this.adDisplayContainer =
            new google.ima.AdDisplayContainer(
                this.adsContainer,
                this.element,
            );

        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

        const loaded = google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED;
        const error = google.ima.AdErrorEvent.Type.AD_ERROR;

        this.adsLoader.addEventListener(error, this._error.bind(this));
        this.adsLoader.addEventListener(loaded, this._loaded.bind(this));
        this.element.onended = this._contentEndedListener.bind(this);
        this.adsRequest = new google.ima.AdsRequest();
        this.adsRequest.adTagUrl = this.adUrl;

        this.adsRequest.linearAdSlotWidth = this.element.offsetWidth;
        this.adsRequest.linearAdSlotHeight = this.element.offsetHeight;
        this.adsRequest.nonLinearAdSlotWidth = this.element.offsetWidth;
        this.adsRequest.nonLinearAdSlotHeight = 150;
        this.adsLoader.requestAds(this.adsRequest);
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
    }

    set src(media) {
    }

    get src() {
        return this.instance.src;
    }

    set volume(value) {
        this.element.volume = value;
    }

    get volume() {
        return this.element.volume;
    }

    set muted(value) {
        this.element.muted = value;
    }

    get muted() {
        return this.element.muted;
    }

    get paused() {
        return !this.adsActive;
    }

    get ended() {
        return this.adEnded;
    }

    private _assign(event) {
        if (event.type === google.ima.AdEvent.Type.CLICK) {
            // this.application_.adClicked();
        } else if (event.type === google.ima.AdEvent.Type.LOADED) {
            const ad = event.getAd();
            if (!ad.isLinear()) {
                this._onContentResumeRequested();
            }
        }
    }

    private _error(e) {
        console.error(`Ad error: ${e.getError().toString()}`);
        if (this.adsManager) {
            this.adsManager.destroy();
        }
        this._resumeMedia();
    }

    private _loaded(adsManagerLoadedEvent) {
        const adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

        // Get the ads manager.
        this.adsManager = adsManagerLoadedEvent.getAdsManager(this.element, adsRenderingSettings);
        this._start(this.adsManager);
    }

    // _revoke() {
    //
    // }

    private _start(manager) {
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
        ];

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
        this.instance.loadSources([{
            src: this.media,
            type: predictType(this.media),
        }]);
        this.instance.play();
    }
}

export default Ads;
