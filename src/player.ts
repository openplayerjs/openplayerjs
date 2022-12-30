import Controls from './controls';
import Fullscreen from './controls/fullscreen';
import { CustomMedia, ElementItem, EventsList, MediaMethods, PlayerOptions, Source, Track } from './interfaces';
import Media from './media';
import Ads from './media/ads';
import { EVENT_OPTIONS, isAndroid, isIOS, isIPhone } from './utils/constants';
import { addEvent, isAudio, isVideo } from './utils/general';
import { isAutoplaySupported, predictMimeType } from './utils/media';

export default class Player {
    static instances: { [id: string]: MediaMethods } = {};

    static customMedia: CustomMedia = {
        media: {},
        optionsKey: {},
        rules: [],
    };

    static addMedia(name: string, mimeType: string, valid: (url: string) => string, media: Source): void {
        Player.customMedia.media[mimeType] = media;
        Player.customMedia.optionsKey[mimeType] = name;
        Player.customMedia.rules.push(valid);
    }

    loader: HTMLSpanElement;

    playBtn: HTMLButtonElement;

    #controls: Controls;

    #adsInstance: Ads;

    #uid = '';

    #element: HTMLMediaElement;

    #ads?: string | string[];

    #media: Media;

    #events: EventsList = {};

    #autoplay = false;

    #volume: number;

    #canAutoplay = false;

    #canAutoplayMuted = false;

    #processedAutoplay = false;

    #options: PlayerOptions;

    #customElements: ElementItem[] = [];

    #fullscreen: Fullscreen;

