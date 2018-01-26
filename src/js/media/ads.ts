import {loadScript} from '../utils/dom';
import Native from '../components/native';
import Media from '../media';
import { predictType } from '../utils/url';

declare const google: any;

class Ads extends Native {
    instance: Media;
    events: object;
    adUrl: string;
    adsManager: any;
    adsLoader: any;
    adsContainer: HTMLDivElement;
    adDisplayContainer: any;
    adsRequest: any;
    adEnded: boolean;
    adsDone: boolean;

    /**
     * Creates an instance of Google IMA SDK.
     *
     * @param {Media} media
     * @param {object} mediaFile
     * @param {string} adUrl
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(media, file) {
        super(media.element, file);
        this.adUrl = media.ads;
        this.instance = media;
        this.adsManager = null;
        this.events = null;
        this.adEnded = false;
        this.adsDone = false;

        this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
            loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') :
            new Promise(resolve => {
                resolve();
            });

        return this;
    }

    canPlayType(mimeType) {
        return this.adsLoader !== null && /\.(mp[34]|m3u8|mpd)/.test(mimeType);
    }

    load() {
        this.adsContainer = document.createElement('div');
        this.adsContainer.id = 'om-ads';
        this.element.parentNode.insertBefore(this.adsContainer, this.element.nextSibling);
        this.element.classList.add('om-ads--active');

        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.INSECURE);
        this.adDisplayContainer =
            new google.ima.AdDisplayContainer(
                this.adsContainer,
                this.element
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

    play() {
        if (!this.adsDone) {
            this.adDisplayContainer.initialize();
            this.adsDone = true;
        }
        if (this.adsManager) {
            this.adsManager.resume();
        } else {
            this.instance.play();
        }
    }

    pause() {
        if (this.adsManager) {
            this.adsManager.pause();
        } else {
            this.instance.pause();
        }
    }

    destroy() {
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

    _assign(event) {
        if (event.type === google.ima.AdEvent.Type.CLICK) {
            // this.application_.adClicked();
        } else if (event.type === google.ima.AdEvent.Type.LOADED) {
            const ad = event.getAd();
            if (!ad.isLinear()) {
                this._onContentResumeRequested();
            }
        }
    }

    _error(e) {
        console.error(`Ad error: ${e.getError().toString()}`);
        if (this.adsManager) {
            this.adsManager.destroy();
        }
        // this.instance.play();
    }

    _loaded(adsManagerLoadedEvent) {
        const adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

        // Get the ads manager.
        this.adsManager = adsManagerLoadedEvent.getAdsManager(this.element, adsRenderingSettings);
        this._start(this.adsManager);
    }

    // _revoke() {
    //
    // }

    _start(manager) {
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
            google.ima.AdEvent.Type.THIRD_QUARTILE
        ];

        Object.keys(this.events).forEach(event => {
            manager.addEventListener(this.events[event], this._assign.bind(this));
        });

        try {
            // Initialize the ads manager. Ad rules playlist will start at this time.
            manager.init(
                this.element.offsetWidth, 
                this.element.offsetHeight, 
                google.ima.ViewMode.NORMAL
            );
            manager.start();
        } catch (adError) {
            this._contentEndedListener();
            this.instance.play();
        }
    }

    _contentEndedListener() {
        this.adEnded = true;
        this.adsLoader.contentComplete();
    }

    _onContentPauseRequested() {
        // This function is where you should setup UI for showing ads (e.g.
        // display ad timer countdown, disable seeking, etc.)
        this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
        this.instance.pause();
    }

    _onContentResumeRequested() {
        // This function is where you should ensure that your UI is ready
        // to play content.
        this.element.addEventListener('ended', this._contentEndedListener.bind(this));
        this.element.classList.remove('om-ads--active');
        this.instance.ads = null;
        this.instance._loaded([{
            src: this.media,
            type: predictType(this.media)
        }]);
        this.instance.play();
    }
}

export default Ads;
