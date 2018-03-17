import IFile from './components/interfaces/media/file';
import Controls from './controls';
import Media from './media';
import Ads from './media/ads';
import { IS_IPHONE } from './utils/constants';
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
            const target = targets[i];
            const player = new Player(target, target.getAttribute('data-om-ads'));
            player.init();
        }
    }

    public uid: string;
    public element: Element;
    public adsUrl?: string;
    public ads: Ads;
    public media: Media;
    public playBtn: HTMLButtonElement;

    /**
     * Creates an instance of Player.
     * @param {Element|string} element
     * @param {?string} adsUrl
     * @memberof Player
     */
    constructor(element: Element|string, adsUrl?: string) {
        this.element = element instanceof Element ? element : document.getElementById(element);
        this.adsUrl = adsUrl;
        this.ads = null;
        return this;
    }

    public init() {
        if (this._isValid()) {
            this._prepareMedia();
            this._wrapInstance();
            this._createPlayButton();
            this._createUID();

            // Let QuickTime render its own controls for video in iPhone
            if (!IS_IPHONE && isVideo) {
                this._createControls();
            }
            Player.instances[this.uid] = this;
        }
    }

    public load() {
        if (this.media instanceof Media) {
            this.media.load();
        }
    }

    public play() {
        if (this.ads) {
            this.ads.play();
        } else {
            this.media.play();
        }
    }

    public pause() {
        if (this.ads) {
            this.ads.pause();
        } else {
            this.media.pause();
        }
    }

    public destroy() {
        if (this.ads) {
            this.ads.destroy();
        } else {
            if (this.element.getAttribute('data-om-file')) {
                (this.element as HTMLMediaElement).src = this.element.getAttribute('data-om-file');
                this.element.removeAttribute('data-om-file');
            }
            this.media.destroy();
        }
    }

    set src(media: IFile[]) {
        if (this.media instanceof Media) {
            this.media.mediaFiles = [];
            this.media.src = media;
        }
    }

    get src() {
        return this.media.src;
    }

    get id() {
        return this.uid;
    }

    public activeElement() {
        return this.ads && this.ads.adsStarted ? this.ads : this.media;
    }

    /**
     * Check if the element passed in the constructor is a valid video/audio/iframe tag
     * with 'om-player' class
     * @private
     * @memberof Player
     * @return {boolean}
     */
    private _isValid() {
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
    private _wrapInstance() {
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
    private _createControls() {
        const controls = new Controls(this);
        controls.prepare();
        controls.render();
    }

    /**
     * Load callbacks/events depending of media type
     *
     * @memberof Player
     */
    private _prepareMedia() {
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

    private _createUID() {
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

    private _createPlayButton() {
        if (isAudio(this.element)) {
            return;
        }

        this.playBtn = document.createElement('button');
        this.playBtn.className = 'om-player__play';
        this.playBtn.tabIndex = 0;
        this.playBtn.setAttribute('aria-pressed', 'false');
        this.playBtn.addEventListener('click', () => {
            this.playBtn.setAttribute('aria-pressed', 'true');
            this.media.play();
        });
        this.element.addEventListener('play', () => {
            this.playBtn.style.display = 'none';
        });
        this.element.addEventListener('pause', () => {
            const el = this.activeElement();
            if (el instanceof Media) {
                this.playBtn.style.display = 'block';
            }
        });
        this.element.parentElement.insertBefore(this.playBtn, this.element);
    }
}

export default Player;

// Expose element globally
(window as any).OpenPlayer = Player;

Player.init();
