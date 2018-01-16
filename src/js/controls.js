import Play from './controls/play';
// import Fullscreen from './controls/fullscreen';
import Progress from './controls/progress';
import Time from './controls/time';
// import Volume from './controls/volume';

/**
 * Class that renders all control elements
 *
 * @class Controls
 */
class Controls {
    /**
     * Creates an instance of Controls.
     * @param {Media} media
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(media) {
        this.media = media;
        this.controls = {};
        this.container = '';

        this.controls.play = new Play(media);
        this.controls.time = new Time(media);
        this.controls.progress = new Progress(media);
        // this.controls.volume = new Volume(media);
        // this.controls.fullscreen = new Fullscreen(media);

        return this;
    }

    prepare() {
        this.container = document.createElement('div');
        this.container.className = 'om-controls';

        // Loop controls to build them and register events
        Object.keys(this.controls).forEach(item => {
            this.controls[item].build(this.container).register();
        });
    }

    render() {
        this.media.element.parentNode.appendChild(this.container);
    }
}

export default Controls;
