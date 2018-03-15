import IEvent from '../components/interfaces/general/event';
import Media from '../media';
import Player from '../player';
import { formatTime } from '../utils/time';

/**
 *
 * @class Time
 * @description Class that renders current and duration times in human-readable format
 * and registers events to update them in the control bar
 */
class Time {
    public player: Player;
    private current: HTMLTimeElement;
    private delimiter: HTMLSpanElement;
    private duration: HTMLTimeElement;
    private events: IEvent;

    /**
     *
     * @param {Media} media
     * @returns {Time}
     * @memberof Time
     */
    constructor(player: Player) {
        this.player = player;
        this.current = document.createElement('time');
        this.current.className = 'om-controls__current';
        this.current.setAttribute('role', 'timer');
		this.current.setAttribute('aria-live', 'off');
        this.current.innerText = '0:00';

        this.delimiter = document.createElement('span');
        this.delimiter.className = 'om-controls__time-delimiter';
        this.delimiter.innerText = '/';

        this.duration = document.createElement('time');
        this.duration.className = 'om-controls__duration';
        this.duration.innerText = '0:00';

        this.events = {};
        this.events['loadedmetadata'] = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity && !isNaN(el.duration)) {
                this.duration.innerText = formatTime(el.duration);
                this.current.innerText = formatTime(el.currentTime);
            } else {
                this.duration.style.display = 'none';
                this.delimiter.style.display = 'none';
            }
        };
        this.events['timeupdate'] = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity) {
                if (!isNaN(el.duration) && el.duration !== this.duration.innerText) {
                    this.duration.innerText = formatTime(el.duration);
                    this.duration.style.display = 'initial';
                    this.delimiter.style.display = 'initial';
                }
                this.current.innerText = formatTime(el.currentTime);
            } else if (this.duration.style.display !== 'none') {
                this.duration.style.display = 'none';
                this.delimiter.style.display = 'none';
                this.current.innerText = 'Live Broadcast';
            }
        };
        this.events['ended'] = () => {
            const el = this.player.activeElement();
            if (el instanceof Media && this.duration.innerText !== '0:00') {
                this.duration.innerText = formatTime(el.duration);
            }
        };

        return this;
    }

    /**
     *
     * @returns {Time}
     * @memberof Time
     */
    public register() {
        Object.keys(this.events).forEach(event => {
            this.player.element.addEventListener(event, this.events[event]);
        });

        return this;
    }

    public unregister() {
        Object.keys(this.events).forEach(event => {
            this.player.element.removeEventListener(event, this.events[event]);
        });

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} controls
     * @returns {Time}
     * @memberof Time
     */
    public build(controls: HTMLDivElement) {
        controls.appendChild(this.current);
        controls.appendChild(this.delimiter);
        controls.appendChild(this.duration);
        return this;
    }
}

export default Time;
