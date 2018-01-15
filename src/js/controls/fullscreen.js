class Fullscreen {
    constructor() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__fullscreen';
        this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';

        return this;
    }
}

export default Fullscreen;
