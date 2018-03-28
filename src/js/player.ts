
import Controls from './controls';
import EventsList from './interfaces/events-list';
import Source from './interfaces/source';
import Media from './media';
import Ads from './media/ads';
import { IS_IPHONE } from './utils/constants';
import { addEvent } from './utils/events';
import { isAudio, isIframe, isVideo } from './utils/general';

/**
 *
 * @class Player
 * @description Class that creates an Open Player instance.
 * This is the entry point for the entire plugin.
 */
class Player {
    public static instances: any;

    /**
     * Entry point
     * Convert all the video/audio tags with `om-player` class in a OpenMedia player
     */
    public static init() {
        Player.instances = {};
        const targets = document.querySelectorAll('video.om-player, audio.om-player');
        for (let i = 0, total = targets.length; i < total; i++) {
            const target = (targets[i] as HTMLMediaElement);
            const player = new Player(target, target.getAttribute('data-om-ads'));
            player.init();
        }
    }

    public controls: Controls;
    private uid: string;
    private element: HTMLMediaElement;
    private adsUrl?: string;
    private ads?: Ads;
    private media: Media;
    private playBtn: HTMLButtonElement;
    private loader: HTMLSpanElement;
    private events: EventsList = {};

    /**
     * Create a Player instance.
     *
     * @param {HTMLMediaElement|string} element
     * @param {?string} adsUrl
     * @returns {Player}
     */
    constructor(element: HTMLMediaElement|string, adsUrl?: string) {
        this.element = element instanceof HTMLMediaElement ? element : (document.getElementById(element) as HTMLMediaElement);
        this.adsUrl = adsUrl;
        return this;
    }

    public init(): void {
        if (this._isValid()) {
            this._prepareMedia();
            this._wrapInstance();
            this._createPlayButton();
            this._createUID();

            // Let QuickTime render its own controls for video in iPhone
            if (!IS_IPHONE && isVideo) {
                this._createControls();
            }
            this._setEvents();
            Player.instances[this.id] = this;
        }
    }

    public load(): void {
        if (this.media instanceof Media) {
            this.media.load();
        }
    }

    public play(): void {
        if (this.ads) {
            this.ads.play();
        } else {
            this.media.play();
        }
    }

    public pause(): void {
        if (this.ads) {
            this.ads.pause();
        } else {
            this.media.pause();
        }
    }

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

    public getContainer(): HTMLElement {
        return this.element.parentElement;
    }

    public getControls(): Controls {
        return this.controls;
    }

    public getElement(): HTMLMediaElement {
        return this.element;
    }

    public getEvents(): EventsList {
        return this.events;
    }

    public activeElement(): Ads|Media {
        return this.ads && this.ads.adsStarted ? this.ads : this.media;
    }

    public isMedia(): boolean {
        return this.activeElement() instanceof Media;
    }

    public isAd(): boolean {
        return this.activeElement() instanceof Ads;
    }

    public getMedia(): Media {
        return this.media;
    }

    public getAd(): Ads {
        return this.ads;
    }
    /**
     *
     *
     * @param {object} args
     * @memberof Player
     */
    public addCaptions(args: any): void {
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

    set src(media: Source[]) {
        if (this.media instanceof Media) {
            this.media.mediaFiles = [];
            this.media.src = media;
        }
    }

    get src(): Source[] {
        return this.media.src;
    }

    get id(): string {
        return this.uid;
    }

    /**
     * Check if the element passed in the constructor is a valid video/audio/iframe tag
     * with 'om-player' class
     * @private
     * @memberof Player
     * @return {boolean}
     */
    private _isValid(): boolean {
        const el = this.element;

        if (el instanceof HTMLElement === false) {
            return false;
        }

        if (!isAudio(el) && !isVideo(el) && !isIframe(el)) {
            return false;
        }

        if (!el.classList.contains('om-player')) {
            return false;
        }

        return true;
    }

    /**
     * Wrap media instance within a DIV
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
    }

    /**
     * Build HTML markup for media controls
     *
     * @memberof Player
     */
    private _createControls(): void {
        this.controls = new Controls(this);
        this.controls.create();
    }

    /**
     * Load callbacks/events depending of media type
     *
     * @memberof Player
     */
    private _prepareMedia(): void {
        try {
            this.media = new Media(this.element);
            this.media.load();

            if (this.adsUrl) {
                this.ads = new Ads(this.media, this.adsUrl);
            }
        } catch (e) {
            console.error(e);
        }
    }

    private _createUID(): void {
        if (this.element.id) {
            this.uid = this.element.id;
            this.element.removeAttribute('id');
        } else {
            let uid;
            do  {
                uid = `om_${Math.random().toString(36).substr(2, 9)}`;
            } while (Player.instances[uid] !== undefined);
            this.uid = uid;
        }
        this.element.parentElement.id = this.uid;
    }

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
            this.media.play();
        });
    }

    private _setEvents(): void {
        if (!IS_IPHONE && isVideo(this.element)) {
            this.events.waiting = () => {
                const el = this.activeElement();
                if (el instanceof Media) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'false');
                } else {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'true');
                }
            };
            this.events.seeking = () => {
                const el = this.activeElement();
                if (el instanceof Media) {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'false');
                } else {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'true');
                }
            };
            this.events.seeked = () => {
                const el = this.activeElement();
                if (el instanceof Media) {
                    this.playBtn.setAttribute('aria-hidden', 'false');
                    this.loader.setAttribute('aria-hidden', 'true');
                } else {
                    this.playBtn.setAttribute('aria-hidden', 'true');
                    this.loader.setAttribute('aria-hidden', 'true');
                }
            };
            this.events.play = () => {
                this.playBtn.classList.add('om-player__play--paused');
                setTimeout(() => this.playBtn.setAttribute('aria-hidden', 'true'), 350);
            };
            this.events.pause = () => {
                this.playBtn.classList.remove('om-player__play--paused');
                const el = this.activeElement();
                if (el instanceof Media) {
                    this.playBtn.setAttribute('aria-hidden', 'false');
                }
            };
        }

        this.events.keydown = (e: any) => {
            const el = this.activeElement();
            const isAd = el instanceof Ads;
            if (el instanceof Media) {
                this.playBtn.setAttribute('aria-hidden', 'false');
            }

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
                    if (!e.ctrlKey && typeof this.controls.getFullscreen().fullScreenEnabled !== 'undefined') {
                        this.controls.getFullscreen().toggleFullscreen();
                    }
                    break;
                default:
                    return true;
            }
        };

        Object.keys(this.events).forEach(event => {
            this.element.addEventListener(event, this.events[event]);
        });
    }
}

export default Player;

// Expose element globally
(window as any).OpenPlayer = Player;

Player.init();
