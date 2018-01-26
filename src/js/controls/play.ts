import Media from '../media';

/**
 *
 * @class Play
 * @description  Class that renders play/pause/replay button and registers events to update it
 */
class Play {
    public media: Media;
    private button: HTMLButtonElement;
    private events: object;

    /**
     *
     * @param {Media} media
     * @returns {Play}
     * @memberof Play
     */
    constructor(media) {
        this.media = media;

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__playpause';
        this.button.innerHTML = '<span class="om-sr">Play/Pause</span>';

        const el = this.media;

        this.events = {};
        this.events['click'] = () => {
            if (el.paused || el.ended) {
                this.media.play();
            } else {
                this.media.pause();
            }
        };
        this.events['play'] = () => {
            if (el.ended) {
                this.button.classList.add('om-controls__playpause--replay');
            } else {
                this.button.classList.add('om-controls__playpause--pause');
            }
        };
        this.events['pause'] = () => {
            this.button.classList.remove('om-controls__playpause--pause');
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
            this.media.element.addEventListener(event, this.events[event]);
        });

        this.button.addEventListener('click', this.events['click']);

        return this;
    }

    public unregister() {
        Object.keys(this.events).forEach(event => {
            this.media.element.removeEventListener(event, this.events[event]);
        });

        this.button.removeEventListener('click', this.events['click']);

        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Play}
     * @memberof Play
     */
    public build(container) {
        container.appendChild(this.button);
        return this;
    }
}

export default Play;
