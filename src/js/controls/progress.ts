import IEvent from '../components/interfaces/general/event';
import Media from '../media';

class Progress {
    public media: Media;
    private slider: HTMLInputElement;
    private events: IEvent;
    // private sliderEvents: IEvent;

    /**
     *
     * @param {Media} media
     * @returns {Progress}
     * @memberof Progress
     */
    constructor(media: Media) {
        this.media = media;
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__progress';
        this.slider.setAttribute('min', '0');
        this.slider.setAttribute('max', '0');
        this.slider.setAttribute('step', '0.1');
        this.slider.value = '0';
        this.slider.innerHTML = '<span class="om-controls__progress-bar"></span>';

        this.events = {};
        // this.sliderEvents = {};
        this.events['loadedmetadata'] = () => {
            if (this.media.element.duration !== Infinity) {
                this.slider.setAttribute('max', `${this.media.element.duration}`);
            } else {
                this.slider.style.display = 'none';
            }
        };
        this.events['timeupdate'] = () => {
            if (this.media.element.duration !== Infinity) {
                if (!this.slider.getAttribute('max')) {
                    this.slider.setAttribute('max', `${this.media.element.duration}`);
                }
                this.slider.value = this.media.element.currentTime.toString();
                (this.slider.firstChild as HTMLElement).style.width =
                    `${Math.floor((this.media.element.currentTime / this.media.element.duration) * 100)}%`;
            } else {
                this.slider.style.display = 'none';
            }
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
            this.media.element.addEventListener(event, this.events[event]);
        });

        return this;
    }

    public unregister() {
        Object.keys(this.events).forEach(event => {
            this.media.element.removeEventListener(event, this.events[event]);
        });
        this.events = {};
        // this.sliderEvents = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Progress}
     * @memberof Progress
     */
    public build(container: HTMLDivElement) {
        container.appendChild(this.slider);
        return this;
    }
}

export default Progress;
