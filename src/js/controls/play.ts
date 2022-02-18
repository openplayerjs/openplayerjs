import { EventsList, PlayerComponent } from '../interfaces';
import Player from '../player';
import { EVENT_OPTIONS } from '../utils/constants';
import { addEvent, isAudio } from '../utils/general';

class Play implements PlayerComponent {
    #player: Player;

    #button: HTMLButtonElement;

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

        this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
        return this;
    }

    create(): void {
        const { labels } = this.#player.getOptions();
        this.#button = document.createElement('button');
        this.#button.type = 'button';
        this.#button.className = `op-controls__playpause op-control__${this.#controlPosition}`;
        this.#button.tabIndex = 0;
        this.#button.title = labels?.play || '';
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-pressed', 'false');
        this.#button.setAttribute('aria-label', labels?.play || '');

        this.#player.getControls().getLayer(this.#controlLayer).appendChild(this.#button);

        this.#events.button = (e: Event): void => {
            this.#button.setAttribute('aria-pressed', 'true');
            const el = this.#player.activeElement();
            if (el.paused || el.ended) {
                if (this.#player.getAd()) {
                    this.#player.getAd().playRequested = true;
                }
                el.play();
                this.#events.media.play();
            } else {
                el.pause();
                this.#events.media.pause();
            }

            e.preventDefault();
            e.stopPropagation();
        };

        const isAudioEl = isAudio(this.#player.getElement());

        this.#events.media.play = (): void => {
            if (this.#player.activeElement().ended) {
                if (this.#player.isMedia()) {
                    this.#button.classList.add('op-controls__playpause--replay');
                } else {
                    this.#button.classList.add('op-controls__playpause--pause');
                }
                this.#button.title = labels?.play || '';
                this.#button.setAttribute('aria-label', labels?.play || '');
            } else {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.add('op-controls__playpause--pause');

                this.#button.title = labels?.pause || '';
                this.#button.setAttribute('aria-label', labels?.pause || '');

                if (this.#player.getOptions()?.pauseOthers) {
                    Object.keys(Player.instances).forEach((key) => {
                        if (key !== this.#player.id) {
                            const target = Player.instances[key].activeElement();
                            target.pause();
                        }
                    });
                }
            }
        };
        this.#events.media.loadedmetadata = (): void => {
            if (this.#button.classList.contains('op-controls__playpause--pause')) {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.remove('op-controls__playpause--pause');
                this.#button.title = labels?.play || '';
                this.#button.setAttribute('aria-label', labels?.play || '');
            }
        };
        this.#events.media.playing = (): void => {
            if (!this.#button.classList.contains('op-controls__playpause--pause')) {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.add('op-controls__playpause--pause');
                this.#button.title = labels?.pause || '';
                this.#button.setAttribute('aria-label', labels?.pause || '');
            }
        };
        this.#events.media.pause = (): void => {
            this.#button.classList.remove('op-controls__playpause--pause');
            this.#button.title = labels?.play || '';
            this.#button.setAttribute('aria-label', labels?.play || '');
        };
        this.#events.media.ended = (): void => {
            if (this.#player.activeElement().ended && this.#player.isMedia()) {
                this.#button.classList.add('op-controls__playpause--replay');
                this.#button.classList.remove('op-controls__playpause--pause');
            } else if (
                this.#player.getElement().currentTime >= this.#player.getElement().duration ||
                this.#player.getElement().currentTime <= 0
            ) {
                this.#button.classList.add('op-controls__playpause--replay');
                this.#button.classList.remove('op-controls__playpause--pause');
            } else {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.add('op-controls__playpause--pause');
            }
            this.#button.title = labels?.play || '';
            this.#button.setAttribute('aria-label', labels?.play || '');
        };
        this.#events.media.adsmediaended = (): void => {
            this.#button.classList.remove('op-controls__playpause--replay');
            this.#button.classList.add('op-controls__playpause--pause');
            this.#button.title = labels?.pause || '';
            this.#button.setAttribute('aria-label', labels?.pause || '');
        };
        this.#events.media.playererror = (): void => {
            if (isAudioEl) {
                const el = this.#player.activeElement();
                el.pause();
            }
        };

        const element = this.#player.getElement();
        this.#events.controls.controlschanged = (): void => {
            if (!this.#player.activeElement().paused) {
                const event = addEvent('playing');
                element.dispatchEvent(event);
            }
        };

        Object.keys(this.#events.media).forEach((event) => {
            element.addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });

        if (this.#player.getOptions().media?.pauseOnClick) {
            element.addEventListener('click', this.#events.button, EVENT_OPTIONS);
        }

        this.#player
            .getControls()
            .getContainer()
            .addEventListener('controlschanged', this.#events.controls.controlschanged, EVENT_OPTIONS);

        this.#player.getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);
        this.#button.addEventListener('click', this.#events.button, EVENT_OPTIONS);
    }

    destroy(): void {
        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().removeEventListener(event, this.#events.media[event]);
        });

        if (this.#player.getOptions().media?.pauseOnClick) {
            this.#player.getElement().removeEventListener('click', this.#events.button);
        }

        this.#player
            .getControls()
            .getContainer()
            .removeEventListener('controlschanged', this.#events.controls.controlschanged);

        this.#player.getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);
        this.#button.removeEventListener('click', this.#events.button);
        this.#button.remove();
    }

    private _enterSpaceKeyEvent(e: KeyboardEvent): void {
        const key = e.which || e.keyCode || 0;
        const playBtnFocused = document?.activeElement?.classList.contains('op-controls__playpause');
        if (playBtnFocused && (key === 13 || key === 32)) {
            this.#events.button(e);
        }
    }
}

export default Play;
