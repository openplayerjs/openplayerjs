import {formatTime} from '../utils/time';

/**
 * Class that renders current and duration times in human-readable format
 * and registers events to update them in the controls
 *
 * @class Time
 */
class Time {
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

        return this;
    }

    /**
     *
     * @returns {Time}
     * @memberof Time
     */
    register() {
        const el = this.media.element;
        el.addEventListener('loadedmetadata', () => {
            if (el.duration !== Infinity && !isNaN(el.duration)) {
                this.duration.innerText = formatTime(el.duration);
            } else {
                this.duration.style.display = 'none';
                this.delimiter.style.display = 'none';
            }
        });

        el.addEventListener('timeupdate', () => {
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
        });

        return this;
    }

    /**
     *
     * @param {HTMLElement} container
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
