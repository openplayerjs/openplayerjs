import Event from '../interfaces/event';
import Player from '../player';

/**
 *
 * @class Play
 * @description  Class that renders play/pause/replay button and registers events to update it
 */
class Play {
    private player: Player;
    private button: HTMLButtonElement;
    private events: Event = {};

    /**
     *
     * @param {Player} player
     * @returns {Play}
     * @memberof Play
     */
    constructor(player: Player) {
        this.player = player;
        return this;
    }

    /**
     *
     * @returns {Play}
     * @memberof Play
     */
    public create(): void {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__playpause';
        this.button.tabIndex = 0;
        this.button.title = 'Play';
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Play');
        this.button.innerHTML = '<span class="om-sr">Play/Pause</span>';
        this.player.getControls().getContainer().appendChild(this.button);

        this.events.click = () => {
            this.button.setAttribute('aria-pressed', 'true');
            const el = this.player.activeElement();
            if (el.paused || el.ended) {
                el.play();
            } else {
                el.pause();
            }
        };
        this.events.play = () => {
            if (this.player.activeElement().ended) {
                if (this.player.isMedia()) {
                    this.button.classList.add('om-controls__playpause--replay');
                } else {
                    this.button.classList.add('om-controls__playpause--pause');
                }
                this.button.title = 'Play';
                this.button.setAttribute('aria-label', 'Play');
            } else {
                this.button.classList.remove('om-controls__playpause--replay');
                this.button.classList.add('om-controls__playpause--pause');

                this.button.title = 'Pause';
                this.button.setAttribute('aria-label', 'Pause');

                Object.keys(Player.instances).forEach(key => {
                    if (key !== this.player.id) {
                        const target = Player.instances[key].activeElement();
                        target.pause();
                    }
                });
            }
        };
        this.events.pause = () => {
            this.button.classList.remove('om-controls__playpause--pause');
            this.button.title = 'Play';
            this.button.setAttribute('aria-label', 'Play');
        };
        this.events.ended = () => {
            if (this.player.activeElement().ended && this.player.isMedia()) {
                this.button.classList.add('om-controls__playpause--replay');
                this.button.classList.remove('om-controls__playpause--pause');
            } else {
                this.button.classList.remove('om-controls__playpause--replay');
                this.button.classList.add('om-controls__playpause--pause');
            }
            this.button.title = 'Play';
            this.button.setAttribute('aria-label', 'Play');
        };
        this.events['ads.ended'] = () => {
            this.button.classList.remove('om-controls__playpause--replay');
            this.button.classList.add('om-controls__playpause--pause');
            this.button.title = 'Pause Ads';
            this.button.setAttribute('aria-label', 'Pause Ads');
        };

        Object.keys(this.events).forEach(event => {
            this.player.getElement().addEventListener(event, this.events[event]);
        });

        this.button.addEventListener('click', this.events.click);
    }

    public destroy(): void {
        Object.keys(this.events).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events[event]);
        });

        this.button.removeEventListener('click', this.events.click);
        this.button.remove();
    }
}

export default Play;
