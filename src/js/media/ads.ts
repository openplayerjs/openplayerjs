import Options from '../interfaces/ads/options';
import Source from '../interfaces/source';
import Media from '../media';
import Player from '../player';
import { IS_ANDROID, IS_IOS, IS_IPHONE } from '../utils/constants';
import { addEvent } from '../utils/events';
import { isVideo, isXml, loadScript, removeElement } from '../utils/general';

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
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Captions
     */
    private player: Player;

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
    private events: string[] = [];

    /**
     * The VAST/VPAID URL to play Ads.
     *
     * @type string|string[]
     * @memberof Ads
     */
    private ads: string | string[];

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
    private adsContainer?: HTMLDivElement;

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
     * Flag to indicate if Ad should be played automatically with sound
     *
     * @type boolean
     * @memberof Ads
     */
    private autoStart: boolean = false;

    /**
     * Flag to indicate if Ad should be played automatically without sound
     *
     * @private
     * @type {boolean}
     * @memberof Ads
     */
    private autoStartMuted: boolean = false;

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
     * @type Options
     * @memberof Ads
     */
    private adsOptions: Options;

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

    /**
     *
     *
     * @private
     * @type {*}
     * @memberof Ads
     */
    private preloadContent: any;

    /**
     * Timer to update media's `currentTime`
     *
     * @private
     * @type number
     * @memberof Ads
     */
    private lastTimePaused: number = 0;

    /**
     * List of media sources from the `media` element.
     *
     * @private
     * @type Source[]
     * @memberof Ads
     */
    private mediaSources: Source[] = [];

    /**
     * Flag to execute `loadedmetadata` and `resize` once.
     *
     * @private
     * @type boolean
     * @memberof Ads
     */
    private mediaStarted: boolean = false;

    /**
     * Create an instance of Ads.
     *
     * @param {Player} player
     * @param {string|string[]} ads
     * @param {any} labels
     * @param {boolean} autoStart
     * @param {Options} options
     * @returns {Ads}
     * @memberof Ads
     */
    constructor(player: Player, ads: string | string[], autoStart?: boolean, autoStartMuted?: boolean, options?: Options) {
        const defaultOpts = {
            autoPlayAdBreaks: true,
            debug: false,
            loop: false,
            numRedirects: 4,
            sdkPath: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
            src: [],
        };
        this.player = player;
        this.ads = ads;
        this.media = player.getMedia();
        this.element = player.getElement();
        this.autoStart = autoStart || false;
        this.autoStartMuted = autoStartMuted || false;
        this.adsOptions = { ...defaultOpts, ...options };
        this.playTriggered = false;
        this.originalVolume = this.element.volume;
        this.adsVolume = this.originalVolume;

        const path = this.adsOptions.debug ? this.adsOptions.sdkPath.replace(/(\.js$)/, '_debug.js') : this.adsOptions.sdkPath;
        this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
            loadScript(path) : new Promise(resolve => resolve());

        this.promise.then(this.load.bind(this));
        return this;
    }

    /**
     * Create the Ads container and loader to process the Ads URL provided.
     *
     * @param {bool} force
     * @memberof Ads
     */
    public load(force: boolean = false): void {

        /**
         * If we have set `autoPlayAdBreaks` to false and haven't set the
         * force flag, don't load ads yet
         */
        if (!this.adsOptions.autoPlayAdBreaks && !force) {
            return;
        }

        /**
         * Check for an existing ad container div and destroy it to avoid
         * clickable areas of subsequent ads being blocked by old DIVs
         */
        const existingContainer = document.getElementById('op-ads');
        if (existingContainer && existingContainer.parentNode) {
            existingContainer.parentNode.removeChild(existingContainer);
        }

        this.adsStarted = true;
        this.adsContainer = document.createElement('div');
        this.adsContainer.id = 'op-ads';
        this.adsContainer.tabIndex = -1;
        if (this.element.parentElement) {
            this.element.parentElement.insertBefore(this.adsContainer, this.element.nextSibling);
        }
        this.mediaSources = this.media.src;

        google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
        google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
        google.ima.settings.setAutoPlayAdBreaks(this.adsOptions.autoPlayAdBreaks);
        google.ima.settings.setNumRedirects(this.adsOptions.numRedirects);

        this.adDisplayContainer =
            new google.ima.AdDisplayContainer(
                this.adsContainer,
                this.element,
            );

        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
        this.adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this._loaded.bind(this),
        );

        this.adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this._error.bind(this),
        );

        // Create responsive ad
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => { this.resizeAds.bind(this); });
        }
        this.element.addEventListener('loadedmetadata', () => { this.resizeAds.bind(this); });

        // Request Ads automatically if `autoplay` was set
        if (this.autoStart === true || this.autoStartMuted === true || force === true) {
            if (!this.adsDone) {
                this.adsDone = true;
                this.adDisplayContainer.initialize();
            }
            this._requestAds();
        }
    }

    /**
     * Start playing/resume Ad if `adsManager` is active.
     *
     * @memberof Ads
     */
    public play(): Promise<void> {
        const play = (): void => {
            if (!this.adsDone) {
                this._initNotDoneAds();
                return;
            }

            if (this.adsManager) {
                this.adsActive = true;
                this.adsManager.resume();
                const e = addEvent('play');
                this.element.dispatchEvent(e);
            }
        };

        return new Promise(resolve => {
            resolve();
        }).then(play);
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

        const controls = this.player.getControls();
        const mouseEvents = controls ? controls.events.mouse : {};
        Object.keys(mouseEvents).forEach((event: string) => {
            if (this.adsContainer) {
                this.adsContainer.removeEventListener(event, mouseEvents[event]);
            }
        });

        if (this.adsLoader) {
            this.adsLoader.removeEventListener(
                google.ima.AdErrorEvent.Type.AD_ERROR,
                this._error.bind(this),
            );
            this.adsLoader.removeEventListener(
                google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                this._loaded.bind(this),
            );
        }

        const destroy = !Array.isArray(this.ads) || this.currentAdsIndex > this.ads.length;
        if (this.adsManager && destroy) {
            this.adsManager.destroy();
        }

        if (IS_IOS || IS_ANDROID) {
            this.element.removeEventListener('loadedmetadata', this._contentLoadedAction.bind(this));
        }
        this.element.removeEventListener('loadedmetadata', () => { this.resizeAds.bind(this); });
        this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', () => { this.resizeAds.bind(this); });
        }
        removeElement(this.adsContainer);
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

            if (timeout && typeof window !== 'undefined') {
                window.cancelAnimationFrame(timeout);
            }
            if (typeof window !== 'undefined') {
                timeout = window.requestAnimationFrame(() => {
                    this.adsManager.resize(
                        width || target.offsetWidth,
                        height || target.offsetHeight,
                        mode,
                    );
                });
            }
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
                    if (IS_IPHONE && isVideo(this.element)) {
                        this.element.controls = false;
                    }
                    this.adsDuration = ad.getDuration();
                    this.adsCurrentTime = ad.getDuration();
                    if (!this.mediaStarted && !IS_IOS && !IS_ANDROID) {
                        const waitingEvent = addEvent('waiting');
                        this.element.dispatchEvent(waitingEvent);

                        const loadedEvent = addEvent('loadedmetadata');
                        this.element.dispatchEvent(loadedEvent);

                        this.resizeAds();
                    }
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                if (ad.isLinear()) {
                    if (this.element.parentElement && !this.element.parentElement.classList.contains('op-ads--active')) {
                        this.element.parentElement.classList.add('op-ads--active');
                    }

                    if (!this.media.paused) {
                        this.media.pause();
                    }
                    this.adsActive = true;
                    const playEvent = addEvent('play');
                    this.element.dispatchEvent(playEvent);
                    let resized;

                    if (!resized) {
                        this.resizeAds();
                        resized = true;
                    }

                    if (this.media.ended) {
                        this.adsEnded = false;
                        const endEvent = addEvent('adsmediaended');
                        this.element.dispatchEvent(endEvent);
                    }

                    if (typeof window !== 'undefined') {
                        this.intervalTimer = window.setInterval(() => {
                            if (this.adsActive === true) {
                                this.adsCurrentTime = Math.round(this.adsManager.getRemainingTime());
                                const timeEvent = addEvent('timeupdate');
                                this.element.dispatchEvent(timeEvent);
                            }
                        }, 350);
                    }
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
            case google.ima.AdEvent.Type.SKIPPED:
                if (ad.isLinear()) {
                    if (event.type === google.ima.AdEvent.Type.SKIPPED) {
                        const skipEvent = addEvent('adsskipped');
                        this.element.dispatchEvent(skipEvent);
                    }

                    if (this.element.parentElement) {
                        this.element.parentElement.classList.remove('op-ads--active');
                    }
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
            case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
                if (ad.isLinear()) {
                    this.adsActive = false;
                    this.adsEnded = true;
                    this.intervalTimer = 0;
                    this.adsMuted = false;
                    this.adsStarted = false;
                    this.adsDuration = 0;
                    this.adsCurrentTime = 0;
                    if (this.element.parentElement) {
                        this.element.parentElement.classList.remove('op-ads--active');
                    }
                    this.destroy();
                    if (this.element.currentTime >= this.element.duration) {
                        const endedEvent = addEvent('ended');
                        this.element.dispatchEvent(endedEvent);
                    }
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
        const error = event.getError();
        const details = {
            detail: {
                data: error,
                message: error.toString(),
                type: 'Ads',
            },
        };
        const errorEvent = addEvent('playererror', details);
        this.element.dispatchEvent(errorEvent);

        // @see https://support.google.com/admanager/answer/4442429?hl=en
        const fatalErrorCodes = [
            100, 101, 102, 300, 301, 302, 303, 400, 401, 402, 403, 405,
            406, 407, 408, 409, 410, 500, 501, 502, 503, 900, 901, 1005,
        ];

        if (Array.isArray(this.ads) && this.ads.length > 1 && this.currentAdsIndex <= this.ads.length - 1) {
            if (this.currentAdsIndex < this.ads.length - 1) {
                this.currentAdsIndex++;
            }
            this.playTriggered = true;
            this.adsStarted = true;
            this.adsDone = false;
            this.destroy();
            this.load(true);
            console.warn(`Ad warning: ${error.toString()}`);
        } else {
            // Unless there's a fatal error, do not destroy the Ads manager
            if (this.adsManager && fatalErrorCodes.indexOf(error.getErrorCode()) > -1) {
                this.adsManager.destroy();
                console.error(`Ad error: ${error.toString()}`);
            } else {
                console.warn(`Ad warning: ${error.toString()}`);
            }

            const unmuteEl = this.element.parentElement ? this.element.parentElement.querySelector('.op-player__unmute') : null;
            if (unmuteEl) {
                removeElement(unmuteEl);
            }
            if (this.autoStart === true || this.autoStartMuted === true || this.adsStarted === true) {
                this.adsActive = false;
                // Sometimes, due to pre-fetch issues, Ads could report an error, but the SDK is able to
                // play Ads, so check if src was set to determine what action to take
                if (this.element.src) {
                    this.media.play();
                } else {
                    this._resumeMedia();
                }
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

        if (!this.adsOptions.autoPlayAdBreaks) {
            // Add it to the events array so it gets removed onDestroy
            this.events.push(google.ima.AdEvent.Type.AD_BREAK_READY);
        }

        const controls = this.player.getControls();
        const mouseEvents = controls ? controls.events.mouse : {};
        Object.keys(mouseEvents).forEach((event: string) => {
            if (this.adsContainer) {
                this.adsContainer.addEventListener(event, mouseEvents[event]);
            }
        });
        this.events.forEach(event => {
            manager.addEventListener(event, this._assign.bind(this));
        });

        if (this.autoStart === true || this.playTriggered === true) {
            this.playTriggered = false;
            if (!this.adsDone) {
                this._initNotDoneAds();
                return;
            }
            manager.init(
                this.element.offsetWidth,
                this.element.offsetHeight,
                this.element.parentElement && this.element.parentElement.getAttribute('data-fullscreen') === 'true' ?
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
     * Resume Ads if not done
     *
     * @memberof Ads
     */
    private _initNotDoneAds(): void {
        this.adsDone = true;
        this.adDisplayContainer.initialize();
        if (IS_IOS || IS_ANDROID) {
            this.preloadContent = this._contentLoadedAction;
            this.element.addEventListener('loadedmetadata', this._contentLoadedAction.bind(this));
            this.element.load();
        } else {
            this._contentLoadedAction();
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
     * @private
     * @memberof Ads
     */
    private _onContentResumeRequested(): void {
        if (this.adsOptions.loop) {
            this.destroy();
            this.adsLoader.contentComplete();
            this.playTriggered = true;
            this.adsStarted = true;
            this.adsDone = false;
            this.load(true);
        } else {
            this.element.addEventListener('ended', this._contentEndedListener.bind(this));
            this.element.addEventListener('loadedmetadata', this._loadedMetadataHandler.bind(this));
            if (IS_IOS || IS_ANDROID) {
                this.media.src = this.mediaSources;
                this.media.load();
                this._prepareMedia();
                if (this.element.parentElement) {
                    this.element.parentElement.classList.add('op-ads--active');
                }
            } else {
                const event = addEvent('loadedmetadata');
                this.element.dispatchEvent(event);
            }
        }
    }

    /**
     * Update the current time to mimic the default Ad Playback.
     *
     * @private
     * @memberof Ads
     */
    private _loadedMetadataHandler() {
        if (Array.isArray(this.ads)) {
            this.currentAdsIndex++;
            if (this.currentAdsIndex <= this.ads.length - 1) {
                if (this.adsManager) {
                    this.adsManager.destroy();
                }
                this.adsLoader.contentComplete();
                this.playTriggered = true;
                this.adsStarted = true;
                this.adsDone = false;
                this._requestAds();
            } else {
                if (!this.adsOptions.autoPlayAdBreaks) {
                    this._resetAdsAfterManualBreak();
                }
                this._prepareMedia();
            }
        } else if (this.element.seekable.length) {
            if (this.element.seekable.end(0) > this.lastTimePaused) {
                if (!this.adsOptions.autoPlayAdBreaks) {
                    this._resetAdsAfterManualBreak();
                }
                this._prepareMedia();
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
        if (this.element.parentElement) {
            this.element.parentElement.classList.remove('op-ads--active');
        }

        const triggerEvent = (eventName: string): void => {
            const event = addEvent(eventName);
            this.element.dispatchEvent(event);
        };

        const waitPromise = (ms: number, isReject: boolean) => new Promise((resolve, reject) => {
            if (isReject) {
                return reject();
            }
            setTimeout(resolve, ms);
        });

        waitPromise(50, this.media.ended)
            .then(() => this.media.play().then(() => triggerEvent('play')))
            .catch(() => triggerEvent('ended'));
    }

    /**
     * Setup final attributes to the Ad before playing it, which include initial dimensions and capabilities
     * to autoplay Ad or not.
     *
     * @memberof Ads
     */
    private _requestAds(): void {
        this.adsRequest = new google.ima.AdsRequest();
        const ads = Array.isArray(this.ads) ? this.ads[this.currentAdsIndex] : this.ads;

        if (isXml(ads)) {
            this.adsRequest.adsResponse = ads;
        } else {
            this.adsRequest.adTagUrl = ads;
        }

        const width = this.element.parentElement ? this.element.parentElement.offsetWidth : 0;
        const height = this.element.parentElement ? this.element.parentElement.offsetHeight : 0;
        this.adsRequest.linearAdSlotWidth = width;
        this.adsRequest.linearAdSlotHeight = height;
        this.adsRequest.nonLinearAdSlotWidth = width;
        this.adsRequest.nonLinearAdSlotHeight = height / 3;
        this.adsRequest.setAdWillAutoPlay(this.autoStart);
        this.adsRequest.setAdWillPlayMuted(this.autoStartMuted);
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

    /**
     * Reset Ads Player after manual ad break.
     *
     * If we have set `autoPlayAdBreaks` to `false`, destroy the adsManager to prevent post rolls
     * and reset the SDK.
     * https://developers.google.com/interactive-media-ads/docs/sdks/html5/faq#8
     *
     * @memberof Ads
     */
    private _resetAdsAfterManualBreak() {
        if (this.adsManager) {
            this.adsManager.destroy();
        }
        this.adsLoader.contentComplete();
        this.adsDone = false;
        this.playTriggered = true;
    }

    /**
     * Remove event for `loadedmetadata` and set the player to resume regular media.
     *
     * @memberof Ads
     */
    private _prepareMedia() {
        this.media.currentTime = this.lastTimePaused;
        this.element.removeEventListener('loadedmetadata', this._loadedMetadataHandler.bind(this));
        this._resumeMedia();
    }
}

export default Ads;
