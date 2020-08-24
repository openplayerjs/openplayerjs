import 'core-js/features/array/find';
import 'core-js/features/array/from';
import 'core-js/features/object/assign';
import 'core-js/features/object/keys';
import 'core-js/features/promise';
import 'custom-event-polyfill';
import 'element-closest/browser';

import Controls from './controls';
import Track from './interfaces/captions/track';
import ControlItem from './interfaces/control-item';
import CustomMedia from './interfaces/custom-media';
import EventsList from './interfaces/events-list';
import PlayerInstanceList from './interfaces/instance';
import PlayerOptions from './interfaces/player-options';
import PlaylistItem from './interfaces/playlist-item';
import Source from './interfaces/source';
import Media from './media';
import Ads from './media/ads';
import { IS_ANDROID, IS_IOS, IS_IPHONE } from './utils/constants';
import { addEvent } from './utils/events';
import { isAudio, isVideo, removeElement } from './utils/general';
import { isAutoplaySupported } from './utils/media';

/**
 * OpenPlayerJS.
 *
 * @description This class generates controls to play native media (such as MP4, MP3, HLS, M(PEG-DASH),
 * and have a unified look-and-feel on all modern browsers (including IE11)
 * @class Player
 */
class Player {
    /**
     * Collection of OpenPlayer instances.
     *
     * @type PlayerInstanceList
     * @memberof Player
     */
    public static instances: PlayerInstanceList = {};

    /**
     * Collection of additional (non-native) media
     *
     * @type CustomMedia
     * @memberof Player
     */
    public static customMedia: CustomMedia = {
        media: {},
        optionsKey: {},
        rules: [],
    };

    /**
     * Convert all the video/audio tags with `op-player` class in a OpenMedia player instance.
     *
     * @memberof Player
     */
    public static init(): void {
        Player.instances = {};
        const targets = document.querySelectorAll('video.op-player, audio.op-player');
        for (let i = 0, total = targets.length; i < total; i++) {
            const target = (targets[i] as HTMLMediaElement);
            const player = new Player(target, JSON.parse(target.getAttribute('data-op-settings')));
            player.init();
        }
    }

    /**
     * Add new media types, such as iframe API players (YouTube, Vimeo, Dailymotion, etc.)
     *
     * @param {string} name  The name of the media, which will be used to determine options when configuring player
     * @param {string} mimeType  The pseudo MIME type associated with media (generally, will be `video/x-[name]`)
     * @param {(url: string) => string} valid  A callback to determine if a match was found between the MIME type and media source
     * @param {object} media  The object that will contain all the native methods/setters/getters to play media
     * @memberof Player
     */
    public static addMedia(name: string, mimeType: string, valid: (url: string) => string, media: any) {
        Player.customMedia.media[mimeType] = media;
        Player.customMedia.optionsKey[mimeType] = name;
        Player.customMedia.rules.push(valid);
    }

    /**
     * Instance of Controls object.
     *
     * @type Controls
     * @memberof Player
     */
    public controls: Controls;

    /**
     * Instance of Ads object.
     *
     * @type Ads
     * @memberof Player
     */
    public adsInstance?: Ads;

    /**
     * Button to play media.
     *
     * @type HTMLButtonElement
     * @memberof Player
     */
    public playBtn: HTMLButtonElement;

    /**
     * Element to indicate that media is being loaded.
     *
     * Only applies for `Media` object, since `Ads` does not need it.
     * @type HTMLSpanElement
     * @memberof Player
     */
    public loader: HTMLSpanElement;

    public playlist: PlaylistItem[] = [];

    /**
     * Unique identified for the current player instance.
     *
     * @type string
     * @memberof Player
     */
    private uid: string;

    /**
     * Native video/audio tag to create player instance.
     *
     * @type HTMLMediaElement
     * @memberof Player
     */
    private element: HTMLMediaElement;

    /**
     * URL that defines a valid Ad XML file to be read by Google IMA SDK
     *
     * @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/tags
     * @type string|string[]
     * @memberof Player
     */
    private ads?: string | string[];

    /**
     * Flag to determine if player must be scaled and scrop to fit parent container
     * (only for video elements)
     *
     * @private
     * @type boolean
     * @memberof Player
     */
    private fill?: boolean;

    /**
     * Instance of Media object.
     *
     * @type Media
     * @memberof Player
     */
    private media: Media;

