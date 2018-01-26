import Media from '../media';

class Fullscreen {
    public media: Media;
    private button: HTMLButtonElement;

    /**
     *
     * @param {Media} media
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    constructor(media: Media) {
        this.media = media;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__fullscreen';
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        return this;
    }
    public register() {
        console.log(this);
    }
}

export default Fullscreen;
