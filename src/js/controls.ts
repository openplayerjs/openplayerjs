import Captions from './controls/captions';
import Fullscreen from './controls/fullscreen';
import Play from './controls/play';
import Progress from './controls/progress';
import Settings from './controls/settings';
import Time from './controls/time';
import Volume from './controls/volume';
import PlayerComponent from './interfaces/component';
import ControlItem from './interfaces/control-item';
import EventsList from './interfaces/events-list';
import Player from './player';
import { IS_ANDROID, IS_IOS } from './utils/constants';
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
     * Instance of Play object.
     *
     * @public
     * @type Play
     * @memberof Controls
     */
    public play: Play;

    /**
     * Instance of Time object.
     *
     * @public
     * @type Time
     * @memberof Controls
     */
    public time: Time;

    /**
     * Instance of Volume object.
     *
     * @public
     * @type Volume
     * @memberof Controls
     */
    public volume: Volume;

    /**
     * Instance of Progress object.
     *
     * @public
     * @type Progress
     * @memberof Controls
     */
    public progress: Progress;

    /**
     * Instance of Settings object.
     *
     * @public
     * @type Settings
     * @memberof Controls
     */
    public settings: Settings;

    /**
     * Instance of Fullscreen object.
     *
     * @public
     * @type Fullscreen
     * @memberof Controls
     */
    public fullscreen: Fullscreen;

    /**
     * Instance of Captions object.
     *
     * @public
     * @type Captions
     * @memberof Controls
     */
    public captions: Captions;

    /**
     * Element that stores the time to hide controls.
     *
     * @public
     * @type number
     * @memberof Controls
     */
    public timer: number;

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
     * @type any
     * @memberof Controls
     */
    private items: any;

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
        this.controls.className = 'op-controls';
        this.player.getContainer().appendChild(this.controls);

        this._buildElements();

        this.events.controlschanged = () => {
            this.destroy();
            this._setElements();
            this.create();
        };

        this.player.getElement().addEventListener('controlschanged', this.events.controlschanged);

        if (!IS_ANDROID && !IS_IOS) {
            this.events.mouse.mouseenter = () => {
                if (isMediaVideo) {
                    this._stopControlTimer();
                    this.player.playBtn.setAttribute('aria-hidden', 'false');
                    this.player.getContainer().classList.remove('op-controls--hidden');
                    this._startControlTimer(2500);
                }
            };
            this.events.mouse.mousemove = () => {
                if (isMediaVideo) {
                    this.player.playBtn.setAttribute('aria-hidden', 'false');
                    this.player.getContainer().classList.remove('op-controls--hidden');
                    this._startControlTimer(2500);
                }
            };
            this.events.mouse.mouseleave = () => {
                if (isMediaVideo) {
                    this._startControlTimer(1000);
                }
            };
            this.events.media.play = () => {
                if (isMediaVideo) {
                    this._startControlTimer(this.player.getOptions().hidePlayBtnTimer);
                }
            };
            this.events.media.pause = () => {
                this.player.getContainer().classList.remove('op-controls--hidden');
                this._stopControlTimer();
            };
            Object.keys(this.events.media).forEach(event => {
                this.player.getElement().addEventListener(event, this.events.media[event]);
            });

            Object.keys(this.events.mouse).forEach(event => {
                this.player.getContainer().addEventListener(event, this.events.mouse[event]);
            });

            // Initial countdown to hide controls
            this._startControlTimer(3000);
        }
    }

    /**
     *
     * @inheritDoc
     * @memberof Controls
     */
    public destroy(): void {
        if (!IS_ANDROID && !IS_IOS) {
            Object.keys(this.events.mouse).forEach(event => {
                this.player.getContainer().removeEventListener(event, this.events.mouse[event]);
            });

            Object.keys(this.events.media).forEach(event => {
                this.player.getElement().removeEventListener(event, this.events.media[event]);
            });

            this._stopControlTimer();
        }

        this.player.getElement().removeEventListener('controlschanged', this.events.controlschanged);

        Object.keys(this.items).forEach((position: string) => {
            this.items[position].forEach((item: any) => {
                if (item.custom) {
                    this._destroyCustomControl(item);
                } else {
                    item.destroy();
                }
            });
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
                this.player.getContainer().classList.add('op-controls--hidden');
                this.player.playBtn.setAttribute('aria-hidden', 'true');
                this._stopControlTimer();
                const event = addEvent('controlshidden');
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
        this.items = {
            left: [
                this.play,
                this.time,
                this.volume,
            ],
            middle: [
                this.progress,
            ],
            right: [
                this.captions,
                this.settings,
            ],
        };

        // Append the custom items (if any)
        const customItems = this.player.getCustomControls();
        customItems.forEach(item => {
            this.items[item.position].push(item);
        });

        // Make sure fullscreen is always the last one
        if (isVideo(this.player.getElement())) {
            this.fullscreen = new Fullscreen(this.player);
            this.items.right.push(this.fullscreen);
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
        Object.keys(this.items).forEach((position: string) => {
            this.items[position].forEach((item: any) => {
                if (item.custom) {
                    this._createCustomControl(item);
                } else {
                    item.create();
                }
            });
        });

        Object.keys(this.items).forEach((position: string) => {
            this.items[position].forEach((item: any) => {
                if (!item.custom && typeof item.addSettings === 'function') {
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
        });

        const e = addEvent('controlschanged');
        this.controls.dispatchEvent(e);
    }

    /**
     * Create a button for custom control items and activate `click` event on it.
     *
     * @private
     * @param {ControlItem} item
     * @memberof Controls
     */
    private _createCustomControl(item: ControlItem): void {
        const control = document.createElement('button');
        const key = item.title.toLowerCase().replace(' ', '-');
        control.className = `op-controls__${key}`;
        control.tabIndex = 0;
        control.title = item.title;
        control.innerHTML = `<img src="${item.icon}"> <span class="op-sr">${item.title}</span>`;
        control.addEventListener('click', item.click);
        this.getContainer().appendChild(control);
    }

    /**
     * Remove a custom control button and deactivate `click` event on it.
     *
     * @private
     * @param {ControlItem} item
     * @memberof Controls
     */
    private _destroyCustomControl(item: ControlItem): void {
        const key = item.title.toLowerCase().replace(' ', '-');
        const control = this.getContainer().querySelector(`.op-controls__${key}`);
        control.removeEventListener('click', item.click);
        control.remove();
    }
}

export default Controls;
