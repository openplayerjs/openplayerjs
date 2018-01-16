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

        this.button.onclick = () => {
            if (el.paused || el.ended) {
                this.media.play();
            } else {
                this.media.pause();
            }
        };

        el.addEventListener('play', () => {
            if (el.ended) {
                this.button.classList.add('om-controls__playpause--replay');
            } else {
                this.button.classList.add('om-controls__playpause--pause');
            }
        });

        el.addEventListener('pause', () => {
            this.button.classList.remove('om-controls__playpause--pause');
        });

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
