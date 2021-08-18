import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Player from '../player';
import { EVENT_OPTIONS } from '../utils/constants';
import { addEvent } from '../utils/events';
import { hasClass, isAudio, removeElement } from '../utils/general';

/**
 * Play/pause element.
 *
 * @description This class controls the state of the media, by playing or pausing it, and
 * when it ends, updates the state to replay the current media.
 * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#PlayPause
 * @class Play
 * @implements PlayerComponent
 */
class Play implements PlayerComponent {
    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Play
     */
    #player: Player;

    /**
     * Button to play/pause media.
     *
     * @private
     * @type HTMLButtonElement
     * @memberof Play
     */
    #button: HTMLButtonElement;

    /**
     * Events that will be triggered in Play element:
     *  - controls (when `controlschanged` event is being triggered)
     *  - media (to toggle button's class and play/pause media)
     *
     * @private
     * @see [[Controls._buildElements]]
     * @type EventsList
     * @memberof Play
     */
    #events: EventsList = {
        controls: {},
        media: {},
    };

    /**
     * Default labels from player's config
     *
     * @private
     * @type object
     * @memberof Play
     */
    #labels: any;

    /**
     * Position of the button to be indicated as part of its class name
     *
     * @private
     * @type {string}
     * @memberof Play
     */
    #position: string;

    /**
     * Layer where the control item will be placed
     *
     * @private
     * @type {string}
     * @memberof Play
     */
    #layer: string;

    /**
     * Create an instance of Play.
     *
     * @param {Player} player
     * @returns {Play}
     * @memberof Play
     */
    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#labels = this.#player.getOptions().labels;
        this.#position = position;
        this.#layer = layer;
        this._keydownEvent = this._keydownEvent.bind(this);
        return this;
    }

    /**
     *
     * @inheritDoc
     * @memberof Play
     */
    public create(): void {
        this.#button = document.createElement('button');
        this.#button.type = 'button';
        this.#button.className = `op-controls__playpause op-control__${this.#position}`;
        this.#button.tabIndex = 0;
        this.#button.title = this.#labels.play;
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-pressed', 'false');
        this.#button.setAttribute('aria-label', this.#labels.play);
        this.#button.innerHTML = `<span class="op-sr">${this.#labels.play}/${this.#labels.pause}</span>`;
        this.#player.getControls().getLayer(this.#layer).appendChild(this.#button);

        this.#events.media.click = (e: any) => {
            this.#button.setAttribute('aria-pressed', 'true');
            const el = this.#player.activeElement();
            if (el.paused || el.ended) {
                if (this.#player.getAd()) {
                    this.#player.getAd().playRequested = true;
                }
                el.play();
            } else {
                el.pause();
            }

            e.preventDefault();
            e.stopPropagation();
        };

        const isAudioEl = isAudio(this.#player.getElement());

        this.#events.media.play = () => {
            if (this.#player.activeElement().ended) {
                if (this.#player.isMedia()) {
                    this.#button.classList.add('op-controls__playpause--replay');
                } else {
                    this.#button.classList.add('op-controls__playpause--pause');
                }
                this.#button.title = this.#labels.play;
                this.#button.setAttribute('aria-label', this.#labels.play);
            } else {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.add('op-controls__playpause--pause');

                this.#button.title = this.#labels.pause;
                this.#button.setAttribute('aria-label', this.#labels.pause);

                if (this.#player.getOptions().pauseOthers) {
                    Object.keys(Player.instances).forEach(key => {
                        if (key !== this.#player.id) {
                            const target = Player.instances[key].activeElement();
                            target.pause();
                        }
                    });
                }
            }
        };
        this.#events.media.loadedmetadata = () => {
            if (hasClass(this.#button, 'op-controls__playpause--pause')) {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.remove('op-controls__playpause--pause');
                this.#button.title = this.#labels.play;
                this.#button.setAttribute('aria-label', this.#labels.play);
            }
        };
        this.#events.media.playing = () => {
            if (!hasClass(this.#button, 'op-controls__playpause--pause')) {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.add('op-controls__playpause--pause');
                this.#button.title = this.#labels.pause;
                this.#button.setAttribute('aria-label', this.#labels.pause);
            }
        };
        this.#events.media.pause = () => {
            this.#button.classList.remove('op-controls__playpause--pause');
            this.#button.title = this.#labels.play;
            this.#button.setAttribute('aria-label', this.#labels.play);
        };
        this.#events.media.ended = () => {
            if (this.#player.activeElement().ended && this.#player.isMedia()) {
                this.#button.classList.add('op-controls__playpause--replay');
                this.#button.classList.remove('op-controls__playpause--pause');
            } else if (this.#player.getElement().currentTime >= this.#player.getElement().duration ||
                this.#player.getElement().currentTime <= 0) {
                this.#button.classList.add('op-controls__playpause--replay');
                this.#button.classList.remove('op-controls__playpause--pause');
            } else {
                this.#button.classList.remove('op-controls__playpause--replay');
                this.#button.classList.add('op-controls__playpause--pause');
            }
            this.#button.title = this.#labels.play;
            this.#button.setAttribute('aria-label', this.#labels.play);
        };
        this.#events.media.adsmediaended = () => {
            this.#button.classList.remove('op-controls__playpause--replay');
            this.#button.classList.add('op-controls__playpause--pause');
            this.#button.title = this.#labels.pause;
            this.#button.setAttribute('aria-label', this.#labels.pause);
        };
        this.#events.media.playererror = () => {
            if (isAudioEl) {
                const el = this.#player.activeElement();
                el.pause();
            }
        };

        const element = this.#player.getElement();
        this.#events.controls.controlschanged = () => {
            if (!this.#player.activeElement().paused) {
                const event = addEvent('playing');
                element.dispatchEvent(event);
            }
        };

        Object.keys(this.#events.media).forEach(event => {
            element.addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });

        this.#player.getControls().getContainer().addEventListener('controlschanged', this.#events.controls.controlschanged, EVENT_OPTIONS);

        this.#player.getContainer().addEventListener('keydown', this._keydownEvent, EVENT_OPTIONS);

        this.#button.addEventListener('click', this.#events.media.click, EVENT_OPTIONS);
    }

    /**
     *
     * @inheritDoc
     * @memberof Play
     */
    public destroy(): void {
        Object.keys(this.#events.media).forEach(event => {
            this.#player.getElement().removeEventListener(event, this.#events.media[event]);
        });

        this.#player.getControls().getContainer().removeEventListener('controlschanged', this.#events.controls.controlschanged);

        this.#player.getContainer().removeEventListener('keydown', this._keydownEvent);

        this.#button.removeEventListener('click', this.#events.media.click);
        removeElement(this.#button);
    }

    /**
     * Use the `Enter` and space bar keys to play/pause.
     *
     * @private
     * @param {KeyboardEvent} e
     * @memberof Play
     */
    private _keydownEvent(e: KeyboardEvent) {
        const key = e.which || e.keyCode || 0;
        const playBtnFocused = document?.activeElement?.classList.contains('op-controls__playpause');
        if (playBtnFocused && (key === 13 || key === 32)) {
            this.#events.media.click(e);
        }
    }
}

export default Play;
