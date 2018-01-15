class Progress {
    constructor() {
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__progress';
        this.slider.setAttribute('min', 0);
        this.slider.setAttribute('max', 0);
        this.slider.setAttribute('step', 0.1);
        this.slider.value = 0;
        this.slider.innerHTML = '<span class="om-controls__progress-bar"></span>';

        return this;
    }
}

export default Progress;