    /**
     * Events that will be triggered in Player to show/hide Play button and loader element,
     * and to interact with the player using a keyboard for accessibility purposes.
     *
     * @type EventsList
     * @memberof Player
     */
    private events: EventsList = {};

    /**
     * Flag to determine if player can autoplay media.
     *
     * @see [[Player._autoplay]]
     * @type boolean
     * @memberof Player
     */
    private autoplay: boolean = false;

    /**
     * Storage for original volume level vaue, when testing browser's autoplay capabilities
     * to restore it back.
     *
     * @see [[Player._autoplay]]
     * @type number
     * @memberof Player
     */
    private volume: number;

    /**
     * Flag that indicates if browser supports autoplay.
     *
     * @see [[Player._autoplay]]
     * @type boolean
     * @memberof Player
     */
    private canAutoplay: boolean;

    /**
     * Flag that indicates if browser supports autoplay in mute mode.
     *
     * This is the case with iOS.
     * @see [[Player._autoplay]]
     * @type boolean
     * @memberof Player
     */
    private canAutoplayMuted: boolean;

    /**
     * Flag that indicates if autoplay algorithm has been applied.
     *
     * @see [[Player._autoplay]]
     * @type boolean
     * @memberof Player
     */
    private processedAutoplay: boolean = false;

    /**
     * Container for other player options.
     *
     * @private
     * @type PlayerOptions
     * @memberof Player
     */
    private options: PlayerOptions;

    /**
     * List of custom controls.
     *
     * @private
     * @type ControlItem[]
     * @memberof Player
     */
    private customControlItems: ControlItem[] = [];

    /**
     * Default configuration for player.
     *
     * @private
     * @type PlayerOptions
     * @memberof Player
     */
    private defaultOptions: PlayerOptions = {
        controls: {
            alwaysVisible: false,
            layers: {
                left: ['play', 'time', 'volume'],
                middle: ['progress'],
                right: ['captions', 'settings', 'fullscreen'],
            }
        },
        detachMenus: false,
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
            playlist: {
                first: 'First',
                last: 'Last',
                next: 'Next',
                previous: 'Previous',
                toggle: 'Toggle Playlist',
            },
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
        mode: 'responsive',
        onError: () => { },
        playlist: [],
        showLoaderOnInit: false,
        startTime: 0,
        startVolume: 1,
        step: 0,
        live: {
            showLabel: true,
            showProgress: false,
        }
    };

    /**
     * Create an instance of Player.
     *
     * @param {(HTMLMediaElement|string)} element  A video/audio tag or its identifier.
     * @param {PlayerOptions} playerOptions  Options to enhance Hls and Dash players, among other things.
     * @returns {Player}
     * @memberof Player
     */
    constructor(element: HTMLMediaElement | string, options?: PlayerOptions) {
        this.element = element instanceof HTMLMediaElement ? element : (document.getElementById(element) as HTMLMediaElement);
        if (this.element) {
            if (options && options.ads && options.ads.src) {
                this.ads = options.ads.src;
            }
            this.autoplay = this.element.autoplay || false;
            if (typeof options !== 'string' && !Array.isArray(options)) {
                this._mergeOptions(options);
            }
            this.element.volume = this.options.startVolume;
            if (this.options.startTime > 0) {
                this.element.currentTime = this.options.startTime;
            }
            this.volume = this.element.volume;
        }
        return this;
    }

    /**
     * Create all the markup and events needed for the player.
     *
     * Note that no controls will be created if user is trying to instantiate a video element
     * in an iPhone, because iOS will only use QuickTime as a default constrain.
     * @memberof Player
     */
    public init(): void {
        if (this._isValid()) {
            this._wrapInstance();
            if (this.options.playlist.length > 0) {
                this._loadPlaylist(this.options.playlist);
            } else {
                this._prepareMedia();
            }
            this._createPlayButton();
            this._createUID();
            this._createControls();
            this._setEvents();
            Player.instances[this.id] = this;
        }
    }

    /**
     * Load media.
     *
     * HLS and M(PEG)-DASH perform more operations during loading if browser does not support them natively.
     * @memberof Player
     */
    public load(): void {
        if (this.isMedia()) {
            this.media.load();
        }
    }

    /**
     * Play media.
     *
     * If Ads are detected, different methods than the native ones are triggered with this operation.
     * @memberof Player
     */
    public play(): Promise<void> {
        if (this.media && !this.media.loaded) {
            this.media.load();
            this.media.loaded = true;
        }
        if (this.adsInstance) {
            return this.adsInstance.play();
        } else {
           return this.media.play();
        }
    }

