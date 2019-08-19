import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import Level from '../interfaces/level';
import Player from '../player';

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
    // private menu: HTMLDivElement;

    /**
     * Events that will be triggered in Caption element:
     *  - button (for the caption toggle element)
     *  - global (for dynamic elements)
     *  - media (to update captions on `timeupdate`, instead of using `oncuechanged`)
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
    // private detachMenu: boolean;

    /**
     * Default labels from player's config
     *
     * @private
     * @type object
     * @memberof Levels
     */
    private labels: any;

    /**
     * Create an instance of Captions.
     *
     * @param {Player} player
     * @memberof Levels
     * @returns {Levels}
     */
    constructor(player: Player) {
        this.player = player;
        this.labels = player.getOptions().labels;
        // this.detachMenu = player.getOptions().detachMenus;
        return this;
    }

    /**
     * Create a button and a container to display levels (if any).
     *
     * @inheritDoc
     * @memberof Levels
     */
    public create(): void {
        this.button = document.createElement('button');
        this.button.className = 'op-controls__levels op-control__right';
        this.button.tabIndex = 0;
        this.button.title = this.labels.mediaLevels;
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', this.labels.mediaLevels);
        this.button.innerHTML = `<span>${this._getResolutionsLabel(-1)}</span>`;

        this.player.getControls().getContainer().appendChild(this.button);

        const labels: any[] = [];
        this.events.media.loadedmetadata = () => {
            if (!labels.length) {
                this.player.getMedia().levels.forEach((level: Level) => {
                    labels.push({ ...level, label: this._getResolutionsLabel(level.height) });
                });
            }
        };

        this.events.media.canplay = () => {
            if (!labels.length) {
                this.destroy();
            }
        };

        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().addEventListener(event, this.events.media[event]);
        });
    }

    public destroy(): void {
        Object.keys(this.events.media).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events.media[event]);
        });
        this.button.remove();
    }

    /**
     * Get the standard label of level depending of media's height.
     *
     * @see https://en.wikipedia.org/wiki/Computer_display_standard#Standards
     * @private
     * @returns {string}
     * @memberof Levels
     */
    private _getResolutionsLabel(height: number) {
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
        return 'Auto';
    }

    // private _buildMenu() {
    //     // Build menu if detachMenu is `true`
    //     if (this.detachMenu) {
    //         this.button.classList.add('op-control--no-hover');
    //         this.menu = document.createElement('div');
    //         this.menu.className = 'op-settings op-levels__menu';
    //         this.menu.setAttribute('aria-hidden', 'true');
    //         const className = 'op-subtitles__option';
    //         const options = this._formatMenuItems();

    //         // Store the submenu to reach all options for current menu item
    //         const menu = `<div class="op-settings__menu" role="menu" id="menu-item-captions">
    //             ${options.map(item => `
    //             <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio"
    //                 aria-checked="${this.default === item.key ? 'true' : 'false'}">
    //                 <div class="op-settings__submenu-label ${className || ''}" data-value="captions-${item.key}">${item.label}</div>
    //             </div>`).join('')}
    //         </div>`;
    //         this.menu.innerHTML = menu;
    //         this.player.getControls().getContainer().appendChild(this.menu);
    //     }
    // }
}

export default Levels;
