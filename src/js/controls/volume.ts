import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Player from '../player';
import { addEvent } from '../utils/events';

/**
 *
 * @class Volume
 * @description  Class that renders volume slider and mute button, and registers events to update them
 */
class Volume implements PlayerComponent {
    private player: Player;
    private button: HTMLButtonElement;
    private container: HTMLDivElement;
    private display: HTMLProgressElement;
    private slider: HTMLInputElement;
    private events: EventsList = {
        button: {},
        media: {},
        slider: {},
    };
    private volume: number;

    /**
     *
     * @param {Player} player
     * @returns {Volume}
     */
    constructor(player: Player) {
        this.player = player;
        this.volume = this.player.getMedia().volume;
        return this;
    }

    /**
     *
     * @returns {Volume}
     * @memberof Volume
     */
    public create(): void {
        this.container = document.createElement('div');
        this.container.className = 'om-controls__volume';
        this.container.tabIndex = 0;
        this.container.setAttribute('aria-valuemin', '0');
        this.container.setAttribute('aria-valuemax', '100');
        this.container.setAttribute('aria-valuenow', `${this.volume}`);
        this.container.setAttribute('aria-valuetext', `${this.volume}`);
        this.container.setAttribute('aria-orientation', 'vertical');
        this.container.setAttribute('aria-label', 'Volume Slider');

        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__volume--input';
        this.slider.tabIndex = -1;
        this.slider.value = this.player.getMedia().volume;
        this.slider.setAttribute('min', '0');
        this.slider.setAttribute('max', '1');
        this.slider.setAttribute('step', '0.1');

        this.display = document.createElement('progress');
        this.display.className = 'om-controls__volume--display';
        this.display.setAttribute('max', '10');
        this.display.setAttribute('role', 'presentation');
        this.display.value = this.player.getMedia().volume * 10;

        this.container.appendChild(this.slider);
        this.container.appendChild(this.display);

        // Use as backup when mute is clicked
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__mute';
        this.button.tabIndex = 0;
        this.button.title = 'Mute';
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Mute');
        this.button.innerHTML = '<span class="om-sr">Mute</span>';

        const updateSlider = (element: any) => {
            const mediaVolume = element.volume * 1;
            const vol = Math.floor(mediaVolume * 100);

            this.slider.value = `${element.volume}`;
            this.display.value = (mediaVolume * 10);
            this.container.setAttribute('aria-valuenow', `${vol}`);
            this.container.setAttribute('aria-valuetext', `${vol}`);
        };

        const updateButton = (element: any) => {
            const vol = parseFloat(element.volume);
            if (vol <= 0.5 && vol > 0) {
                this.button.classList.remove('om-controls__mute--muted');
                this.button.classList.add('om-controls__mute--half');
            } else if (vol === 0) {
                this.button.classList.add('om-controls__mute--muted');
                this.button.classList.remove('om-controls__mute--half');
            } else {
                this.button.classList.remove('om-controls__mute--muted');
                this.button.classList.remove('om-controls__mute--half');
            }
        };

        const updateVolume = (event: any) => {
            const el = this.player.activeElement();
            el.volume = event.target.value;
            el.muted = (el.volume === 0);
            this.volume = event.target.value;
            const e = addEvent('volumechange');
            this.player.getElement().dispatchEvent(e);
        };

        this.events.media.volumechange = () => {
            const el = this.player.activeElement();
            updateSlider(el);
            updateButton(el);
        };
        this.events.media.loadedmetadata = () => {
            const el = this.player.activeElement();
            if (el.muted) {
                el.volume = 0;
                const e = addEvent('volumechange');
                this.player.getElement().dispatchEvent(e);
            }
        };
        this.events.slider.input = updateVolume.bind(this);
        this.events.slider.change = updateVolume.bind(this);

        this.events.button.click = () => {
            this.button.setAttribute('aria-pressed', 'true');
            const el = this.player.activeElement();
            el.muted = !el.muted;

            if (el.muted) {
                el.volume = 0;
                this.button.setAttribute('aria-label', 'Unmute');
            } else {
                el.volume = this.volume;
                this.button.setAttribute('aria-label', 'Mute');
            }
            const event = addEvent('volumechange');
            this.player.getElement().dispatchEvent(event);
        };

        this.button.addEventListener('click', this.events.button.click);
        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().addEventListener(event, this.events.media[event]);
        });

        Object.keys(this.events.slider).forEach(event => {
            this.slider.addEventListener(event, this.events.slider[event]);
        });

        const controls = this.player.getControls().getContainer();
        controls.appendChild(this.button);
        controls.appendChild(this.container);
    }

    public destroy(): void {
        this.button.removeEventListener('click', this.events.button.click);
        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events.media[event]);
        });

        Object.keys(this.events.slider).forEach(event => {
            this.slider.removeEventListener(event, this.events.slider[event]);
        });

        this.slider.remove();
        this.display.remove();
        this.container.remove();
    }
}

export default Volume;