    /**
     * Pause media.
     *
     * If Ads are detected, different methods than the native ones are triggered with this operation.
     * @memberof Player
     */
    public pause(): void {
        if (this.adsInstance) {
            this.adsInstance.pause();
        } else {
            this.media.pause();
        }
    }

    /**
     * Destroy OpenMedia Player instance (including all events associated) and return the
     * video/audio tag to its original state.
     *
     * @memberof Player
     */
    public destroy(): void {
        if (this.adsInstance) {
            this.adsInstance.pause();
            this.adsInstance.destroy();
        }

        const el = (this.element as HTMLMediaElement);
        this.media.destroy();

        Object.keys(this.events).forEach(event => {
            el.removeEventListener(event, this.events[event]);
        });

        if (this.autoplay && !this.processedAutoplay && isVideo(this.element)) {
            el.removeEventListener('canplay', this._autoplay.bind(this));
        }
        this.controls.destroy();

        if (isVideo(this.element)) {
            removeElement(this.playBtn);
            removeElement(this.loader);
        }

        el.controls = true;
        el.setAttribute('id', this.uid);
        el.removeAttribute('op-live__enabled');
        el.removeAttribute('op-dvr__enabled');
        const parent = el.parentElement;
        parent.parentNode.replaceChild(el, parent);

        const e = addEvent('playerdestroyed');
        el.dispatchEvent(e);
    }

    /**
     * Retrieve the parent element (with `op-player` class) of the native video/audio tag.
     *
     * This element is mostly useful to attach other player component's markup in a place
     * different than the controls bar.
     * @returns {HTMLElement}
     * @memberof Player
     */
    public getContainer(): HTMLElement {
        return this.element.parentElement;
    }

    /**
     * Retrieve an instance of the controls object used in the player instance.
     *
     * This element is mostly useful to attach other player component's markup in the controls bar.
     * @returns {Controls}
     * @memberof Player
     */
    public getControls(): Controls {
        return this.controls;
    }

    /**
     * Retrieve an instance of the custom controls invoked in the player instance.
     *
     * @returns {ControlItem[]}
     * @memberof Player
     */
    public getCustomControls(): ControlItem[] {
        return this.customControlItems;
    }

    /**
     * Retrieve the original video/audio tag.
     *
     * This element is useful to attach different events in other player's components.
     * @returns {HTMLMediaElement}
     * @memberof Player
     */
    public getElement(): HTMLMediaElement {
        return this.element;
    }

    /**
     * Retrieve the events attached to the player.
     *
     * This list does not include individual events associated with other player's components.
     * @returns {EventsList}
     * @memberof Player
     */
    public getEvents(): EventsList {
        return this.events;
    }

    /**
     * Retrieve the list of config options associated with the player..
     *
     * @returns {PlayerOptions}
     * @memberof Player
     */
    public getOptions(): PlayerOptions {
        return this.options;
    }

    /**
     * Retrieve the current media object (could be Ads or any other media type).
     *
     * @returns {(Ads|Media)}
     * @memberof Player
     */
    public activeElement(): Ads | Media {
        return this.adsInstance && this.adsInstance.adsStarted ? this.adsInstance : this.media;
    }

    /**
     * Check if current media is an instance of a native media type.
     *
     * @returns {boolean}
     * @memberof Player
     */
    public isMedia(): boolean {
        return this.activeElement() instanceof Media;
    }

    /**
     * Check if current media is an instance of an Ad.
     *
     * @returns {boolean}
     * @memberof Player
     */
    public isAd(): boolean {
        return this.activeElement() instanceof Ads;
    }

    /**
     * Retrieve an instance of the `Media` object.
     *
     * @returns {Media}
     * @memberof Player
     */
    public getMedia(): Media {
        return this.media;
    }

