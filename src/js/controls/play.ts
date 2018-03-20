import IEvent from '../components/interfaces/general/event';
import Media from '../media';
import Player from '../player';

/**
 *
 * @class Play
 * @description  Class that renders play/pause/replay button and registers events to update it
 */
class Play {
    public player: Player;
    private button: HTMLButtonElement;
    private events: IEvent;

    /**
     *
     * @param {Player} player
     * @returns {Play}
     * @memberof Play
     */
    constructor(player: Player) {
        this.player = player;

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__playpause';
        this.button.tabIndex = 0;
        this.button.title = 'Play';
        this.button.setAttribute('aria-controls', player.uid);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Play');
        this.button.innerHTML = '<span class="om-sr">Play/Pause</span>';

        this.events = {};
        this.events['click'] = () => {
            this.button.setAttribute('aria-pressed', 'true');
            const el = this.player.activeElement();
            if (el.paused || el.ended) {
                el.play();
            } else {
                el.pause();
            }
        };
        this.events['play'] = () => {
            const el = this.player.activeElement();
            if (el.ended) {
                if (el instanceof Media) {
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
                    if (key !== this.player.uid) {
                        const target = Player.instances[key].activeElement();
                        target.pause();
                    }
                });
            }
        };
        this.events['pause'] = () => {
            this.button.classList.remove('om-controls__playpause--pause');
            this.button.title = 'Play';
            this.button.setAttribute('aria-label', 'Play');
        };
        this.events['ended'] = () => {
            const el = this.player.activeElement();
            if (el.ended && el instanceof Media) {
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

        return this;
    }

    /**
     *
     * @returns {Play}
     * @memberof Play
     */
    public register() {
        Object.keys(this.events).forEach(event => {
            this.player.media.element.addEventListener(event, this.events[event]);
        });

        this.button.addEventListener('click', this.events['click']);

        return this;
    }

    public unregister() {
        Object.keys(this.events).forEach(event => {
            this.player.media.element.removeEventListener(event, this.events[event]);
        });

        this.button.removeEventListener('click', this.events['click']);

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} controls
     * @returns {Play}
     * @memberof Play
     */
    public build(controls: HTMLDivElement) {
        controls.appendChild(this.button);
        return this;
    }
}

export default Play;
