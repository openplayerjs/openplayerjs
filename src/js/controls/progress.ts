import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Player from '../player';
import { hasClass, offset } from '../utils/general';
import { formatTime } from '../utils/time';

class Progress implements PlayerComponent {
    private player: Player;
    private slider: HTMLInputElement;
    private buffer: HTMLProgressElement;
    private progress: HTMLDivElement;
    private played: HTMLProgressElement;
    private tooltip: HTMLSpanElement;
    private events: EventsList = {
        container: {},
        global: {},
        media: {},
        slider: {},
    };
    private forcePause: boolean;

    /**
     *
     * @param {Player} player
     * @returns {Progress}
     * @memberof Progress
     */
    constructor(player: Player) {
        this.player = player;
        this.forcePause = false;
        return this;
    }

    /**
     *
     * @returns {Progress}
     * @memberof Progress
     */
    public create(): void {
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

        this.tooltip = document.createElement('span');
        this.tooltip.className = 'om-controls__tooltip';
        this.tooltip.tabIndex = -1;
        this.tooltip.innerHTML = '00:00';

        this.progress.appendChild(this.slider);
        this.progress.appendChild(this.played);
        this.progress.appendChild(this.buffer);
        this.progress.appendChild(this.tooltip);

        this.events.media.loadedmetadata = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                this.slider.setAttribute('max', `${el.duration}`);
                const current = this.player.isMedia() ? el.currentTime : (el.duration - el.currentTime);
                this.slider.value = current.toString();
                this.progress.setAttribute('aria-valuemax', el.duration);
            }
        };
        this.events.media.progress = (e: any) => {
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
        this.events.media.pause = () => {
            const el = this.player.activeElement();
            const current = el.currentTime;
            this.progress.setAttribute('aria-valuenow', current.toString());
            this.progress.setAttribute('aria-valuetext', formatTime(current));
        };
        this.events.media.play = () => {
            this.progress.removeAttribute('aria-valuenow');
            this.progress.removeAttribute('aria-valuetext');
        };
        this.events.media.timeupdate = (e: any) => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                if (!this.slider.getAttribute('max') || this.slider.getAttribute('max') === '0' ||
                    this.slider.getAttribute('max') !== el.duration) {
                    this.slider.setAttribute('max', `${el.duration}`);
                }

                const current = this.player.isMedia() ? el.currentTime : (el.duration - el.currentTime);
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

        this.events.media.ended = () => {
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
            if (this.player.isMedia()) {
                el.currentTime = val;
            }
        };

        const forcePause = (e: any) => {
            const el = this.player.activeElement();
            // If current progress is not related to an Ad, manipulate current time
            if ((e.which === 1 || e.which === 0) && this.player.isMedia()) {
                if (!el.paused) {
                    el.pause();
                    this.forcePause = true;
                }
            }
        };

        const releasePause = () => {
            const el = this.player.activeElement();
            if (this.forcePause === true && this.player.isMedia()) {
                el.play();
            }
            this.forcePause = false;
        };

        this.events.slider.input = updateSlider.bind(this);
        this.events.slider.change = updateSlider.bind(this);
        this.events.slider.mousedown = forcePause.bind(this);
        this.events.slider.touchstart = forcePause.bind(this);
        this.events.slider.mouseup = releasePause.bind(this);
        this.events.slider.touchend = releasePause.bind(this);

        this.events.container.mousemove = (e: any) => {
            const el = this.player.activeElement();
            if (el.duration === Infinity) {
                return true;
            }

            const x = (e.originalEvent && e.originalEvent.changedTouches) ?
                e.originalEvent.changedTouches[0].pageX : e.pageX;

            let pos = x - offset(this.progress).left;
            const half = this.tooltip.offsetWidth / 2;
            const percentage = (pos / this.progress.offsetWidth);
            const time = (percentage <= 0.02) ? 0 : percentage * el.duration;
            const mediaContainer = this.player.getContainer();
            const limit = mediaContainer.offsetWidth - this.tooltip.offsetWidth;

            if (pos <= 0 || x - offset(mediaContainer).left <= half) {
                pos = 0;
            } else if (x - offset(mediaContainer).left >= limit) {
                pos = limit;
            } else {
                pos -= half;
            }

            if (percentage >= 0 && percentage <= 1) {
                this.tooltip.classList.add('om-controls__tooltip--visible');
            } else {
                this.tooltip.classList.remove('om-controls__tooltip--visible');
            }

            this.tooltip.style.left = `${pos}px`;
            this.tooltip.innerHTML = isNaN(time) ? '00:00' : formatTime(time);
        };

        this.events.global.mousemove = (e: any) => {
            if (!e.target.closest('.om-controls__progress')) {
                this.tooltip.classList.remove('om-controls__tooltip--visible');
            }
        };

        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().addEventListener(event, this.events.media[event]);
        });

        Object.keys(this.events.slider).forEach(event => {
            this.slider.addEventListener(event, this.events.slider[event]);
        });

        this.progress.addEventListener('keydown', this.player.getEvents().keydown);
        this.progress.addEventListener('mousemove', this.events.container.mousemove);

        document.addEventListener('mousemove', this.events.global.mousemove);

        this.player.getControls().getContainer().appendChild(this.progress);
    }

    public destroy(): void {
        Object.keys(this.events).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events[event]);
        });

        Object.keys(this.events.slider).forEach(event => {
            this.slider.removeEventListener(event, this.events.slider[event]);
        });

        this.progress.removeEventListener('keydown', this.player.getEvents().keydown);
        this.progress.removeEventListener('mousemove', this.events.container.mousemove);

        document.removeEventListener('mousemove', this.events.global.mousemove);

        this.buffer.remove();
        this.played.remove();
        this.slider.remove();
        this.tooltip.remove();
        this.progress.remove();
    }
}

export default Progress;