    /**
     * Retrieve an instance of the `Ads` object.
     *
     * @returns {Ads}
     * @memberof Player
     */
    public getAd(): Ads {
        return this.adsInstance;
    }
    /**
     * Append a new `<track>` tag to the video/audio tag and dispatch event
     * so it gets registered/loaded in the player, via `controlschanged` event.
     *
     * @param {Track} args
     * @memberof Player
     */
    public addCaptions(args: Track): void {
        if (args.default) {
            const tracks = this.element.querySelectorAll('track');
            for (let i = 0, total = tracks.length; i < total; i++) {
                (tracks[i] as HTMLTrackElement).default = false;
            }
        }

        const el = this.element;

        // If captions have been added previously, just update URL and default status
        let track = (el.querySelector(`track[srclang="${args.srclang}"][kind="${args.kind}"]`) as HTMLTrackElement);
        if (track) {
            track.src = args.src;
            track.label = args.label;
            track.default = args.default || null;
        } else {
            track = document.createElement('track');
            track.srclang = args.srclang;
            track.src = args.src;
            track.kind = args.kind;
            track.label = args.label;
            track.default = args.default || null;
            el.appendChild(track);
        }

        const e = addEvent('controlschanged');
        el.dispatchEvent(e);
    }

    /**
     * Add new custom control to the list to be rendered.
     *
     * @param {ControlItem} args
     * @memberof Player
     */
    public addControl(args: ControlItem): void {
        args.custom = true;
        this.customControlItems.push(args);
        const e = addEvent('controlschanged');
        this.element.dispatchEvent(e);
    }

    /**
     *
     *
     * @param {PlaylistItem[]} playlist
     * @memberof Player
     */
    public loadPlaylist(playlist: PlaylistItem[]) {
        this._loadPlaylist(playlist);
        const e = addEvent('controlschanged');
        this.element.dispatchEvent(e);
    }

