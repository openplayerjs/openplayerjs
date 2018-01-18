import { addEvent } from '../events';

/**
 *
 * @class Volume
 * @description  Class that renders volume slider and mute button, and registers events to update them
 */
class Volume {
    /**
     *
     * @param media
     * @returns {Volume}
     */
    constructor(media) {
        this.media = media;
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__volume';
        const volume = Math.floor(media.volume * 100);

        this.slider.value = media.volume;
        this.slider.setAttribute('min', 0);
        this.slider.setAttribute('aria-valuemin', 0);
        this.slider.setAttribute('max', 1);
        this.slider.setAttribute('aria-valuemax', 1);
        this.slider.setAttribute('step', 0.1);
        this.slider.setAttribute('aria-valuetext', `${volume}%`);

        this.volume = media.volume;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__mute';
        this.button.innerHTML = '<span class="om-sr">Mute</span>';

        this.events = {};

        return this;
    }

    /**
     *
     * @returns {Play}
     * @memberof Play
     */
    register() {
        const el = this.media.element;
        const updateVolume = () => {
            const volume = Math.floor(this.media.volume * 100);
            this.slider.setAttribute('aria-valuenow', volume);
            this.slider.setAttribute('aria-valuetext', `${volume}%`);
            this.slider.value = this.media.volume;
        };
        // const updateMute = () => {
        //     this.media.muted = !this.media.muted;
        //     if (this.media.muted) {
        //         this.media.volume = 0;
        //     } else {
        //         this.media.volume = this.volume;
        //     }
        //     const event = addEvent('volumechange');
        //     el.dispatchEvent(event);
        // };

        this.events = {
            input: e => {
                this.media.volume = e.target.value;
                const event = addEvent('volumechange');
                el.dispatchEvent(event);
            },
            change: e => {
                this.media.volume = e.target.value;
                const event = addEvent('volumechange');
                el.dispatchEvent(event);
            }
        };

        // this.button.addEventListener('click', () => {
        //
        // });

        el.addEventListener('volumechange', () => {
            this.volume = this.media.volume;
            updateVolume();
        });

        Object.keys(this.events).forEach(event => {
            this.slider.addEventListener(event, this.events[event]);
        });

        return this;
    }

    unregister() {
        Object.keys(this.events).forEach(event => {
            this.slider.removeEventListener(event, this.events[event]);
        });

        this.button.removeEventListener('click', this.events.click);

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLElement} container
     * @returns {Play}
     * @memberof Play
     */
    build(container) {
        container.appendChild(this.button);
        container.appendChild(this.slider);
        return this;
    }
}

export default Volume;
