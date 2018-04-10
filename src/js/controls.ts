import Captions from './controls/captions';
import Fullscreen from './controls/fullscreen';
import Play from './controls/play';
import Progress from './controls/progress';
import Settings from './controls/settings';
import Time from './controls/time';
import Volume from './controls/volume';
import PlayerComponent from './interfaces/component';
import EventsList from './interfaces/events-list';
import Player from './player';
import { addEvent } from './utils/events';
import { isVideo } from './utils/general';

/**
 * Controls element.
 *
 * @description This class handles the creation/destruction of all player's control elements.
 * @class Controls
 * @implements PlayerComponent
 */
class Controls implements PlayerComponent {
    /**
     * Main container of control elements.
     *
     * @private
     * @type HTMLDivElement
     * @memberof Controls
     */
    private controls: HTMLDivElement;

    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Controls
     */
    private player: Player;

    /**
     * Storage for all the control elements.
     *
     * @private
     * @type any[]
     * @memberof Controls
     */
    private items: any[];

    /**
     * Instance of Play object.
     *
     * @private
     * @type Play
     * @memberof Controls
     */
    private play: Play;

    /**
     * Instance of Time object.
     *
     * @private
     * @type Time
     * @memberof Controls
     */
    private time: Time;

    /**
     * Instance of Volume object.
     *
     * @private
     * @type Volume
     * @memberof Controls
     */
    private volume: Volume;

    /**
     * Instance of Progress object.
     *
     * @private
     * @type Progress
     * @memberof Controls
     */
    private progress: Progress;

    /**
     * Instance of Settings object.
     *
     * @private
     * @type Settings
     * @memberof Controls
     */
    private settings: Settings;

    /**
     * Instance of Fullscreen object.
     *
     * @private
     * @type Fullscreen
     * @memberof Controls
     */
    private fullscreen: Fullscreen;

    /**
     * Instance of Captions object.
     *
     * @private
     * @type Captions
     * @memberof Controls
     */
    private captions: Captions;

    /**
     * Element that stores the time to hide controls.
     *
     * @private
     * @type number
     * @memberof Controls
     */
    private timer: number;

    /**
     * Events that will be triggered in Controls element:
     *  - mouse (to show/hide controls after specific number of seconds)
     *  - media (to trigger/stop timer that will hide or show controls)
     *
     * @private
     * @type EventsList
     * @memberof Controls
     */
    private events: EventsList = {
        media: {},
        mouse: {},
    };

    /**
     * Create an instance of Controls.
     *
     * @param {Player} player
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
     * @inheritDoc
     * @memberof Controls
     */
    public create(): void {
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
            this.destroy();
            this._setElements();
            this.create();
        };

        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().addEventListener(event, this.events.media[event]);
        });

        Object.keys(this.events.mouse).forEach(event => {
            this.player.getContainer().addEventListener(event, this.events.mouse[event]);
        });

        // Initial countdown to hide controls
        this._startControlTimer(3000);

        this._buildElements();
    }

    /**
     *
     * @inheritDoc
     * @memberof Controls
     */
    public destroy(): void {
        Object.keys(this.events.mouse).forEach(event => {
            this.player.getContainer().removeEventListener(event, this.events.mouse[event]);
        });

        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events.media[event]);
        });

        this._stopControlTimer();

        this.items.forEach(item => {
            item.destroy();
        });

        this.controls.remove();
    }

    /**
     * Retrieve the main container of all control elements, to add/remove them in latter steps.
     *
     * @returns {HTMLDivElement}
     * @memberof Controls
     */
    public getContainer(): HTMLDivElement {
        return this.controls;
    }

    /**
     * Retrieve an instance of Fullscreen object.
     *
     * @returns {Fullscreen}
     * @memberof Controls
     */
    public getFullscreen(): Fullscreen {
        return this.fullscreen;
    }

    /**
     * Set timer to hide controls.
     *
     * @private
     * @param {number} time The time when controls will be hidden in milliseconds (ms).
     * @memberof Controls
     */
    private _startControlTimer(time: number): void {
        const el = this.player.activeElement();
        this._stopControlTimer();

        this.timer = window.setTimeout(() => {
            if ((!el.paused || !el.ended) && isVideo(this.player.getElement())) {
                this.player.getContainer().classList.add('om-controls--hidden');
                this._stopControlTimer();
                const event = addEvent('controls.hide');
                this.player.getElement().dispatchEvent(event);
            }
        }, time);
    }

    /**
     * Stop timer to hide controls.
     *
     * @private
     * @memberof Controls
     */
    private _stopControlTimer(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            delete this.timer;
            this.timer = null;
        }
    }

    /**
     * Instantiate all control elements' classes and store them in `items` element.
     *
     * @see [[Controls.items]]
     * @private
     * @memberof Controls
     */
    private _setElements(): void {
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

    /**
     * Create markup for all control elements and, if available, create entries for Settings element.
     *
     * It will dispatch a `controlschanged` event to reload all elements in the control bar.
     * @see [[Settings.addItem]]
     * @see [[Settings.addSettings]]
     * @private
     * @memberof Controls
     */
    private _buildElements(): void {
        // Loop controls to build them and register events
        this.items.forEach(item => {
            item.create();
        });

        this.items.forEach(item => {
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
        });

        const e = addEvent('controlschanged');
        this.controls.dispatchEvent(e);
    }
}

export default Controls;
