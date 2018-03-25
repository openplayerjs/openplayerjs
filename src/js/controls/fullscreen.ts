import Event from '../interfaces/event';
import Player from '../player';

/**
 *
 * @class Fullscreen
 * @description Class that handles the fullscreen behavior cross/browsers
 */
class Fullscreen {
    public fullScreenEnabled: boolean;
    private player: Player;
    private isFullscreen: boolean;
    private button: HTMLButtonElement;
    private events: Event = {};
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

        const target = (document as any);

        // Check if fullscreen is supported
        this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled ||
            target.msFullscreenEnabled || target.webkitSupportsFullscreen ||
            target.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);
    }
    /**
     *
     *
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    public create(): void {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__fullscreen om-control__right';
        this.button.tabIndex = 0;
        this.button.title = 'Fullscreen';
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Fullscreen');
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        this.clickEvent = () => {
            this.button.setAttribute('aria-pressed', 'true');
            this.toggleFullscreen();
        };

        this.events.click = this.clickEvent.bind(this);

        this.fullscreenEvents = [
            'fullscreenchange',
            'mozfullscreenchange',
            'webkitfullscreenchange',
            'msfullscreenchange',
        ];

        this._setFullscreenData(false);

        this.fullscreenEvents.forEach(event => {
            document.addEventListener(event, this._fullscreenChange.bind(this));
        });

        this.button.addEventListener('click', this.events.click);

        this.player.getControls().getContainer().appendChild(this.button);
    }

    public destroy(): void {
        this.fullscreenEvents.forEach(event => {
            document.removeEventListener(event, this._fullscreenChange.bind(this));
        });
        this.button.removeEventListener('click', this.events.click);
        this.button.remove();
    }

    public toggleFullscreen(): void {
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
            const video = (this.player.getElement() as any);
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

    private _fullscreenChange(): void {
        const width = this.isFullscreen ? 0 : this.fullscreenWidth;
        const height = this.isFullscreen ? 0 : this.fullscreenHeight;
        this._setFullscreenData(!this.isFullscreen);

        if (this.player.isAd()) {
            this.player.getAd().resizeAds(width, height);
        }
        this.isFullscreen = !this.isFullscreen;
        this._resize(width, height);
    }

    private _setFullscreenData(state: boolean): void {
        this.player.getContainer().setAttribute('data-fullscreen', (!!state).toString());
        if (state) {
            this.button.classList.add('om-controls__fullscreen--out');
        } else {
            this.button.classList.remove('om-controls__fullscreen--out');
        }
    }

    private _resize(width?: number, height?: number): void {
        const wrapper = this.player.getContainer();
        const video = this.player.getElement();
        wrapper.style.width = width ? `${width}px` : null;
        wrapper.style.height = height ? `${height}px` : null;
        video.style.width = width ? `${width}px` : null;
        video.style.height = height ? `${height}px` : null;
    }
}

export default Fullscreen;
