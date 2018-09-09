import 'core-js/es6/array';
import 'core-js/es6/promise';
import 'custom-event-polyfill';
import 'element-closest';
import 'element-remove';

import Controls from './controls';
import Track from './interfaces/captions/track';
import CustomMedia from './interfaces/custom-media';
import EventsList from './interfaces/events-list';
import PlayerInstanceList from './interfaces/instance';
import PlayerOptions from './interfaces/player-options';
import Source from './interfaces/source';
import Media from './media';
import Ads from './media/ads';
import { IS_ANDROID, IS_IOS, IS_IPHONE } from './utils/constants';
import { addEvent } from './utils/events';
import { isAudio, isVideo } from './utils/general';
import { isAutoplaySupported } from './utils/media';

/**
 * OpenMedia Player.
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
     * Convert all the video/audio tags with `om-player` class in a OpenMedia player instance.
     *
     * @memberof Player
     */
    public static init(): void {
        Player.instances = {};
        const targets = document.querySelectorAll('video.om-player, audio.om-player');
        for (let i = 0, total = targets.length; i < total; i++) {
            const target = (targets[i] as HTMLMediaElement);
            const player = new Player(target, target.getAttribute('data-om-ads'),
                !!target.getAttribute('data-om-fill'), JSON.parse(target.getAttribute('data-om-options')));
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
     * @type string
     * @memberof Player
     */
    private adsUrl?: string;

    /**
     * Instance of Ads object.
     *
     * @type Ads
     * @memberof Player
     */
    private ads?: Ads;

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
     * Button to play media.
     *
     * @type HTMLButtonElement
     * @memberof Player
     */
    private playBtn: HTMLButtonElement;

    /**
     * Element to indicate that media is being loaded.
     *
     * Only applies for `Media` object, since `Ads` does not need it.
     * @type HTMLSpanElement
     * @memberof Player
     */
    private loader: HTMLSpanElement;

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
     * Container for other player options.
     *
     * @private
     * @type {object}
     * @memberof Player
     */
    private options: PlayerOptions;

    /**
     * Create an instance of Player.
     *
     * @param {(HTMLMediaElement|string)} element  A video/audio tag or its identifier.
     * @param {?string} adsUrl  A URL to play Ads via Google IMA SDK.
     * @param {?boolean} fill  Determine if video should be scaled and scrop to fit container.
     * @param {?PlayerOptions} options  Options to enhance Hls and Dash players.
     * @returns {Player}
     * @memberof Player
     */
    constructor(element: HTMLMediaElement | string, adsUrl?: string, fill?: boolean, options?: PlayerOptions) {
        this.element = element instanceof HTMLMediaElement ? element : (document.getElementById(element) as HTMLMediaElement);
        if (this.element) {
            this.adsUrl = adsUrl;
            this.fill = fill;
            this.autoplay = this.element.autoplay || false;
            this.volume = this.element.volume;
            this.options = options;
            this.element.autoplay = false;
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
            this._prepareMedia();
            this._createPlayButton();
            this._createUID();
            this._createControls();
            this._setEvents();
            this._autoplay();
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
    public play(): void {
        if (this.ads) {
            this.ads.play();
        } else {
            this.media.play();
        }
    }

    /**
     * Pause media.
     *
     * If Ads are detected, different methods than the native ones are triggered with this operation.
     * @memberof Player
     */
    public pause(): void {
        if (this.ads) {
            this.ads.pause();
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
        if (this.ads) {
            this.ads.pause();
            this.ads.destroy();
        }

        const el = (this.element as HTMLMediaElement);
        this.media.destroy();

        Object.keys(this.events).forEach(event => {
            el.removeEventListener(event, this.events[event]);
        });

        this.controls.destroy();

        if (isVideo(this.element)) {
            this.playBtn.remove();
            this.loader.remove();
        }

        el.controls = true;
        const parent = el.parentElement;
        parent.parentNode.replaceChild(el, parent);
    }

    /**
     * Retrieve the parent element (with `om-player` class) of the native video/audio tag.
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
     * Retrieve the current media object (could be Ads or any other media type).
     *
     * @returns {(Ads|Media)}
     * @memberof Player
     */
    public activeElement(): Ads | Media {
        return this.ads && this.ads.adsStarted ? this.ads : this.media;
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
        return this.ads;
    }
    /**
     * Append a new `<track>` tag to the video/audio tag and dispatch event
     * so it gets registered/loaded in the player, via `controlschanged` event.
     *
     * @param {Track} args
     * @memberof Player
     */
    public addCaptions(args: Track): void {
        const el = this.element;
        const track = document.createElement('track');
        track.srclang = args.srclang;
        track.src = args.src;
        track.kind = args.kind;
        track.label = args.label;
        track.default = args.default || null;
        this.element.appendChild(track);

        const e = addEvent('controlschanged');
        el.dispatchEvent(e);
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
     * with 'om-player__media' class (at the very least, since `om-player` works
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

        if (!el.classList.contains('om-player__media')) {
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
        wrapper.className = 'om-player om-player__keyboard--inactive';
        wrapper.className += isAudio(this.element) ? ' om-player__audio' : ' om-player__video';
        wrapper.tabIndex = 0;

        this.element.classList.remove('om-player');
        this.element.parentElement.insertBefore(wrapper, this.element);
        wrapper.appendChild(this.element);

        wrapper.addEventListener('keydown', () => {
            if (wrapper.classList.contains('om-player__keyboard--inactive')) {
                wrapper.classList.remove('om-player__keyboard--inactive');
            }
        });

        wrapper.addEventListener('click', () => {
            if (!wrapper.classList.contains('om-player__keyboard--inactive')) {
                wrapper.classList.add('om-player__keyboard--inactive');
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
        this.controls = new Controls(this);
        this.controls.create();
    }

    /**
     * Load media and events depending of media type.
     *
     * @memberof Player
     */
    private _prepareMedia(): void {
        try {
            this.media = new Media(this.element, this.options, this.autoplay, Player.customMedia);
            this.media.load();

            if (this.adsUrl) {
                this.ads = new Ads(this.media, this.adsUrl, this.autoplay);
            }
        } catch (e) {
            console.error(e);
        }
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
                uid = `om_${Math.random().toString(36).substr(2, 9)}`;
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
        this.playBtn.className = 'om-player__play';
        this.playBtn.tabIndex = 0;
        this.playBtn.setAttribute('aria-pressed', 'false');
        this.playBtn.setAttribute('aria-hidden', 'false');

        this.loader = document.createElement('span');
        this.loader.className = 'om-player__loader';
        this.loader.tabIndex = -1;
        this.loader.setAttribute('aria-hidden', 'true');

        this.element.parentElement.insertBefore(this.loader, this.element);
        this.element.parentElement.insertBefore(this.playBtn, this.element);

        this.playBtn.addEventListener('click', () => {
            if (this.ads) {
                this.ads.playRequested = true;
            }
            this.activeElement().play();
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
                if (el.paused) {
                    this.playBtn.classList.remove('om-player__play--paused');
                    this.playBtn.setAttribute('aria-pressed', 'false');
                    this.playBtn.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
                }
            };
            this.events.waiting = () => {
                const el = this.activeElement();
                this.playBtn.setAttribute('aria-hidden', 'true');
                this.loader.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
            };
            this.events.seeking = () => {
                const el = this.activeElement();
                this.playBtn.setAttribute('aria-hidden', 'true');
                this.loader.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
            };
            this.events.seeked = () => {
                const el = this.activeElement();
                this.playBtn.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
                this.loader.setAttribute('aria-hidden', 'true');
            };
            this.events.play = () => {
                this.playBtn.classList.add('om-player__play--paused');
                setTimeout(() => {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'true');
                }, 350);
            };
            this.events.playing = () => {
                this.playBtn.setAttribute('aria-hidden', 'true');
            };
            this.events.pause = () => {
                this.playBtn.classList.remove('om-player__play--paused');
                this.loader.setAttribute('aria-hidden', 'true');
                const el = this.activeElement();
                this.playBtn.setAttribute('aria-hidden', el instanceof Media ? 'false' : 'true');
            };
        }

        Object.keys(this.events).forEach(event => {
            this.element.addEventListener(event, this.events[event]);
        });

        this.events.keydown = (e: any) => {
            const el = this.activeElement();
            const isAd = el instanceof Ads;
            const key = e.which || e.keyCode || 0;
            const step = el.duration * 0.05;

            switch (key) {
                case 13: // Enter
                case 32: // Space bar
                    if (el.paused) {
                        el.play();
                    } else {
                        el.pause();
                    }
                    break;
                case 36: // Home
                    if (!isAd) {
                        el.currentTime = 0;
                    }
                    break;
                case 37: // Left
                case 39: // Right
                    if (!isAd && el.duration !== Infinity) {
                        el.currentTime += key === 37 ? (step * -1) : step;
                        if (el.currentTime < 0) {
                            el.currentTime = 0;
                        } else if (el.currentTime >= el.duration) {
                            el.currentTime = el.duration;
                        }
                    }
                    break;
                case 38: // Up
                case 40: // Down
                    const newVol = key === 38 ? Math.min(el.volume + 0.1, 1) : Math.max(el.volume - 0.1, 0);
                    el.volume = newVol;
                    el.muted = !(newVol > 0);
                    break;
                case 35: // End
                    if (!isAd) {
                        el.currentTime = el.duration;
                    }
                    break;
                case 70: // F
                    if (!e.ctrlKey && typeof this.controls.fullscreen.fullScreenEnabled !== 'undefined') {
                        this.controls.fullscreen.toggleFullscreen();
                    }
                    break;
                default:
                    return true;
            }
            e.preventDefault();
        };

        this.getContainer().addEventListener('keydown', this.events.keydown);
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
        if (this.autoplay) {
            this.autoplay = false;
            isAutoplaySupported(autoplay => {
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
                    const action = IS_IOS || IS_ANDROID ? 'Tap' : 'Click';
                    volumeEl.className = 'om-player__unmute';
                    volumeEl.innerHTML = `<span>${action} to unmute</span>`;

                    volumeEl.addEventListener('click', () => {
                        this.activeElement().muted = false;
                        this.activeElement().volume = this.volume;

                        const event = addEvent('volumechange');
                        this.element.dispatchEvent(event);

                        // Remove element
                        volumeEl.remove();
                    });

                    const target = this.getContainer();
                    target.insertBefore(volumeEl, target.firstChild);
                }

                if (!this.ads && (this.canAutoplay || this.canAutoplayMuted)) {
                    this.play();
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
            this.getContainer().classList.add('om-player__full');
        }
    }
}

export default Player;

// Expose element globally.
(window as any).OpenPlayer = Player;
Player.init();
