class Play {
    constructor() {
        const play = document.createElement('button');
        play.type = 'button';
        play.className = 'om-controls__playpause';
        play.innerHTML = '<span class="om-sr">Play/Pause</span>';
    }
}

export default Play;
