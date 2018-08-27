import Media from '../media';
import { IS_ANDROID, IS_IOS } from '../utils/constants';
import { addEvent } from '../utils/events';
import { loadScript } from '../utils/general';
import { isAutoplaySupported } from '../utils/media';

declare const google: any;

/**
 * Ads Media.
 *
 * @description This class implements Google IMA SDK v3.0 to display VAST and VPAID advertisements
 * @see https://developers.google.com/interactive-media-ads/
 * @class Ads
 */
class Ads {
    /**
     * Flag to indicate when player has finished playing all Ads.
     *
     * Type of Ads could be: pre-roll, mid-roll, post-roll or combination of them.
     * @type boolean
     * @memberof Ads
     */
    public adsEnded: boolean = false;

    /**
     * Flag to indicate that individual Ad has been played.
     *
     * @type boolean
     * @memberof Ads
     */
    public adsDone: boolean = false;

    /**
     * Flag to indicate that current Ad is being played.
     *
     * @type boolean
     * @memberof Ads
     */
    public adsActive: boolean = false;

    /**
     * Flag to indicate that Ads are ready to being played.
     *
     * @type boolean
     * @memberof Ads
     */
    public adsStarted: boolean = false;

    /**
     * Element to present changes in current time while Ad is being played.
     *
     * @type number
     * @memberof Ads
     */
    public intervalTimer: number = 0;

    /**
     * Store the current Ad's volume level.
     *
     * @type number
     * @memberof Ads
     */
    public adsVolume: number;

    /**
     * Flag to indicate if Ad is currently muted or not.
     *
     * @type boolean
     * @memberof Ads
     */
    public adsMuted: boolean = false;

    /**
     * Store the current Ad's duration.
     *
     * @type number
     * @memberof Ads
     */
    public adsDuration: number = 0;

    /**
     * Store the current Ad's current time position to be passed in the `timeupdate` event.
     *
     * @type number
     * @memberof Ads
     */
    public adsCurrentTime: number = 0;

    /**
     * Object which handles playing ads after they've been received from the server.
     *
     * @see https://tinyurl.com/ybjas4ut
     * @type google.ima.AdsManager
     * @memberof Ads
     */
    public adsManager: any = null;

    /**
     * Instance of Media object to execute actions once Ad has ended/skipped.
     *
     * @type Media
     * @memberof Ads
     */
    private media: Media;

    /**
     * Native video/audio tag to execute native events.
     *
     * @type HTMLMediaElement
     * @memberof Ads
     */
    private element: HTMLMediaElement;

    /**
     * List of IMA SDK events to be executed.
     *
     * @type string[]
     * @memberof Ads
     */
    private events: string[];

    /**
     * The VAST/VPAID URL to play Ads.
     *
     * @type string
     * @memberof Ads
     */
    private adsUrl: string;

    /**
     * Promise to start all IMA SDK elements, once the library has been loaded.
     *
     * @type Promise<any>
     * @memberof Ads
     */
    private promise: Promise<any>;

    /**
     * Object which allows to request ads from ad servers or a dynamic ad insertion stream.
     *
     * @see https://tinyurl.com/ycwp4ufd
     * @type google.ima.AdsLoader
     * @memberof Ads
     */
    private adsLoader: any;

    /**
     * Element in which Ads will be created.
     *
     * @type HTMLDivElement
     * @memberof Ads
     */
    private adsContainer: HTMLDivElement;

    /**
     * Container to display Ads.
     *
     * @see https://tinyurl.com/ya3zksso
     * @type google.ima.adDisplayContainer
     * @memberof Ads
     */
    private adDisplayContainer: any;

    /**
     * Object containing the data used to request ads from the server.
     *
     * @see https://tinyurl.com/ya8bxjf4
     * @type google.ima.adsRequest
     * @memberof Ads
     */
    private adsRequest: any;

    /**
     * Flag to indicate if Ad can be played via `autoplay` attribute.
     *
     * @type boolean
     * @memberof Ads
     */
    private autoplayAllowed: boolean = false;

    /**
     * Flag to indicate if Ad can autoplayed while muted.
     *
     * @type boolean
     * @memberof Ads
     */
    private autoplayRequiresMuted: boolean = false;

    /**
     * Flag to indicate if Ad should be played automatically
     *
     * @type boolean
     * @memberof Ads
     */
    private autoStart: boolean = false;

