import Media from '../media';

class Progress {
    public media: Media;
    private slider: HTMLInputElement;

    /**
     *
     * @param {Media} media
     * @returns {Progress}
     * @memberof Progress
     */
    constructor(media: Media) {
        this.media = media;
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__progress';
        this.slider.setAttribute('min', '0');
        this.slider.setAttribute('max', '0');
        this.slider.setAttribute('step', '0.1');
        this.slider.value = '0';
        this.slider.innerHTML = '<span class="om-controls__progress-bar"></span>';

        return this;
    }

    /**
     *
     * @returns {Progress}
     * @memberof Progress
     */
    public register() {
        const el = this.media.element;
        el.addEventListener('loadedmetadata', () => {
            if (el.duration !== Infinity) {
                this.slider.setAttribute('max', `${el.duration}`);
            } else {
                this.slider.style.display = 'none';
            }
        });

        el.addEventListener('timeupdate', () => {
            if (el.duration !== Infinity) {
                if (!this.slider.getAttribute('max')) {
                    this.slider.setAttribute('max', `${el.duration}`);
                }
                this.slider.value = el.currentTime.toString();
                (this.slider.firstChild as HTMLElement).style.width =
                    `${Math.floor((el.currentTime / el.duration) * 100)}%`;
            } else {
                this.slider.style.display = 'none';
            }
        });

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Progress}
     * @memberof Progress
     */
    public build(container: HTMLDivElement) {
        container.appendChild(this.slider);
        return this;
    }
}

export default Progress;
