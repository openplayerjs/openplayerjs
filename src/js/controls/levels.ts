import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Level from '../interfaces/level';
import SettingsItem from '../interfaces/settings/item';
import SettingsSubItem from '../interfaces/settings/subitem';
import Player from '../player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS, NAV } from '../utils/constants';
import { addEvent } from '../utils/events';
import { hasClass, removeElement } from '../utils/general';
import { isDashSource, isHlsSource } from '../utils/media';

/**
 * Levels element.
 *
 * @description
 * @class Levels
 * @implements PlayerComponent
 */
class Levels implements PlayerComponent {
    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Levels
     */
    private player: Player;

    /**
     * Button to toggle captions.
     *
     * @private
     * @type HTMLButtonElement
     * @memberof Levels
     */
    private button: HTMLButtonElement;

    /**
     * Container to display Levels options if `detachMenus` is set as `true`.
     *
     * @private
     * @type HTMLDivElement
     * @memberof Levels
     */
    private menu: HTMLDivElement;

    /**
     * Events that will be triggered:
     *  - button (to display menu of Levels if detached menus are active)
     *  - global (to dispatch click on the subitems on the menu settings)
     *  - media (to check the available levels)
     *
     * @private
     * @type EventsList
     * @memberof Levels
     */
    private events: EventsList = {
        button: {},
        global: {},
        media: {},
    };

    /**
     * Determine if a submenu must be created with the CC button, instead of using the Settings menu.
     *
     * @private
     * @type boolean
     * @memberof Levels
     */
    private detachMenu: boolean;

    /**
     * Default labels from player's config
     *
     * @private
     * @type object
     * @memberof Levels
     */
    private labels: any;

    private levels: Level[] = [];

    /**
     * Initial level to be used as a default value in the `Settings` component.
     *
     * @see [[Levels.addSettings]]
     * @private
     * @type string
     * @memberof Levels
     */
    private default: string = '';

    /**
     * Position of the button to be indicated as part of its class name
     *
     * @private
     * @type {string}
     * @memberof Levels
     */
    private position: string;

    /**
     * Layer where the control item will be placed
     *
     * @private
     * @type {string}
     * @memberof Captions
     */
    private layer: string;

    /**
     * Create an instance of Captions.
     *
     * @param {Player} player
     * @memberof Levels
     * @returns {Levels}
     */
    constructor(player: Player, position: string, layer: string) {
        this.player = player;
        this.labels = player.getOptions().labels;
        this.detachMenu = player.getOptions().detachMenus;
        this.position = position;
        this.layer = layer;
        return this;
    }

