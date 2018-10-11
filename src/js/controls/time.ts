import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Player from '../player';
import { formatTime } from '../utils/time';

/**
 * Time element.
 *
 * @description Class that renders media's current time and duration in human-readable format
 * (hh:mm:ss), and if media is a live streaming, a `Live Broadcast` message will be displayed.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration
 * @class Time
 * @implements PlayerComponent
 */
class Time implements PlayerComponent {
    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Time
     */
    private player: Player;

    /**
     * Element that displays media's current time being played.
     *
     * It will change to `Live Broadcast` if duration is Infinity.
     * @private
     * @type {HTMLTimeElement}
     * @memberof Time
     */
    private current: HTMLTimeElement;

    /**
     * Element that separates current time and duration labels.
     *
     * It will be hidden if duration is Infinity.
     * @private
     * @type {HTMLSpanElement}
     * @memberof Time
     */
    private delimiter: HTMLSpanElement;

    /**
     * Element that displays media's total duration.
     *
     * It will be hidden if duration is Infinity.
     * @private
     * @type {HTMLTimeElement}
     * @memberof Time
     */
    private duration: HTMLTimeElement;

    /**
     * Events that will be triggered in Time element:
     *  - controls (to reset time properly when `controlschanged` event is triggered).
     *  - media (to set current time and duration in `loadedmetadata`, `progress` and `timeupdate` events).
     *
     * @private
     * @type EventsList
     * @memberof Time
     */
    private events: EventsList = {
        controls: {},
        media: {},
    };

    /**
     * Create an instance of Time.
     *
     * @param {Player} player
     * @returns {Time}
     * @memberof Time
     */
    constructor(player: Player) {
        this.player = player;
        return this;
    }

    /**
     * When no duration (Infinity) is detected, the `Live Broadcast` will be displayed.
     *
     * @inheritDoc
     * @memberof Time
     */
    public create(): void {
        this.current = document.createElement('time');
        this.current.className = 'op-controls__current';
        this.current.setAttribute('role', 'timer');
        this.current.setAttribute('aria-live', 'off');
        this.current.setAttribute('aria-hidden', 'false');
        this.current.innerText = '0:00';

        this.delimiter = document.createElement('span');
        this.delimiter.className = 'op-controls__time-delimiter';
        this.delimiter.setAttribute('aria-hidden', 'false');
        this.delimiter.innerText = '/';

        this.duration = document.createElement('time');
        this.duration.className = 'op-controls__duration';
        this.duration.setAttribute('aria-hidden', 'false');
        this.duration.innerText = '0:00';

        const setInitialTime = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity && !this.player.getElement().getAttribute('op-live')) {
                const duration = !isNaN(el.duration) ? el.duration : 0;
                this.duration.innerText = formatTime(duration);
                this.current.innerText = formatTime(el.currentTime);
            } else {
                this.duration.setAttribute('aria-hidden', 'true');
                this.delimiter.setAttribute('aria-hidden', 'true');
            }
        };

        this.events.media.loadedmetadata = setInitialTime.bind(this);
        this.events.controls.controlschanged = setInitialTime.bind(this);

        this.events.media.timeupdate = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity && !this.player.getElement().getAttribute('op-live')) {
                const duration = formatTime(el.duration);
                if (!isNaN(el.duration) && duration !== this.duration.innerText) {
                    this.duration.innerText = duration;
                    this.duration.setAttribute('aria-hidden', 'false');
                    this.delimiter.setAttribute('aria-hidden', 'false');
                }
                this.current.innerText = formatTime(el.currentTime);
            } else if (this.duration.getAttribute('aria-hidden') === 'false') {
                this.duration.setAttribute('aria-hidden', 'true');
                this.delimiter.setAttribute('aria-hidden', 'true');
                this.current.innerText = 'Live Broadcast';
            }
        };
        this.events.media.ended = () => {
            const el = this.player.activeElement();
            if (this.player.isMedia() && this.duration.innerText !== '0:00') {
                this.duration.innerText = formatTime(el.duration);
            }
        };

        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().addEventListener(event, this.events.media[event]);
        });

        this.player.getControls().getContainer().addEventListener('controlschanged', this.events.controls.controlschanged);

        const controls = this.player.getControls().getContainer();
        controls.appendChild(this.current);
        controls.appendChild(this.delimiter);
        controls.appendChild(this.duration);
    }

    /**
     *
     * @inheritDoc
     * @memberof Time
     */
    public destroy(): void {
        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events.media[event]);
        });

        this.player.getControls().getContainer().removeEventListener('controlschanged', this.events.controls.controlschanged);

        this.current.remove();
        this.delimiter.remove();
        this.duration.remove();
    }
}

export default Time;
