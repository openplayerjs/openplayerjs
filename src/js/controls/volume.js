class Volume {
    constructor() {
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__volume';
        this.slider.setAttribute('min', 0);
        this.slider.setAttribute('max', 1);
        this.slider.setAttribute('step', 0.1);
        this.slider.value = 0.8;

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__mute';
        this.button.innerHTML = '<span class="om-sr">Mute</span>';

        return this;
    }
}

export default Volume;
