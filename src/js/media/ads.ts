import {loadScript} from '../utils/dom';
import Native from '../components/native';

class Ads extends Native {
    events: object;
    adsManager?: AdsManager;
    adsContainer: HTMLDivElement;
    adDisplayContainer: adDisplayContainer;

    /**
     * Creates an instance of Google IMA SDK.
     *
     * @param {HTMLMediaElement} element
     * @param {object} mediaFile
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(element, mediaFile) {
        super(element, mediaFile);

        this.adsManager = null;
        this.events = null;

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

        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
        this.adDisplayContainer =
            new google.ima.AdDisplayContainer(
                this.adsContainer,
                this.element
            );
        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);


        const loaded = google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED;
        const error = google.ima.AdErrorEvent.Type.AD_ERROR;

        this.adsLoader.addEventListener(loaded, e => {
            const adsRenderingSettings = new google.ima.AdsRenderingSettings();
            adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
            this.adsManager = e.getAdsManager(this.element, adsRenderingSettings);
            this._start(this.adsManager);
        });

        this.adsLoader.addEventListener(error, this._error.bind(this));
    }

    play() {
        this.element.play();
    }

    pause() {
        this.element.pause();
    }

    destroy() {
        this._revoke();
    }

    set src(media) {
    }

    get src() {
        return 'aaaaa';
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
                // this.onContentResumeRequested_();
            }
        }
    }

    _error(e) {
        console.error(`Ad error: ${e.getError().toString()}`);
        if (this.adsManager) {
            this.adsManager.destroy();
        }
        // this.application_.resumeAfterAd();
    }

    // _revoke() {
    //
    // }

    _start(manager) {
        // Attach the pause/resume events.
        manager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
            // this.onContentPauseRequested_,
            false
        );
        manager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
            // this.onContentResumeRequested_
        );
        // Handle errors.
        manager.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this._error.bind(this)
        );

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

        manager.init(
            (<HTMLElement>this.element.parentNode).offsetWidth,
            (<HTMLElement>this.element.parentNode).offsetHeight,
            google.ima.ViewMode.NORMAL
        );

        manager.start();
    }
}

export default Ads;
