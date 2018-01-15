import Play from './controls/play';
import Fullscreen from './controls/fullscreen';
import Progress from './controls/progress';
import Time from './controls/time';
import Volume from './controls/volume';

/**
 * Class that renders all control elements
 *
 * @class Controls
 */
class Controls {
    /**
     * Creates an instance of Controls.
     * @param {HTMLElement} element
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(element) {
        this.element = element;
        // this.element.controls = false;
        this.container = document.createElement('div');
        this.container.className = 'om-controls';

        const play = new Play();
        this.container.appendChild(play.button);

        const time = new Time();
        this.container.appendChild(time.current);
        this.container.appendChild(time.delimiter);
        this.container.appendChild(time.duration);

        const progress = new Progress();
        this.container.appendChild(progress.slider);

        const volume = new Volume();
        this.container.appendChild(volume.button);
        this.container.appendChild(volume.slider);

        const fullscreen = new Fullscreen();
        this.container.appendChild(fullscreen.button);

        return this;
    }

    prepare() {
        const el = this.element;
        const progress = this.container.querySelector('.om-controls__progress');
        const duration = this.container.querySelector('.om-controls__duration');
        const current = this.container.querySelector('.om-controls__current');
        const timeDelimiter = this.container.querySelector('.om-controls__time-delimiter');

        el.onloadedmetadata = () => {
            if (el.duration !== Infinity) {
                progress.setAttribute('max', el.duration);
                duration.innerText = Controls._formatTime(el.duration);
            } else {
                progress.style.display = 'none';
                duration.style.display = 'none';
                timeDelimiter.style.display = 'none';
            }
        };

        el.ontimeupdate = () => {
            if (el.duration !== Infinity) {
                if (!progress.getAttribute('max')) {
                    progress.setAttribute('max', el.duration);
                    duration.innerText = Controls._formatTime(el.duration);
                }
                progress.value = el.currentTime;
                current.innerText = Controls._formatTime(el.currentTime);
                progress.firstChild.style.width = `${Math.floor((el.currentTime / el.duration) * 100)}%`;
            } else {
                progress.style.display = 'none';
                duration.style.display = 'none';
                timeDelimiter.style.display = 'none';
                current.innerText = 'Live Broadcast';
            }
        };
    }

    render() {
        this.element.parentNode.appendChild(this.container);
    }

    static _formatTime(seconds) {
        let hrs = Math.floor(seconds / 3600);
        const min = Math.floor((seconds - (hrs * 3600)) / 60);
        let secs = Math.floor(seconds - (hrs * 3600) - (min * 60));
        const showHours = hrs > 0;

        hrs = hrs < 10 ? `0${hrs}` : hrs;
        secs = secs < 10 ? `0${secs}` : secs;
        return `${(showHours ? `${hrs}:` : '')}${min}:${secs}`;
    }
}

export default Controls;
