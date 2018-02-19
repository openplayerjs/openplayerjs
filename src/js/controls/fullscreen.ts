import IEvent from '../components/interfaces/general/event';
import { addEvent } from '../events';
import Ads from '../media/ads';
import Player from '../player';

class Fullscreen {
    public player: Player;
    public fullScreenEnabled: boolean;
    private button: HTMLButtonElement;
    private events: IEvent;

    /**
     *
     * @param {Player} player
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    constructor(player: Player) {
        this.player = player;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__fullscreen';
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        // Initialize default value for fullscreen
        const wrapper = (this.player.element.parentNode as any);
        wrapper.setAttribute('data-fullscreen', 'false');

        // Check if fullscreen is supported
        const target = (document as any);
        this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled ||
            target.msFullscreenEnabled || target.webkitSupportsFullscreen ||
            target.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

        const isFullScreen = () => !!(target.fullScreen || target.webkitIsFullScreen ||
            target.mozFullScreen || target.msFullscreenElement || target.fullscreenElement);

        const handleFullscreen = () => {
            if (isFullScreen()) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (target.mozCancelFullScreen) {
                    target.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (target.msExitFullscreen) {
                    target.msExitFullscreen();
                }
                setFullscreenData(false);
            } else {
                const video = (this.player.element as any);
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    video.mozRequestFullScreen();
                } else if (video.webkitRequestFullScreen) {
                    video.webkitRequestFullScreen();
                } else if (video.msRequestFullscreen) {
                    video.msRequestFullscreen();
                }
                setFullscreenData(true);
            }
            const el = this.player.activeElement();
            if (el instanceof Ads) {
                const e = addEvent('resize');
                this.player.element.dispatchEvent(e);
            }
        };

        const setFullscreenData = (state: boolean) => {
            wrapper.setAttribute('data-fullscreen', (!!state).toString());
            if (state) {
                this.button.classList.add('om-controls__fullscreen--out');
            } else {
                this.button.classList.remove('om-controls__fullscreen--out');
            }
        };

        this.events = {};
        this.events['click'] = () => {
            handleFullscreen();
            if (isFullScreen()) {
                this.button.classList.remove('om-controls__fullscreen--out');
            } else {
                this.button.classList.add('om-controls__fullscreen--out');
            }
        };

        document.addEventListener('fullscreenchange', () => {
            setFullscreenData(!!(target.fullScreen || target.fullscreenElement));
        });
        document.addEventListener('webkitfullscreenchange', () => {
            setFullscreenData(!!target.webkitIsFullScreen);
        });
        document.addEventListener('mozfullscreenchange', () => {
            setFullscreenData(!!target.mozFullScreen);
        });
        document.addEventListener('msfullscreenchange', () => {
            setFullscreenData(!!target.msFullscreenElement);
        });

        return this;
    }
    public register() {
        this.button.addEventListener('click', this.events['click']);

        return this;
    }

    public unregister() {
        this.button.removeEventListener('click', this.events['click']);

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    public build(container: HTMLDivElement) {
        container.appendChild(this.button);
        return this;
    }
}

export default Fullscreen;