    /**
     * Create a button and a container to display levels (if any).
     *
     * @inheritDoc
     * @memberof Levels
     */
    public create(): void {
        const initialLevel = this.player.getOptions().defaultLevel !== null ?
            parseInt(this.player.getOptions().defaultLevel, 10) : this.player.getMedia().level;
        this.default = `${initialLevel}`;
        const menuItems = this._formatMenuItems();
        const defaultLevel = menuItems.length ? menuItems.find((items: any) => items.key === this.default) : null;
        const defaultLabel = defaultLevel ? defaultLevel.label : this.labels.auto;

        this.button = document.createElement('button');
        this.button.className = `op-controls__levels op-control__${this.position}`;
        this.button.tabIndex = 0;
        this.button.title = this.labels.mediaLevels;
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-label', this.labels.mediaLevels);
        this.button.setAttribute('data-active-level', this.default);
        this.button.innerHTML = `<span>${defaultLabel}</span>`;

        const loadLevelsEvent = () => {
            if (!this.levels.length) {
                this._gatherLevels.bind(this);
                const e = addEvent('controlschanged');
                this.player.getElement().dispatchEvent(e);
            }
        };

        this.events.media.loadedmetadata = loadLevelsEvent.bind(this);
        this.events.media.manifestLoaded = loadLevelsEvent.bind(this);
        this.events.media.hlsManifestParsed = loadLevelsEvent.bind(this);

        if (this.detachMenu) {
            this.player.getControls().getLayer(this.layer).appendChild(this.button);
            this._buildMenu();
            this.events.button.click = () => {
                if (this.detachMenu) {
                    const menus = this.player.getContainer().querySelectorAll('.op-settings');
                    for (let i = 0, total = menus.length; i < total; ++i) {
                        if (menus[i] !== this.menu) {
                            menus[i].setAttribute('aria-hidden', 'true');
                        }
                    }
                    if (this.menu.getAttribute('aria-hidden') === 'true') {
                        this.menu.setAttribute('aria-hidden', 'false');
                    } else {
                        this.menu.setAttribute('aria-hidden', 'true');
                    }
                }
            };
            this.events.button.mouseover = () => {
                if (!IS_IOS && !IS_ANDROID) {
                    const menus = this.player.getContainer().querySelectorAll('.op-settings');
                    for (let i = 0, total = menus.length; i < total; ++i) {
                        if (menus[i] !== this.menu) {
                            menus[i].setAttribute('aria-hidden', 'true');
                    }
                }
                    if (this.menu.getAttribute('aria-hidden') === 'true') {
                        this.menu.setAttribute('aria-hidden', 'false');
                    }
                }
            };
            this.events.button.mouseout = () => {
                if (!IS_IOS && !IS_ANDROID) {
                    const menus = this.player.getContainer().querySelectorAll('.op-settings');
                    for (let i = 0, total = menus.length; i < total; ++i) {
                        menus[i].setAttribute('aria-hidden', 'true');
                    }
                    if (this.menu.getAttribute('aria-hidden') === 'false') {
                        this.menu.setAttribute('aria-hidden', 'true');
                    }
                }
            };

            this.button.addEventListener('click', this.events.button.click, EVENT_OPTIONS);
            this.button.addEventListener('mouseover', this.events.button.mouseover, EVENT_OPTIONS);
            this.menu.addEventListener('mouseover', this.events.button.mouseover, EVENT_OPTIONS);
            this.menu.addEventListener('mouseout', this.events.button.mouseout, EVENT_OPTIONS);
            this.player.getElement().addEventListener('controlshidden', this.events.button.mouseout, EVENT_OPTIONS);
        }

        this.events.global.click = (e: Event) => {
            const option = (e.target as HTMLElement);
            const currentTime = this.player.getMedia().currentTime;
            const isPaused = this.player.getMedia().paused;
            if (option.closest(`#${this.player.id}`) && hasClass(option, 'op-levels__option')) {
                const levelVal = option.getAttribute('data-value');
                const level = parseInt(levelVal ? levelVal.replace('levels-', '') : '-1', 10);
                this.default = `${level}`;
                if (this.detachMenu) {
                    this.button.setAttribute('data-active-level', `${level}`);
                    this.button.innerHTML = `<span>${option.innerText}</span>`;
                    const levels = option.parentElement && option.parentElement.parentElement ?
                        option.parentElement.parentElement.querySelectorAll('.op-settings__submenu-item') : [];
                    for (let i = 0, total = levels.length; i < total; ++i) {
                        levels[i].setAttribute('aria-checked', 'false');
                    }
                    if (option.parentElement) {
                        option.parentElement.setAttribute('aria-checked', 'true');
                    }
                    this.menu.setAttribute('aria-hidden', 'false');
                }
                this.player.getMedia().level = level;
                this.player.getMedia().currentTime = currentTime;
                if (!isPaused) {
                    this.player.play();
                }

                const event = addEvent('levelchanged', {
                    detail: {
                        label: option.innerText.trim(),
                        level,
                    },
                });
                this.player.getElement().dispatchEvent(event);
                e.preventDefault();
            }
        };

        const connection = NAV.connection || NAV.mozConnection || NAV.webkitConnection;
        this.events.global.connection = () => {
            // Check connectivity to switch levels (only HTML5 since HLS and Dash can use adaptive streaming)
            const media = this.player.getMedia().media.media;
            if (!isDashSource(media) && !isHlsSource(media)) {
                let type = connection.effectiveType;

                const levels = this.levels.map(item => ({
                    ...item,
                    resolution: parseInt(item.label.replace('p', ''), 10),
                }));

                let level = levels.find(item => item.resolution < 360);
                if (type === '4g') {
                    level = levels.find(item => item.resolution >= 720);
                } else if (type === '3g') {
                    level = levels.find(item => item.resolution >= 360 && item.resolution < 720);
                }

                if (level) {
                    this.player.pause();
                    this.player.getMedia().level = level.id;
                    this.player.play();
                }
                type = connection.effectiveType;
            }
        };

        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().addEventListener(event, this.events.media[event], EVENT_OPTIONS);
        });

        document.addEventListener('click', this.events.global.click, EVENT_OPTIONS);
        if (connection) {
            connection.addEventListener('change', this.events.global.connection, EVENT_OPTIONS);
        }
    }

    public destroy(): void {
        const connection = NAV.connection || NAV.mozConnection || NAV.webkitConnection;

        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events.media[event]);
        });
        document.removeEventListener('click', this.events.global.click);
        if (connection) {
            connection.removeEventListener('change', this.events.global.connection);
        }
        if (this.detachMenu) {
            this.button.removeEventListener('click', this.events.button.click);
            removeElement(this.button);
            this.button.removeEventListener('mouseover', this.events.button.mouseover);
            this.menu.removeEventListener('mouseover', this.events.button.mouseover);
            this.menu.removeEventListener('mouseout', this.events.button.mouseout);
            this.player.getElement().removeEventListener('controlshidden', this.events.button.mouseout);
            removeElement(this.menu);
        }
    }

    /**
     * Add list of available captions in the `Settings` menu.
     *
     * @see [[Settings.addSettings]]
     * @returns {SettingsItem|object}
     * @memberof Captions
     */
    public addSettings(): SettingsItem | object {
        if (this.detachMenu) {
            return {};
        }
        const subitems = this._formatMenuItems();
        // Avoid implementing submenu for levels if only 2 options were available
        return subitems.length > 2 ? {
            className: 'op-levels__option',
            default: '-1',
            key: 'levels',
            name: this.labels.levels,
            subitems,
        } : {};
    }

    private _formatMenuItems(): SettingsSubItem[] {
        const levels = this._gatherLevels();
        const total = levels.length;
        let items = total ? [{ key: '-1', label: this.labels.auto }] : [];
        for (let i = 0; i < total; i++) {
            const level = levels[i];
            items = items.filter(el => el.key !== level.id);
            items.push({ key: level.id, label: level.label });
        }

        // Remove duplicated labels
        items = items.reduce((acc: SettingsSubItem[], current) => {
            const duplicate = acc.find(item => item.label === current.label);
            if (!duplicate) {
                return acc.concat([current]);
            }
            return acc;
        }, []).sort((a, b) => parseInt(a.label, 10) > parseInt(b.label, 10) ? 1 : -1);

        return items;
    }

    /**
     * Get the standard label of level depending of media's height.
     *
     * @see https://en.wikipedia.org/wiki/Computer_display_standard#Standards
     * @private
     * @returns {string}
     * @memberof Levels
     */
    private _getResolutionsLabel(height: number): string {
        if (height >= 4320) {
            return '8K';
        } else if (height >= 2160) {
            return '4K';
        } else if (height >= 1440) {
            return '1440p';
        } else if (height >= 1080) {
            return '1080p';
        } else if (height >= 720) {
            return '720p';
        } else if (height >= 480) {
            return '480p';
        } else if (height >= 360) {
            return '360p';
        } else if (height >= 240) {
            return '240p';
        } else if (height >= 144) {
            return '144p';
        }
        return this.labels.auto;
    }

    private _gatherLevels() {
        if (!this.levels.length) {
            this.player.getMedia().levels.forEach((level: Level) => {
                this.levels.push({ ...level, label: level.label || this._getResolutionsLabel(level.height) });
            });
        }
        return this.levels;
    }

    private _buildMenu() {
        // Build menu if detachMenu is `true`
        if (this.detachMenu) {
            this.button.classList.add('op-control--no-hover');
            this.menu = document.createElement('div');
            this.menu.className = 'op-settings op-levels__menu';
            this.menu.setAttribute('aria-hidden', 'true');
            const className = 'op-levels__option';
            const options = this._formatMenuItems();

            // Store the submenu to reach all options for current menu item
            const menu = `<div class="op-settings__menu" role="menu" id="menu-item-levels">
                ${options.map(item => `
                <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio"
                    aria-checked="${this.default === item.key ? 'true' : 'false'}">
                    <div class="op-settings__submenu-label ${className || ''}" data-value="levels-${item.key}">${item.label}</div>
                </div>`).join('')}
            </div>`;
            this.menu.innerHTML = menu;
            this.player.getControls().getLayer(this.layer).appendChild(this.menu);
        }
    }
}

export default Levels;
