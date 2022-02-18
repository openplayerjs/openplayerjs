import { EventsList, PlayerComponent } from '../interfaces';
import Player from '../player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS } from '../utils/constants';
import { addEvent } from '../utils/general';

class Volume implements PlayerComponent {
    #player: Player;

    #button: HTMLButtonElement;

    #container: HTMLDivElement;

    #display: HTMLProgressElement;

    #slider: HTMLInputElement;

    #events: EventsList = {
        button: {},
        media: {},
        slider: {},
    };

    #volume: number;

    #controlPosition: string;

    #controlLayer: string;

    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#volume = this.#player.getMedia().volume;
        this.#controlPosition = position;
        this.#controlLayer = layer;
        this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
        return this;
    }

    create(): void {
        const { labels } = this.#player.getOptions();

        this.#container = document.createElement('div');
        this.#container.className = `op-controls__volume op-control__${this.#controlPosition}`;
        this.#container.tabIndex = 0;
        this.#container.setAttribute('aria-valuemin', '0');
        this.#container.setAttribute('aria-valuemax', '100');
        this.#container.setAttribute('aria-valuenow', `${this.#volume}`);
        this.#container.setAttribute('aria-valuetext', `${labels?.volume || ''}: ${this.#volume}`);
        this.#container.setAttribute('aria-orientation', 'vertical');
        this.#container.setAttribute('aria-label', labels?.volumeSlider || '');

        this.#slider = document.createElement('input');
        this.#slider.type = 'range';
        this.#slider.className = 'op-controls__volume--input';
        this.#slider.tabIndex = -1;
        this.#slider.value = this.#player.getMedia().volume.toString();
        this.#slider.setAttribute('min', '0');
        this.#slider.setAttribute('max', '1');
        this.#slider.setAttribute('step', '0.1');
        this.#slider.setAttribute('aria-label', labels?.volumeControl || '');

        this.#display = document.createElement('progress');
        this.#display.className = 'op-controls__volume--display';
        this.#display.setAttribute('max', '10');
        this.#display.setAttribute('role', 'presentation');
        this.#display.value = this.#player.getMedia().volume * 10;

        this.#container.appendChild(this.#slider);
        this.#container.appendChild(this.#display);

        // Use as backup when mute is clicked
        this.#button = document.createElement('button');
        this.#button.type = 'button';
        this.#button.className = `op-controls__mute op-control__${this.#controlPosition}`;
        this.#button.tabIndex = 0;
        this.#button.title = labels?.mute || '';
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-pressed', 'false');
        this.#button.setAttribute('aria-label', labels?.mute || '');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateSlider = (element: any): void => {
            const mediaVolume = element.volume * 1;
            const vol = Math.floor(mediaVolume * 100);

            this.#slider.value = `${element.volume}`;
            this.#display.value = mediaVolume * 10;
            this.#container.setAttribute('aria-valuenow', `${vol}`);
            this.#container.setAttribute('aria-valuetext', `${labels?.volume}: ${vol}`);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateButton = (element: any): void => {
            const vol = element.volume;
            if (vol <= 0.5 && vol > 0) {
                this.#button.classList.remove('op-controls__mute--muted');
                this.#button.classList.add('op-controls__mute--half');
            } else if (vol === 0) {
                this.#button.classList.add('op-controls__mute--muted');
                this.#button.classList.remove('op-controls__mute--half');
            } else {
                this.#button.classList.remove('op-controls__mute--muted');
                this.#button.classList.remove('op-controls__mute--half');
            }
        };

        const updateVolume = (event: Event): void => {
            const el = this.#player.activeElement();
            const value = parseFloat((event.target as HTMLInputElement).value);
            el.volume = value;
            el.muted = el.volume === 0;
            this.#volume = value;
            const unmuteEl = this.#player.getContainer().querySelector('.op-player__unmute');
            if (!el.muted && unmuteEl) {
                unmuteEl.remove();
            }
            const e = addEvent('volumechange');
            this.#player.getElement().dispatchEvent(e);
        };

        this.#events.media.volumechange = (): void => {
            const el = this.#player.activeElement();
            updateSlider(el);
            updateButton(el);
        };
        this.#events.media.loadedmetadata = (): void => {
            const el = this.#player.activeElement();
            if (el.muted) {
                el.volume = 0;
            }
            const e = addEvent('volumechange');
            this.#player.getElement().dispatchEvent(e);
        };
        this.#events.slider.input = updateVolume.bind(this);
        this.#events.slider.change = updateVolume.bind(this);

        this.#events.button.click = (): void => {
            this.#button.setAttribute('aria-pressed', 'true');
            const el = this.#player.activeElement();
            el.muted = !el.muted;

            if (el.muted) {
                el.volume = 0;
                this.#button.title = labels?.unmute || '';
                this.#button.setAttribute('aria-label', labels?.unmute || '');
            } else {
                el.volume = this.#volume;
                this.#button.title = labels?.mute || '';
                this.#button.setAttribute('aria-label', labels?.mute || '');
            }
            const event = addEvent('volumechange');
            this.#player.getElement().dispatchEvent(event);
        };

        this.#button.addEventListener('click', this.#events.button.click, EVENT_OPTIONS);
        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });

        Object.keys(this.#events.slider).forEach((event) => {
            this.#slider.addEventListener(event, this.#events.slider[event], EVENT_OPTIONS);
        });

        this.#player.getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);

        if ((!IS_ANDROID && !IS_IOS) || !this.#player.getOptions().useDeviceVolume) {
            const controls = this.#player.getControls().getLayer(this.#controlLayer);
            controls.appendChild(this.#button);
            controls.appendChild(this.#container);
        }
    }

    destroy(): void {
        this.#button.removeEventListener('click', this.#events.button.click);
        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().removeEventListener(event, this.#events.media[event]);
        });

        Object.keys(this.#events.slider).forEach((event) => {
            this.#slider.removeEventListener(event, this.#events.slider[event]);
        });

        this.#player.getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);

        this.#slider.remove();
        this.#display.remove();
        this.#container.remove();
    }

    private _enterSpaceKeyEvent(e: KeyboardEvent): void {
        const key = e.which || e.keyCode || 0;
        const el = this.#player.activeElement();
        const playBtnFocused = document?.activeElement?.classList.contains('op-controls__mute');

        if (playBtnFocused && (key === 13 || key === 32)) {
            el.muted = !el.muted;
            el.volume = el.muted ? 0 : this.#volume;
            this.#events.button.click();
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

export default Volume;
