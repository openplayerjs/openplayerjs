import IEvent from '../components/interfaces/general/event';
import Media from '../media';
import Player from '../player';
import { hasClass } from '../utils/general';

/**
 *
 * @class Settings
 * @description Class that handles the Settings behavior cross/browsers
 */
class Settings {
    public player: Player;
    public submenu: any;
    private button: HTMLButtonElement;
    private menu: HTMLElement;
    private events: IEvent;
    private globalEvents: IEvent;
    private clickEvent: any;

    /**
     *
     * @param {Player} player
     * @returns {Settings}
     * @memberof Settings
     */
    constructor(player: Player) {
        this.player = player;
        this.button = document.createElement('button');
        this.button.className = 'om-controls__settings om-control__right';
        this.button.tabIndex = 0;
        this.button.title = 'Player Settings';
        this.button.setAttribute('aria-controls', player.uid);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Player Settings');
        this.button.innerHTML = '<span class="om-sr">Player Settings</span>';

        this.menu = document.createElement('div');
        this.menu.className = 'om-settings';
        this.menu.setAttribute('aria-hidden', 'true');
        this.menu.innerHTML = '<div class="om-settings__menu" role="menu"></div>';

        this.clickEvent = () => {
            this.button.setAttribute('aria-pressed', 'true');
            this.menu.setAttribute('aria-hidden', (this.menu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false'));
        };

        this.events = {};
        this.globalEvents = {};
        this.submenu = {};
        this.events['click'] = this.clickEvent.bind(this);

        this.globalEvents['click'] = (e: any) => {
            if (e.target.closest(`#${this.player.id}`) && hasClass(e.target, 'om-speed__option')) {
                const option = e.target;
                const el = this.player.activeElement();
                if (el instanceof Media) {
                    el.playbackRate = parseFloat(option.getAttribute('data-value').replace('speed-', ''));
                }
            }
        };

        return this;
    }
    /**
     *
     *
     * @returns {Settings}
     * @memberof Settings
     */
    public register() {
        this.button.addEventListener('click', this.events['click']);

        document.addEventListener('click', this.globalEvents.click);

        return this;
    }

    public unregister() {
        this.button.removeEventListener('click', this.events['click']);

        document.removeEventListener('click', this.globalEvents.click);

        this.menu.remove();
        this.button.remove();

        return this;
    }
    /**
     * By default, Settings will contaim speed adjustments
     *
     * @returns {any}
     * @memberof Settings
     */
    public addSettingsMenu() {
        return {
            className: 'om-speed__option',
            default: '1',
            key: 'speed',
            name: 'Speed',
            subitems: [
                {key: '0.25', label: '0.25'},
                {key: '0.5', label: '0.5'},
                {key: '0.75', label: '0.75'},
                {key: '1', label: 'Normal'},
                {key: '1.25', label: '1.25'},
                {key: '1.5', label: '1.5'},
                {key: '2', label: '2'},
            ],
        };
    }

    public addItem(name: string, key: string, defaultValue: string, submenu?: any[], className?: string) {
        // Build the menu entry first
        const menuItem = document.createElement('div');
        menuItem.className = 'om-settings__menu-item';
        menuItem.tabIndex = 0;
        menuItem.setAttribute('role', 'menuitemradio');
        menuItem.innerHTML = `<div class="om-settings__menu-label" data-value="${key}-${defaultValue}">${name}</div>
            <div class="om-settings__menu-content">${submenu.find(x => x.key === defaultValue).label}</div>`;

        this.menu.querySelector('.om-settings__menu').appendChild(menuItem);
        let mainMenu = this.menu.innerHTML;

        // Store the submenu to reach all options for current menu item
        if (submenu) {
            const subItems = `
                <div class="om-settings__header">
                    <button type="button" class="om-settings__back">${name}</button>
                </div>
                <div class="om-settings__menu" role="menu" id="menu-item-${key}">
                    ${submenu.map((item: any) => `
                    <div class="om-settings__submenu-item" tabindex="0" role="menuitemradio"
                        aria-checked="${defaultValue === item.key ? 'true' : 'false'}">
                        <div class="om-settings__submenu-label ${className || ''}" data-value="${key}-${item.key}">${item.label}</div>
                    </div>`).join('')}
                </div>`;
            this.submenu[key] = subItems;
        }

        document.addEventListener('click', (e: any) => {
            if (e.target.closest(`#${this.player.id}`)) {
                if (hasClass(e.target, 'om-settings__back')) {
                    this.menu.classList.add('om-settings--sliding');
                    setTimeout(() => {
                        this.menu.innerHTML = mainMenu;
                        this.menu.classList.remove('om-settings--sliding');
                    }, 100);
                } else if (hasClass(e.target, 'om-settings__menu-content') && typeof this.submenu[key] !== undefined) {
                    this.menu.classList.add('om-settings--sliding');
                    setTimeout(() => {
                        this.menu.innerHTML = this.submenu[key];
                        this.menu.classList.remove('om-settings--sliding');
                    }, 100);
                } else if (hasClass(e.target, 'om-settings__submenu-label')) {
                    // Update values in submenu and store
                    this.menu.querySelector('.om-settings__submenu-item[aria-checked=true]').setAttribute('aria-checked', 'false');
                    e.target.parentElement.setAttribute('aria-checked', 'true');
                    this.submenu[key] = this.menu.innerHTML;
                    const value = e.target.getAttribute('data-value').replace(`${key}-`, '');
                    const label = e.target.innerText;

                    // Restore original menu, and set the new value
                    this.menu.classList.add('om-settings--sliding');
                    setTimeout(() => {
                        this.menu.innerHTML = mainMenu;
                        const prev = this.menu.querySelector(`.om-settings__menu-label[data-value="${key}-${defaultValue}"]`);
                        prev.setAttribute('data-value', `${key}-${value}`);
                        prev.nextElementSibling.innerHTML = label;
                        defaultValue = value;
                        mainMenu = this.menu.innerHTML;
                        this.menu.classList.remove('om-settings--sliding');
                    }, 100);
                }
            } else {
                this.menu.setAttribute('aria-hidden', 'true');
                this.menu.innerHTML = mainMenu;
            }
        });

        window.addEventListener('resize', () => {
            this.menu.setAttribute('aria-hidden', 'true');
            this.menu.innerHTML = mainMenu;
        });
    }

    /**
     *
     * @param {HTMLDivElement} controls
     * @returns {Settings}
     * @memberof Settings
     */
    public build(controls: HTMLDivElement) {
        controls.appendChild(this.button);
        this.player.element.parentElement.appendChild(this.menu);
        return this;
    }
}

export default Settings;
