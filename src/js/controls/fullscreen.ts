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
    public isFullscreen: boolean;
    private button: HTMLButtonElement;
    private events: IEvent;
    private fullscreenEvents: string[];
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
        this.button.className = 'om-controls__fullscreen om-control__right';
        this.button.tabIndex = 0;
        this.button.title = 'Fullscreen';
        this.button.setAttribute('aria-controls', player.uid);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Fullscreen');
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        const target = (document as any);

        // Check if fullscreen is supported
        this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled ||
            target.msFullscreenEnabled || target.webkitSupportsFullscreen ||
            target.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

        this.clickEvent = () => {
            this.button.setAttribute('aria-pressed', 'true');
            this.toggleFullscreen();
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
        this.button.remove();

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

    public toggleFullscreen() {
        if (this.isFullscreen) {
            const target = (document as any);
            // The video is currently in fullscreen mode
            if (target.exitFullscreen) {
                target.exitFullscreen();
            } else if (target.mozCancelFullScreen) {
                target.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                target.webkitCancelFullScreen();
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
                video.parentElement.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.parentElement.mozRequestFullScreen();
            } else if (video.webkitRequestFullScreen) {
                video.parentElement.webkitRequestFullScreen();
            } else if (video.msRequestFullscreen) {
                video.parentElement.msRequestFullscreen();
            } else {
                this._fullscreenChange();
            }
        }
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
        this.player.element.parentElement.setAttribute('data-fullscreen', (!!state).toString());
        if (state) {
            this.button.classList.add('om-controls__fullscreen--out');
        } else {
            this.button.classList.remove('om-controls__fullscreen--out');
        }
    }

    private _resize(width?: number, height?: number) {
        const wrapper = this.player.element.parentElement;
        const video = (this.player.element as HTMLElement);
        wrapper.style.width = width ? `${width}px` : null;
        wrapper.style.height = height ? `${height}px` : null;
        video.style.width = width ? `${width}px` : null;
        video.style.height = height ? `${height}px` : null;
    }
}

export default Fullscreen;
