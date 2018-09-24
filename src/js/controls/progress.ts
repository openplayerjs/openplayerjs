import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Player from '../player';
import { IS_ANDROID, IS_IOS } from '../utils/constants';
import { hasClass, offset } from '../utils/general';
import { formatTime } from '../utils/time';

/**
 * Progress bar element.
 *
 * @description This class creates a progress bar to track how much time media has been played,
 * downloaded and its current time, using `semantic markup`, such as input range and progress elements.
 * @see https://codepen.io/mi-lee/post/an-overview-of-html5-semantics
 * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#Progress
 * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/buffering_seeking_time_ranges
 * @class Progress
 * @implements PlayerComponent
 */
class Progress implements PlayerComponent {
    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Progress
     */
    private player: Player;

    /**
     * Container for progress bar elements (buffered, played and slider input).
     *
     * @private
     * @type HTMLDivElement
     * @memberof Progress
     */
    private progress: HTMLDivElement;

    /**
     * Element that allows changing media's current position (time).
     *
     * @private
     * @type HTMLInputElement
     * @memberof Progress
     */
    private slider: HTMLInputElement;

    /**
     * Element that displays the media's downloaded amount.
     *
     * @private
     * @type HTMLProgressElement
     * @memberof Progress
     */
    private buffer: HTMLProgressElement;

    /**
     * Element that displays the media's played time.
     *
     * @private
     * @type HTMLProgressElement
     * @memberof Progress
     */
    private played: HTMLProgressElement;

    /**
     * Element that displays the current media time when hovering in the progress bar.
     *
     * @private
     * @type HTMLSpanElement
     * @memberof Progress
     */
    private tooltip: HTMLSpanElement;

    /**
     * Events that will be triggered in Progress element:
     *  - container (to display tooltip when hovering in the progress bar)
     *  - global (to hide tooltip once user moves out of the progress bar)
     *  - media (to capture different states of the current time and duration in the time rail)
     *  - slider (events to be triggered when clicking or sliding time rail)
     *
     * @private
     * @type EventsList
     * @memberof Progress
     */
    private events: EventsList = {
        container: {},
        global: {},
        media: {},
        slider: {},
    };

    /**
     * Flag that pauses and then plays media properly (if media was played) when
     * clicking in the progress bar.
     *
     * @private
     * @type {boolean}
     * @memberof Progress
     */
    private forcePause: boolean;

    /**
     * Create an instance of Progress.
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
     * @inheritDoc
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
        this.slider.setAttribute('aria-label', 'Time Rail');
        this.slider.setAttribute('role', 'slider');

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

        if (!IS_IOS && !IS_ANDROID) {
            this.tooltip = document.createElement('span');
            this.tooltip.className = 'om-controls__tooltip';
            this.tooltip.tabIndex = -1;
            this.tooltip.innerHTML = '00:00';
            this.progress.appendChild(this.tooltip);
        }

        this.events.media.loadedmetadata = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                this.slider.setAttribute('max', `${el.duration}`);
                const current = this.player.isMedia() ? el.currentTime : (el.duration - el.currentTime);
                this.slider.value = current.toString();
                this.progress.setAttribute('aria-valuemax', el.duration.toString());
            }
        };
        this.events.media.progress = (e: Event) => {
            const el = (e.target as HTMLMediaElement);
            if (el.duration > 0) {
                for (let i = 0, total = el.buffered.length; i < total; i++) {
                    if (el.buffered.start(el.buffered.length - 1 - i) < el.currentTime) {
                        this.buffer.value = (el.buffered.end(el.buffered.length - 1 - i) / el.duration) * 100;
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
        this.events.media.timeupdate = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                if (!this.slider.getAttribute('max') || this.slider.getAttribute('max') === '0' ||
                    parseFloat(this.slider.getAttribute('max')) !== el.duration) {
                    this.slider.setAttribute('max', `${el.duration}`);
                }

                // Adjust current time between Media and Ads; with the latter,
                // it is convenient to add an extra second to ensure it will
                // reach the end of the rail
                const current = this.player.isMedia() ? el.currentTime :
                    ((el.duration - el.currentTime) + 1 >= 100 ? 100 :
                    (el.duration - el.currentTime) + 1);
                const min = parseFloat(this.slider.min);
                const max = parseFloat(this.slider.max);
                this.slider.value = current.toString();
                this.slider.style.backgroundSize = `${(current - min) * 100 / (max - min)}% 100%`;
                this.played.value = el.duration <= 0 || isNaN(el.duration) || !isFinite(el.duration) ?
                    0 : ((current / el.duration) * 100);
            }
        };

        this.events.media.ended = () => {
            this.slider.style.backgroundSize = '0% 100%';
            this.slider.setAttribute('max', '0');
            this.buffer.value = 0;
            this.played.value = 0;
        };

        /**
         *
         * @private
         */
        const updateSlider = (e: any) => {
            if (hasClass(this.slider, 'om-progress--pressed')) {
                return;
            }
            const target = (e.target as HTMLInputElement);
            this.slider.classList.add('.om-progress--pressed');

            const el = this.player.activeElement();
            const min = parseFloat(target.min);
            const max = parseFloat(target.max);
            const val = parseFloat(target.value);
            this.slider.style.backgroundSize = `${(val - min) * 100 / (max - min)}% 100%`;
            this.slider.classList.remove('.om-progress--pressed');
            el.currentTime = val;
            e.preventDefault();
        };