    /**
     * Create an instance of Ads.
     *
     * @param {Media} media
     * @param {string} adsUrl
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(media: Media, adsUrl: string, autoStart?: boolean) {
        this.adsUrl = adsUrl;
        this.media = media;
        this.element = media.element;
        this.autoStart = autoStart || false;

        const originalVolume = this.element.volume;
        this.adsVolume = IS_IOS ? 0 : originalVolume;
        this.adsMuted = IS_IOS ? true : this.adsMuted;

        // Test browser capabilities to autoplay Ad if `autoStart` is flagged as true
        if (this.autoStart === true) {
            isAutoplaySupported(autoplay => {
                this.autoplayAllowed = autoplay;
            }, muted => {
                this.autoplayRequiresMuted = muted;
            }, () => {
                if (this.autoplayRequiresMuted || IS_IOS) {
                    this.adsMuted = true;
                    this.media.muted = true;
                    this.adsVolume = 0;
                    this.media.volume = 0;

                    const e = addEvent('volumechange');
                    this.element.dispatchEvent(e);

                    // Insert element to unmute if browser allows autoplay with muted media
                    const volumeEl = document.createElement('div');
                    const action = IS_IOS || IS_ANDROID ? 'Tap' : 'Click';
                    volumeEl.className = 'om-player__unmute';
                    volumeEl.innerHTML = `<span>${action} to unmute</span>`;

                    volumeEl.addEventListener('click', () => {
                        this.adsMuted = false;
                        this.media.muted = false;
                        this.adsVolume = originalVolume;
                        this.media.volume = originalVolume;

                        const event = addEvent('volumechange');
                        this.element.dispatchEvent(event);

                        // Remove element
                        volumeEl.remove();
                    });

                    const target = this.element.parentElement;
                    target.insertBefore(volumeEl, target.firstChild);
                }

                this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
                    loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') :
                    new Promise(resolve => {
                        resolve();
                    });

                this.promise.then(this.load.bind(this));
            });
        } else {
            this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
                loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') :
                new Promise(resolve => {
                    resolve();
                });

            this.promise.then(this.load.bind(this));
        }

        return this;
    }

    /**
     * Create the Ads container and loader to process the Ads URL provided.
     *
     * @memberof Ads
     */
    public load(): void {
        this.adsContainer = document.createElement('div');
        this.adsContainer.id = 'om-ads';
        this.adsContainer.tabIndex = -1;
        this.element.parentElement.insertBefore(this.adsContainer, this.element.nextSibling);

        // Create responsive ad
        window.addEventListener('resize', this.resizeAds.bind(this));

        this._setup();
        this._requestAds();
    }

    /**
     * Start playing/resume Ad if `adsManager` is active.
     *
     * @memberof Ads
     */
    public play(): void {
        if (!this.adsDone) {
            this.adsDone = true;
            this.adDisplayContainer.initialize();
            this._playAds();
        } else if (this.adsManager) {
            this.adsActive = true;
            this.adsManager.resume();
            const e = addEvent('play');
            this.element.dispatchEvent(e);

            const event = addEvent('playing');
            this.element.dispatchEvent(event);
        }
    }

    /**
     * Pause Ad if `adsManager` is active.
     *
     * @memberof Ads
     */
    public pause(): void {
        if (this.adsManager) {
            this.adsActive = false;
            this.adsManager.pause();
            const e = addEvent('pause');
            this.element.dispatchEvent(e);
        }
    }

    /**
     * Execute any callbacks to destroy Ads.
     *
     * @memberof Ads
     */
    public destroy(): void {
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

        this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
        window.removeEventListener('resize', this.resizeAds.bind(this));
        this.adsContainer.remove();
    }

    /**
     * Change dimensions of Ad.
     *
     * @param {?number} width       The new width of the Ad's container.
     * @param {?number} height      The new height of the Ad's container.
     * @param {?string} transform   CSS `transform` property to align Ad if `fill` mode is enabled.
     * @memberof Ads
     */
    public resizeAds(width?: number, height?: number, transform?: string): void {
        let timeout;
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }

