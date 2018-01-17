/**
 * Class that renders play/pause/replay buttons
 * and registers events to update them in the controls
 *
 * @class Play
 */
class Play {
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

        this.events = {};

        return this;
    }

    /**
     *
     * @param {Media} media
     * @returns {Play}
     * @memberof Play
     */
    register() {
        const el = this.media.element;
        this.events = {
            click: () => {
                if (el.paused || el.ended) {
                    this.media.play();
                } else {
                    this.media.pause();
                }
            },
            play: () => {
                if (el.ended) {
                    this.button.classList.add('om-controls__playpause--replay');
                } else {
                    this.button.classList.add('om-controls__playpause--pause');
                }
            },
            pause: () => {
                this.button.classList.remove('om-controls__playpause--pause');
            }
        };

        Object.keys(this.events).forEach(event => {
            el.addEventListener(event, this.events[event]);
        });

        this.button.addEventListener('click', this.events.click);

        return this;
    }

    unregister() {
        Object.keys(this.events).forEach(event => {
            el.removeEventListener(event, this.events[event]);
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
        return this;
    }
}

export default Play;
