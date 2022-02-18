/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdsOptions, Source } from '../interfaces';
import Media from '../media';
import Player from '../player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS, IS_IPHONE } from '../utils/constants';
import { addEvent, isAudio, isVideo, isXml, loadScript } from '../utils/general';

declare const google: any;

// @see https://developers.google.com/interactive-media-ads/
class Ads {
    loadPromise: unknown;

    loadedAd = false;

    #ended = false;

    #done = false;

    #active = false;

    #started = false;

    #intervalTimer = 0;

    #volume: number;

    #muted = false;

    #duration = 0;

    #currentTime = 0;

    // @see https://tinyurl.com/ybjas4ut
    #manager: any = null;

    #player: Player;

    #media: Media;

    #element: HTMLMediaElement;

    #events: string[] = [];

    #ads: string | string[];

    #promise: Promise<void>;

    // @see https://tinyurl.com/ycwp4ufd
    #loader: any;

    #container?: HTMLDivElement;

    #customClickContainer?: HTMLDivElement;

    #skipElement?: HTMLElement;

    // @see https://tinyurl.com/ya3zksso
    #displayContainer: any;

    // @see https://tinyurl.com/ya8bxjf4
    #request: any;

    #autostart = false;

    #autostartMuted = false;

    #playTriggered = false;

    #options: AdsOptions;

    #currentIndex = 0;

    #originalVolume: number;

    #preloadContent: any;

    #lastTimePaused = 0;

    #mediaSources: Source[] = [];

    #mediaStarted = false;

