// import AirPlay from './controls/airplay';
import IEvent from './components/interfaces/general/event';
import Captions from './controls/captions';
import Fullscreen from './controls/fullscreen';
import Play from './controls/play';
import Progress from './controls/progress';
import Settings from './controls/settings';
import Time from './controls/time';
import Volume from './controls/volume';
import { addEvent } from './events';
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
    public player: Player;
    public controls: any[];
    public container: HTMLDivElement;
    public settings: Settings;
    public fullscreen: Fullscreen;
    private timer: any;
    private events: IEvent;
    private mouseEvents: IEvent;

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
        this.mouseEvents = {};
        const isMediaVideo = isVideo(this.player.element);

        this.container = document.createElement('div');
        this.container.className = 'om-controls';
        this.mouseEvents.mouseenter = () => {
            if (isMediaVideo) {
                this._stopControlTimer();
                this.player.element.parentElement.classList.remove('om-controls--hidden');
                this._startControlTimer(2500);
            }
        };
        this.mouseEvents.mousemove = () => {
            if (isMediaVideo) {
                this.player.element.parentElement.classList.remove('om-controls--hidden');
                this._startControlTimer(2500);
            }
        };
        this.mouseEvents.mouseleave = () => {
            if (isMediaVideo) {
                this._startControlTimer(1000);
            }
        };
        this.events.pause = () => {
            this.player.element.parentElement.classList.remove('om-controls--hidden');
            this._stopControlTimer();
        };

        return this;
    }

    public prepare() {
        Object.keys(this.events).forEach(event => {
            this.player.element.addEventListener(event, this.events[event]);
        });

        Object.keys(this.mouseEvents).forEach(event => {
            this.player.element.parentElement.addEventListener(event, this.mouseEvents[event]);
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

        this.container.remove();
    }

    /**
     * Set correctly timer to hide controls
     *
     * @private
     * @param {number} time The time when controls will be hidden in ms
     * @memberof Controls
     */
    private _startControlTimer(time: number) {
        const el = this.player.activeElement();
        this._stopControlTimer();

        this.timer = setTimeout(() => {
            if ((!el.paused || !el.ended) && isVideo(this.player.element)) {
                this.player.element.parentElement.classList.add('om-controls--hidden');
                this._stopControlTimer();
                const event = addEvent('controls.hide');
                this.player.element.dispatchEvent(event);
            }
        }, time);
    }

    /**
     * Stop timer to hide controls
     *
     * @private
     * @memberof Controls
     */
    private _stopControlTimer() {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            delete this.timer;
            this.timer = null;
        }
    }
}

export default Controls;
