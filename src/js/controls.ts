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
import IEvent from './components/interfaces/general/event';

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
    public fullscreen: Fullscreen;
    private timer: any;
    private events: IEvent;

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
            this.fullscreen = new Fullscreen(player);
            this.controls.push(this.fullscreen);
        }

        this.container = null;
        this.events = {};
        const isMediaVideo = isVideo(this.player.element);

        this.container = document.createElement('div');
        this.container.className = 'om-controls';
        this.events['mouseenter'] = () => {
            const el = this.player.activeElement();
            if ((!el.paused || !el.ended) && isMediaVideo) {
                this._stopControlTimer();
                this.player.element.parentElement.classList.remove('om-controls--hidden');
                this._startControlTimer(2500);
            }
        };
        this.events['mousemove'] = () => {
            const el = this.player.activeElement();
            if ((!el.paused || !el.ended) && isMediaVideo) {
                this.player.element.parentElement.classList.remove('om-controls--hidden');
                this._startControlTimer(2500);
            }  
        };
        this.events['mouseleave'] = () => {
            const el = this.player.activeElement();
            if ((!el.paused || !el.ended) && isMediaVideo) {
                this._startControlTimer(1000);
            }
        };
        this.events['pause'] = () => {
            this.player.element.parentElement.classList.remove('om-controls--hidden');
            this._stopControlTimer();
        };

        return this;
    }

    public prepare() {
        Object.keys(this.events).forEach(event => {
            this.player.element.addEventListener(event, this.events[event]);
        });

        // Initial countdown to hide controls
        this._startControlTimer(3000);

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

    public destroy() {
        Object.keys(this.events).forEach(event => {
            this.player.element.removeEventListener(event, this.events[event]);
        });

        this._stopControlTimer();

        this.controls.forEach(item => {
            item.unregister();
        });
    }

    private _startControlTimer(time: number) {
        const el = this.player.activeElement();
        this.timer = setTimeout(() => {
            if ((!el.paused || !el.ended) && isVideo(this.player.element)) {
                this.player.element.parentElement.classList.add('om-controls--hidden');
                this._stopControlTimer();
            }
        }, time);
    }
    private _stopControlTimer() {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            delete this.timer;
            this.timer = null;
        }
    }
}

export default Controls;
