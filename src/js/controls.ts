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
import { hasClass, isVideo } from './utils/general';

/**
 *
 * @class Controls
 * @description Class that renders all control elements inside a control bar
 * and appends it in the player container
 */
class Controls {
    public media: Media;
    public player: Player;
    public controls: any[];
    public container: HTMLDivElement;
    public settings: Settings;
    private timer: any;

    /**
     * Creates an instance of Controls.
     * @param {Media} media
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(player: Player) {
        this.player = player;
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

        const videoPointed = isVideo(this.player.element);
        this.player.element.parentElement.addEventListener('mousemove', () => {
            const el = this.player.activeElement();
            if ((!el.paused || !el.ended) && videoPointed) {
                this.player.element.parentElement.classList.remove('om-controls--hidden');
            }
        });
        this.player.element.parentElement.addEventListener('mouseover', () => {
            const el = this.player.activeElement();
            if ((!el.paused || !el.ended) && videoPointed && hasClass(this.player.element.parentElement, 'om-controls--hidden')) {
                this.player.element.parentElement.classList.remove('om-controls--hidden');

                this.timer = setTimeout(() => {
                    if ((!el.paused || !el.ended) && videoPointed) {
                        this.player.element.parentElement.classList.add('om-controls--hidden');
                        clearTimeout(this.timer);
                    }
                }, 3000);
            }
        });
        this.player.element.parentElement.addEventListener('mouseout', () => {
            const el = this.player.activeElement();
            if ((!el.paused || !el.ended) && videoPointed) {
                this.player.element.parentElement.classList.add('om-controls--hidden');
            }
        });
        this.player.element.addEventListener('pause', () => {
            this.player.element.parentElement.classList.remove('om-controls--hidden');
            clearTimeout(this.timer);
        });

        this.timer = setTimeout(() => {
            if (videoPointed) {
                this.player.element.parentElement.classList.add('om-controls--hidden');
                clearTimeout(this.timer);
            }
        }, 3000);

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