    #defaultOptions: PlayerOptions = {
        controls: {
            alwaysVisible: false,
            layers: {
                left: ['play', 'time', 'volume'],
                middle: ['progress'],
                right: ['captions', 'settings', 'fullscreen'],
            },
        },
        defaultLevel: undefined,
        detachMenus: false,
        forceNative: true,
        height: 0,
        hidePlayBtnTimer: 350,
        labels: {
            auto: 'Auto',
            captions: 'CC/Subtitles',
            click: 'Click to unmute',
            fullscreen: 'Fullscreen',
            lang: {
                en: 'English',
            },
            levels: 'Quality Levels',
            live: 'Live Broadcast',
            mediaLevels: 'Change Quality',
            mute: 'Mute',
            off: 'Off',
            pause: 'Pause',
            play: 'Play',
            progressRail: 'Time Rail',
            progressSlider: 'Time Slider',
            settings: 'Player Settings',
            speed: 'Speed',
            speedNormal: 'Normal',
            tap: 'Tap to unmute',
            toggleCaptions: 'Toggle Captions',
            unmute: 'Unmute',
            volume: 'Volume',
            volumeControl: 'Volume Control',
            volumeSlider: 'Volume Slider',
        },
        live: {
            showLabel: true,
            showProgress: false,
        },
        media: {
            pauseOnClick: false,
        },
        minimalist: false,
        mode: 'responsive', // or `fill` or `fit`
        onError: (e: unknown) => console.error(e),
        pauseOthers: true,
        progress: {
            allowRewind: true,
            allowSkip: true,
            duration: 0,
            showCurrentTimeOnly: false,
        },
        showLoaderOnInit: false,
        startTime: 0,
        startVolume: 1,
        step: 0,
        useDeviceVolume: true,
        width: 0,
    };

    constructor(element: HTMLMediaElement | string, options?: PlayerOptions) {
        this.#element =
            element instanceof HTMLMediaElement ? element : (document.getElementById(element) as HTMLMediaElement);
        if (this.#element) {
            this.#autoplay = this.#element.autoplay || false;
            if (typeof options !== 'string' && !Array.isArray(options)) {
                this.#options = { ...this.#defaultOptions, ...options };
                const complexOptions = Object.keys(this.#defaultOptions).filter(
                    (key) => typeof this.#defaultOptions[key] === 'object'
                );
                complexOptions.forEach((key) => {
                    const currOption = options ? options[key] || {} : {};
                    if (Object.keys(currOption).length) {
                        this.#options[key] = {
                            ...(this.#defaultOptions[key] as Record<string, unknown>),
                            ...(currOption as Record<string, unknown>),
                        };
                    }
                });
            }
            this.#element.volume = this.#options.startVolume || 1;

            if (this.#options.ads && this.#options.ads.src) {
                this.#ads = this.#options.ads.src;
            }
            if ((this.#options?.startTime || 0) > 0) {
                this.#element.currentTime = this.#options.startTime || 0;
            }
            this.#volume = this.#element.volume;
        }

        this._autoplay = this._autoplay.bind(this);
        this._enableKeyBindings = this._enableKeyBindings.bind(this);
    }

    async init(): Promise<void> {
        if (!this._isValid()) {
            return;
        }

        this._wrapInstance();
        this._generateID();
        await this.prepareMedia();

        if (!this.#options.minimalist) {
            this._createPlayButton();
            this._createControls();
            this._setEvents();
        }
        Player.instances[this.id] = this;
    }

    async load(): Promise<void> {
        if (!this.#media) {
            await this.prepareMedia();
            await (this.#media as Media).load();
        }
    }

    async play(): Promise<void> {
        if (!this.#media.loaded) {
            await this.#media.load();
            this.#media.loaded = true;
        }
        if (this.#adsInstance) {
            return this.#adsInstance.play();
        }
        return this.#media.play();
    }

    pause(): void {
        if (this.#adsInstance) {
            this.#adsInstance.pause();
        } else {
            this.#media.pause();
        }
    }

    stop(): void {
        this.pause();

        if (this.#media) {
            this.#media.currentTime = 0;
            this.src = [{ src: '', type: 'video/mp4' }];
        }
    }

    destroy(): void {
        if (this.#adsInstance) {
            this.#adsInstance.pause();
            this.#adsInstance.destroy();
        }

        if (this.#fullscreen) {
            this.#fullscreen.destroy();
        }

        const el = this.#element as HTMLMediaElement;
        if (this.#media) {
            this.#media.destroy();
        }

        Object.keys(this.#events).forEach((event) => {
            el.removeEventListener(event, this.#events[event]);
        });

        this.getContainer().removeEventListener('keydown', this._enableKeyBindings);

        if (this.#autoplay && !this.#processedAutoplay && isVideo(this.#element)) {
            el.removeEventListener('canplay', this._autoplay);
        }
        if (this.#controls) {
            this.#controls.destroy();
        }

        if (isVideo(this.#element)) {
            if (this.playBtn) {
                this.playBtn.remove();
            }
            if (this.loader) {
                this.loader.remove();
            }
        }

        if (this.#options?.onError) {
            this.#element.removeEventListener('playererror', this.#options.onError);
        }

        el.controls = true;
        el.setAttribute('id', this.#uid);
        el.removeAttribute('op-live__enabled');
        el.removeAttribute('data-op-dvr__enabled');
        const parent =
            this.#options.mode === 'fit' && !isAudio(el) ? el.closest('.op-player__fit--wrapper') : el.parentElement;
        if (parent && parent.parentNode) {
            parent.parentNode.replaceChild(el, parent);
        }

        delete Player.instances[this.#uid];

        const e = addEvent('playerdestroyed');
        el.dispatchEvent(e);
    }

    getContainer(): HTMLElement {
        return this.#element.parentElement || this.#element;
    }

    getControls(): Controls {
        return this.#controls;
    }

    getCustomControls(): ElementItem[] {
        return this.#customElements;
    }

    getElement(): HTMLMediaElement {
        return this.#element;
    }

    getEvents(): EventsList {
        return this.#events;
    }

    getOptions(): PlayerOptions {
        return this.#options;
    }

    activeElement(): Ads | Media {
        return this.#adsInstance && this.#adsInstance.started() ? this.#adsInstance : this.#media;
    }

    isMedia(): boolean {
        return this.activeElement() instanceof Media;
    }

    isAd(): boolean {
        return this.activeElement() instanceof Ads;
    }

    getMedia(): Media {
        return this.#media;
    }

    getAd(): Ads {
        return this.#adsInstance;
    }

    addCaptions(args: Track): void {
        if (args.default) {
            const tracks = this.#element.querySelectorAll('track');
            for (let i = 0, total = tracks.length; i < total; i++) {
                (tracks[i] as HTMLTrackElement).default = false;
            }
        }

        const el = this.#element;

        // If captions have been added previously, just update URL and default status
        let track = el.querySelector(`track[srclang="${args.srclang}"][kind="${args.kind}"]`) as HTMLTrackElement;
        if (track) {
            track.src = args.src;
            track.label = args.label;
            track.default = args.default || false;
        } else {
            track = document.createElement('track');
            track.srclang = args.srclang;
            track.src = args.src;
            track.kind = args.kind;
            track.label = args.label;
            track.default = args.default || false;
            el.appendChild(track);
        }

        const e = addEvent('controlschanged');
        el.dispatchEvent(e);
    }

    addControl(args: ElementItem): void {
        args.custom = true;
        args.type = 'button';
        this.#customElements.push(args);
        const e = addEvent('controlschanged');
        this.#element.dispatchEvent(e);
    }

    addElement(args: ElementItem): void {
        args.custom = true;
        this.#customElements.push(args);
        const e = addEvent('controlschanged');
        this.#element.dispatchEvent(e);
    }

    removeControl(controlName: string): void {
        // Check custom controls and remove reference there as well
        this.#customElements.forEach((item: ElementItem, idx: number) => {
            if (item.id === controlName) {
                this.#customElements.splice(idx, 1);
            }
        });
        const e = addEvent('controlschanged');
        this.#element.dispatchEvent(e);
    }

    async prepareMedia(): Promise<void> {
        try {
            if (this.#options?.onError) {
                this.#element.addEventListener('playererror', this.#options.onError, EVENT_OPTIONS);
            }
            if (this.#autoplay && isVideo(this.#element)) {
                this.#element.addEventListener('canplay', this._autoplay, EVENT_OPTIONS);
            }
            this.#media = new Media(this.#element, this.#options, this.#autoplay, Player.customMedia);
            const preload = this.#element.getAttribute('preload');
            if (this.#ads || !preload || preload !== 'none') {
                await this.#media.load();
                this.#media.loaded = true;
            }

            if (!this.#autoplay && this.#ads) {
                const adsOptions = this.#options && this.#options.ads ? this.#options.ads : undefined;
                this.#adsInstance = new Ads(this.#media, this.#ads, false, false, adsOptions);
                await this.#adsInstance.load();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async loadAd(src: string | string[]): Promise<void> {
        try {
            if (this.isAd()) {
                this.getAd().destroy();
                this.getAd().src = src;
                await this.getAd().load();
            } else {
                const adsOptions = this.#options && this.#options.ads ? this.#options.ads : undefined;
                const autoplay = !this.activeElement().paused || this.#canAutoplay;
                this.#adsInstance = new Ads(this.#media, src, autoplay, this.#canAutoplayMuted, adsOptions);
                await this.#adsInstance.load();
            }
        } catch (err) {
            console.error(err);
        }
    }

    set src(media) {
        if (this.#media instanceof Media) {
            this.#media.mediaFiles = [];
            this.#media.src = media;
        } else if (typeof media === 'string') {
            this.#element.src = media;
        } else if (Array.isArray(media)) {
            media.forEach((m) => {
                const source = document.createElement('source');
                source.src = m.src;
                source.type = m.type || predictMimeType(m.src, this.#element);
                this.#element.appendChild(source);
            });
        } else if (typeof media === 'object') {
            this.#element.src = (media as Source).src;
        }
    }

    get src(): Source[] {
        return this.#media.src;
    }

    get id(): string {
        return this.#uid;
    }

    private _isValid(): boolean {
        const el = this.#element;

        if (el instanceof HTMLElement === false) {
            return false;
        }

        if (!isAudio(el) && !isVideo(el)) {
            return false;
        }

        if (!el.classList.contains('op-player__media')) {
            return false;
        }

        return true;
    }

    private _wrapInstance(): void {
        const wrapper = document.createElement('div');
        wrapper.className = 'op-player op-player__keyboard--inactive';
        wrapper.className += isAudio(this.#element) ? ' op-player__audio' : ' op-player__video';
        wrapper.tabIndex = 0;

        this.#element.classList.remove('op-player');
        if (this.#element.parentElement) {
            this.#element.parentElement.insertBefore(wrapper, this.#element);
        }
        wrapper.appendChild(this.#element);

        const messageContainer = document.createElement('div');
        messageContainer.className = 'op-status';
        messageContainer.innerHTML = '<span></span>';
        messageContainer.tabIndex = -1;
        messageContainer.setAttribute('aria-hidden', 'true');

        if (isVideo(this.#element) && this.#element.parentElement) {
            this.#element.parentElement.insertBefore(messageContainer, this.#element);
        }

        wrapper.addEventListener(
            'keydown',
            (): void => {
                if (wrapper.classList.contains('op-player__keyboard--inactive')) {
                    wrapper.classList.remove('op-player__keyboard--inactive');
                }
            },
            EVENT_OPTIONS
        );

        wrapper.addEventListener(
            'click',
            (): void => {
                if (!wrapper.classList.contains('op-player__keyboard--inactive')) {
                    wrapper.classList.add('op-player__keyboard--inactive');
                }
            },
            EVENT_OPTIONS
        );

        if (this.#options.mode === 'fill' && !isAudio(this.#element) && !isIPhone()) {
            // Create fill effect on video, scaling and cropping dimensions relative to its parent, setting just a class.
            // This method centers the video view using pure CSS in both Ads and Media.
            // @see https://slicejack.com/fullscreen-html5-video-background-css/
            this.getContainer().classList.add('op-player__full');
        } else if (this.#options.mode === 'fit' && !isAudio(this.#element)) {
            const container = this.getContainer();
            if (container.parentElement) {
                const fitWrapper = document.createElement('div');
                fitWrapper.className = 'op-player__fit--wrapper';
                fitWrapper.tabIndex = 0;
                container.parentElement.insertBefore(fitWrapper, container);
                fitWrapper.appendChild(container);
                container.classList.add('op-player__fit');
            }
        } else {
            let style = '';
            if (this.#options.width) {
                const width =
                    typeof this.#options.width === 'number' ? `${this.#options.width}px` : this.#options.width;
                style += `width: ${width} !important;`;
            }
            if (this.#options.height) {
                const height =
                    typeof this.#options.height === 'number' ? `${this.#options.height}px` : this.#options.height;
                style += `height: ${height} !important;`;
            }

            if (style) {
                wrapper.setAttribute('style', style);
            }
        }
    }

    private _createControls(): void {
        if (isIPhone() && isVideo(this.#element)) {
            this.getContainer().classList.add('op-player__ios--iphone');
        }

        this.#controls = new Controls(this);
        this.#controls.create();

        if (isAudio(this.#element) && this.#options.ads?.audioSkip?.enabled) {
            if (!this.#options.ads?.audioSkip?.element) {
                const skipControl = document.createElement('button');
                skipControl.className = 'op-ads__skip hidden';
                this.#controls.getContainer().appendChild(skipControl);
            }
        }
    }

    private _generateID(): void {
        if (this.#element.id) {
            this.#uid = this.#element.id;
            this.#element.removeAttribute('id');
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cryptoLib = crypto as any;
            const encryption =
                typeof cryptoLib.getRandomBytes === 'function' ? cryptoLib.getRandomBytes : cryptoLib.getRandomValues;
            this.#uid = `op_${encryption(new Uint32Array(1))[0].toString(36).substr(2, 9)}`;
        }

        if (this.#element.parentElement) {
            this.#element.parentElement.id = this.#uid;
        }
    }

    private _createPlayButton(): void {
        if (isAudio(this.#element)) {
            return;
        }

        this.playBtn = document.createElement('button');
        this.playBtn.className = 'op-player__play';
        this.playBtn.tabIndex = 0;
        this.playBtn.title = this.#options.labels?.play || '';
        this.playBtn.innerHTML = `<span>${this.#options.labels?.play || ''}</span>`;
        this.playBtn.setAttribute('aria-pressed', 'false');
        this.playBtn.setAttribute('aria-hidden', 'false');

        this.loader = document.createElement('span');
        this.loader.className = 'op-player__loader';
        this.loader.tabIndex = -1;
        this.loader.setAttribute('aria-hidden', 'true');

        if (this.#element.parentElement) {
            this.#element.parentElement.insertBefore(this.loader, this.#element);
            this.#element.parentElement.insertBefore(this.playBtn, this.#element);
        }

        this.playBtn.addEventListener(
            'click',
            (): void => {
                if (this.activeElement().paused) {
                    this.activeElement().play();
                } else {
                    this.activeElement().pause();
                }
            },
            EVENT_OPTIONS
        );
    }

    private _setEvents(): void {
        if (isVideo(this.#element)) {
            this.#events.loadedmetadata = (): void => {
                const el = this.activeElement();
                if (this.#options.showLoaderOnInit && !isIPhone() && !isAndroid()) {
                    this.loader.setAttribute('aria-hidden', 'false');
                    this.playBtn.setAttribute('aria-hidden', 'true');
                } else {
                    this.loader.setAttribute('aria-hidden', 'true');
                    this.playBtn.setAttribute('aria-hidden', 'false');
                }
                if (el.paused) {
                    this.playBtn.classList.remove('op-player__play--paused');
                    this.playBtn.setAttribute('aria-pressed', 'false');
                }
            };
            this.#events.waiting = (): void => {
                this.playBtn.setAttribute('aria-hidden', 'true');
                this.loader.setAttribute('aria-hidden', 'false');
            };
            this.#events.seeking = (): void => {
                const el = this.activeElement();
                this.playBtn.setAttribute('aria-hidden', 'true');
                this.loader.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
            };
            this.#events.seeked = (): void => {
                const el = this.activeElement();
                if (Math.round(el.currentTime) === 0) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'false');
                } else {
                    this.playBtn.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
                    this.loader.setAttribute('aria-hidden', 'true');
                }
            };
            this.#events.play = (): void => {
                this.playBtn.classList.add('op-player__play--paused');
                this.playBtn.title = this.#options.labels?.pause || '';
                this.loader.setAttribute('aria-hidden', 'true');
                if (this.#options.showLoaderOnInit) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                } else {
                    setTimeout((): void => {
                        this.playBtn.setAttribute('aria-hidden', 'true');
                    }, this.#options.hidePlayBtnTimer);
                }
            };
            this.#events.playing = (): void => {
                this.loader.setAttribute('aria-hidden', 'true');
                this.playBtn.setAttribute('aria-hidden', 'true');
            };
            this.#events.pause = (): void => {
                const el = this.activeElement();
                this.playBtn.classList.remove('op-player__play--paused');
                this.playBtn.title = this.#options.labels?.play || '';

                if (this.#options.showLoaderOnInit && Math.round(el.currentTime) === 0) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'false');
                } else {
                    this.playBtn.setAttribute('aria-hidden', 'false');
                    this.loader.setAttribute('aria-hidden', 'true');
                }
            };
            this.#events.ended = (): void => {
                this.loader.setAttribute('aria-hidden', 'true');
                this.playBtn.setAttribute('aria-hidden', 'true');
            };
            // This workflow is needed when media is on a loop and post roll needs to be played.
            // This happens because, when in loop, media never sends the `ended` event back;
            // so, when media reaches a quarter of a second left before the end, Ads would be dispatched
            // @see https://github.com/googleads/videojs-ima/issues/890
            let postRollCalled = false;
            this.#events.timeupdate = (): void => {
                if (this.#element.loop && this.isMedia() && this.#adsInstance) {
                    const el = this.getMedia();
                    const remainingTime = el.duration - el.currentTime;
                    if (remainingTime > 0 && remainingTime <= 0.25 && !postRollCalled) {
                        postRollCalled = true;
                        const e = addEvent('ended');
                        this.#element.dispatchEvent(e);
                    } else if (remainingTime === 0) {
                        postRollCalled = false;
                    }
                }
            };
        }

        Object.keys(this.#events).forEach((event) => {
            this.#element.addEventListener(event, this.#events[event], EVENT_OPTIONS);
        });

        this.getContainer().addEventListener('keydown', this._enableKeyBindings, EVENT_OPTIONS);
    }

    private async _autoplay(): Promise<void> {
        if (!this.#processedAutoplay) {
            this.#processedAutoplay = true;
            this.#element.removeEventListener('canplay', this._autoplay);

            await isAutoplaySupported(
                this.#element,
                this.#volume,
                (autoplay) => {
                    this.#canAutoplay = autoplay;
                },
                (muted) => {
                    this.#canAutoplayMuted = muted;
                },
                async (): Promise<void> => {
                    if (this.#canAutoplayMuted) {
                        this.activeElement().muted = true;
                        this.activeElement().volume = 0;

                        const e = addEvent('volumechange');
                        this.#element.dispatchEvent(e);

                        // Insert element to unmute if browser allows autoplay with muted media
                        const volumeEl = document.createElement('div');
                        const action =
                            isIOS() || isAndroid()
                                ? this.#options.labels?.tap || ''
                                : this.#options.labels?.click || '';
                        volumeEl.className = 'op-player__unmute';
                        volumeEl.innerHTML = `<span>${action}</span>`;
                        volumeEl.tabIndex = 0;

                        volumeEl.addEventListener(
                            'click',
                            (): void => {
                                this.activeElement().muted = false;
                                this.activeElement().volume = this.#volume;

                                const event = addEvent('volumechange');
                                this.#element.dispatchEvent(event);

                                volumeEl.remove();
                            },
                            EVENT_OPTIONS
                        );

                        const target = this.getContainer();
                        target.insertBefore(volumeEl, target.firstChild);
                    } else {
                        this.activeElement().muted = this.#element.muted;
                        this.activeElement().volume = this.#volume;
                    }

                    if (this.#ads) {
                        const adsOptions = this.#options && this.#options.ads ? this.#options.ads : undefined;
                        this.#adsInstance = new Ads(
                            this.#media,
                            this.#ads,
                            this.#canAutoplay,
                            this.#canAutoplayMuted,
                            adsOptions
                        );
                        await this.#adsInstance.load();
                    } else if (this.#canAutoplay || this.#canAutoplayMuted) {
                        await this.play();
                    }
                }
            );
        }
    }

    private _enableKeyBindings(e: KeyboardEvent): void {
        const key = e.key || '';
        const el = this.activeElement();
        const isAd = this.isAd();
        const playerFocused = document?.activeElement?.classList.contains('op-player');

        switch (key) {
            case 'Enter':
            case 'K':
            case ' ':
                // Avoid interference of Enter/Space keys when focused in the player container
                if (playerFocused && (key === ' ' || key === 'Enter')) {
                    if (el.paused) {
                        el.play();
                    } else {
                        el.pause();
                    }
                } else if (key === 'K') {
                    if (el.paused) {
                        el.play();
                    } else {
                        el.pause();
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                break;
            case 'End':
                if (!isAd && el.duration !== Infinity) {
                    el.currentTime = el.duration;
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
            case 'Home':
                if (!isAd) {
                    el.currentTime = 0;
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'J':
            case 'L':
                if (!isAd && el.duration !== Infinity) {
                    // Letters L/J will be used to control the step
                    let newStep = 5;
                    const configStep = this.getOptions().step;
                    if (configStep) {
                        newStep = key === 'J' || key === 'L' ? configStep * 2 : configStep;
                    } else if (key === 'J' || key === 'L') {
                        newStep = 10;
                    }
                    const step = el.duration !== Infinity ? newStep : this.getOptions().progress?.duration || 0;
                    el.currentTime += key === 'ArrowRight' || key === 'J' ? step * -1 : step;
                    if (el.currentTime < 0) {
                        el.currentTime = 0;
                    } else if (el.currentTime >= el.duration) {
                        el.currentTime = el.duration;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                const newVol = key === 'ArrowUp' ? Math.min(el.volume + 0.1, 1) : Math.max(el.volume - 0.1, 0);
                el.volume = newVol;
                el.muted = !(newVol > 0);
                e.preventDefault();
                e.stopPropagation();
                break;
            case 'F':
                if (isVideo(this.#element) && !e.ctrlKey) {
                    this.#fullscreen = new Fullscreen(this, '', '');
                    if (typeof this.#fullscreen.fullScreenEnabled !== 'undefined') {
                        this.#fullscreen.toggleFullscreen();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
                break;
            case 'M':
                el.muted = !el.muted;
                if (el.muted) {
                    el.volume = 0;
                } else {
                    el.volume = this.#volume;
                }
                e.preventDefault();
                e.stopPropagation();
                break;
            case '<':
            case '>':
                if (!isAd && e.shiftKey) {
                    const elem = el as Media;
                    elem.playbackRate =
                        key === '<' ? Math.max(elem.playbackRate - 0.25, 0.25) : Math.min(elem.playbackRate + 0.25, 2);
                    // Show playbackRate and update controls to reflect change in settings
                    const target = this.getContainer().querySelector('.op-status>span');
                    if (target) {
                        target.textContent = `${elem.playbackRate}x`;
                        if (target.parentElement) {
                            target.parentElement.setAttribute('aria-hidden', 'false');
                        }
                        setTimeout((): void => {
                            if (target.parentElement) {
                                target.parentElement.setAttribute('aria-hidden', 'true');
                            }
                        }, 500);
                    }
                    const ev = addEvent('controlschanged');
                    dispatchEvent(ev);
                    e.preventDefault();
                    e.stopPropagation();
                } else if (!isAd && el.paused) {
                    el.currentTime += (1 / 25) * (key === '<' ? -1 : 1);
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
            default:
                break;
        }
    }
}

// Expose element globally.
if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).OpenPlayer = Player;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).OpenPlayerJS = Player;
}
