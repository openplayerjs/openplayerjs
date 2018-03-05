import IEvent from '../components/interfaces/general/event';
import Media from '../media';
import Player from '../player';

class Progress {
    public player: Player;
    private slider: HTMLInputElement;
    private buffer: HTMLProgressElement;
    private progress: HTMLDivElement;
    private played: HTMLProgressElement;
    private events: IEvent;
    private sliderEvents: IEvent;

    /**
     *
     * @param {Player} player
     * @returns {Progress}
     * @memberof Progress
     */
    constructor(player: Player) {
        this.player = player;
        this.progress = document.createElement('div');
        this.progress.className = 'om-controls__progress';

        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__progress--seek';
        this.slider.setAttribute('min', '0');
        this.slider.setAttribute('max', '0');
        this.slider.setAttribute('step', '0.1');
        this.slider.value = '0';

        this.buffer = document.createElement('progress');
        this.buffer.className = 'om-controls__progress--buffer';
        this.buffer.setAttribute('max', '100');
        this.buffer.value = 0;

        this.played = document.createElement('progress');
        this.played.className = 'om-controls__progress--played';
        this.played.setAttribute('max', '100');
        this.played.setAttribute('role', 'presentation');
        this.played.value = 0;

        this.progress.appendChild(this.slider);
        this.progress.appendChild(this.played);
        this.progress.appendChild(this.buffer);

        this.events = {};
        this.sliderEvents = {};
        this.events['loadedmetadata'] = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                this.slider.setAttribute('max', `${el.duration}`);
                const current = el instanceof Media ? el.currentTime : (el.duration - el.currentTime);
                this.slider.value = current.toString();
            // } else {
            //     this.slider.style.display = 'none';
            }
        };
        this.events['progress'] = (e: any) => {
            const el = e.target;
            if (el.duration > 0) {
                for (let i = 0, total = el.buffered.length; i < total; i++) {
                    if (el.buffered.start(el.buffered.length - 1 - i) < el.currentTime) {
                        this.buffer.value = (el.buffered.end(e.target.buffered.length - 1 - i) / el.duration) * 100;
                        break;
                    }
                }
            }
        };
        this.events['timeupdate'] = (e: any) => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                if (!this.slider.getAttribute('max')) {
                    this.slider.setAttribute('max', `${el.duration}`);
                }

                const current = el instanceof Media ? el.currentTime : (el.duration - el.currentTime);
                const min = parseFloat(this.slider.min);
                const max = parseFloat(this.slider.max);
                this.slider.value = current.toString();
                this.slider.style.backgroundSize = `${(current - min) * 100 / (max - min)}% 100%`;

                const currentEl = e.target;
                if (currentEl.duration > 0) {
                    this.played.value = ((currentEl.currentTime / currentEl.duration) * 100);
                }
            // } else {
            //     this.slider.style.display = 'none';
            }
        };

        const updateSlider = (e: any) => {
            const el = this.player.activeElement();
            const min = e.target.min;
            const max = e.target.max;
            const val = e.target.value;
            this.slider.style.backgroundSize = `${(val - min) * 100 / (max - min)}% 100%`;

            // If current progress is not related to an Ad, manipulate current time
            if (el instanceof Media) {
                el.currentTime = val;
            }
        };
        this.sliderEvents['input'] = updateSlider.bind(this);
        this.sliderEvents['change'] = updateSlider.bind(this);

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

        Object.keys(this.sliderEvents).forEach(event => {
            this.slider.addEventListener(event, this.sliderEvents[event]);
        });

        return this;
    }

    public unregister() {
        Object.keys(this.events).forEach(event => {
            this.player.media.element.removeEventListener(event, this.events[event]);
        });

        Object.keys(this.sliderEvents).forEach(event => {
            this.slider.removeEventListener(event, this.sliderEvents[event]);
        });

        this.events = {};
        this.sliderEvents = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} controls
     * @returns {Progress}
     * @memberof Progress
     */
    public build(controls: HTMLDivElement) {
        controls.appendChild(this.progress);
        return this;
    }
}

export default Progress;
