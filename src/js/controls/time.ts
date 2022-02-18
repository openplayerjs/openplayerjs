import { EventsList, PlayerComponent } from '../interfaces';
import Player from '../player';
import { EVENT_OPTIONS } from '../utils/constants';
import { formatTime } from '../utils/time';

class Time implements PlayerComponent {
    #player: Player;

    #currentTime: HTMLTimeElement;

    #delimiter: HTMLSpanElement;

    #duration: HTMLTimeElement;

    #container: HTMLSpanElement;

    #events: EventsList = {
        controls: {},
        media: {},
    };

    #controlPosition: string;

    #controlLayer: string;

    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#controlPosition = position;
        this.#controlLayer = layer;
        return this;
    }

    create(): void {
        const { labels, progress } = this.#player.getOptions();

        this.#currentTime = document.createElement('time');
        this.#currentTime.className = 'op-controls__current';
        this.#currentTime.setAttribute('role', 'timer');
        this.#currentTime.setAttribute('aria-live', 'off');
        this.#currentTime.setAttribute('aria-hidden', 'false');
        this.#currentTime.innerText = '0:00';

        const showOnlyCurrent = progress?.showCurrentTimeOnly || false;

        if (!showOnlyCurrent) {
            this.#delimiter = document.createElement('span');
            this.#delimiter.className = 'op-controls__time-delimiter';
            this.#delimiter.setAttribute('aria-hidden', 'false');
            this.#delimiter.innerText = '/';

            this.#duration = document.createElement('time');
            this.#duration.className = 'op-controls__duration';
            this.#duration.setAttribute('aria-hidden', 'false');
            this.#duration.innerText = formatTime(progress?.duration || 0);
        }

        const controls = this.#player.getControls().getLayer(this.#controlLayer);
        this.#container = document.createElement('span');
        this.#container.className = `op-controls-time op-control__${this.#controlPosition}`;
        this.#container.appendChild(this.#currentTime);
        if (!showOnlyCurrent) {
            this.#container.appendChild(this.#delimiter);
            this.#container.appendChild(this.#duration);
        }
        controls.appendChild(this.#container);

        const setInitialTime = (): void => {
            const el = this.#player.activeElement();
            if (el.duration !== Infinity && !this.#player.getElement().getAttribute('op-live__enabled')) {
                if (!showOnlyCurrent) {
                    const duration = !Number.isNaN(el.duration) ? el.duration : this.#player.getOptions().progress?.duration || 0;
                    this.#duration.innerText = formatTime(duration);
                }
                this.#currentTime.innerText = formatTime(el.currentTime);
            } else if (!showOnlyCurrent) {
                this.#duration.setAttribute('aria-hidden', 'true');
                this.#delimiter.setAttribute('aria-hidden', 'true');
            }
        };

        this.#events.media.loadedmetadata = setInitialTime.bind(this);
        this.#events.controls.controlschanged = setInitialTime.bind(this);

        const { showLabel: showLiveLabel } = this.#player.getOptions().live || {};

        this.#events.media.timeupdate = (): void => {
            const el = this.#player.activeElement();
            if (
                el.duration !== Infinity &&
                !this.#player.getElement().getAttribute('op-live__enabled') &&
                !this.#player.getElement().getAttribute('op-dvr__enabled')
            ) {
                const duration = formatTime(el.duration);
                if (!showOnlyCurrent && !Number.isNaN(el.duration) && duration !== this.#duration.innerText) {
                    this.#duration.innerText = duration;
                    this.#duration.setAttribute('aria-hidden', 'false');
                    this.#delimiter.setAttribute('aria-hidden', 'false');
                } else if (showOnlyCurrent || duration !== this.#duration.innerText) {
                    this.#currentTime.innerText = showLiveLabel ? labels?.live || '' : formatTime(el.currentTime);
                }
                this.#currentTime.innerText = formatTime(el.currentTime);
            } else if (this.#player.getElement().getAttribute('op-dvr__enabled')) {
                if (!showOnlyCurrent) {
                    this.#duration.setAttribute('aria-hidden', 'true');
                    this.#delimiter.setAttribute('aria-hidden', 'true');
                }
                this.#currentTime.innerText = formatTime(el.currentTime);
            } else if (
                showOnlyCurrent ||
                (!this.#player.getElement().getAttribute('op-dvr__enabled') && this.#duration.getAttribute('aria-hidden') === 'false')
            ) {
                if (!showOnlyCurrent) {
                    this.#duration.setAttribute('aria-hidden', 'true');
                    this.#delimiter.setAttribute('aria-hidden', 'true');
                }
                this.#currentTime.innerText = showLiveLabel ? labels?.live || '' : formatTime(el.currentTime);
            } else {
                this.#currentTime.innerText = showLiveLabel ? labels?.live || '' : formatTime(el.currentTime);
            }
        };
        this.#events.media.ended = (): void => {
            const el = this.#player.activeElement();
            const duration = !Number.isNaN(el.duration) ? el.duration : this.#player.getOptions().progress?.duration || 0;
            if (!showOnlyCurrent && this.#player.isMedia()) {
                this.#duration.innerText = formatTime(duration);
            }
        };

        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });

        this.#player
            .getControls()
            .getContainer()
            .addEventListener('controlschanged', this.#events.controls.controlschanged, EVENT_OPTIONS);
    }

    destroy(): void {
        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().removeEventListener(event, this.#events.media[event]);
        });

        this.#player
            .getControls()
            .getContainer()
            .removeEventListener('controlschanged', this.#events.controls.controlschanged);

        this.#currentTime.remove();
        const { showCurrentTimeOnly } = this.#player.getOptions().progress || {};
        if (!showCurrentTimeOnly) {
            this.#delimiter.remove();
            this.#duration.remove();
        }
        this.#container.remove();
    }
}

export default Time;
