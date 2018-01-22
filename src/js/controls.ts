import Play from './controls/play';
import Progress from './controls/progress';
import Time from './controls/time';
import Volume from './controls/volume';
import Media from './media';
// import Fullscreen from './controls/fullscreen';

/**
 *
 * @class Controls
 * @description Class that renders all control elements inside a control bar
 * and appends it in the player container
 */
class Controls {
    /**
     * @type Media
     */
    media: Media;

    /**
     * @type Object
     */
    controls: Object;

    /**
     * @type HTMLDivElement
     */
    container: HTMLDivElement;

    /**
     * Creates an instance of Controls.
     * @param {Media} media
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(media) {
        this.media = media;
        this.media.element.controls = false;
        this.controls = {
            play: new Play(media),
            time: new Time(media),
            progress: new Progress(media),
            volume: new Volume(media),
            // fullscreen = new Fullscreen(media),
        };

        this.container = null;

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