    /**
     * Load media and events depending of media type.
     *
     * @memberof Player
     */
    public _prepareMedia(): void {
        try {
            this.element.addEventListener('playererror', this.options.onError);
            if (this.autoplay && isVideo(this.element)) {
                this.element.addEventListener('canplay', this._autoplay.bind(this));
            }
            this.media = new Media(this.element, this.options, this.autoplay, Player.customMedia);
            const preload = this.element.getAttribute('preload');
            if (this.ads || !preload || preload !== 'none') {
                this.media.load();
                this.media.loaded = true;
            }

            if (!this.autoplay && this.ads) {
                const adsOptions = this.options && this.options.ads ? this.options.ads : undefined;
                this.adsInstance = new Ads(this, this.ads, false, false, adsOptions);
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Set a Source object to the current media.
     *
     * @memberof Player
     */
    set src(media: Source[]) {
        if (this.media instanceof Media) {
            this.media.mediaFiles = [];
            this.media.src = media;
        }
    }

    /**
     * Retrieve the current Source list associated with the player.
     *
     * @type Source[]
     * @memberof Player
     * @readonly
     */
    get src(): Source[] {
        return this.media.src;
    }

    /**
     * Retrieve current player's unique identifier.
     *
     * @type string
     * @memberof Player
     * @readonly
     */
    get id(): string {
        return this.uid;
    }

    /**
     * Check if the element passed in the constructor is a valid video/audio tag
     * with 'op-player__media' class (at the very least, since `op-player` works
     * for automatic instantiation)
     *
     * @private
     * @memberof Player
     * @return {boolean}
     */
    private _isValid(): boolean {
        const el = this.element;

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

    /**
     * Wrap media instance within a DIV tag.
     *
     * It detects also wheter the user is using a mouse, or TAB for accessibility purposes.
     * @private
     * @memberof Player
     */
    private _wrapInstance(): void {
        const wrapper = document.createElement('div');
        wrapper.className = 'op-player op-player__keyboard--inactive';
        wrapper.className += isAudio(this.element) ? ' op-player__audio' : ' op-player__video';
        wrapper.tabIndex = 0;

        this.element.classList.remove('op-player');
        this.element.parentElement.insertBefore(wrapper, this.element);
        wrapper.appendChild(this.element);

        wrapper.addEventListener('keydown', () => {
            if (wrapper.classList.contains('op-player__keyboard--inactive')) {
                wrapper.classList.remove('op-player__keyboard--inactive');
            }
        });

        wrapper.addEventListener('click', () => {
            if (!wrapper.classList.contains('op-player__keyboard--inactive')) {
                wrapper.classList.add('op-player__keyboard--inactive');
            }
        });

        if (this.fill) {
            this._fill();
        }
    }

    /**
     * Build HTML markup for media controls.
     *
     * @memberof Player
     */
    private _createControls(): void {
        if (IS_IPHONE && isVideo(this.element)) {
            this.getContainer().classList.add('op-player__ios--iphone');
        }
        this.controls = new Controls(this);
        this.controls.create();
    }

    /**
     * Generate a unique identifier for the current player instance, if no `id` attribute was detected.
     *
     * @private
     * @memberof Player
     */
    private _createUID(): void {
        if (this.element.id) {
            this.uid = this.element.id;
            this.element.removeAttribute('id');
        } else {
            let uid;
            do {
                uid = `op_${Math.random().toString(36).substr(2, 9)}`;
            } while (Player.instances[uid] !== undefined);
            this.uid = uid;
        }
        this.element.parentElement.id = this.uid;
    }

    /**
     * Create a Play button in the main player's container.
     *
     * Also, it creates a loader element, that will be displayed when seeking/waiting for media.
     * @memberof Player
     */
    private _createPlayButton(): void {
        if (isAudio(this.element)) {
            return;
        }

        this.playBtn = document.createElement('button');
        this.playBtn.className = 'op-player__play';
        this.playBtn.tabIndex = 0;
        this.playBtn.title = this.options.labels.play;
        this.playBtn.innerHTML = `<span>${this.options.labels.play}</span>`;
        this.playBtn.setAttribute('aria-pressed', 'false');
        this.playBtn.setAttribute('aria-hidden', 'false');

        this.loader = document.createElement('span');
        this.loader.className = 'op-player__loader';
        this.loader.tabIndex = -1;
        this.loader.setAttribute('aria-hidden', 'true');

        this.element.parentElement.insertBefore(this.loader, this.element);
        this.element.parentElement.insertBefore(this.playBtn, this.element);

        this.playBtn.addEventListener('click', () => {
            if (this.adsInstance) {
                this.adsInstance.playRequested = this.activeElement().paused;
            }
            if (this.activeElement().paused) {
                this.activeElement().play();
            } else {
                this.activeElement().pause();
            }
        });
    }

    /**
     * Set events to show/hide play button and loader element, and to use the player using keyboard
     * for accessibility purposes.
     *
     * @private
     * @memberof Player
     */
    private _setEvents(): void {
        if (isVideo(this.element)) {
            this.events.loadedmetadata = () => {
                const el = this.activeElement();
                if (this.options.showLoaderOnInit && !IS_IOS && !IS_ANDROID) {
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
            this.events.waiting = () => {
                this.playBtn.setAttribute('aria-hidden', 'true');
                this.loader.setAttribute('aria-hidden', 'false');
            };
            this.events.seeking = () => {
                const el = this.activeElement();
                this.playBtn.setAttribute('aria-hidden', 'true');
                this.loader.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
            };
            this.events.seeked = () => {
                const el = this.activeElement();
                if (Math.round(el.currentTime) === 0) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'false');
                } else {
                    this.playBtn.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
                    this.loader.setAttribute('aria-hidden', 'true');
                }
            };
            this.events.play = () => {
                this.playBtn.classList.add('op-player__play--paused');
                this.playBtn.title = this.options.labels.pause;
                this.loader.setAttribute('aria-hidden', 'true');
                if (this.options.showLoaderOnInit) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                } else {
                    setTimeout(() => {
                        this.playBtn.setAttribute('aria-hidden', 'true');
                    }, this.options.hidePlayBtnTimer);
                }
            };
            this.events.playing = () => {
                this.loader.setAttribute('aria-hidden', 'true');
                this.playBtn.setAttribute('aria-hidden', 'true');
            };
            this.events.pause = () => {
                const el = this.activeElement();
                this.playBtn.classList.remove('op-player__play--paused');
                this.playBtn.title = this.options.labels.play;

                if (this.options.showLoaderOnInit && Math.round(el.currentTime) === 0) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'false');
                } else {
                    this.playBtn.setAttribute('aria-hidden', 'false');
                    this.loader.setAttribute('aria-hidden', 'true');
                }
            };
            this.events.ended = () => {
                this.loader.setAttribute('aria-hidden', 'true');
                this.playBtn.setAttribute('aria-hidden', 'true');
            };
        }

        Object.keys(this.events).forEach(event => {
            this.element.addEventListener(event, this.events[event]);
        });
    }

    /**
     * Attempt to autoplay media depending on browser's capabilities.
     *
     * It does not consider autoplaying Ads since that workflow is established already as part
     * of that object.
     * @see [[Ads.constructor]]
     * @private
     * @memberof Player
     */
    private _autoplay() {
        if (!this.processedAutoplay) {
            this.processedAutoplay = true;
            this.element.removeEventListener('canplay', this._autoplay.bind(this));

            isAutoplaySupported(this.element, autoplay => {
                this.canAutoplay = autoplay;
            }, muted => {
                this.canAutoplayMuted = muted;
            }, () => {
                if (this.canAutoplayMuted) {
                    this.activeElement().muted = true;
                    this.activeElement().volume = 0;

                    const e = addEvent('volumechange');
                    this.element.dispatchEvent(e);

                    // Insert element to unmute if browser allows autoplay with muted media
                    const volumeEl = document.createElement('div');
                    const action = IS_IOS || IS_ANDROID ? this.options.labels.tap : this.options.labels.click;
                    volumeEl.className = 'op-player__unmute';
                    volumeEl.innerHTML = `<span>${action}</span>`;
                    volumeEl.tabIndex = 0;

                    volumeEl.addEventListener('click', () => {
                        this.activeElement().muted = false;
                        this.activeElement().volume = this.volume;

                        const event = addEvent('volumechange');
                        this.element.dispatchEvent(event);

                        // Remove element
                        removeElement(volumeEl);
                    });

                    const target = this.getContainer();
                    target.insertBefore(volumeEl, target.firstChild);
                } else {
                    this.activeElement().muted = this.element.muted;
                    this.activeElement().volume = this.volume;
                }

                if (this.ads) {
                    const adsOptions = this.options && this.options.ads ? this.options.ads : undefined;
                    this.adsInstance = new Ads(this, this.ads, this.canAutoplay, this.canAutoplayMuted, adsOptions);
                } else if (this.canAutoplay || this.canAutoplayMuted) {
                    return this.play();
                }
            });
        }
    }

    /**
     * Create fill effect on video, scaling and croping dimensions relative to its parent, setting just a class.
     *
     * This methods centers the video view using pure CSS in both Ads and Media.
     * @see https://slicejack.com/fullscreen-html5-video-background-css/
     * @private
     * @memberof Player
     */
    private _fill(): void {
        if (!isAudio(this.element) && !IS_IPHONE) {
            this.getContainer().classList.add('op-player__full');
        }
    }

    /**
     * Merge user's configuration with default configuration.
     *
     * It deals with complex config elements, like `labels` and `controls`.
     * @param playerOptions
     * @private
     * @memberof Player
     */
    private _mergeOptions(playerOptions?: PlayerOptions): void {
        this.options = { ...this.defaultOptions, ...playerOptions };
        if (playerOptions) {
            const objectElements = ['labels', 'controls'];
            objectElements.forEach(item => {
                this.options[item] = playerOptions[item] && Object.keys(playerOptions[item]).length ?
                    { ...this.defaultOptions[item], ...playerOptions[item] } :
                    this.defaultOptions[item];
            });
        }
    }

    /**
     *
     *
     * @private
     * @param {PlaylistItem[]} playlist
     * @return {void}
     * @memberof Player
     */
    private _loadPlaylist(playlist: PlaylistItem[]) {
        this.playlist = playlist;

        const currentMedia = playlist[0];
        this.element.src = currentMedia.src;

        // build DOM for playlist
        if (playlist.length > 1) {
            const container = document.createElement('div');
            container.id = 'op-player__playlist';
            container.className = 'op-player__playlist--closed';

            playlist.forEach(item => {
                const img = item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.name}">` : '';
                container.innerHTML += `<div class="op-player__playlist-item" data-url="${item.src}">
                    ${img}
                    <div class="op-player__playlist-item-info">
                        <span>${item.name}</span>
                    </div>
                </div>`;
            });

            const wrapper = document.createElement('div');
            wrapper.id = 'op-player__wrapper';

            this.getContainer().parentElement.insertBefore(wrapper, this.getContainer());
            wrapper.appendChild(this.getContainer());
            wrapper.appendChild(container);

            const listItems = container.querySelectorAll('.op-player__playlist-item');
            for (let i = 0, total = listItems.length; i < total; ++i) {
                listItems[i].addEventListener('click', () => {
                    const isPlaying = !this.media.paused;
                    this.element.src = listItems[i].getAttribute('data-url');
                    this.load();
                    if (isPlaying) {
                        setTimeout(() => this.play, 100);
                    }
                });
            }
        }

        return this._prepareMedia();
    }
}

export default Player;

// Expose element globally.
if (typeof window !== 'undefined') {
    (window as any).OpenPlayer = Player;
    (window as any).OpenPlayerJS = Player;
    Player.init();
}
