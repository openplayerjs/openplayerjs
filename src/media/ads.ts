/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdsOptions } from '../interfaces';
import Media from '../media';
import { EVENT_OPTIONS, isAndroid, isIOS, isIPhone } from '../utils/constants';
import { addEvent, isAudio, isVideo, isXml, loadScript, sanitize } from '../utils/general';

declare const google: any;

export default class Ads {
    #loader: any;

    #autostart = false;

    #autostartMuted = false;

    #playing = false;

    #ended = false;

    #volume = 1;

    #mediaVolume = 1;

    #duration = 0;

    #currentTime = 0;

    #currentSavedTime = 0;

    #prefetchSeconds = 30;

    #muted = false;

    #events: string[] = [];

    #media: Media;

    #container: HTMLDivElement;

    #clickContainer: HTMLDivElement;

    #displayContainer: any;

    #manager: any;

    #request: any;

    #skipElement?: HTMLElement;

    #index = 0;

    #initialized = false;

    #started = false;

    #ads: string | string[];

    #options: AdsOptions;

    #adEvent: any = null;

    #timer = 0;

    #defaultOptions: AdsOptions = {
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
        live: false,
        numRedirects: 4,
        publisherId: undefined,
        sdkPath: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
        sessionId: undefined,
        src: [],
        vpaidMode: 'enabled',
    };

    constructor(
        media: Media,
        ads: string | string[],
        autostart?: boolean,
        autostartMuted?: boolean,
        options?: AdsOptions
    ) {
        this.#ads = ads;
        this.#media = media;
        this.#autostart = autostart || false;
        this.#autostartMuted = autostartMuted || false;
        this.#mediaVolume = this.#media.element.volume;
        this.#options = { ...this.#defaultOptions, ...options };
        if (options?.audioSkip && Object.keys(options.audioSkip).length) {
            this.#options.audioSkip = { ...this.#defaultOptions.audioSkip, ...options.audioSkip };
        }
        if (options?.customClick && Object.keys(options.customClick).length) {
            this.#options.customClick = { ...this.#defaultOptions.customClick, ...options.customClick };
        }

        this._loadAds = this._loadAds.bind(this);
        this._handleClickInContainer = this._handleClickInContainer.bind(this);
        this._handleResizeAds = this._handleResizeAds.bind(this);
        this._handleSkipAds = this._handleSkipAds.bind(this);
        this._onError = this._onError.bind(this);
        this._onAdsManagerLoaded = this._onAdsManagerLoaded.bind(this);
        this._onMetadataLoaded = this._onMetadataLoaded.bind(this);
        this._onEvent = this._onEvent.bind(this);
        this._onPlay = this._onPlay.bind(this);
        this._onPause = this._onPause.bind(this);
        this._onEnded = this._onEnded.bind(this);
    }

    async load(force = false): Promise<void> {
        await this._loadIMA();

        if (!force && !this.#options.autoPlayAdBreaks) {
            return;
        }

        this.#started = true;

        this._setAdSettings();
        this._createCustomClick();
        this._createSkipElement();
        this._loadAdsContainer();
        this._loadAdsLoader();

        if (force) {
            this._requestAds();
            if (!this.#options.autoPlayAdBreaks) {
                this.#initialized = true;
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this._handleResizeAds, EVENT_OPTIONS);
        }
        this.#media.element.addEventListener('loadedmetadata', this._handleResizeAds, EVENT_OPTIONS);
    }

    async play(): Promise<void> {
        try {
            if (!this.#initialized) {
                this.#initialized = true;

                if (this.#displayContainer) {
                    this.#displayContainer.initialize();
                    await this._onPreloadContent();
                } else {
                    await this.load();
                }
                return;
            }

            if (this.#manager) {
                if (!this.#currentTime) {
                    this.#manager.start();
                } else {
                    this.#manager.resume();
                }
                this.#playing = true;
            } else {
                await this._onPlay();
            }

            const e = addEvent('play');
            this.#media.element.dispatchEvent(e);
        } catch (err) {
            await this._onPlay();
        }
    }

    pause(): void {
        if (this.#manager) {
            this.#playing = false;
            this.#manager.pause();
            const e = addEvent('pause');
            this.#media.element.dispatchEvent(e);
        }
    }

    resizeAds(width?: number, height?: number): void {
        if (this.#manager) {
            const target = this.#media.element;
            const mode =
                target.getAttribute('data-fullscreen') === 'true'
                    ? google.ima.ViewMode.FULLSCREEN
                    : google.ima.ViewMode.NORMAL;
            let formattedWidth = width;
            const percentageWidth = width ? width.toString() : '';
            if (width && percentageWidth.indexOf('%') > -1) {
                if (this.#media.element.parentElement) {
                    formattedWidth =
                        this.#media.element.parentElement.offsetWidth * (parseInt(percentageWidth, 10) / 100);
                }
            }
            let formattedHeight = height;
            const percentageHeight = height ? height.toString() : '';
            if (height && percentageHeight.indexOf('%') > -1) {
                if (this.#media.element.parentElement) {
                    formattedHeight =
                        this.#media.element.parentElement.offsetHeight * (parseInt(percentageHeight, 10) / 100);
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

    destroy(): void {
        if (this.#timer) {
            clearInterval(this.#timer);
        }
        if (this.#manager) {
            this.#manager.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onError);
            if (this.#events) {
                this.#events.forEach((event) => {
                    this.#manager.removeEventListener(event, this._onEvent);
                });
            }
        }
        if (this.#loader) {
            this.#loader.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onError);
            this.#loader.removeEventListener(
                google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                this._onAdsManagerLoaded
            );
        }
        const destroy = !Array.isArray(this.#ads) || this.#index > this.#ads.length;
        if (this.#manager && destroy) {
            this.#manager.destroy();
        }
        if (this.#options.customClick?.enabled && this.#clickContainer) {
            this.#clickContainer.remove();
        }
        if (this.#options.audioSkip?.enabled && this.#skipElement) {
            this.#skipElement.removeEventListener('click', this._handleSkipAds);
            if (this.#skipElement?.classList.contains('op-ads__skip')) {
                this.#skipElement.remove();
            }
        }
        if (isIOS() || isAndroid()) {
            this.#media.element.removeEventListener('loadedmetadata', this._loadAds);
        }
        this.#media.element.removeEventListener('loadedmetadata', this._handleResizeAds);
        this.#media.element.removeEventListener('loadedmetadata', this._onPreloadContent);
        this.#media.element.removeEventListener('ended', this._onEnded);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this._handleResizeAds);
        }
        if (this.#container) {
            this.#container.removeEventListener('click', this._handleClickInContainer);
            this.#container.remove();
        }
        this.#playing = false;
        this.#duration = 0;
        this.#currentTime = 0;
    }

    set src(source: string | string[]) {
        this.#ads = source;
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
        return this.#manager ? this.#manager.getVolume() : this.#mediaVolume;
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
        return !this.#playing;
    }

    get ended(): boolean {
        return this.#ended;
    }

    private async _loadIMA(): Promise<void> {
        const path = this.#options?.debug
            ? this.#options?.sdkPath?.replace(/(\.js$)/, '_debug.js')
            : this.#options?.sdkPath;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (path && !(window as any).google?.ima) {
                await loadScript(path);
            }
        } catch (error) {
            const message =
                'Ad script could not be loaded; please check if you have an AdBlock turned on, or if you provided a valid URL';
            console.error(`Ad error: ${message}.`);

            const details = {
                detail: {
                    data: error,
                    message,
                    type: 'Ads',
                },
            };
            const errorEvent = addEvent('playererror', details);
            this.#media.element.dispatchEvent(errorEvent);
        }
    }

    private _setAdSettings(): void {
        const vpaidModeMap: Record<string, unknown> = {
            disabled: google.ima.ImaSdkSettings.VpaidMode.DISABLED,
            enabled: google.ima.ImaSdkSettings.VpaidMode.ENABLED,
            insecure: google.ima.ImaSdkSettings.VpaidMode.INSECURE,
        };

        google.ima.settings.setVpaidMode(vpaidModeMap[this.#options.vpaidMode || 'enabled']);
        google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
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
    }

    private _loadAdsContainer(): void {
        this.#container = document.createElement('div');
        this.#container.className = 'op-ads';
        this.#container.tabIndex = -1;
        if (this.#media.element.parentElement) {
            this.#media.element.parentElement.insertBefore(this.#container, this.#media.element.nextSibling);
        }
        this.#container.addEventListener('click', this._handleClickInContainer, EVENT_OPTIONS);

        this.#displayContainer = new google.ima.AdDisplayContainer(
            this.#container,
            this.#media.element,
            this.#clickContainer
        );

        if (!this.#options.autoPlayAdBreaks) {
            this.#displayContainer.initialize();
        }
    }

    private async _loadAdsLoader(): Promise<void> {
        this.#loader = new google.ima.AdsLoader(this.#displayContainer);

        if (!this.#options.autoPlayAdBreaks) {
            this.#loader.getSettings().setAutoPlayAdBreaks(false);
        }

        this.#loader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this._onAdsManagerLoaded,
            EVENT_OPTIONS
        );
        this.#loader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onError, EVENT_OPTIONS);
        this.#media.element.addEventListener('ended', this._onEnded, EVENT_OPTIONS);
    }

    private _handleClickInContainer(): void {
        if (this.#media.paused) {
            this.#playing = false;
            const e = addEvent('paused');
            this.#media.element.dispatchEvent(e);
            this.pause();
        }
    }

    private _requestAds(livePrefetchSeconds = 0): void {
        const ads = Array.isArray(this.#ads) ? this.#ads[this.#index] : this.#ads;
        this.#request = new google.ima.AdsRequest();

        if (!this.#options.autoPlayAdBreaks) {
            this.#loader.getSettings().setAutoPlayAdBreaks(false);
        }

        if (isXml(ads)) {
            this.#request.adsResponse = ads;
        } else {
            this.#request.adTagUrl = ads;
        }

        const width = this.#media.element.parentElement ? this.#media.element.parentElement.offsetWidth : 0;
        const height = this.#media.element.parentElement ? this.#media.element.parentElement.offsetHeight : 0;

        this.#request.linearAdSlotWidth = width;
        this.#request.linearAdSlotHeight = height;
        this.#request.nonLinearAdSlotWidth = width;
        this.#request.nonLinearAdSlotHeight = height / 3;

        if (this.#options.live) {
            this.#request.liveStreamPrefetchSeconds = livePrefetchSeconds;
        }

        if (this.#options.autoPlayAdBreaks) {
            this.#request.setAdWillAutoPlay(this.#autostart);
            this.#request.setAdWillPlayMuted(this.#autostartMuted);
        }
        this.#loader.requestAds(this.#request);
    }

    private _setMediaVolume(volume: number): void {
        this.#media.volume = volume;
        this.#media.muted = volume === 0;
    }

    private _handleResizeAds(): void {
        this.resizeAds();
    }

    private _createCustomClick(): void {
        if (this.#options.customClick?.enabled) {
            if (this.#clickContainer) {
                this.#clickContainer.remove();
            }

            this.#clickContainer = document.createElement('div');
            this.#clickContainer.className = 'op-ads__click-container';
            this.#clickContainer.innerHTML = `<div class="op-ads__click-label">${sanitize(
                this.#options.customClick.label
            )}</div>`;
            if (this.#media.element.parentElement) {
                this.#media.element.parentElement.insertBefore(this.#clickContainer, this.#media.element.nextSibling);
            }
        }
    }

    private _createSkipElement(): void {
        if (isAudio(this.#media.element) && this.#options.audioSkip?.enabled) {
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
                // Default control created
                this.#skipElement = this.#media.element.parentElement?.querySelector('.op-ads__skip') || undefined;
            }
            if (this.#skipElement) {
                this.#skipElement.addEventListener('click', this._handleSkipAds, EVENT_OPTIONS);
            }
        }
    }

    private _handleSkipAds(): void {
        this.#manager.skip();
    }

    private async _onError(event: any): Promise<void> {
        const error = event.getError();
        const details = {
            detail: {
                data: error,
                message: error.toString(),
                type: 'Ads',
            },
        };
        const errorEvent = addEvent('playererror', details);
        this.#media.element.dispatchEvent(errorEvent);

        // @see https://support.google.com/admanager/answer/4442429?hl=en
        const fatalErrorCodes = [
            100, 101, 102, 300, 301, 302, 303, 400, 401, 402, 403, 405, 406, 407, 408, 409, 410, 500, 501, 502, 503,
            900, 901, 1005,
        ];

        if (Array.isArray(this.#ads) && this.#ads.length > 1 && this.#index < this.#ads.length - 1) {
            this.#index++;
            this.destroy();
            this.#started = true;
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
            this.#adEvent = null;
            if (this.#autostart === true || this.#autostartMuted === true || this.#started === true) {
                this._onPlay();
            }
        }
    }

    private async _onAdsManagerLoaded(adsManagerLoadedEvent: any): Promise<void> {
        const adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

        this.#manager = adsManagerLoadedEvent.getAdsManager(this.#media.element, adsRenderingSettings);
        this.#manager.setVolume(this.#autostart && this.#autostartMuted ? 0 : 1);

        if (this.#clickContainer) {
            this.#clickContainer.style.display = this.#manager.isCustomClickTrackingUsed() ? 'block' : 'none';
        }

        this.#manager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._onError, EVENT_OPTIONS);
        this.#manager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this._onPause, EVENT_OPTIONS);
        this.#manager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this._onPlay, EVENT_OPTIONS);

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
            this.#events.push(google.ima.AdEvent.Type.AD_BREAK_READY);
        }

        this.#events.forEach((event) => {
            this.#manager.addEventListener(event, this._onEvent, EVENT_OPTIONS);
        });

        try {
            this.#manager.init(
                this.#media.element.offsetWidth,
                this.#media.element.offsetHeight,
                this.#media.element.parentElement?.getAttribute('data-fullscreen') === 'true'
                    ? google.ima.ViewMode.FULLSCREEN
                    : google.ima.ViewMode.NORMAL
            );

            if (this.#options.autoPlayAdBreaks) {
                this.#manager.start();
            }
        } catch (err) {
            await this.play();
        }
    }

    private async _onEvent(event: any): Promise<void> {
        const ad = event.getAd();
        if (ad) {
            this.#adEvent = ad;
        }

        switch (event.type) {
            case google.ima.AdEvent.Type.LOADED:
                if (!ad.isLinear()) {
                    this._onPlay();
                } else {
                    if (isIPhone() && isVideo(this.#media.element)) {
                        this.#media.element.controls = false;
                    }
                    this.#duration = ad.getDuration();
                    this.#currentTime = ad.getDuration();
                    this.resizeAds();
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                if (ad.isLinear()) {
                    if (
                        this.#media.element.parentElement &&
                        !this.#media.element.parentElement.classList.contains('op-ads--active')
                    ) {
                        this.#media.element.parentElement.classList.add('op-ads--active');
                    }

                    if (!this.#media.paused) {
                        this.#media.pause();
                    }
                    this.#playing = true;
                    const playEvent = addEvent('play');
                    this.#media.element.dispatchEvent(playEvent);
                    let resized;

                    if (!resized) {
                        this.resizeAds();
                        resized = true;
                    }

                    if (this.#media.ended) {
                        this.#ended = false;
                        const endEvent = addEvent('adsmediaended');
                        this.#media.element.dispatchEvent(endEvent);
                    }

                    if (typeof window !== 'undefined') {
                        this.#timer = window.setInterval(() => {
                            this.#currentTime = Math.round(this.#manager.getRemainingTime());
                            const timeEvent = addEvent('timeupdate');
                            this.#media.element.dispatchEvent(timeEvent);
                        }, 350);
                    }
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
            case google.ima.AdEvent.Type.SKIPPED:
                if (ad.isLinear()) {
                    if (this.#started) {
                        this.#started = false;
                    }
                    if (event.type === google.ima.AdEvent.Type.SKIPPED) {
                        const skipEvent = addEvent('adsskipped');
                        this.#media.element.dispatchEvent(skipEvent);
                    }

                    if (this.#media.element.parentElement) {
                        this.#media.element.parentElement.classList.remove('op-ads--active');
                    }

                    clearInterval(this.#timer);
                }
                break;
            case google.ima.AdEvent.Type.VOLUME_CHANGED:
                this._setMediaVolume(this.volume);
                break;
            case google.ima.AdEvent.Type.VOLUME_MUTED:
                if (ad.isLinear()) {
                    const volumeEvent = addEvent('volumechange');
                    this.#media.element.dispatchEvent(volumeEvent);
                }
                break;
            case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
                if (this.#options.live) {
                    this.#initialized = false;
                    this._requestAds(this.#prefetchSeconds - 5);
                    setTimeout(this.play, this.#prefetchSeconds * 1000);
                } else if (ad.isLinear() && (typeof this.#ads === 'string' || this.#index < this.#ads.length)) {
                    this.#ended = true;
                    this.#started = false;
                    this.#initialized = false;
                    this.#timer = 0;
                    this.#currentTime = 0;
                    this.#duration = 0;
                    this.#muted = false;
                    this.#playing = false;
                    this.#adEvent = null;
                    this.destroy();

                    if (Array.isArray(this.#ads) && this.#index < this.#ads.length) {
                        this.#ended = false;
                        this.#index++;
                        this.#loader.contentComplete();
                        this.load(true);
                    } else {
                        if (this.#media.element.parentElement) {
                            this.#media.element.parentElement.classList.remove('op-ads--active');
                        }
                        if (this.#media.element.currentTime >= this.#media.element.duration) {
                            const endedEvent = addEvent('ended');
                            this.#media.element.dispatchEvent(endedEvent);
                        }
                    }
                }
                break;
            case google.ima.AdEvent.Type.AD_BREAK_READY:
                if (this.#manager) {
                    this.#playing = true;
                    this.#manager.start();
                }
                break;
            case google.ima.AdEvent.Type.CLICK:
                this.#playing = false;
                const pauseEvent = addEvent('pause');
                this.#media.element.dispatchEvent(pauseEvent);
                break;
            case google.ima.AdEvent.Type.AD_PROGRESS:
                const progressData = event.getAdData();
                const offset = this.#adEvent ? this.#adEvent.getSkipTimeOffset() : -1;
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
                this.#media.element.dispatchEvent(errorEvent);
            }
        } else {
            const e = addEvent(`ads${event.type}`);
            this.#media.element.dispatchEvent(e);
        }
    }

    private _onPreloadContent(): void {
        if (isAndroid() || isIOS()) {
            this.#media.element.addEventListener('loadedmetadata', this._loadAds, EVENT_OPTIONS);
            this.#media.load();

            // Since mobile devices require user interaction to download any part of the media file,
            // programatically dispatch the event
            const e = addEvent('loadedmetadata');
            this.#media.element.dispatchEvent(e);
        } else {
            this._loadAds();
        }
    }

    private _onMetadataLoaded(): void {
        if (this.#media.element.seekable.length) {
            if (this.#media.element.seekable.end(0) > this.#currentSavedTime) {
                this._onPlay();
            }
        } else {
            setTimeout(this._onMetadataLoaded, 100);
        }
    }

    private _loadAds(): void {
        this.#media.element.removeEventListener('loadedmetadata', this._loadAds);
        this._requestAds();
    }

    private async _onPlay(): Promise<void> {
        this.#media.currentTime = this.#currentSavedTime;
        this.#media.element.addEventListener('ended', this._onEnded, EVENT_OPTIONS);
        this.#timer = 0;
        this.#started = false;
        this.#muted = false;
        this.#duration = 0;
        this.#currentTime = 0;
        if (this.#media.element.parentElement) {
            this.#media.element.parentElement.classList.remove('op-ads--active');
        }
        try {
            await this.#media.play();
            const e = addEvent('play');
            this.#media.element.dispatchEvent(e);
        } catch (err) {
            console.error(err);
        }
    }

    private _onPause(): void {
        this.#currentSavedTime = this.#media.currentTime;
        this.#media.pause();
        this.#media.element.removeEventListener('ended', this._onEnded);
    }

    private _onEnded(): void {
        this.#ended = true;
        this.#started = false;
        this.#media.element.removeEventListener('ended', this._onEnded);
        if (this.#loader) {
            this.#loader.contentComplete();
        }
    }
}