        timeout = window.requestAnimationFrame(() => {
            if (this.adsManager) {
                const target = this.element;
                if (width && height) {
                    const mode = target.getAttribute('data-fullscreen') === 'true' ?
                        google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;
                    this.adsManager.resize(
                        width,
                        height,
                        mode,
                    );
                } else {
                    this.adsManager.resize(
                        target.offsetWidth,
                        target.offsetHeight,
                        google.ima.ViewMode.NORMAL,
                    );
                }

                if (transform) {
                    this.adsContainer.style.transform = transform;
                    this.adsContainer.style.webkitTransform = transform;
                }
            }
        });
    }

    /**
     * Set the current Ad's volume level.
     *
     * @memberof Ads
     */
    set volume(value: number) {
        this.adsVolume = value;
        this.adsManager.setVolume(value);
        this.media.volume = value;
        this.media.muted = (value === 0);
        this.adsMuted = (value === 0);
    }

    /**
     * Retrieve current Ad's volume level.
     *
     * @returns {number}
     * @memberof Ads
     */
    get volume(): number {
        return this.adsVolume;
    }

    /**
     * Set the current Ad's muted status.
     *
     * @memberof Ads
     */
    set muted(value: boolean) {
        if (value === true) {
            this.adsManager.setVolume(0);
            this.adsMuted = true;
            this.media.muted = true;
            this.media.volume = 0;
        } else {
            this.adsManager.setVolume(this.adsVolume);
            this.adsMuted = false;
            this.media.muted = false;
            this.media.volume = this.adsVolume;
        }
    }

    /**
     * Retrieve the current Ad's muted status.
     *
     * @returns {boolean}
     * @memberof Ads
     */
    get muted(): boolean {
        return this.adsMuted;
    }

    /**
     * Set the current Ad's current time position.
     *
     * @memberof Ads
     */
    set currentTime(value: number) {
        this.adsCurrentTime = value;
    }

    /**
     * Retrieve the current Ad's current time position.
     *
     * @returns {number}
     * @memberof Ads
     */
    get currentTime(): number {
        return this.adsCurrentTime;
    }

    /**
     * Retrieve the current Ad's duration.
     *
     * @returns {number}
     * @memberof Ads
     */
    get duration(): number {
        return this.adsDuration;
    }

    /**
     * Retrieve the current Ad's paused status.
     *
     * @returns {boolean}
     * @memberof Ads
     */
    get paused(): boolean {
        return !this.adsActive;
    }

    /**
     * Retrieve the current Ad's ended status.
     *
     * @returns {boolean}
     * @memberof Ads
     */
    get ended(): boolean {
        return this.adsEnded;
    }

    /**
     * Dispatch IMA SDK's events via OpenPlayer.
     *
     * @param {any} event
     * @memberof Ads
     */
    private _assign(event: any): void {
        const ad = event.getAd();
        switch (event.type) {
            case google.ima.AdEvent.Type.LOADED:
                if (!ad.isLinear()) {
                    this._onContentResumeRequested();
                } else {
                    if (!this.media.paused) {
                        this.media.pause();
                    }
                    this.element.parentElement.classList.add('om-ads--active');
                    this.adsDuration = ad.getDuration();
                    this.adsCurrentTime = ad.getDuration();

                    const loadedEvent = addEvent('loadedmetadata');
                    this.element.dispatchEvent(loadedEvent);

                    const resizeEvent = addEvent('resize');
                    window.dispatchEvent(resizeEvent);
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                if (ad.isLinear()) {
                    this.adsActive = true;
                    const playEvent = addEvent('play');
                    this.element.dispatchEvent(playEvent);

                    if (this.media.ended) {
                        this.adsEnded = false;
                        const endEvent = addEvent('adsended');
                        this.element.dispatchEvent(endEvent);
                    }

                    this.intervalTimer = window.setInterval(() => {
                        if (this.adsActive === true) {
                            this.adsCurrentTime = Math.round(this.adsManager.getRemainingTime());
                            const timeEvent = addEvent('timeupdate');
                            this.element.dispatchEvent(timeEvent);
                        }
                    }, 250);
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
            case google.ima.AdEvent.Type.SKIPPED:
                if (ad.isLinear()) {
                    this.element.parentElement.classList.remove('om-ads--active');
                    this.adsActive = false;
                    clearInterval(this.intervalTimer);
                }
                break;
            case google.ima.AdEvent.Type.VOLUME_CHANGED:
            case google.ima.AdEvent.Type.VOLUME_MUTED:
                if (ad.isLinear()) {
                    const volumeEvent = addEvent('volumechange');
                    this.element.dispatchEvent(volumeEvent);
                }
                break;
            case google.ima.AdEvent.ALL_ADS_COMPLETED:
                if (ad.isLinear()) {
                    this.adsActive = false;
                    this.adsEnded = true;
                    this.element.parentElement.classList.remove('om-ads--active');
                }
                break;
        }
    }

    /**
     * Dispatch an IMA SDK error that will destroy the Ads instance and resume original media.
     *
     * @param {any} event
     * @memberof Ads
     */
    private _error(event: any): void {
        console.error(`Ad error: ${event.getError().toString()}`);
        if (this.adsManager) {
            this.adsManager.destroy();
        }
        if (this.autoStart === true || this.adsStarted === true) {
            this.adsActive = false;
            this._resumeMedia();
        }
    }

    /**
     * Callback to be executed once IMA SDK manager is loaded.
     *
     * @param {any} adsManagerLoadedEvent
     * @memberof Ads
     */
    private _loaded(adsManagerLoadedEvent: any): void {
        const adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
        // Get the ads manager.
        this.adsManager = adsManagerLoadedEvent.getAdsManager(this.element, adsRenderingSettings);
        this._start(this.adsManager);
    }

    /**
     * Callback to be executed to start playing Ad.
     *
     * @param {any} manager
     * @memberof Ads
     */
    private _start(manager: any): void {
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

        if (this.autoStart === true) {
            this._playAds();
        } else {
            this.adDisplayContainer.initialize();
            this.adsStarted = true;
        }
    }

    /**
     * Callback to be executed once the Ad has ended.
     *
     * @memberof Ads
     */
    private _contentEndedListener(): void {
        this.adsEnded = true;
        this.adsActive = false;
        this.adsStarted = false;
        this.adsLoader.contentComplete();
    }

    /**
     * Callback to be executed once the Ad has been paused.
     *
     * @memberof Ads
     */
    private _onContentPauseRequested(): void {
        this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
        if (this.adsStarted) {
            this.media.pause();
        } else {
            this.adsStarted = true;
        }
        const e = addEvent('play');
        this.element.dispatchEvent(e);
    }

    /**
     * Callback to be executed once the Ad has been resumed.
     *
     * @memberof Ads
     */
    private _onContentResumeRequested(): void {
        this.element.addEventListener('ended', this._contentEndedListener.bind(this));
        this._resumeMedia();
    }

    /**
     * Callback to resume original media.
     *
     * This can happen when Ad is being skipped or has ended.
     * @memberof Ads
     */
    private _resumeMedia(): void {
        this.intervalTimer = 0;
        this.adsMuted = false;
        this.adsStarted = false;
        this.adsDuration = 0;
        this.adsCurrentTime = 0;
        this.element.parentElement.classList.remove('om-ads--active');

        if (!this.media.ended) {
            setTimeout(() => {
                this.media.play();
                const playEvent = addEvent('play');
                this.element.dispatchEvent(playEvent);
            }, 500);
        } else {
            const event = addEvent('ended');
            this.element.dispatchEvent(event);
        }
    }

    /**
     * Setup final attributes to the Ad before playing it, which include initial dimensions and capabilities
     * to autoplay Ad or not.
     *
     * @memberof Ads
     */
    private _requestAds(): void {
        if (this.adsLoader) {
            this.adsLoader.contentComplete();
        }
        this.adsRequest = new google.ima.AdsRequest();
        this.adsRequest.adTagUrl = this.adsUrl;

        const width = this.element.parentElement.offsetWidth;
        const height = this.element.parentElement.offsetWidth;
        this.adsRequest.linearAdSlotWidth = width;
        this.adsRequest.linearAdSlotHeight = height;
        this.adsRequest.nonLinearAdSlotWidth = width;
        this.adsRequest.nonLinearAdSlotHeight = 150;

        this.adsRequest.setAdWillAutoPlay(this.autoplayAllowed);
        this.adsRequest.setAdWillPlayMuted(this.autoplayRequiresMuted);
        this.adsLoader.requestAds(this.adsRequest);
    }

    /**
     * Prepare container and request loader so Ads can be played.
     *
     * @memberof Ads
     */
    private _setup(): void {
        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
        this.adDisplayContainer =
            new google.ima.AdDisplayContainer(
                this.adsContainer,
                this.element,
            );

        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
        this.adsLoader.getSettings().setDisableCustomPlaybackForIOS10Plus(true);
        this.adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this._loaded.bind(this),
        );
        this.adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this._error.bind(this),
        );

        this.element.addEventListener('ended', this._contentEndedListener.bind(this));
    }

    /**
     * Internal callback to start playing Ads or resume media if error is detected.
     *
     * @memberof Ads
     */
    private _playAds(): void {
        try {
            if (!this.adsDone) {
                this.adsDone = true;
                this.adDisplayContainer.initialize();
            }
            // Initialize the ads manager. Ad rules playlist will start at this time.
            this.adsManager.init(
                this.element.offsetWidth,
                this.element.offsetHeight,
                google.ima.ViewMode.NORMAL,
            );
            this.adsManager.start();
            const e = addEvent('play');
            this.element.dispatchEvent(e);

            const event = addEvent('playing');
            this.element.dispatchEvent(event);
            this.adsActive = true;
            this.adsStarted = true;
        } catch (adError) {
            this._resumeMedia();
        }
    }
}

export default Ads;
