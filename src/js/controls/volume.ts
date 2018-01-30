import IEvent from '../components/interfaces/general/event';
import { addEvent } from '../events';
import Media from '../media';

/**
 *
 * @class Volume
 * @description  Class that renders volume slider and mute button, and registers events to update them
 */
class Volume {
    public media: Media;
    private button: HTMLButtonElement;
    private slider: HTMLInputElement;
    private buttonEvents: IEvent;
    private sliderEvents: IEvent;
    private events: IEvent;
    private volume: number;

    /**
     *
     * @param media
     * @returns {Volume}
     */
    constructor(media: Media) {
        this.media = media;
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__volume';
        const volume = Math.floor(media.volume * 100);

        this.slider.value = media.volume;
        this.slider.setAttribute('min', '0');
        this.slider.setAttribute('aria-valuemin', '0');
        this.slider.setAttribute('max', '1');
        this.slider.setAttribute('aria-valuemax', '1');
        this.slider.setAttribute('step', '0.1');
        this.slider.setAttribute('aria-valuetext', `${volume}%`);

        // Use as backup when mute is clicked
        this.volume = media.volume;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__mute';
        this.button.innerHTML = '<span class="om-sr">Mute</span>';

        const el = this.media.element;

        const updateSlider = () => {
            const mediaVolume = this.media.volume * 1;
            const vol = Math.floor(mediaVolume * 100);
            this.slider.setAttribute('aria-valuenow', `${vol}`);
            this.slider.setAttribute('aria-valuetext', `${vol}%`);
            this.slider.value = `${this.media.volume}`;
        };

        const updateVolume = (event: any) => {
            this.media.volume = event.target.value;
            this.volume = event.target.value;
            const e = addEvent('volumechange');
            el.dispatchEvent(e);
        };

        this.events = {};
        this.events['volumechange'] = () => {
            updateSlider();
        };
        this.sliderEvents = {};
        this.sliderEvents['input'] = updateVolume.bind(this);
        this.sliderEvents['change'] = updateVolume.bind(this);

        this.buttonEvents = {};
        this.buttonEvents['click'] = () => {
            this.media.muted = !this.media.muted;

            if (this.media.muted) {
                this.media.volume = 0;
            } else {
                this.media.volume = this.volume;
            }
            const event = addEvent('volumechange');
            el.dispatchEvent(event);
        };

        return this;
    }

    /**
     *
     * @returns {Volume}
     * @memberof Volume
     */
    public register() {
        this.button.addEventListener('click', this.buttonEvents['click']);

        this.media.addEventListener('volumechange', this.events['volumechange']);

        Object.keys(this.sliderEvents).forEach(event => {
            this.slider.addEventListener(event, this.sliderEvents[event]);
        });

        return this;
    }

    public unregister() {
        Object.keys(this.sliderEvents).forEach(event => {
            this.slider.addEventListener(event, this.sliderEvents[event]);
        });

        this.media.removeEventListener('volumechange', this.events['volumechange']);

        this.button.removeEventListener('click', this.buttonEvents['click']);

        this.buttonEvents = {};
        this.sliderEvents = {};
        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Volume}
     * @memberof Volume
     */
    public build(container: HTMLDivElement) {
        container.appendChild(this.button);
        container.appendChild(this.slider);
        return this;
    }
}

export default Volume;
