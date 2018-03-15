import IEvent from '../components/interfaces/general/event';
import Media from '../media';
import Ads from '../media/ads';
import Player from '../player';
import { hasClass } from '../utils/general';
import { formatTime } from '../utils/time';

class Progress {
    public player: Player;
    private slider: HTMLInputElement;
    private buffer: HTMLProgressElement;
    private progress: HTMLDivElement;
    private played: HTMLProgressElement;
    private events: IEvent;
    private sliderEvents: IEvent;
    private containerEvents: IEvent;
    private forcePause: boolean;

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
        this.progress.tabIndex = 0;
        this.progress.setAttribute('aria-label', 'Time Slider');
        this.progress.setAttribute('aria-valuemin', '0');

        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__progress--seek';
        this.slider.tabIndex = -1;
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

        this.forcePause = false;

        this.events = {};
        this.sliderEvents = {};
        this.containerEvents = {};
        this.events['loadedmetadata'] = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                this.slider.setAttribute('max', `${el.duration}`);
                const current = el instanceof Media ? el.currentTime : (el.duration - el.currentTime);
                this.slider.value = current.toString();
                this.progress.setAttribute('aria-valuemax', el.duration);
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
        this.events['pause'] = () => {
            const el = this.player.activeElement();
            const current = el.currentTime;
            this.progress.setAttribute('aria-valuenow', current.toString());
            this.progress.setAttribute('aria-valuetext', formatTime(current));
        };
        this.events['play'] = () => {
            this.progress.removeAttribute('aria-valuenow');
            this.progress.removeAttribute('aria-valuetext');
        };
        this.events['timeupdate'] = (e: any) => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                if (!this.slider.getAttribute('max') || this.slider.getAttribute('max') === '0' ||
                    this.slider.getAttribute('max') !== el.duration) {
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
            }
        };

        this.events['ended'] = () => {
            this.slider.style.backgroundSize = '0% 100%';
            this.slider.setAttribute('max', '0');
            this.buffer.value = 0;
            this.played.value = 0;
        };

        const updateSlider = (e: any) => {
            if (hasClass(this.slider, 'om-progress--pressed')) {
                return;
            }
            this.slider.classList.add('.om-progress--pressed');
            const min = e.target.min;
            const max = e.target.max;
            const val = e.target.value;
            this.slider.style.backgroundSize = `${(val - min) * 100 / (max - min)}% 100%`;
            this.slider.classList.remove('.om-progress--pressed');

            const el = this.player.activeElement();
            if (el instanceof Media) {
                el.currentTime = val;
            }
        };

        const forcePause = (e: any) => {
            const el = this.player.activeElement();
            // If current progress is not related to an Ad, manipulate current time
            if ((e.which === 1 || e.which === 0) && el instanceof Media) {
                if (!el.paused) {
                    el.pause();
                    this.forcePause = true;
                }
            }
        };

        const releasePause = () => {
            const el = this.player.activeElement();
            if (this.forcePause === true && el instanceof Media) {
                el.play();
            }
            this.forcePause = false;
        }

        this.sliderEvents['input'] = updateSlider.bind(this);
        this.sliderEvents['change'] = updateSlider.bind(this);
        this.sliderEvents['mousedown'] = forcePause.bind(this);
        this.sliderEvents['touchstart'] = forcePause.bind(this);
        this.sliderEvents['mouseup'] = releasePause.bind(this);
        this.sliderEvents['touchend'] = releasePause.bind(this);
    
        this.containerEvents['keydown'] = (e: any) => {
            const el = this.player.activeElement();

            if (el instanceof Ads) {
                return true;
            }
            const key = e.which || e.keyCode || 0;
            const step = el.duration * 0.05;
            let seekTime = el.currentTime;

            switch (key) {
                case 37: // Left
                    if (el.duration !== Infinity) {
                        seekTime -= step;
                    }
                    break;
                case 39: // Right
                    if (el.duration !== Infinity) {
                        seekTime += step;
                    }
                    break;
                case 36: // Home
                    seekTime = 0;
                    break;
                case 35: // end
                    seekTime = el.duration;
                    break;
                case 13: // enter
                case 32: // space
                    if (el.paused) {
                        el.play();
                    } else {
                        el.pause();
                    }
                    return;
                default:
                    return;
            }

            seekTime = seekTime < 0 ? 0 : (seekTime >= el.duration ? e.duration : Math.floor(seekTime));
            el.currentTime = seekTime;
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

        Object.keys(this.sliderEvents).forEach(event => {
            this.slider.addEventListener(event, this.sliderEvents[event]);
        });

        this.progress.addEventListener('keydown', this.containerEvents.keydown);

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
