import IEvent from '../components/interfaces/general/event';
import Media from '../media';
import Player from '../player';

class Progress {
    public player: Player;
    private slider: HTMLInputElement;
    private events: IEvent;
    // private sliderEvents: IEvent;

    /**
     *
     * @param {Media} player
     * @returns {Progress}
     * @memberof Progress
     */
    constructor(player: Player) {
        this.player = player;
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__progress';
        this.slider.setAttribute('min', '0');
        this.slider.setAttribute('max', '0');
        this.slider.setAttribute('step', '0.1');
        this.slider.value = '0';
        this.slider.innerHTML = '<span class="om-controls__progress-bar"></span>';

        this.events = {};
        // this.sliderEvents = {};
        this.events['loadedmetadata'] = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                this.slider.setAttribute('max', `${el.duration}`);
                const current = el instanceof Media ? el.currentTime : (el.duration - el.currentTime);
                this.slider.value = current.toString();
                (this.slider.firstChild as HTMLElement).style.width =
                    `${((current / el.duration) * 100)}%`;
            } else {
                this.slider.style.display = 'none';
            }
        };
        this.events['timeupdate'] = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                if (!this.slider.getAttribute('max')) {
                    this.slider.setAttribute('max', `${el.duration}`);
                }

                const current = el instanceof Media ? el.currentTime : (el.duration - el.currentTime);
                this.slider.value = current.toString();
                (this.slider.firstChild as HTMLElement).style.width =
                    `${((current / el.duration) * 100)}%`;
            } else {
                this.slider.style.display = 'none';
            }
        };

        return this;
    }

    /**
     *
     * @returns {Progress}
     * @memberof Progress
     */
    public register() {
        Object.keys(this.events).forEach(event => {
            this.player.media.element.addEventListener(event, this.events[event]);
        });

        return this;
    }

    public unregister() {
        Object.keys(this.events).forEach(event => {
            this.player.media.element.removeEventListener(event, this.events[event]);
        });
        this.events = {};
        // this.sliderEvents = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Progress}
     * @memberof Progress
     */
    public build(container: HTMLDivElement) {
        container.appendChild(this.slider);
        return this;
    }
}

export default Progress;
