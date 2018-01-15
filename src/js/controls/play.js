class Play {
    constructor() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__playpause';
        this.button.innerHTML = '<span class="om-sr">Play/Pause</span>';

        return this;
    }
}

export default Play;
