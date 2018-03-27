import Event from '../interfaces/event';
import Player from '../player';
import { formatTime } from '../utils/time';

/**
 *
 * @class Time
 * @description Class that renders current and duration times in human-readable format
 * and registers events to update them in the control bar
 */
class Time {
    private player: Player;
    private current: HTMLTimeElement;
    private delimiter: HTMLSpanElement;
    private duration: HTMLTimeElement;
    private events: Event = {
        controls: {},
        media: {},
    };

    /**
     *
     * @param {Media} media
     * @returns {Time}
     * @memberof Time
     */
    constructor(player: Player) {
        this.player = player;
        return this;
    }

    /**
     *
     * @returns {Time}
     * @memberof Time
     */
    public create(): void {
        this.current = document.createElement('time');
        this.current.className = 'om-controls__current';
        this.current.setAttribute('role', 'timer');
        this.current.setAttribute('aria-live', 'off');
        this.current.setAttribute('aria-hidden', 'false');
        this.current.innerText = '0:00';

        this.delimiter = document.createElement('span');
        this.delimiter.className = 'om-controls__time-delimiter';
        this.delimiter.setAttribute('aria-hidden', 'false');
        this.delimiter.innerText = '/';

        this.duration = document.createElement('time');
        this.duration.className = 'om-controls__duration';
        this.duration.setAttribute('aria-hidden', 'false');
        this.duration.innerText = '0:00';

        const setInitialTime = () => {
            const el = this.player.activeElement();
            if (el.duration !== Infinity && !isNaN(el.duration) && el.duration !== this.duration.innerText) {
                this.duration.innerText = formatTime(el.duration);
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
            if (el.duration !== Infinity) {
                if (!isNaN(el.duration) && el.duration !== this.duration.innerText) {
                    this.duration.innerText = formatTime(el.duration);
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
