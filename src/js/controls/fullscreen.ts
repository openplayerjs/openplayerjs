import IEvent from '../components/interfaces/general/event';
import Player from '../player';

/**
 *
 * @class Fullscreen
 * @description Class that handles the fullscreen behavior cross/browsers
 */
class Fullscreen {
    public player: Player;
    public fullScreenEnabled: boolean;
    private button: HTMLButtonElement;
    private events: IEvent;
    private fullscreenEvents: string[];
    private isFullscreen: boolean;
    private fullscreenWidth: number;
    private fullscreenHeight: number;
    private clickEvent: any;

    /**
     *
     * @param {Player} player
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    constructor(player: Player) {
        this.player = player;
        this.isFullscreen = false;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__fullscreen';
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        const target = (document as any);

        // Check if fullscreen is supported
        this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled ||
            target.msFullscreenEnabled || target.webkitSupportsFullscreen ||
            target.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

        this.clickEvent = () => {
            if (this.isFullscreen) {
                // The video is currently in fullscreen mode
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (target.mozCancelFullScreen) {
                    target.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (target.msExitFullscreen) {
                    target.msExitFullscreen();
                } else {
                    this._fullscreenChange();
                }
            } else {
                const video = (this.player.element as any);
                this.fullscreenWidth = window.screen.width;
                this.fullscreenHeight = window.screen.height;

                if (video.requestFullscreen) {
                    video.parentNode.requestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    video.parentNode.mozRequestFullScreen();
                } else if (video.webkitRequestFullScreen) {
                    video.parentNode.webkitRequestFullScreen();
                } else if (video.msRequestFullscreen) {
                    video.parentNode.msRequestFullscreen();
                } else {
                    this._fullscreenChange();
                }
            }
        };

        this.events = {};
        this.events['click'] = this.clickEvent.bind(this);

        this.fullscreenEvents = [
            'fullscreenchange',
            'mozfullscreenchange',
            'webkitfullscreenchange',
            'msfullscreenchange',
        ];

        this._setFullscreenData(false);

        return this;
    }
    /**
     *
     *
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    public register() {
        this.fullscreenEvents.forEach(event => {
            document.addEventListener(event, this._fullscreenChange.bind(this));
        });

        this.button.addEventListener('click', this.events['click']);

        return this;
    }

    public unregister() {
        this.fullscreenEvents.forEach(event => {
            document.removeEventListener(event, this._fullscreenChange.bind(this));
        });
        this.button.removeEventListener('click', this.events['click']);

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} controls
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    public build(controls: HTMLDivElement) {
        controls.appendChild(this.button);
        return this;
    }

    private _fullscreenChange() {
        const width = this.isFullscreen ? 0 : this.fullscreenWidth;
        const height = this.isFullscreen ? 0 : this.fullscreenHeight;
        this._setFullscreenData(!this.isFullscreen);

        if (this.player.ads) {
            this.player.ads.resizeAds(width, height);
        }
        this.isFullscreen = !this.isFullscreen;
        this._resize(width, height);
    }

    private _setFullscreenData(state: boolean) {
        (this.player.element.parentNode as HTMLElement).setAttribute('data-fullscreen', (!!state).toString());
        if (state) {
            this.button.classList.add('om-controls__fullscreen--out');
        } else {
            this.button.classList.remove('om-controls__fullscreen--out');
        }
    }

    private _resize(width?: number, height?: number) {
        const wrapper = (this.player.element.parentNode as HTMLElement);
        const video = (this.player.element as HTMLElement);
        wrapper.style.width = width ? `${width}px` : null;
        wrapper.style.height = height ? `${height}px` : null;
        video.style.width = width ? `${width}px` : null;
        video.style.height = height ? `${height}px` : null;
    }
}

export default Fullscreen;
