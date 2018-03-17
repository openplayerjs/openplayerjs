// import AirPlay from './controls/airplay';
import Captions from './controls/captions';
import Fullscreen from './controls/fullscreen';
import Play from './controls/play';
import Progress from './controls/progress';
import Settings from './controls/settings';
import Time from './controls/time';
import Volume from './controls/volume';
import Media from './media';
import Player from './player';
import { isVideo } from './utils/general';

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
    public settings: Settings;

    /**
     * Creates an instance of Controls.
     * @param {Media} media
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(player: Player) {
        this.media = player.media;
        this.media.element.controls = false;
        this.settings = new Settings(player);
        this.controls = [
            new Play(player),
            new Time(player),
            new Progress(player),
            new Volume(player),
            new Captions(player),
            this.settings,
        ];

        if (isVideo(this.media.element)) {
            this.controls.push(new Fullscreen(player));
        }

        this.container = null;

        return this;
    }

    public prepare() {
        this.container = document.createElement('div');
        this.container.className = 'om-controls';

        // Loop controls to build them and register events
        this.controls.forEach(item => {
            item.build(this.container);

            if (typeof item.addSettingsMenu === 'function') {
                const menuItem = item.addSettingsMenu();
                if (Object.keys(menuItem).length) {
                    this.settings.addItem(
                        menuItem.name,
                        menuItem.key,
                        menuItem.default,
                        menuItem.subitems,
                        menuItem.className,
                    );
                }
            }

            item.register();
        });
    }

    public render() {
        this.media.element.parentElement.appendChild(this.container);
    }
}

export default Controls;
