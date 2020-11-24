import Captions from './controls/captions';
import Fullscreen from './controls/fullscreen';
import Levels from './controls/levels';
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
import { isAudio, isVideo, removeElement } from './utils/general';

/**
 * Controls element.
 *
 * @description This class handles the creation/destruction of all player's control elements.
 * @class Controls
 * @implements PlayerComponent
 */
class Controls implements PlayerComponent {
    /**
     * Events that will be triggered in Controls element:
     *  - mouse (to show/hide controls after specific number of seconds)
     *  - media (to trigger/stop timer that will hide or show controls)
     *
     * @private
     * @type EventsList
     * @memberof Controls
     */
    public events: EventsList = {
        media: {},
        mouse: {},
    };

    /**
     * Instance of Settings object.
     *
     * @private
     * @type Settings
     * @memberof Controls
     */
    private settings: Settings;

    /**
     * Element that stores the time to hide controls.
     *
     * @private
     * @type number
     * @memberof Controls
     */
    private timer: number = 0;

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

    private controlEls: any = {
        Captions,
        Fullscreen,
        Levels,
        Play,
        Progress,
        Settings,
        Time,
        Volume,
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

        this._createControlsLayer();
        this._buildElements();

        this.events.controlschanged = () => {
            this.destroy();
            this._setElements();
            this.create();
        };

        this.events.ended = () => {
            this.player.getContainer().classList.remove('op-controls--hidden');
        };

        this.player.getElement().addEventListener('controlschanged', this.events.controlschanged);
        this.player.getElement().addEventListener('ended', this.events.ended);

        const { alwaysVisible } = this.player.getOptions().controls;

        if (!alwaysVisible && !IS_ANDROID && !IS_IOS) {
            this.events.mouse.mouseenter = () => {
                if (isMediaVideo && !this.player.activeElement().paused) {
                    this._stopControlTimer();
                    if (this.player.activeElement().currentTime) {
                        this.player.playBtn.setAttribute('aria-hidden', this.player.isMedia() ? 'false' : 'true');
                        this.player.loader.setAttribute('aria-hidden', 'true');
                    } else if (this.player.getOptions().showLoaderOnInit) {
                        this.player.playBtn.setAttribute('aria-hidden', 'true');
                        this.player.loader.setAttribute('aria-hidden', 'false');
                    }
                    this.player.getContainer().classList.remove('op-controls--hidden');
                    this._startControlTimer(2500);
                }
            };
            this.events.mouse.mousemove = () => {
                if (isMediaVideo) {
                    if (this.player.activeElement().currentTime) {
                        this.player.loader.setAttribute('aria-hidden', 'true');
                        this.player.playBtn.setAttribute('aria-hidden', this.player.isMedia() ? 'false' : 'true');
                    } else {
                        this.player.playBtn.setAttribute('aria-hidden', this.player.getOptions().showLoaderOnInit ? 'true' : 'false');
                        this.player.loader.setAttribute('aria-hidden', this.player.getOptions().showLoaderOnInit ? 'false' : 'true');
                    }

                    this.player.getContainer().classList.remove('op-controls--hidden');
                    this._startControlTimer(2500);
                }
            };
            this.events.mouse.mouseleave = () => {
                if (isMediaVideo && !this.player.activeElement().paused) {
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
        this.player.getElement().removeEventListener('ended', this.events.ended);

        Object.keys(this.items).forEach((position: string) => {
            this.items[position].forEach((item: any) => {
                if (item.custom) {
                    this._destroyCustomControl(item);
                } else if (typeof item.destroy === 'function') {
                    item.destroy();
                }
            });
        });

        removeElement(this.controls);
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
     * Retrieve the layer to append/remove elements from the player controls.
     *
     * @param {string}
     * @memberof Controls
     */
    public getLayer(layer: string): HTMLDivElement {
        return this.controls.querySelector(`.op-controls-layer__${layer}`) || this.controls;
    }

    private _createControlsLayer() {
        if (!this.controls) {
            this.controls = document.createElement('div');
            this.controls.className = 'op-controls';
            this.player.getContainer().appendChild(this.controls);
        }
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

        if (typeof window !== 'undefined') {
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
    }

    /**
     * Stop timer to hide controls.
     *
     * @private
     * @memberof Controls
     */
    private _stopControlTimer(): void {
        if (this.timer !== 0) {
            clearTimeout(this.timer);
            this.timer = 0;
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
        const controls = this.player.getOptions().controls.layers;
        this.items = {
            'bottom-left': [],
            'bottom-middle': [],
            'bottom-right': [],
            'left': [],
            'main': [],
            'middle': [],
            'right': [],
            'top-left': [],
            'top-middle': [],
            'top-right': [],
        };

        const isVideoEl = isVideo(this.player.getElement());
        const isAudioEl = isAudio(this.player.getElement());

        const controlPositions = Object.keys(controls);
        const layersExist = controlPositions.find(item => /^(top|bottom)/.test(item));
        this._createControlsLayer();

        controlPositions.forEach((position: string) => {
            const [layer, pos] = position.split('-');

            // Create extra layers if top/bottom exist
            if (pos) {
                const className = `op-controls-layer__${layer}`;
                if (!this.controls.querySelector(`.${className}`)) {
                    const controlLayer = document.createElement('div');
                    controlLayer.className = className;
                    this.controls.appendChild(controlLayer);
                }
            } else if (layersExist) {
                const className = 'op-controls-layer__center';
                if (!this.controls.querySelector(`.${className}`)) {
                    const controlLayer = document.createElement('div');
                    controlLayer.className = className;
                    this.controls.appendChild(controlLayer);
                }
            }

            controls[position]
                // remove duplicate values in the same position
                .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
                .forEach((el: string) => {
                    const currentLayer = layersExist && !pos ? 'center' : layer;
                    const className = `${el.charAt(0).toUpperCase()}${el.slice(1)}`;
                    const item = new this.controlEls[className](this.player, pos || layer, currentLayer);
                    if (el === 'settings') {
                        this.settings = (item as Settings);
                    }
                    if (isVideoEl || (el !== 'fullscreen' && isAudioEl)) {
                        this.items[position].push(item);
                    }
                });
        });

        // Append/prepend the custom items (if any) depending on their position:
        // If position is right, always prepend so Settings and Fullscreen are the last items;
        // otherwise, append new controls
        this.player.getCustomControls().forEach(item => {
            const [layer, pos] = item.position.split('-');
            const currentLayer = layersExist && !pos ? 'center' : layer;
            item.layer = currentLayer;
            item.position = pos || layer;

            if (item.position === 'right') {
                this.items[item.position].unshift(item);
            } else {
                this.items[item.position].push(item);
            }
        });
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
                const allowDefault = !this.player.getOptions().detachMenus || item instanceof Settings;
                if (allowDefault && !item.custom && typeof item.addSettings === 'function') {
                    const menuItem = item.addSettings();
                    if (this.settings && Object.keys(menuItem).length) {
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
        const icon = /\.(jpg|png|svg|gif)$/.test(item.icon) ? `<img src="${item.icon}">` : item.icon;
        control.className = `op-controls__${key} op-control__${item.position} ${item.showInAds ? '' : 'op-control__hide-in-ad'}`;
        control.tabIndex = 0;
        control.title = item.title;
        control.innerHTML = `${icon} <span class="op-sr">${item.title}</span>`;
        control.addEventListener('click', item.click);
        if (item.layer) {
            if (item.layer === 'main') {
                this.player.getContainer().appendChild(control);
            } else {
                this.getLayer(item.layer).appendChild(control);
            }
        }
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
        if (control) {
            control.removeEventListener('click', item.click);
            removeElement(control);
        }
    }
}

export default Controls;
