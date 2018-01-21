import formatTime from '../utils/time';
import Media from '../media';

/**
 *
 * @class Time
 * @description Class that renders current and duration times in human-readable format
 * and registers events to update them in the control bar
 */
class Time {
    media: Media;
    current: HTMLTimeElement;
    delimiter: HTMLSpanElement;
    duration: HTMLTimeElement;
    events: object;

    /**
     *
     * @param {Media} media
     * @returns {Time}
     * @memberof Time
     */
    constructor(media) {
        this.media = media;
        this.current = document.createElement('time');
        this.current.className = 'om-controls__current';
        this.current.innerHTML = '<span class="om-current">0:00</span>';

        this.delimiter = document.createElement('span');
        this.delimiter.className = 'om-controls__time-delimiter';
        this.delimiter.innerText = '/';

        this.duration = document.createElement('time');
        this.duration.className = 'om-controls__duration';
        this.duration.innerHTML = '<span class="om-duration">0:00</span>';

        const el = this.media.element;
        this.events['loadedmetadata'] = () => {
            if (el.duration !== Infinity && !isNaN(el.duration)) {
                this.duration.innerText = formatTime(el.duration);
            } else {
                this.duration.style.display = 'none';
                this.delimiter.style.display = 'none';
            }
        };
        this.events['timeupdate'] = () => {
            if (el.duration !== Infinity) {
                if (!isNaN(el.duration) && !el.duration) {
                    this.duration.innerText = formatTime(el.duration);
                }
                this.current.innerText = formatTime(el.currentTime);
            } else {
                this.duration.style.display = 'none';
                this.delimiter.style.display = 'none';
                this.current.innerText = 'Live Broadcast';
            }
        };

        return this;
    }

    /**
     *
     * @returns {Time}
     * @memberof Time
     */
    register() {
        Object.keys(this.events).forEach(event => {
            this.media.element.addEventListener(event, this.events[event]);
        });

        return this;
    }

    unregister() {
        Object.keys(this.events).forEach(event => {
            this.media.element.removeEventListener(event, this.events[event]);
        });

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Time}
     * @memberof Time
     */
    build(container) {
        container.appendChild(this.current);
        container.appendChild(this.delimiter);
        container.appendChild(this.duration);
        return this;
    }
}

export default Time;
