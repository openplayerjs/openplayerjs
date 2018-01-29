import AirPlay from './controls/airplay';
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
    public media: Media;
    public controls: any[];
    public container: HTMLDivElement;

    /**
     * Creates an instance of Controls.
     * @param {Media} media
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(media: Media) {
        this.media = media;
        this.media.element.controls = false;
        this.controls = [
            new Play(media),
            new Time(media),
            new Progress(media),
            new Volume(media),
            // 4: new Fullscreen(media),
            new AirPlay(media),
        ];

        this.container = null;

        return this;
    }

    public prepare() {
        this.container = document.createElement('div');
        this.container.className = 'om-controls';

        // Loop controls to build them and register events
        this.controls.forEach(item => {
            item.build(this.container).register();
        });
    }

    public render() {
        this.media.element.parentNode.appendChild(this.container);
    }
}

export default Controls;