        /**
         *
         * @private
         */
        const forcePause = (e: KeyboardEvent) => {
            const el = this.player.activeElement();
            // If current progress is not related to an Ad, manipulate current time
            if ((e.which === 1 || e.which === 0) && this.player.isMedia()) {
                if (!el.paused) {
                    el.pause();
                    this.forcePause = true;
                }
            }
        };

        /**
         *
         * @private
         */
        const releasePause = () => {
            const el = this.player.activeElement();
            if (this.forcePause === true && this.player.isMedia()) {
                if (el.paused) {
                    el.play();
                    this.forcePause = false;
                }
            }
        };

        /**
         * When tapping on mobile, it will update the time and force pause
         *
         * @private
         * @param {any} e Event to calculate new time when user taps on time rail
         */
        const mobileForcePause = (e: any) => {
            const el = this.player.activeElement();
            if (el.duration === Infinity) {
                return true;
            }
            const x = (e.originalEvent && e.originalEvent.changedTouches) ?
                e.originalEvent.changedTouches[0].pageX : e.pageX;

            const pos = x - offset(this.progress).left;
            const percentage = (pos / this.progress.offsetWidth);
            const time = percentage * el.duration;
            this.slider.value = time.toString();
            updateSlider(e);
            forcePause(e);
            e.preventDefault();
        };

        this.events.slider.input = updateSlider.bind(this);
        this.events.slider.change = updateSlider.bind(this);
        this.events.slider.mousedown = forcePause.bind(this);
        this.events.slider.mouseup = releasePause.bind(this);

        this.events.slider.touchstart = mobileForcePause.bind(this);
        this.events.slider.touchend = releasePause.bind(this);

        if (!IS_IOS && !IS_ANDROID) {
            this.events.container.mousemove = (e: any) => {
                const el = this.player.activeElement();
                if (el.duration === Infinity || this.player.isAd()) {
                    return true;
                }

                const x = (e.originalEvent && e.originalEvent.changedTouches) ?
                    e.originalEvent.changedTouches[0].pageX : e.pageX;

                let pos = x - offset(this.progress).left;
                const half = this.tooltip.offsetWidth / 2;
                const percentage = (pos / this.progress.offsetWidth);
                const time = percentage * el.duration;
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
            this.events.global.mousemove = (e: MouseEvent) => {
                if (!(e.target as HTMLElement).closest('.om-controls__progress') || this.player.isAd()) {
                    this.tooltip.classList.remove('om-controls__tooltip--visible');
                }
            };
        }

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

    /**
     *
     * @inheritDoc
     * @memberof Progress
     */
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
        if (!IS_IOS && !IS_ANDROID) {
            this.tooltip.remove();
        }
        this.progress.remove();
    }
}

export default Progress;