    constructor(
        player: Player,
        ads: string | string[],
        autostart?: boolean,
        autostartMuted?: boolean,
        options?: AdsOptions
    ) {
        const defaultOpts: AdsOptions = {
            autoPlayAdBreaks: true,
            customClick: {
                enabled: false,
                label: 'Click here for more info',
            },
            audioSkip: {
                enabled: true,
                label: 'Skip Ad',
                remainingLabel: 'Skip in [[secs]] seconds',
            },
            debug: false,
            enablePreloading: false,
            language: 'en',
            loop: false,
            numRedirects: 4,
            publisherId: undefined,
            sdkPath: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
            sessionId: undefined,
            src: [],
            vpaidMode: 'enabled',
        };
        this.#player = player;
        this.#ads = ads;
        this.#media = player.getMedia();
        this.#element = player.getElement();
        this.#autostart = autostart || false;
        this.#muted = player.getElement().muted;
        this.#autostartMuted = autostartMuted || false;
        this.#options = { ...defaultOpts, ...options };
        if (options?.customClick && Object.keys(options.customClick).length) {
            this.#options.customClick = { ...defaultOpts.customClick, ...options.customClick };
        }
        this.#playTriggered = false;
        this.#originalVolume = this.#element.volume;
        this.#volume = this.#originalVolume;

        const path = this.#options?.debug
            ? this.#options?.sdkPath?.replace(/(\.js$)/, '_debug.js')
            : this.#options?.sdkPath;

        this.load = this.load.bind(this);
        this.resizeAds = this.resizeAds.bind(this);
        this._handleClickInContainer = this._handleClickInContainer.bind(this);
        this._handleSkipAds = this._handleSkipAds.bind(this);
        this._loaded = this._loaded.bind(this);
        this._error = this._error.bind(this);
        this._assign = this._assign.bind(this);
        this._contentLoadedAction = this._contentLoadedAction.bind(this);
        this._loadedMetadataHandler = this._loadedMetadataHandler.bind(this);
        this._contentEndedListener = this._contentEndedListener.bind(this);
        this._handleResizeAds = this._handleResizeAds.bind(this);
        this._onContentPauseRequested = this._onContentPauseRequested.bind(this);
        this._onContentResumeRequested = this._onContentResumeRequested.bind(this);

        this.#promise =
            path && (typeof google === 'undefined' || typeof google.ima === 'undefined')
                ? loadScript(path)
                : new Promise((resolve) => {
                      resolve();
                  });

        this.#promise
            .then(() => {
                this.load();
            })
            .catch((error) => {
                let message = 'Ad script could not be loaded; please check if you have an AdBlock ';
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

    load(force = false): void {
        if (
            typeof google === 'undefined' ||
            !google.ima ||
            (!force && this.loadedAd && this.#options.autoPlayAdBreaks)
        ) {
            return;
        }

        // If we have set `autoPlayAdBreaks` to false and haven't set the force flag, don't load ads yet
        if (!this.#options.autoPlayAdBreaks && !force) {
            return;
        }

        this.loadedAd = true;

        const existingContainer = this.#player.getContainer().querySelector('.op-ads');
        if (existingContainer && existingContainer.parentNode) {
            existingContainer.parentNode.removeChild(existingContainer);
        }

        this.#started = true;
        this.#container = document.createElement('div');
        this.#container.className = 'op-ads';
        this.#container.tabIndex = -1;
        if (this.#element.parentElement) {
            this.#element.parentElement.insertBefore(this.#container, this.#element.nextSibling);
        }
        this.#container.addEventListener('click', this._handleClickInContainer);

        if (this.#options.customClick?.enabled) {
            this.#customClickContainer = document.createElement('div');
            this.#customClickContainer.className = 'op-ads__click-container';
            this.#customClickContainer.innerHTML = `<div class="op-ads__click-label">${
                this.#options.customClick.label
            }</div>`;
            if (this.#element.parentElement) {
                this.#element.parentElement.insertBefore(this.#customClickContainer, this.#element.nextSibling);
            }
        }

        if (isAudio(this.#element) && this.#options.audioSkip?.enabled) {
            if (this.#options.audioSkip?.element) {
                const { element } = this.#options.audioSkip || {};
                if (typeof element === 'string') {
                    const target = document.getElementById(element);
                    if (target) {
                        this.#skipElement = target;
                    }
                } else if (element instanceof HTMLElement) {
                    this.#skipElement = element;
                }
            } else {
                this.#skipElement = document.createElement('button');
                this.#skipElement.className = 'op-ads__skip hidden';
                this.#player.getControls().getContainer().appendChild(this.#skipElement);
            }
            if (this.#skipElement) {
                this.#skipElement.addEventListener('click', this._handleSkipAds, EVENT_OPTIONS);
            }
        }

        this.#mediaSources = this.#media.src;
        const vpaidModeMap: Record<string, unknown> = {
            disabled: google.ima.ImaSdkSettings.VpaidMode.DISABLED,
            enabled: google.ima.ImaSdkSettings.VpaidMode.ENABLED,
            insecure: google.ima.ImaSdkSettings.VpaidMode.INSECURE,
        };

        google.ima.settings.setVpaidMode(vpaidModeMap[this.#options.vpaidMode || 'enabled']);
        google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
        google.ima.settings.setAutoPlayAdBreaks(this.#options.autoPlayAdBreaks);
        google.ima.settings.setNumRedirects(this.#options.numRedirects);
        google.ima.settings.setLocale(this.#options.language);
        if (this.#options.sessionId) {
            google.ima.settings.setSessionId(this.#options.sessionId);
        }
        if (this.#options.publisherId) {
            google.ima.settings.setPpid(this.#options.publisherId);
        }
        google.ima.settings.setPlayerType('openplayerjs');
        google.ima.settings.setPlayerVersion('3.0.0');

        this.#displayContainer = new google.ima.AdDisplayContainer(
            this.#container,
            this.#element,
            this.#customClickContainer
        );

        this.#loader = new google.ima.AdsLoader(this.#displayContainer);
        this.#loader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this._loaded,
            EVENT_OPTIONS
        );

        this.#loader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error, EVENT_OPTIONS);

        // Create responsive ad
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this._handleResizeAds, EVENT_OPTIONS);
        }
        this.#element.addEventListener('loadedmetadata', this._handleResizeAds, EVENT_OPTIONS);

        // Request Ads automatically if `autoplay` was set
        if (
            this.#autostart === true ||
            this.#autostartMuted === true ||
            force === true ||
            this.#options.enablePreloading === true ||
            this.#playTriggered === true
        ) {
            if (!this.#done) {
                this.#done = true;
                this.#displayContainer.initialize();
            }
            this._requestAds();
        }
    }

    async play(): Promise<void> {
        if (!this.#done) {
            this.#playTriggered = true;
            this._initNotDoneAds();
            return;
        }

        if (this.#manager) {
            try {
                // No timer interval and no Ad active means it's a potential initial ad play
                if (!this.#intervalTimer && this.#active === false) {
                    this.#manager.start();
                } else {
                    this.#manager.resume();
                }
                this.#active = true;
                const e = addEvent('play');
                this.#element.dispatchEvent(e);
            } catch (err) {
                this._resumeMedia();
            }
        }
    }

    pause(): void {
        if (this.#manager) {
            this.#active = false;
            this.#manager.pause();
            const e = addEvent('pause');
            this.#element.dispatchEvent(e);
        }
    }

    destroy(): void {
        if (this.#manager) {
            this.#manager.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);

            if (this.#events) {
                this.#events.forEach((event) => {
                    this.#manager.removeEventListener(event, this._assign);
                });
            }
        }

        this.#events = [];

        const controls = this.#player.getControls();
        const mouseEvents = controls ? controls.events.mouse : {};
        Object.keys(mouseEvents).forEach((event: string) => {
            if (this.#container) {
                this.#container.removeEventListener(event, mouseEvents[event]);
            }
        });

        if (this.#loader) {
            this.#loader.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);
            this.#loader.removeEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded);
        }

        const destroy = !Array.isArray(this.#ads) || this.#currentIndex > this.#ads.length;
        if (this.#manager && destroy) {
            this.#manager.destroy();
        }

        if (this.#options.customClick?.enabled && this.#customClickContainer) {
            this.#customClickContainer.remove();
        }

        if (this.#options.audioSkip?.enabled && this.#skipElement) {
            this.#skipElement.removeEventListener('click', this._handleSkipAds);
            this.#skipElement.remove();
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

        if (this.#container) {
            this.#container.removeEventListener('click', this._handleClickInContainer);
            this.#container.remove();
        }
        this.loadPromise = null;
        this.loadedAd = false;
        this.#done = false;
        this.#playTriggered = false;
        this.#duration = 0;
        this.#currentTime = 0;
    }

    resizeAds(width?: number, height?: number): void {
        if (this.#manager) {
            const target = this.#element;
            const mode =
                target.getAttribute('data-fullscreen') === 'true'
                    ? google.ima.ViewMode.FULLSCREEN
                    : google.ima.ViewMode.NORMAL;

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
                    this.#manager.resize(
                        formattedWidth || target.offsetWidth,
                        formattedHeight || target.offsetHeight,
                        mode
                    );
                });
            }
        }
    }

    getAdsManager(): unknown {
        return this.#manager;
    }

    getAdsLoader(): any {
        return this.#loader;
    }

    started(): boolean {
        return this.#started;
    }

    set src(source: string | string[]) {
        this.#ads = source;
    }

    set isDone(value: boolean) {
        this.#done = value;
    }

    set playRequested(value: boolean) {
        this.#playTriggered = value;
    }

    set volume(value: number) {
        if (this.#manager) {
            this.#volume = value;
            this.#manager.setVolume(value);
            this._setMediaVolume(value);
            this.#muted = value === 0;
        }
    }

    get volume(): number {
        return this.#manager ? this.#manager.getVolume() : this.#originalVolume;
    }

    set muted(value: boolean) {
        if (this.#manager) {
            if (value) {
                this.#manager.setVolume(0);
                this.#muted = true;
                this._setMediaVolume(0);
            } else {
                this.#manager.setVolume(this.#volume);
                this.#muted = false;
                this._setMediaVolume(this.#volume);
            }
        }
    }

    get muted(): boolean {
        return this.#muted;
    }

    set currentTime(value: number) {
        this.#currentTime = value;
    }

    get currentTime(): number {
        return this.#currentTime;
    }

    get duration(): number {
        return this.#duration;
    }

    get paused(): boolean {
        return !this.#active;
    }

    get ended(): boolean {
        return this.#ended;
    }

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
                    this.#duration = ad.getDuration();
                    this.#currentTime = ad.getDuration();
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
                    if (
                        this.#element.parentElement &&
                        !this.#element.parentElement.classList.contains('op-ads--active')
                    ) {
                        this.#element.parentElement.classList.add('op-ads--active');
                    }

                    if (!this.#media.paused) {
                        this.#media.pause();
                    }
                    this.#active = true;
                    const playEvent = addEvent('play');
                    this.#element.dispatchEvent(playEvent);
                    let resized;

                    if (!resized) {
                        this.resizeAds();
                        resized = true;
                    }

                    if (this.#media.ended) {
                        this.#ended = false;
                        const endEvent = addEvent('adsmediaended');
                        this.#element.dispatchEvent(endEvent);
                    }

                    if (typeof window !== 'undefined') {
                        this.#intervalTimer = window.setInterval(() => {
                            if (this.#active === true) {
                                this.#currentTime = Math.round(this.#manager.getRemainingTime());
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
                    this.#active = false;
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
                    this.#active = false;
                    this.#ended = true;
                    this.#intervalTimer = 0;
                    this.#muted = false;
                    this.#started = false;
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
                if (!this.#options.autoPlayAdBreaks) {
                    this.play();
                }
                break;
            case google.ima.AdEvent.Type.AD_PROGRESS:
                const progressData = event.getAdData();
                const offset = ad ? ad.getSkipTimeOffset() : -1;
                if (this.#skipElement) {
                    if (offset !== -1) {
                        const canSkip = this.#manager.getAdSkippableState();
                        const remainingTime = Math.ceil(offset - progressData.currentTime);
                        this.#skipElement.classList.remove('hidden');
                        if (canSkip) {
                            this.#skipElement.textContent = this.#options.audioSkip?.label || '';
                            this.#skipElement.classList.remove('disabled');
                        } else {
                            this.#skipElement.textContent =
                                this.#options.audioSkip?.remainingLabel.replace('[[secs]]', remainingTime.toString()) ||
                                '';
                            this.#skipElement.classList.add('disabled');
                        }
                    } else {
                        this.#skipElement.classList.add('hidden');
                    }
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

    // @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdError.ErrorCode
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
            100, 101, 102, 300, 301, 302, 303, 400, 401, 402, 403, 405, 406, 407, 408, 409, 410, 500, 501, 502, 503,
            900, 901, 1005,
        ];

        if (Array.isArray(this.#ads) && this.#ads.length > 1 && this.#currentIndex < this.#ads.length - 1) {
            this.#currentIndex++;
            this.destroy();
            this.#started = true;
            this.#playTriggered = true;
            this.load(true);
            console.warn(`Ad warning: ${error.toString()}`);
        } else {
            // Unless there's a fatal error, do not destroy the Ads manager
            if (fatalErrorCodes.indexOf(error.getErrorCode()) > -1) {
                if (this.#manager) {
                    this.#manager.destroy();
                }
                console.error(`Ad error: ${error.toString()}`);
            } else {
                console.warn(`Ad warning: ${error.toString()}`);
            }
            if (this.#autostart === true || this.#autostartMuted === true || this.#started === true) {
                this.#active = false;
                // Sometimes, due to pre-fetch issues, Ads could report an error, but the SDK is able to
                // play Ads, so check if src was set to determine what action to take
                this._resumeMedia();
            }
        }
    }

    private _loaded(managerLoadedEvent: any): void {
        const adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = false;
        adsRenderingSettings.enablePreloading = this.#options.enablePreloading;
        // Get the ads manager.
        this.#manager = managerLoadedEvent.getAdsManager(this.#element, adsRenderingSettings);
        this._start(this.#manager);
        this.loadPromise = new Promise((resolve) => resolve);
    }

    private _start(manager: any): void {
        if (this.#customClickContainer && manager.isCustomClickTrackingUsed()) {
            this.#customClickContainer.classList.add('op-ads__click-container--visible');
        }
        // Add listeners to the required events.
        manager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
            this._onContentPauseRequested,
            EVENT_OPTIONS
        );
        manager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
            this._onContentResumeRequested,
            EVENT_OPTIONS
        );

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

        if (!this.#options.autoPlayAdBreaks) {
            // Add it to the events array so it gets removed onDestroy
            this.#events.push(google.ima.AdEvent.Type.AD_BREAK_READY);
        }

        const controls = this.#player.getControls();
        const mouseEvents = controls ? controls.events.mouse : {};
        Object.keys(mouseEvents).forEach((event: string) => {
            if (this.#container) {
                this.#container.addEventListener(event, mouseEvents[event], EVENT_OPTIONS);
            }
        });
        this.#events.forEach((event) => {
            manager.addEventListener(event, this._assign, EVENT_OPTIONS);
        });

        if (this.#autostart === true || this.#autostartMuted === true || this.#playTriggered === true) {
            this.#playTriggered = false;
            if (!this.#done) {
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
        } else if (this.#options.enablePreloading === true) {
            manager.init(
                this.#element.offsetWidth,
                this.#element.offsetHeight,
                this.#element.parentElement && this.#element.parentElement.getAttribute('data-fullscreen') === 'true'
                    ? google.ima.ViewMode.FULLSCREEN
                    : google.ima.ViewMode.NORMAL
            );
        }
    }

    private _initNotDoneAds(): void {
        if (this.#displayContainer) {
            this.#done = true;
            this.#displayContainer.initialize();

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

    private _contentEndedListener(): void {
        this.#ended = true;
        this.#active = false;
        this.#started = false;
        this.#loader.contentComplete();
    }

    private _onContentPauseRequested(): void {
        this.#element.removeEventListener('ended', this._contentEndedListener);
        this.#lastTimePaused = this.#media.currentTime;

        if (this.#started) {
            this.#media.pause();
        } else {
            this.#started = true;
        }
        const e = addEvent('play');
        this.#element.dispatchEvent(e);
    }

    private _onContentResumeRequested(): void {
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

    private _loadedMetadataHandler(): void {
        if (Array.isArray(this.#ads)) {
            this.#currentIndex++;
            if (this.#currentIndex <= this.#ads.length - 1) {
                if (this.#manager) {
                    this.#manager.destroy();
                }
                this.#loader.contentComplete();
                this.#playTriggered = true;
                this.#started = true;
                this.#done = false;
                this.load(true);
            } else {
                if (!this.#options.autoPlayAdBreaks) {
                    this._resetAdsAfterManualBreak();
                }
                this._prepareMedia();
            }
        } else if (this.#element.seekable.length) {
            if (this.#element.seekable.end(0) > this.#lastTimePaused) {
                if (!this.#options.autoPlayAdBreaks) {
                    this._resetAdsAfterManualBreak();
                }
                this._prepareMedia();
            }
        } else {
            setTimeout(this._loadedMetadataHandler, 100);
        }
    }

    private _resumeMedia(): void {
        this.#intervalTimer = 0;
        this.#muted = false;
        this.#started = false;
        this.#duration = 0;
        this.#currentTime = 0;
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
            } catch (err) {
                console.error(err);
            }
        }
    }

    private _requestAds(): void {
        this.#request = new google.ima.AdsRequest();
        const ads = Array.isArray(this.#ads) ? this.#ads[this.#currentIndex] : this.#ads;

        if (isXml(ads)) {
            this.#request.adsResponse = ads;
        } else {
            this.#request.adTagUrl = ads;
        }

        const width = this.#element.parentElement ? this.#element.parentElement.offsetWidth : 0;
        const height = this.#element.parentElement ? this.#element.parentElement.offsetHeight : 0;
        this.#request.linearAdSlotWidth = width;
        this.#request.linearAdSlotHeight = height;
        this.#request.nonLinearAdSlotWidth = width;
        this.#request.nonLinearAdSlotHeight = height / 3;
        this.#request.setAdWillAutoPlay(this.#autostart);
        this.#request.setAdWillPlayMuted(this.#autostartMuted);
        this.#loader.requestAds(this.#request);
    }

    /**
     * Internal callback to request Ads.
     *
     * @memberof Ads
     */
    private _contentLoadedAction(): void {
        if (this.#preloadContent) {
            this.#element.removeEventListener('loadedmetadata', this.#preloadContent);
            this.#preloadContent = null;
        }
        this._requestAds();
    }

    // @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/faq#8
    private _resetAdsAfterManualBreak(): void {
        if (this.#manager) {
            this.#manager.destroy();
        }
        this.#loader.contentComplete();
        this.#done = false;
        this.#playTriggered = true;
    }

    private _prepareMedia(): void {
        this.#media.currentTime = this.#lastTimePaused;
        this.#element.removeEventListener('loadedmetadata', this._loadedMetadataHandler);
        this._resumeMedia();
    }

    private _setMediaVolume(volume: number): void {
        this.#media.volume = volume;
        this.#media.muted = volume === 0;
    }

    private _handleClickInContainer(): void {
        if (this.#media.paused) {
            const e = addEvent('paused');
            this.#element.dispatchEvent(e);
            this.pause();
        }
    }

    private _handleResizeAds(): void {
        this.resizeAds();
    }

    private _handleSkipAds(): void {
        this.#manager.skip();
    }
}

export default Ads;
