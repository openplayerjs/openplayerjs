import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Player from '../player';
import { EVENT_OPTIONS } from '../utils/constants';
import { removeElement } from '../utils/general';
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
    #player: Player;

    /**
     * Element that displays media's current time being played.
     *
     * It will change to `Live Broadcast` if duration is Infinity.
     * @private
     * @type {HTMLTimeElement}
     * @memberof Time
     */
    #current: HTMLTimeElement;

    /**
     * Element that separates current time and duration labels.
     *
     * It will be hidden if duration is Infinity.
     * @private
     * @type {HTMLSpanElement}
     * @memberof Time
     */
    #delimiter: HTMLSpanElement;

    /**
     * Element that displays media's total duration.
     *
     * It will be hidden if duration is Infinity.
     * @private
     * @type {HTMLTimeElement}
     * @memberof Time
     */
    #duration: HTMLTimeElement;

    /**
     * Element that encloses all elements to show time
     *
     * @private
     * @type {HTMLSpanElement}
     * @memberof Time
     */
    #container: HTMLSpanElement;

    /**
     * Events that will be triggered in Time element:
     *  - controls (to reset time properly when `controlschanged` event is triggered).
     *  - media (to set current time and duration in `loadedmetadata`, `progress` and `timeupdate` events).
     *
     * @private
     * @type EventsList
     * @memberof Time
     */
    #events: EventsList = {
        controls: {},
        media: {},
    };

    /**
     * Default labels from player's config
     *
     * @private
     * @type object
     * @memberof Time
     */
    #labels: any;

    /**
     * Position of the button to be indicated as part of its class name
     *
     * @private
     * @type {string}
     * @memberof Time
     */
    #position: string;

    /**
     * Layer where the control item will be placed
     *
     * @private
     * @type {string}
     * @memberof Captions
     */
    #layer: string;

    /**
     * Create an instance of Time.
     *
     * @param {Player} player
     * @returns {Time}
     * @memberof Time
     */
    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#labels = player.getOptions().labels;
        this.#position = position;
        this.#layer = layer;
        return this;
    }

    /**
     * When no duration (Infinity) is detected, the `Live Broadcast` will be displayed.
     *
     * @inheritDoc
     * @memberof Time
     */
    public create(): void {
        this.#current = document.createElement('time');
        this.#current.className = 'op-controls__current';
        this.#current.setAttribute('role', 'timer');
        this.#current.setAttribute('aria-live', 'off');
        this.#current.setAttribute('aria-hidden', 'false');
        this.#current.innerText = '0:00';

        const showOnlyCurrent = this.#player.getOptions().progress.showCurrentTimeOnly;

        if (!showOnlyCurrent) {
            this.#delimiter = document.createElement('span');
            this.#delimiter.className = 'op-controls__time-delimiter';
            this.#delimiter.setAttribute('aria-hidden', 'false');
            this.#delimiter.innerText = '/';

            this.#duration = document.createElement('time');
            this.#duration.className = 'op-controls__duration';
            this.#duration.setAttribute('aria-hidden', 'false');
            this.#duration.innerText = formatTime(this.#player.getOptions().progress.duration);
        }

        const controls = this.#player.getControls().getLayer(this.#layer);
        this.#container = document.createElement('span');
        this.#container.className = `op-controls-time op-control__${this.#position}`;
        this.#container.appendChild(this.#current);
        if (!showOnlyCurrent) {
            this.#container.appendChild(this.#delimiter);
            this.#container.appendChild(this.#duration);
        }
        controls.appendChild(this.#container);

        const setInitialTime = () => {
            const el = this.#player.activeElement();
            if (el.duration !== Infinity && !this.#player.getElement().getAttribute('op-live__enabled')) {
                if (!showOnlyCurrent) {
                    const duration = !isNaN(el.duration) ? el.duration : this.#player.getOptions().progress.duration;
                    this.#duration.innerText = formatTime(duration);
                }
                this.#current.innerText = formatTime(el.currentTime);
            } else {
                if (!showOnlyCurrent) {
                    this.#duration.setAttribute('aria-hidden', 'true');
                }
                this.#delimiter.setAttribute('aria-hidden', 'true');
            }
        };

        this.#events.media.loadedmetadata = setInitialTime.bind(this);
        this.#events.controls.controlschanged = setInitialTime.bind(this);

        const { showLabel: showLiveLabel } = this.#player.getOptions().live;

        this.#events.media.timeupdate = () => {
            const el = this.#player.activeElement();
            if (el.duration !== Infinity && !this.#player.getElement().getAttribute('op-live__enabled') &&
                !this.#player.getElement().getAttribute('op-dvr__enabled')) {
                const duration = formatTime(el.duration);
                if (!showOnlyCurrent && !isNaN(el.duration) && duration !== this.#duration.innerText) {
                    this.#duration.innerText = duration;
                    this.#duration.setAttribute('aria-hidden', 'false');
                    this.#delimiter.setAttribute('aria-hidden', 'false');
                } else if (showOnlyCurrent || duration !== this.#duration.innerText) {
                    this.#current.innerText = showLiveLabel ? this.#labels.live : formatTime(el.currentTime);
                }
                this.#current.innerText = formatTime(el.currentTime);
            } else if (this.#player.getElement().getAttribute('op-dvr__enabled')) {
                if (!showOnlyCurrent) {
                    this.#duration.setAttribute('aria-hidden', 'true');
                    this.#delimiter.setAttribute('aria-hidden', 'true');
                }
                this.#current.innerText = formatTime(el.currentTime);
            } else if (showOnlyCurrent || (!this.#player.getElement().getAttribute('op-dvr__enabled') &&
                this.#duration.getAttribute('aria-hidden') === 'false')) {
                if (!showOnlyCurrent) {
                    this.#duration.setAttribute('aria-hidden', 'true');
                    this.#delimiter.setAttribute('aria-hidden', 'true');
                }
                this.#current.innerText = showLiveLabel ? this.#labels.live : formatTime(el.currentTime);
            } else {
                this.#current.innerText = showLiveLabel ? this.#labels.live : formatTime(el.currentTime);
            }
        };
        this.#events.media.ended = () => {
            const el = this.#player.activeElement();
            const duration = !isNaN(el.duration) ? el.duration : this.#player.getOptions().progress.duration;
            if (!showOnlyCurrent && this.#player.isMedia()) {
                this.#duration.innerText = formatTime(duration);
            }
        };

        Object.keys(this.#events.media).forEach(event => {
            this.#player.getElement().addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });

        this.#player.getControls().getContainer().addEventListener('controlschanged', this.#events.controls.controlschanged, EVENT_OPTIONS);
    }

    /**
     *
     * @inheritDoc
     * @memberof Time
     */
    public destroy(): void {
        Object.keys(this.#events.media).forEach(event => {
            this.#player.getElement().removeEventListener(event, this.#events.media[event]);
        });

        this.#player.getControls().getContainer().removeEventListener('controlschanged', this.#events.controls.controlschanged);

        removeElement(this.#current);
        if (!this.#player.getOptions().progress.showCurrentTimeOnly) {
            removeElement(this.#delimiter);
            removeElement(this.#duration);
        }
        removeElement(this.#container);
    }
}

export default Time;
