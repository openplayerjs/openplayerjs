class Fullscreen {
    constructor(media) {
        this.media = media;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__fullscreen';
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        return this;
    }
    register() {
        console.log(this);
    }
}

export default Fullscreen;
