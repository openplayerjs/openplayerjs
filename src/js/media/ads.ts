import AdsOptions from '../interfaces/ads-options';
import Source from '../interfaces/source';
import Media from '../media';
import { IS_ANDROID, IS_IOS, IS_IPHONE } from '../utils/constants';
import { addEvent } from '../utils/events';
import { isVideo, loadScript } from '../utils/general';
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
     * @type string|string[]
     * @memberof Ads
     */
    private ads: string|string[];

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
     * Flag to indicate if player requested play.
     *
     * This will help if the play was triggered before Ads were ready.
     * @private
     * @type boolean
     * @memberof Ads
     */
    private playTriggered: boolean = false;

    /**
     * Configuration elements passed to Ads, including IMA SDK location
     *
     * @private
     * @type AdsOptions
     * @memberof Ads
     */
    private adsOptions: AdsOptions;

    /**
     * Current Ad; used when passing a list of Ads
     *
     * @private
     * @type number
     * @memberof Ads
     */
    private currentAdsIndex: number = 0;

    /**
     * Store original volume from media.
     *
     * @private
     * @type number
     * @memberof Ads
     */
    private originalVolume: number;

    private preloadContent: any;

    private lastTimePaused: number = 0;

    private mediaSources: Source[];

    private mediaStarted: boolean = false;

    /**
     * Create an instance of Ads.
     *
     * @param {Media} media
     * @param {string} ads
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(media: Media, ads: string|string[], autoStart?: boolean, options?: AdsOptions) {
        this.ads = ads;
        this.media = media;
        this.element = media.element;
        this.autoStart = autoStart || false;
        this.adsOptions = options;
        if (!this.adsOptions) {
            this.adsOptions = {
                url: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
            };
        }

        this.playTriggered = false;

        this.originalVolume = this.element.volume;
        this.adsVolume = this.originalVolume;

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

                    const volumeEl = document.createElement('div');
                    const action = IS_IOS || IS_ANDROID ? 'Tap' : 'Click';
                    volumeEl.className = 'om-player__unmute';
                    volumeEl.innerHTML = `<span>${action} to unmute</span>`;
                    volumeEl.addEventListener('click', () => {
                        this.adsMuted = false;
                        this.media.muted = false;
                        this.adsVolume = this.originalVolume;
                        this.media.volume = this.originalVolume;
                        this.adsManager.setVolume(this.originalVolume);

                        const event = addEvent('volumechange');
                        this.element.dispatchEvent(event);

                        // Remove element
                        volumeEl.remove();
                    });

                    const target = this.element.parentElement;
                    target.insertBefore(volumeEl, target.firstChild);
                }

                this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
                    loadScript(this.adsOptions.url) :
                    new Promise(resolve => resolve());

                this.promise.then(this.load.bind(this));
            });
        } else {
            this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
                loadScript(this.adsOptions.url) :
                new Promise(resolve => resolve());

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
        this.adsStarted = true;
        this.adsContainer = document.createElement('div');
        this.adsContainer.id = 'om-ads';
        this.adsContainer.tabIndex = -1;
        this.element.parentElement.insertBefore(this.adsContainer, this.element.nextSibling);
        this.mediaSources = this.media.src;

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

        // Create responsive ad
        window.addEventListener('resize', this.resizeAds.bind(this));
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
            this.media.load();

            if (IS_IOS || IS_ANDROID) {
                this.preloadContent = this._contentLoadedAction;
                this.element.addEventListener(
                    'loadedmetadata',
                    this._contentLoadedAction.bind(this),
                    false);
                this.media.load();
              } else {
                this._contentLoadedAction();
              }
            return;
        }

        if (this.adsManager) {
            this.adsActive = true;
            this.adsManager.resume();
            const e = addEvent('play');
            this.element.dispatchEvent(e);
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
        if (this.events) {
            this.events.forEach(event => {
                this.adsManager.removeEventListener(event, this._assign.bind(this));
            });
        }

        this.events = [];

        this.adsLoader.removeEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this._error.bind(this),
        );
        this.adsLoader.removeEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this._loaded.bind(this),
        );

        const destroy = !Array.isArray(this.ads) || this.currentAdsIndex > this.ads.length;
        if (this.adsManager && destroy) {
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
     * @memberof Ads
     */
    public resizeAds(width?: number, height?: number): void {
        if (this.adsManager) {
            const target = this.element;
            const mode = target.getAttribute('data-fullscreen') === 'true' ?
                google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;

            let timeout;

            if (timeout) {
                window.cancelAnimationFrame(timeout);
            }
            timeout = window.requestAnimationFrame(() => {
                this.adsManager.resize(
                    width && height ? width : target.offsetWidth,
                    width && height ? height : target.offsetHeight,
                    mode,
                );
            });
        }
    }

    /**
     * Update the `playTriggered` flag
     *
     * @memberof Ads
     */
    set playRequested(value: boolean) {
        this.playTriggered = value;
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
                    if (!this.mediaStarted) {
                        const loadedEvent = addEvent('loadedmetadata');
                        this.element.dispatchEvent(loadedEvent);
                        this.mediaStarted = true;
                    }
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                if (ad.isLinear()) {
                    this.adsActive = true;
                    const playEvent = addEvent('play');
                    this.element.dispatchEvent(playEvent);

                    if (this.media.ended) {
                        this.adsEnded = false;
                        const endEvent = addEvent('adsmediaended');
                        this.element.dispatchEvent(endEvent);
                    }

                    this.intervalTimer = window.setInterval(() => {
                        if (this.adsActive === true) {
                            this.adsCurrentTime = Math.round(this.adsManager.getRemainingTime());
                            const timeEvent = addEvent('timeupdate');
                            this.element.dispatchEvent(timeEvent);
                        }
                    }, 300);
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

        // Assign events prefixed with `ads` to main element so user
        // can listen to these events
        const e = addEvent(`ads${event.type}`);
        this.element.dispatchEvent(e);
    }

    /**
     * Dispatch an IMA SDK error that will destroy the Ads instance and resume original media.
     *
     * If more than one URL for Ads was found, attempt to play it.
     *
     * @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdError.ErrorCode
     * @param {any} event
     * @memberof Ads
     */
    private _error(event: any): void {
        console.error(`Ad error: ${event.getError().toString()}`);
        if (Array.isArray(this.ads) && this.currentAdsIndex <= this.ads.length) {
            this.currentAdsIndex++;
            this.playTriggered = true;
            this.adsStarted = true;
            this.destroy();
            this.load();
        } else {
            if (this.adsManager) {
                this.adsManager.destroy();
            }
            const unmuteEl = this.element.parentElement.querySelector('.om-player__unmute');
            if (unmuteEl) {
                unmuteEl.remove();
            }
            if (this.autoStart === true || this.adsStarted === true) {
                this.adsActive = false;
                this._resumeMedia();
            }
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
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = false;
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

        if (this.autoStart === true || this.playTriggered === true) {
            this.playTriggered = false;
            manager.init(
                this.element.offsetWidth,
                this.element.offsetHeight,
                this.element.parentElement.getAttribute('data-fullscreen') === 'true' ?
                    google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL,
            );
            manager.start();
            const e = addEvent('play');
            this.element.dispatchEvent(e);
            const event = addEvent('playing');
            this.element.dispatchEvent(event);
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
        this.lastTimePaused = this.media.currentTime;

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
        this.media.src = this.mediaSources;
        this.element.addEventListener('loadedmetadata', this._loadedMetadataHandler.bind(this));
        this.media.load();
    }

    private _loadedMetadataHandler() {
        if (this.element.seekable.length) {
            if (this.element.seekable.end(0) > this.lastTimePaused) {
                this.element.currentTime = this.lastTimePaused;
                this.element.controls = !!(IS_IPHONE && isVideo(this.element));
                this.element.removeEventListener('loadedmetadata', this._loadedMetadataHandler.bind(this));
                this.media.currentTime = this.element.currentTime;
                this._resumeMedia();
            }
        } else {
            setTimeout(this._loadedMetadataHandler.bind(this), 100);
        }
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
            }, 50);
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
        this.adsRequest = new google.ima.AdsRequest();
        this.adsRequest.adTagUrl = Array.isArray(this.ads) ? this.ads[this.currentAdsIndex] : this.ads;

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
     * Internal callback to request Ads.
     *
     * @memberof Ads
     */
    private _contentLoadedAction() {
        if (this.preloadContent) {
            this.element.removeEventListener('loadedmetadata', this.preloadContent.bind(this));
            this.preloadContent = null;
        }
        this._requestAds();
    }
}

export default Ads;
