class Volume {
    constructor() {
        const volume = document.createElement('input');
        volume.type = 'range';
        volume.className = 'om-controls__volume';
        volume.setAttribute('min', 0);
        volume.setAttribute('max', 1);
        volume.setAttribute('step', 0.1);
        volume.value = 0.8;

        const mute = document.createElement('button');
        mute.type = 'button';
        mute.className = 'om-controls__mute';
        mute.innerHTML = '<span class="om-sr">Mute</span>';
    }
}

export default Volume;
