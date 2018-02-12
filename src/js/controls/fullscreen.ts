import IEvent from '../components/interfaces/general/event';
import Player from '../player';
import { isVideo } from '../utils/dom';

class Fullscreen {
    public player: Player;
    private button: HTMLButtonElement;
    private events: IEvent;

    /**
     *
     * @param {Player} media
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    constructor(player: Player) {
        this.player = player;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__fullscreen';
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        this.events = {};
        this.events['click'] = () => {
            if (this.button.classList.contains('om-controls__fullscreen--out')) {
                this.button.classList.remove('om-controls__fullscreen--out');
            } else {
                this.button.classList.add('om-controls__fullscreen--out');
            }
        };

        return this;
    }
    public register() {
        this.button.addEventListener('click', this.events['click']);

        return this;
    }

    public unregister() {
        this.button.removeEventListener('click', this.events['click']);

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    public build(container: HTMLDivElement) {
        if (isVideo(this.player.element)) {
            container.appendChild(this.button);
        }
        return this;
    }
}

export default Fullscreen;
