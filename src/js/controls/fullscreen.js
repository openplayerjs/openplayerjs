class Fullscreen {
    constructor() {
        const fullscreen = document.createElement('button');
        fullscreen.type = 'button';
        fullscreen.className = 'om-controls__fullscreen';
        fullscreen.innerHTML = '<span class="om-sr">Fullscreen</span>';
        container.appendChild(fullscreen);
    }
}

export default Fullscreen;
