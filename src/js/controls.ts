import Captions from './controls/captions';
import Fullscreen from './controls/fullscreen';
import Play from './controls/play';
import Progress from './controls/progress';
import Settings from './controls/settings';
import Time from './controls/time';
import Volume from './controls/volume';
import PlayerComponent from './interfaces/component';
import Event from './interfaces/event';
import Player from './player';
import { addEvent } from './utils/events';
import { isVideo } from './utils/general';

/**
 *
 * @class Controls
 * @description Class that renders all control elements inside a control bar
 * and appends it in the player controls
 */
class Controls implements PlayerComponent {
    private controls: HTMLDivElement;
    private player: Player;
    private items: any[];
    private play: Play;
    private time: Time;
    private volume: Volume;
    private progress: Progress;
    private settings: Settings;
    private fullscreen: Fullscreen;
    private captions: Captions;
    private timer: any;
    private events: Event = {
        media: {},
        mouse: {},
    };

    /**
     * Creates an instance of Controls.
     * @param {Media} media
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(player: Player) {
        this.player = player;
        this._setElements();
        return this;
    }

    /**
     *
     *
     * @memberof Controls
     */
    public create() {
        this.player.getElement().controls = false;

        const isMediaVideo = isVideo(this.player.getElement());

        this.controls = document.createElement('div');
        this.controls.className = 'om-controls';
        this.player.getContainer().appendChild(this.controls);

        this.events.mouse.mouseenter = () => {
            if (isMediaVideo) {
                this._stopControlTimer();
                this.player.getContainer().classList.remove('om-controls--hidden');
                this._startControlTimer(2500);
            }
        };
        this.events.mouse.mousemove = () => {
            if (isMediaVideo) {
                this.player.getContainer().classList.remove('om-controls--hidden');
                this._startControlTimer(2500);
            }
        };
        this.events.mouse.mouseleave = () => {
            if (isMediaVideo) {
                this._startControlTimer(1000);
            }
        };
        this.events.media.pause = () => {
            this.player.getContainer().classList.remove('om-controls--hidden');
            this._stopControlTimer();
        };
        this.events.media.controlschanged = () => {
            this._setElements();
            this._buildElements();
        };

        this.player.getElement().addEventListener('pause', this.events.media.pause);

        Object.keys(this.events.mouse).forEach(event => {
            this.player.getContainer().addEventListener(event, this.events.mouse[event]);
        });

        // Initial countdown to hide controls
        this._startControlTimer(3000);

        this._buildElements();
    }

    public destroy() {
        Object.keys(this.events.mouse).forEach(event => {
            this.player.getContainer().removeEventListener(event, this.events.mouse[event]);
        });

        this.player.getElement().removeEventListener('pause', this.events.media.pause);

        this._stopControlTimer();

        this.items.forEach(item => {
            item.destroy();
        });

        this.controls.remove();
    }

    public getContainer() {
        return this.controls;
    }

    public getFullscreen() {
        return this.fullscreen;
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
            if ((!el.paused || !el.ended) && isVideo(this.player.getElement())) {
                this.player.getContainer().classList.add('om-controls--hidden');
                this._stopControlTimer();
                const event = addEvent('controls.hide');
                this.player.getElement().dispatchEvent(event);
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

    private _setElements() {
        this.play = new Play(this.player);
        this.time = new Time(this.player);
        this.progress = new Progress(this.player);
        this.volume = new Volume(this.player);
        this.captions = new Captions(this.player);
        this.settings = new Settings(this.player);
        this.items = [
            this.play,
            this.time,
            this.progress,
            this.volume,
            this.captions,
            this.settings,
        ];

        if (isVideo(this.player.getElement())) {
            this.fullscreen = new Fullscreen(this.player);
            this.items.push(this.fullscreen);
        }
    }

    private _buildElements() {
        // Loop controls to build them and register events
        this.items.forEach(item => {
            if (typeof item.create === 'function') {
                item.create();

                if (typeof item.addSettings === 'function') {
                    const menuItem = item.addSettings();
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
            }
        });
    }
}

export default Controls;
