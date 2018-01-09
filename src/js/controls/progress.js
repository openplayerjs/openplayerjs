class Progress {
    constructor() {
        const progress = document.createElement('input');
        progress.type = 'range';
        progress.className = 'om-controls__progress';
        progress.setAttribute('min', this.element.currentTime);
        progress.setAttribute('max', this.element.duration);
        progress.setAttribute('step', 0.1);
        progress.value = 0;
        container.appendChild(progress);
    }
}

export default Progress;
