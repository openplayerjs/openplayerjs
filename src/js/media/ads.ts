import Options from '../interfaces/ads/options';
import Source from '../interfaces/source';
import Media from '../media';
import Player from '../player';
import {
    EVENT_OPTIONS, IS_ANDROID, IS_IOS, IS_IPHONE
} from '../utils/constants';
import { addEvent } from '../utils/events';
import {
    isVideo, isXml, loadScript, removeElement
} from '../utils/general';

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
    #adsEnded = false;

    /**
     * Flag to indicate that individual Ad has been played.
     *
     * @type boolean
     * @memberof Ads
     */
    #adsDone = false;

    /**
     * Flag to indicate that current Ad is being played.
     *
     * @type boolean
     * @memberof Ads
     */
    #adsActive = false;

    /**
     * Flag to indicate that Ads are ready to being played.
     *
     * @type boolean
     * @memberof Ads
     */
    #adsStarted = false;

    /**
     * Element to present changes in current time while Ad is being played.
     *
     * @type number
     * @memberof Ads
     */
    #intervalTimer = 0;

    /**
     * Store the current Ad's volume level.
     *
     * @type number
     * @memberof Ads
     */
    #adsVolume: number;

    /**
     * Flag to indicate if Ad is currently muted or not.
     *
     * @type boolean
     * @memberof Ads
     */
    #adsMuted = false;

    /**
     * Store the current Ad's duration.
     *
     * @type number
     * @memberof Ads
     */
    #adsDuration = 0;

    /**
     * Store the current Ad's current time position to be passed in the `timeupdate` event.
     *
     * @type number
     * @memberof Ads
     */
    #adsCurrentTime = 0;

    /**
     * Object which handles playing ads after they've been received from the server.
     *
     * @see https://tinyurl.com/ybjas4ut
     * @type google.ima.AdsManager
     * @memberof Ads
     */
    #adsManager: any = null;

    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Captions
     */
    #player: Player;

    /**
     * Instance of Media object to execute actions once Ad has ended/skipped.
     *
     * @type Media
     * @memberof Ads
     */
    #media: Media;

    /**
     * Native video/audio tag to execute native events.
     *
     * @type HTMLMediaElement
     * @memberof Ads
     */
    #element: HTMLMediaElement;

    /**
     * List of IMA SDK events to be executed.
     *
     * @type string[]
     * @memberof Ads
     */
    #events: string[] = [];

    /**
     * The VAST/VPAID URL to play Ads.
     *
     * @type string|string[]
     * @memberof Ads
     */
    #ads: string | string[];

    /**
     * Promise to start all IMA SDK elements, once the library has been loaded.
     *
     * @type Promise<any>
     * @memberof Ads
     */
    #promise: Promise<any>;

    /**
     * Object which allows to request ads from ad servers or a dynamic ad insertion stream.
     *
     * @see https://tinyurl.com/ycwp4ufd
     * @type google.ima.AdsLoader
     * @memberof Ads
     */
    #adsLoader: any;

    /**
     * Element in which Ads will be created.
     *
     * @type HTMLDivElement
     * @memberof Ads
     */
    #adsContainer?: HTMLDivElement;

    /**
     * Element in which Ads will render a custom click handler to track clicks.
     * This overrides the default `Learn More` button from IMA SDK
     *
     * @type HTMLDivElement
     * @memberof Ads
     */
    #adsCustomClickContainer?: HTMLDivElement;

    /**
     * Container to display Ads.
     *
     * @see https://tinyurl.com/ya3zksso
     * @type google.ima.adDisplayContainer
     * @memberof Ads
     */
    #adDisplayContainer: any;

    /**
     * Object containing the data used to request ads from the server.
     *
     * @see https://tinyurl.com/ya8bxjf4
     * @type google.ima.adsRequest
     * @memberof Ads
     */
    #adsRequest: any;

    /**
     * Flag to indicate if Ad should be played automatically with sound
     *
     * @type boolean
     * @memberof Ads
     */
    #autoStart = false;

    /**
     * Flag to indicate if Ad should be played automatically without sound
     *
     * @private
     * @type {boolean}
     * @memberof Ads
     */
    #autoStartMuted = false;

    /**
     * Flag to indicate if player requested play.
     *
     * This will help if the play was triggered before Ads were ready.
     * @private
     * @type boolean
     * @memberof Ads
     */
    #playTriggered = false;

    /**
     * Configuration elements passed to Ads, including IMA SDK location
     *
     * @private
     * @type Options
     * @memberof Ads
     */
    #adsOptions: Options;

    /**
     * Current Ad; used when passing a list of Ads
     *
     * @private
     * @type number
     * @memberof Ads
     */
    #currentAdsIndex = 0;

    /**
     * Store original volume from media.
     *
     * @private
     * @type number
     * @memberof Ads
     */
    #originalVolume: number;

    /**
     *
     *
     * @private
     * @type {*}
     * @memberof Ads
     */
    #preloadContent: any;

    /**
     * Timer to update media's `currentTime`
     *
     * @private
     * @type number
     * @memberof Ads
     */
    #lastTimePaused = 0;

    /**
     * List of media sources from the `media` element.
     *
     * @private
     * @type Source[]
     * @memberof Ads
     */
    #mediaSources: Source[] = [];

    /**
     * Flag to execute `loadedmetadata` and `resize` once.
     *
     * @private
     * @type boolean
     * @memberof Ads
     */
    #mediaStarted = false;

    loadPromise: unknown;

    loadedAd = false;

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
        const defaultOpts: Options = {
            autoPlayAdBreaks: true,
            customClick: {
                enabled: false,
                label: 'Click here for more info',
            },
            debug: false,
            enablePreloading: false,
            language: 'en',
            loop: false,
            numRedirects: 4,
            publisherId: null,
            sdkPath: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
            sessionId: null,
            src: [],
            vpaidMode: 'enabled',
        };
        this.#player = player;
        this.#ads = ads;
        this.#media = player.getMedia();
        this.#element = player.getElement();
        this.#autoStart = autoStart || false;
        this.#adsMuted = player.getElement().muted;
        this.#autoStartMuted = autoStartMuted || false;
        this.#adsOptions = { ...defaultOpts, ...options };
        if (options) {
            const objectElements = ['customClick'];
            objectElements.forEach(item => {
                this.#adsOptions[item] = options[item] && Object.keys(options[item]).length
                    ? { ...defaultOpts[item], ...options[item] }
                    : defaultOpts[item];
            });
        }
        this.#playTriggered = false;
        this.#originalVolume = this.#element.volume;
        this.#adsVolume = this.#originalVolume;

        const path = this.#adsOptions.debug && this.#adsOptions.sdkPath
            ? this.#adsOptions.sdkPath.replace(/(\.js$)/, '_debug.js')
            : this.#adsOptions.sdkPath;

        this._handleClickInContainer = this._handleClickInContainer.bind(this);
        this.load = this.load.bind(this);
        this._loaded = this._loaded.bind(this);
        this._error = this._error.bind(this);
        this._assign = this._assign.bind(this);
        this._contentLoadedAction = this._contentLoadedAction.bind(this);
        this._loadedMetadataHandler = this._loadedMetadataHandler.bind(this);
        this._contentEndedListener = this._contentEndedListener.bind(this);
        this.resizeAds = this.resizeAds.bind(this);
        this._handleResizeAds = this._handleResizeAds.bind(this);
        this._onContentPauseRequested = this._onContentPauseRequested.bind(this);
        this._onContentResumeRequested = this._onContentResumeRequested.bind(this);

        this.#promise = path && (typeof google === 'undefined' || typeof google.ima === 'undefined')
            ? loadScript(path)
            : new Promise(resolve => {
                resolve({});
            });

        this.#promise.then(this.load).catch(error => {
            let message = 'Ad script could not be loaded; please check if you have an AdBlock';
            message += 'turned on, or if you provided a valid URL is correct';
            console.error(`Ad error: ${message}.`);

            const details = {
                detail: {
                    data: error,
                    message,
                    type: 'Ads',
                },
            };
            const errorEvent = addEvent('playererror', details);
            this.#element.dispatchEvent(errorEvent);
        });
        return this;
    }

    /**
     * Create the Ads container and loader to process the Ads URL provided.
     *
     * @param {bool} force
     * @memberof Ads
     */
    public load(force = false): void {
        if (this.loadedAd) {
            return;
        }

        /**
         * If we have set `autoPlayAdBreaks` to false and haven't set the
         * force flag, don't load ads yet
         */
        if (!google && !google.ima && !this.#adsOptions.autoPlayAdBreaks && !force) {
            return;
        }

        this.loadedAd = true;

        /**
         * Check for an existing ad container div and destroy it to avoid
         * clickable areas of subsequent ads being blocked by old DIVs
         */
        const existingContainer = this.#player.getContainer().querySelector('.op-ads');
        if (existingContainer && existingContainer.parentNode) {
            existingContainer.parentNode.removeChild(existingContainer);
        }

        this.#adsStarted = true;
        this.#adsContainer = document.createElement('div');
        this.#adsContainer.className = 'op-ads';
        this.#adsContainer.tabIndex = -1;
        if (this.#element.parentElement) {
            this.#element.parentElement.insertBefore(this.#adsContainer, this.#element.nextSibling);
        }
        this.#adsContainer.addEventListener('click', this._handleClickInContainer);

        if (this.#adsOptions.customClick.enabled) {
            this.#adsCustomClickContainer = document.createElement('div');
            this.#adsCustomClickContainer.className = 'op-ads__click-container';
            this.#adsCustomClickContainer.innerHTML = `<div class="op-ads__click-label">${this.#adsOptions.customClick.label}</div>`;
            if (this.#element.parentElement) {
                this.#element.parentElement.insertBefore(this.#adsCustomClickContainer, this.#element.nextSibling);
            }
        }

        this.#mediaSources = this.#media.src;
        const vpaidModeMap: Record<string, unknown> = {
            disabled: google.ima.ImaSdkSettings.VpaidMode.DISABLED,
            enabled: google.ima.ImaSdkSettings.VpaidMode.ENABLED,
            insecure: google.ima.ImaSdkSettings.VpaidMode.INSECURE,
        };

        google.ima.settings.setVpaidMode(vpaidModeMap[this.#adsOptions.vpaidMode]);
        google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
        google.ima.settings.setAutoPlayAdBreaks(this.#adsOptions.autoPlayAdBreaks);
        google.ima.settings.setNumRedirects(this.#adsOptions.numRedirects);
        google.ima.settings.setLocale(this.#adsOptions.language);
        if (this.#adsOptions.sessionId) {
            google.ima.settings.setSessionId(this.#adsOptions.sessionId);
        }
        if (this.#adsOptions.publisherId) {
            google.ima.settings.setPpid(this.#adsOptions.publisherId);
        }
        google.ima.settings.setPlayerType('openplayerjs');
        google.ima.settings.setPlayerVersion('2.9.1');

        this.#adDisplayContainer = new google.ima.AdDisplayContainer(this.#adsContainer, this.#element, this.#adsCustomClickContainer);

        this.#adsLoader = new google.ima.AdsLoader(this.#adDisplayContainer);
        this.#adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded, EVENT_OPTIONS);

        this.#adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error, EVENT_OPTIONS);

        // Create responsive ad
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this._handleResizeAds, EVENT_OPTIONS);
        }
        this.#element.addEventListener('loadedmetadata', this._handleResizeAds, EVENT_OPTIONS);

        // Request Ads automatically if `autoplay` was set
        if (
            this.#autoStart === true
            || this.#autoStartMuted === true
            || force === true
            || this.#adsOptions.enablePreloading === true
            || this.#playTriggered === true
        ) {
            if (!this.#adsDone) {
                this.#adsDone = true;
                this.#adDisplayContainer.initialize();
            }
            this._requestAds();
        }
    }

    /**
     * Start playing/resume Ad if `adsManager` is active.
     *
     * @memberof Ads
     */
    public async play(): Promise<void> {
        if (!this.#adsDone) {
            this.#playTriggered = true;
            await this.loadPromise;
            return;
        }

        if (this.#adsManager) {
            try {
                // No timer interval and no adsActive mean it's a potential initial ad play
                if (!this.#intervalTimer && this.#adsActive === false) {
                    this.#adsManager.start();
                } else {
                    this.#adsManager.resume();
                }
                this.#adsActive = true;
                const e = addEvent('play');
                this.#element.dispatchEvent(e);
            } catch (err) {
                this._resumeMedia();
            }
        }
    }

    /**
     * Pause Ad if `adsManager` is active.
     *
     * @memberof Ads
     */
    public pause(): void {
        if (this.#adsManager) {
            this.#adsActive = false;
            this.#adsManager.pause();
            const e = addEvent('pause');
            this.#element.dispatchEvent(e);
        }
    }

    /**
     * Execute any callbacks to destroy Ads.
     *
     * @memberof Ads
     */
    public destroy(): void {
        if (this.#adsManager) {
            this.#adsManager.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);

            if (this.#events) {
                this.#events.forEach(event => {
                    this.#adsManager.removeEventListener(event, this._assign);
                });
            }
        }

        this.#events = [];

        const controls = this.#player.getControls();
        const mouseEvents = controls ? controls.events.mouse : {};
        Object.keys(mouseEvents).forEach((event: string) => {
            if (this.#adsContainer) {
                this.#adsContainer.removeEventListener(event, mouseEvents[event]);
            }
        });

        if (this.#adsLoader) {
            this.#adsLoader.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);
            this.#adsLoader.removeEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded);
        }

        const destroy = !Array.isArray(this.#ads) || this.#currentAdsIndex > this.#ads.length;
        if (this.#adsManager && destroy) {
            this.#adsManager.destroy();
        }

        if (this.#adsOptions.customClick.enabled) {
            removeElement(this.#adsCustomClickContainer);
        }

        if (IS_IOS || IS_ANDROID) {
            this.#element.removeEventListener('loadedmetadata', this._contentLoadedAction);
        }
        this.#element.removeEventListener('loadedmetadata', this._handleResizeAds);
        this.#element.removeEventListener('loadedmetadata', this._loadedMetadataHandler);
        this.#element.removeEventListener('ended', this._contentEndedListener);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this._handleResizeAds);
        }

        if (this.#adsContainer) {
            this.#adsContainer.removeEventListener('click', this._handleClickInContainer);
        }
        removeElement(this.#adsContainer);
    }

    /**
     * Change dimensions of Ad.
     *
     * @param {?number} width
     * @param {?number} height
     * @memberof Ads
     */
    public resizeAds(width?: number, height?: number): void {
        if (this.#adsManager) {
            const target = this.#element;
            const mode = target.getAttribute('data-fullscreen') === 'true' ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;

            let formattedWidth = width;
            const percentageWidth = width ? width.toString() : '';
            if (width && percentageWidth.indexOf('%') > -1) {
                if (this.#element.parentElement) {
                    formattedWidth = this.#element.parentElement.offsetWidth * (parseInt(percentageWidth, 10) / 100);
                }
            }

            let formattedHeight = height;
            const percentageHeight = height ? height.toString() : '';
            if (height && percentageHeight.indexOf('%') > -1) {
                if (this.#element.parentElement) {
                    formattedHeight = this.#element.parentElement.offsetHeight * (parseInt(percentageHeight, 10) / 100);
                }
            }

            let timeout;

            if (timeout && typeof window !== 'undefined') {
                window.cancelAnimationFrame(timeout);
            }
            if (typeof window !== 'undefined') {
                timeout = window.requestAnimationFrame(() => {
                    this.#adsManager.resize(formattedWidth || target.offsetWidth, formattedHeight || target.offsetHeight, mode);
                });
            }
        }
    }

    /**
     * Obtain an instance of the IMA adsManager.
     *
     * @returns {google.ima.AdsManager}
     * @memberof Ads
     */
    public getAdsManager(): any {
        return this.#adsManager;
    }

    /**
     * Flag if the ad has started or not.
     *
     * @returns {boolean}
     * @memberof Ads
     */
    public started(): boolean {
        return this.#adsStarted;
    }

    set src(source: string | string[]) {
        this.#ads = source;
    }

    set isDone(value: boolean) {
        this.#adsDone = value;
    }

    /**
     * Update the `playTriggered` flag
     *
     * @param {boolean} value
     * @memberof Ads
     */
    set playRequested(value: boolean) {
        this.#playTriggered = value;
    }

    /**
     * Set the current Ad's volume level.
     *
     * @memberof Ads
     */
    set volume(value: number) {
        if (this.#adsManager) {
            this.#adsVolume = value;
            this.#adsManager.setVolume(value);
            this._setMediaVolume(value);
            this.#adsMuted = value === 0;
        }
    }

    /**
     * Retrieve current Ad's volume level.
     *
     * @returns {number}
     * @memberof Ads
     */
    get volume(): number {
        return this.#adsManager ? this.#adsManager.getVolume() : this.#originalVolume;
    }

    /**
     * Set the current Ad's muted status.
     *
     * @memberof Ads
     */
    set muted(value: boolean) {
        if (this.#adsManager) {
            if (value) {
                this.#adsManager.setVolume(0);
                this.#adsMuted = true;
                this._setMediaVolume(0);
            } else {
                this.#adsManager.setVolume(this.#adsVolume);
                this.#adsMuted = false;
                this._setMediaVolume(this.#adsVolume);
            }
        }
    }

    /**
     * Retrieve the current Ad's muted status.
     *
     * @returns {boolean}
     * @memberof Ads
     */
    get muted(): boolean {
        return this.#adsMuted;
    }

    /**
     * Set the current Ad's current time position.
     *
     * @memberof Ads
     */
    set currentTime(value: number) {
        this.#adsCurrentTime = value;
    }

    /**
     * Retrieve the current Ad's current time position.
     *
     * @returns {number}
     * @memberof Ads
     */
    get currentTime(): number {
        return this.#adsCurrentTime;
    }

    /**
     * Retrieve the current Ad's duration.
     *
     * @returns {number}
     * @memberof Ads
     */
    get duration(): number {
        return this.#adsDuration;
    }

    /**
     * Retrieve the current Ad's paused status.
     *
     * @returns {boolean}
     * @memberof Ads
     */
    get paused(): boolean {
        return !this.#adsActive;
    }

    /**
     * Retrieve the current Ad's ended status.
     *
     * @returns {boolean}
     * @memberof Ads
     */
    get ended(): boolean {
        return this.#adsEnded;
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
                    if (IS_IPHONE && isVideo(this.#element)) {
                        this.#element.controls = false;
                    }
                    this.#adsDuration = ad.getDuration();
                    this.#adsCurrentTime = ad.getDuration();
                    if (!this.#mediaStarted && !IS_IOS && !IS_ANDROID) {
                        const waitingEvent = addEvent('waiting');
                        this.#element.dispatchEvent(waitingEvent);

                        const loadedEvent = addEvent('loadedmetadata');
                        this.#element.dispatchEvent(loadedEvent);

                        this.resizeAds();
                    }
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                if (ad.isLinear()) {
                    if (this.#element.parentElement && !this.#element.parentElement.classList.contains('op-ads--active')) {
                        this.#element.parentElement.classList.add('op-ads--active');
                    }

                    if (!this.#media.paused) {
                        this.#media.pause();
                    }
                    this.#adsActive = true;
                    const playEvent = addEvent('play');
                    this.#element.dispatchEvent(playEvent);
                    let resized;

                    if (!resized) {
                        this.resizeAds();
                        resized = true;
                    }

                    if (this.#media.ended) {
                        this.#adsEnded = false;
                        const endEvent = addEvent('adsmediaended');
                        this.#element.dispatchEvent(endEvent);
                    }

                    if (typeof window !== 'undefined') {
                        this.#intervalTimer = window.setInterval(() => {
                            if (this.#adsActive === true) {
                                this.#adsCurrentTime = Math.round(this.#adsManager.getRemainingTime());
                                const timeEvent = addEvent('timeupdate');
                                this.#element.dispatchEvent(timeEvent);
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
                        this.#element.dispatchEvent(skipEvent);
                    }

                    if (this.#element.parentElement) {
                        this.#element.parentElement.classList.remove('op-ads--active');
                    }
                    this.#adsActive = false;
                    clearInterval(this.#intervalTimer);
                }
                break;
            case google.ima.AdEvent.Type.VOLUME_CHANGED:
                this._setMediaVolume(this.volume);
                break;
            case google.ima.AdEvent.Type.VOLUME_MUTED:
                if (ad.isLinear()) {
                    const volumeEvent = addEvent('volumechange');
                    this.#element.dispatchEvent(volumeEvent);
                }
                break;
            case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
                if (ad.isLinear()) {
                    this.#adsActive = false;
                    this.#adsEnded = true;
                    this.#intervalTimer = 0;
                    this.#adsMuted = false;
                    this.#adsStarted = false;
                    this.#adsDuration = 0;
                    this.#adsCurrentTime = 0;
                    if (this.#element.parentElement) {
                        this.#element.parentElement.classList.remove('op-ads--active');
                    }
                    this.destroy();
                    if (this.#element.currentTime >= this.#element.duration) {
                        const endedEvent = addEvent('ended');
                        this.#element.dispatchEvent(endedEvent);
                    }
                }
                break;
            case google.ima.AdEvent.Type.CLICK:
                const pauseEvent = addEvent('pause');
                this.#element.dispatchEvent(pauseEvent);
                break;
            case google.ima.AdEvent.Type.AD_BREAK_READY:
                if (!this.#adsOptions.autoPlayAdBreaks) {
                    this.play();
                }
                break;
            default:
                break;
        }

        // Assign events prefixed with `ads` to main element so user
        // can listen to these events, except if the system detects a non-fatal error
        if (event.type === google.ima.AdEvent.Type.LOG) {
            const adData = event.getAdData();
            if (adData.adError) {
                const message = adData.adError.getMessage();
                console.warn(`Ad warning: Non-fatal error occurred: ${message}`);
                const details = {
                    detail: {
                        data: adData.adError,
                        message,
                        type: 'Ads',
                    },
                };
                const errorEvent = addEvent('playererror', details);
                this.#element.dispatchEvent(errorEvent);
            }
        } else {
            const e = addEvent(`ads${event.type}`);
            this.#element.dispatchEvent(e);
        }
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
        this.#element.dispatchEvent(errorEvent);

        // @see https://support.google.com/admanager/answer/4442429?hl=en
        const fatalErrorCodes = [
            100, 101, 102, 300, 301, 302, 303, 400, 401, 402, 403, 405, 406, 407, 408, 409, 410, 500, 501, 502, 503, 900, 901, 1005,
        ];

        if (Array.isArray(this.#ads) && this.#ads.length > 1 && this.#currentAdsIndex < this.#ads.length - 1) {
            this.#currentAdsIndex++;
            this.#playTriggered = true;
            this.#adsStarted = true;
            this.#adsDone = false;
            this.destroy();
            this.loadedAd = false;
            this.load(true);
            console.warn(`Ad warning: ${error.toString()}`);
        } else {
            // Unless there's a fatal error, do not destroy the Ads manager
            if (fatalErrorCodes.indexOf(error.getErrorCode()) > -1) {
                if (this.#adsManager) {
                    this.#adsManager.destroy();
                }
                console.error(`Ad error: ${error.toString()}`);
            } else {
                console.warn(`Ad warning: ${error.toString()}`);
            }
            if (this.#autoStart === true || this.#autoStartMuted === true || this.#adsStarted === true) {
                this.#adsActive = false;
                // Sometimes, due to pre-fetch issues, Ads could report an error, but the SDK is able to
                // play Ads, so check if src was set to determine what action to take
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
        adsRenderingSettings.enablePreloading = this.#adsOptions.enablePreloading;
        // Get the ads manager.
        this.#adsManager = adsManagerLoadedEvent.getAdsManager(this.#element, adsRenderingSettings);
        this._start(this.#adsManager);
        this.loadPromise = new Promise(resolve => resolve);
    }

    /**
     * Callback to be executed to start playing Ad.
     *
     * @param {any} manager
     * @memberof Ads
     */
    private _start(manager: any): void {
        if (this.#adsCustomClickContainer && manager.isCustomClickTrackingUsed()) {
            this.#adsCustomClickContainer.classList.add('op-ads__click-container--visible');
        }
        // Add listeners to the required events.
        manager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this._onContentPauseRequested, EVENT_OPTIONS);
        manager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this._onContentResumeRequested, EVENT_OPTIONS);

        this.#events = [
            google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            google.ima.AdEvent.Type.CLICK,
            google.ima.AdEvent.Type.VIDEO_CLICKED,
            google.ima.AdEvent.Type.VIDEO_ICON_CLICKED,
            google.ima.AdEvent.Type.AD_PROGRESS,
            google.ima.AdEvent.Type.AD_BUFFERING,
            google.ima.AdEvent.Type.IMPRESSION,
            google.ima.AdEvent.Type.DURATION_CHANGE,
            google.ima.AdEvent.Type.USER_CLOSE,
            google.ima.AdEvent.Type.LINEAR_CHANGED,
            google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
            google.ima.AdEvent.Type.AD_METADATA,
            google.ima.AdEvent.Type.INTERACTION,
            google.ima.AdEvent.Type.COMPLETE,
            google.ima.AdEvent.Type.FIRST_QUARTILE,
            google.ima.AdEvent.Type.LOADED,
            google.ima.AdEvent.Type.MIDPOINT,
            google.ima.AdEvent.Type.PAUSED,
            google.ima.AdEvent.Type.RESUMED,
            google.ima.AdEvent.Type.USER_CLOSE,
            google.ima.AdEvent.Type.STARTED,
            google.ima.AdEvent.Type.THIRD_QUARTILE,
            google.ima.AdEvent.Type.SKIPPED,
            google.ima.AdEvent.Type.VOLUME_CHANGED,
            google.ima.AdEvent.Type.VOLUME_MUTED,
            google.ima.AdEvent.Type.LOG,
        ];

        if (!this.#adsOptions.autoPlayAdBreaks) {
            // Add it to the events array so it gets removed onDestroy
            this.#events.push(google.ima.AdEvent.Type.AD_BREAK_READY);
        }

        const controls = this.#player.getControls();
        const mouseEvents = controls ? controls.events.mouse : {};
        Object.keys(mouseEvents).forEach((event: string) => {
            if (this.#adsContainer) {
                this.#adsContainer.addEventListener(event, mouseEvents[event], EVENT_OPTIONS);
            }
        });
        this.#events.forEach(event => {
            manager.addEventListener(event, this._assign, EVENT_OPTIONS);
        });
        manager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error, EVENT_OPTIONS);

        if (this.#autoStart === true || this.#playTriggered === true) {
            this.#playTriggered = false;
            if (!this.#adsDone) {
                this._initNotDoneAds();
                return;
            }
            manager.init(
                this.#element.offsetWidth,
                this.#element.offsetHeight,
                this.#element.parentElement && this.#element.parentElement.getAttribute('data-fullscreen') === 'true'
                    ? google.ima.ViewMode.FULLSCREEN
                    : google.ima.ViewMode.NORMAL
            );
            manager.start();
            const e = addEvent('play');
            this.#element.dispatchEvent(e);
            const event = addEvent('playing');
            this.#element.dispatchEvent(event);
        } else if (this.#adsOptions.enablePreloading === true) {
            manager.init(
                this.#element.offsetWidth,
                this.#element.offsetHeight,
                this.#element.parentElement && this.#element.parentElement.getAttribute('data-fullscreen') === 'true'
                    ? google.ima.ViewMode.FULLSCREEN
                    : google.ima.ViewMode.NORMAL
            );
        }
    }

    /**
     * Resume Ads if not done
     *
     * @memberof Ads
     */
    private _initNotDoneAds(): void {
        this.#adsDone = true;
        if (this.#adDisplayContainer) {
            this.#adDisplayContainer.initialize();

            if (IS_IOS || IS_ANDROID) {
                this.#preloadContent = this._contentLoadedAction;
                this.#element.addEventListener('loadedmetadata', this._contentLoadedAction, EVENT_OPTIONS);
                this.#element.load();
            } else {
                this._contentLoadedAction();
            }
        } else {
            this.load();
            this.loadedAd = false;
        }
    }

    /**
     * Callback to be executed once the Ad has ended.
     *
     * @memberof Ads
     */
    private _contentEndedListener(): void {
        this.#adsEnded = true;
        this.#adsActive = false;
        this.#adsStarted = false;
        this.#adsLoader.contentComplete();
    }

    /**
     * Callback to be executed once the Ad has been paused.
     *
     * @memberof Ads
     */
    private _onContentPauseRequested(): void {
        this.#element.removeEventListener('ended', this._contentEndedListener);
        this.#lastTimePaused = this.#media.currentTime;

        if (this.#adsStarted) {
            this.#media.pause();
        } else {
            this.#adsStarted = true;
        }
        const e = addEvent('play');
        this.#element.dispatchEvent(e);
    }

    /**
     * Callback to be executed once the Ad has been resumed.
     *
     * @private
     * @memberof Ads
     */
    private _onContentResumeRequested(): void {
        if (this.#adsOptions.loop) {
            if (Array.isArray(this.#ads)) {
                if (this.#currentAdsIndex === this.#ads.length - 1) {
                    this.#currentAdsIndex = 0;
                } else {
                    this.#currentAdsIndex++;
                }
            }
            this.destroy();
            this.#adsLoader.contentComplete();
            this.#playTriggered = true;
            this.#adsStarted = true;
            this.#adsDone = false;
            this.loadedAd = false;
            this.load(true);
        } else {
            this.#element.addEventListener('ended', this._contentEndedListener, EVENT_OPTIONS);
            this.#element.addEventListener('loadedmetadata', this._loadedMetadataHandler, EVENT_OPTIONS);
            if (IS_IOS || IS_ANDROID) {
                this.#media.src = this.#mediaSources;
                this.#media.load();
                this._prepareMedia();
                if (this.#element.parentElement) {
                    this.#element.parentElement.classList.add('op-ads--active');
                }
            } else {
                const event = addEvent('loadedmetadata');
                this.#element.dispatchEvent(event);
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
        if (Array.isArray(this.#ads)) {
            this.#currentAdsIndex++;
            if (this.#currentAdsIndex <= this.#ads.length - 1) {
                if (this.#adsManager) {
                    this.#adsManager.destroy();
                }
                this.#adsLoader.contentComplete();
                this.#playTriggered = true;
                this.#adsStarted = true;
                this.#adsDone = false;
                this._requestAds();
            } else {
                if (!this.#adsOptions.autoPlayAdBreaks) {
                    this._resetAdsAfterManualBreak();
                }
                this._prepareMedia();
            }
        } else if (this.#element.seekable.length) {
            if (this.#element.seekable.end(0) > this.#lastTimePaused) {
                if (!this.#adsOptions.autoPlayAdBreaks) {
                    this._resetAdsAfterManualBreak();
                }
                this._prepareMedia();
            }
        } else {
            setTimeout(this._loadedMetadataHandler, 100);
        }
    }

    /**
     * Callback to resume original media.
     *
     * This can happen when Ad is being skipped or has ended.
     * @memberof Ads
     */
    private _resumeMedia(): void {
        this.#intervalTimer = 0;
        this.#adsMuted = false;
        this.#adsStarted = false;
        this.#adsDuration = 0;
        this.#adsCurrentTime = 0;
        if (this.#element.parentElement) {
            this.#element.parentElement.classList.remove('op-ads--active');
        }

        if (this.#media.ended) {
            const e = addEvent('ended');
            this.#element.dispatchEvent(e);
        } else {
            try {
                this.#media.play();
                setTimeout(() => {
                    const e = addEvent('play');
                    this.#element.dispatchEvent(e);
                }, 50);
            } catch (err) {}
        }
    }

    /**
     * Setup final attributes to the Ad before playing it, which include initial dimensions and capabilities
     * to autoplay Ad or not.
     *
     * @memberof Ads
     */
    private _requestAds(): void {
        this.#adsRequest = new google.ima.AdsRequest();
        const ads = Array.isArray(this.#ads) ? this.#ads[this.#currentAdsIndex] : this.#ads;

        if (isXml(ads)) {
            this.#adsRequest.adsResponse = ads;
        } else {
            this.#adsRequest.adTagUrl = ads;
        }

        const width = this.#element.parentElement ? this.#element.parentElement.offsetWidth : 0;
        const height = this.#element.parentElement ? this.#element.parentElement.offsetHeight : 0;
        this.#adsRequest.linearAdSlotWidth = width;
        this.#adsRequest.linearAdSlotHeight = height;
        this.#adsRequest.nonLinearAdSlotWidth = width;
        this.#adsRequest.nonLinearAdSlotHeight = height / 3;
        this.#adsRequest.setAdWillAutoPlay(this.#autoStart);
        this.#adsRequest.setAdWillPlayMuted(this.#autoStartMuted);
        this.#adsLoader.requestAds(this.#adsRequest);
    }

    /**
     * Internal callback to request Ads.
     *
     * @memberof Ads
     */
    private _contentLoadedAction() {
        if (this.#preloadContent) {
            this.#element.removeEventListener('loadedmetadata', this.#preloadContent);
            this.#preloadContent = null;
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
        if (this.#adsManager) {
            this.#adsManager.destroy();
        }
        this.#adsLoader.contentComplete();
        this.#adsDone = false;
        this.#playTriggered = true;
    }

    /**
     * Remove event for `loadedmetadata` and set the player to resume regular media.
     *
     * @memberof Ads
     */
    private _prepareMedia() {
        this.#media.currentTime = this.#lastTimePaused;
        this.#element.removeEventListener('loadedmetadata', this._loadedMetadataHandler);
        this._resumeMedia();
    }

    private _setMediaVolume(volume: number) {
        this.#media.volume = volume;
        this.#media.muted = volume === 0;
    }

    private _handleClickInContainer() {
        if (this.#media.paused) {
            const e = addEvent('paused');
            this.#element.dispatchEvent(e);
            this.pause();
        }
    }

    private _handleResizeAds() {
        this.resizeAds();
    }
}

export default Ads;
