import { EventsList, PlayerComponent, SettingsItem, SettingsSubItem, SettingsSubMenu } from '../interfaces';
import Player from '../player';
import { EVENT_OPTIONS } from '../utils/constants';
import { sanitize } from '../utils/general';

class Settings implements PlayerComponent {
    #player: Player;

    #submenu: SettingsSubMenu = {};

    #button: HTMLButtonElement;

    #menu: HTMLElement;

    #events: EventsList = {
        global: {},
        media: {},
    };

    #originalOutput = '';

    #controlPosition: string;

    #controlLayer: string;

    private clickEvent: () => void;

    private hideEvent: () => void;

    private removeEvent: (e: CustomEvent) => void;

    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#controlPosition = position;
        this.#controlLayer = layer;
        this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
        return this;
    }

    create(): void {
        const { labels } = this.#player.getOptions();

        this.#button = document.createElement('button');
        this.#button.className = `op-controls__settings op-control__${this.#controlPosition}`;
        this.#button.tabIndex = 0;
        this.#button.title = labels?.settings || '';
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-pressed', 'false');
        this.#button.setAttribute('aria-label', labels?.settings || '');

        this.#menu = document.createElement('div');
        this.#menu.className = 'op-settings';
        this.#menu.setAttribute('aria-hidden', 'true');
        this.#menu.innerHTML = '<div class="op-settings__menu" role="menu"></div>';

        this.clickEvent = (): void => {
            this.#button.setAttribute('aria-pressed', 'true');
            const menus = this.#player.getContainer().querySelectorAll('.op-settings');
            for (let i = 0, total = menus.length; i < total; ++i) {
                if (menus[i] !== this.#menu) {
                    menus[i].setAttribute('aria-hidden', 'true');
                }
            }
            this.#menu.setAttribute('aria-hidden', this.#menu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false');
        };

        this.hideEvent = (): void => {
            let timeout;
            if (timeout && typeof window !== 'undefined') {
                window.cancelAnimationFrame(timeout);
            }

            if (typeof window !== 'undefined') {
                timeout = window.requestAnimationFrame((): void => {
                    this.#menu.innerHTML = this.#originalOutput;
                    this.#menu.setAttribute('aria-hidden', 'true');
                });
            }
        };

        this.removeEvent = (e: CustomEvent): void => {
            const { id, type } = e.detail;
            this.removeItem(id, type);
        };

        this.clickEvent = this.clickEvent.bind(this);
        this.hideEvent = this.hideEvent.bind(this);
        this.removeEvent = this.removeEvent.bind(this);

        this.#events.media.controlshidden = this.hideEvent.bind(this);
        this.#events.media.settingremoved = this.removeEvent.bind(this);
        this.#events.media.play = this.hideEvent.bind(this);
        this.#events.media.pause = this.hideEvent.bind(this);

        this.#player.getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);

        this.#events.global.click = (e: Event): void => {
            const { target } = e;
            const current = target as HTMLElement;
            if (current?.closest(`#${this.#player.id}`) && current?.classList.contains('op-speed__option')) {
                const level = current?.getAttribute('data-value') || '';
                this.#player.getMedia().playbackRate = parseFloat(level.replace('speed-', ''));
            }
        };
        this.#events.global.resize = this.hideEvent.bind(this);

        this.#button.addEventListener('click', this.clickEvent, EVENT_OPTIONS);
        Object.keys(this.#events).forEach((event) => {
            this.#player.getElement().addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });
        document.addEventListener('click', this.#events.global.click, EVENT_OPTIONS);
        document.addEventListener('keydown', this.#events.global.click, EVENT_OPTIONS);
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.#events.global.resize, EVENT_OPTIONS);
        }

        this.#player
            .getControls()
            .getLayer(this.#controlLayer)
            .appendChild(this.#button);
        this.#player.getContainer().appendChild(this.#menu);
    }

    destroy(): void {
        this.#button.removeEventListener('click', this.clickEvent);
        Object.keys(this.#events).forEach((event) => {
            this.#player.getElement().removeEventListener(event, this.#events.media[event]);
        });
        document.removeEventListener('click', this.#events.global.click);
        document.removeEventListener('keydown', this.#events.global.click);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.#events.global.resize);
        }
        if (this.#events.global['settings.submenu'] !== undefined) {
            document.removeEventListener('click', this.#events.global['settings.submenu']);
            this.#player.getElement().removeEventListener('controlshidden', this.hideEvent);
        }

        this.#player.getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);

        this.#menu.remove();
        this.#button.remove();
    }

    addSettings(): SettingsItem {
        const media = this.#player.getMedia();
        const { labels } = this.#player.getOptions();

        let rate = 1;
        if (this.#player && media) {
            rate = media.defaultPlaybackRate !== media.playbackRate ? media.playbackRate : media.defaultPlaybackRate;
        }
        return {
            className: 'op-speed__option',
            default: rate.toString(),
            key: 'speed',
            name: labels?.speed || '',
            subitems: [
                { key: '0.25', label: '0.25' },
                { key: '0.5', label: '0.5' },
                { key: '0.75', label: '0.75' },
                { key: '1', label: labels?.speedNormal || '' },
                { key: '1.25', label: '1.25' },
                { key: '1.5', label: '1.5' },
                { key: '2', label: '2' },
            ],
        };
    }

    addItem(name: string, key: string, defaultValue: string, submenu?: SettingsSubItem[], className?: string): void {
        // Build the menu entry first
        const dataValue = `${key}-${sanitize(defaultValue, true)}`;
        const menuItem = document.createElement('div');
        menuItem.className = 'op-settings__menu-item';
        menuItem.tabIndex = 0;
        menuItem.setAttribute('role', 'menuitemradio');
        menuItem.innerHTML = `<div class="op-settings__menu-label" data-value="${dataValue}">${name}</div>`;

        const submenuMatch = submenu ? submenu.find((x) => x.key === defaultValue) : null;
        if (submenuMatch) {
            menuItem.innerHTML += `<div class="op-settings__menu-content" tabindex="0">${submenuMatch.label}</div>`;
        }

        const mainMenu = this.#menu.querySelector('.op-settings__menu');
        if (mainMenu) {
            mainMenu.appendChild(menuItem);
        }
        this.#originalOutput = this.#menu.innerHTML;

        // Store the submenu to reach all options for current menu item
        if (submenu) {
            const subItems = `
                <div class="op-settings__header">
                    <button type="button" class="op-settings__back" tabindex="0">${name}</button>
                </div>
                <div class="op-settings__menu" role="menu" id="menu-item-${key}">
                    ${submenu
                        .map(
                            (item: SettingsSubItem) => `
                    <div class="op-settings__submenu-item" role="menuitemradio" aria-checked="${
                        defaultValue === item.key ? 'true' : 'false'
                    }">
                        <div class="op-settings__submenu-label ${className || ''}" tabindex="0" data-value="${key}-${item.key}">
                            ${item.label}
                        </div>
                    </div>`
                        )
                        .join('')}
                </div>`;
            this.#submenu[key] = subItems;
        }

        this.#events.global['settings.submenu'] = (e: Event): void => {
            const target = e.target as HTMLElement;
            if (target.closest(`#${this.#player.id}`)) {
                if (target.classList.contains('op-settings__back')) {
                    this.#menu.classList.add('op-settings--sliding');
                    setTimeout((): void => {
                        this.#menu.innerHTML = this.#originalOutput;
                        this.#menu.classList.remove('op-settings--sliding');
                    }, 100);
                } else if (target.classList.contains('op-settings__menu-content')) {
                    const labelEl = target.parentElement ? target.parentElement.querySelector('.op-settings__menu-label') : null;
                    const label = labelEl ? labelEl.getAttribute('data-value') : null;
                    const fragments = label ? label.split('-') : [];
                    if (fragments.length > 0) {
                        fragments.pop();

                        // eslint-disable-next-line no-useless-escape
                        const current = fragments.join('-').replace(/^\-|\-$/, '');
                        if (typeof this.#submenu[current] !== 'undefined') {
                            this.#menu.classList.add('op-settings--sliding');
                            setTimeout((): void => {
                                this.#menu.innerHTML = this.#submenu[current];
                                this.#menu.classList.remove('op-settings--sliding');
                            }, 100);
                        }
                    }
                } else if (target.classList.contains('op-settings__submenu-label')) {
                    const current = target.getAttribute('data-value');
                    const value = current ? current.replace(`${key}-`, '') : '';
                    const label = target.innerText;

                    // Update values in submenu and store
                    const menuTarget = this.#menu.querySelector(`#menu-item-${key} .op-settings__submenu-item[aria-checked=true]`);
                    if (menuTarget) {
                        menuTarget.setAttribute('aria-checked', 'false');
                        if (target.parentElement) {
                            target.parentElement.setAttribute('aria-checked', 'true');
                        }
                        this.#submenu[key] = this.#menu.innerHTML;

                        // Restore original menu, and set the new value
                        this.#menu.classList.add('op-settings--sliding');
                        setTimeout((): void => {
                            this.#menu.innerHTML = this.#originalOutput;
                            const prev = this.#menu.querySelector(`.op-settings__menu-label[data-value="${key}-${defaultValue}"]`);
                            if (prev) {
                                prev.setAttribute('data-value', `${current}`);
                                if (prev.nextElementSibling) {
                                    prev.nextElementSibling.textContent = label;
                                }
                            }
                            defaultValue = value;
                            this.#originalOutput = this.#menu.innerHTML;
                            this.#menu.classList.remove('op-settings--sliding');
                        }, 100);
                    }
                }
            } else {
                this.hideEvent();
            }
        };

        document.addEventListener('click', this.#events.global['settings.submenu'], EVENT_OPTIONS);
        this.#player.getElement().addEventListener('controlshidden', this.hideEvent, EVENT_OPTIONS);
    }

    removeItem(id: string | number, type: string, minItems = 2): void {
        const target = this.#player.getElement().querySelector(`.op-settings__submenu-label[data-value=${type}-${id}]`);
        if (target) {
            target.remove();
        }

        if (this.#player.getElement().querySelectorAll(`.op-settings__submenu-label[data-value^=${type}]`).length < minItems) {
            delete this.#submenu[type];
            const label = this.#player.getElement().querySelector(`.op-settings__menu-label[data-value^=${type}]`);
            const menuItem = label ? label.closest('.op-settings__menu-item') : null;
            if (menuItem) {
                menuItem.remove();
            }
        }
    }

    private _enterSpaceKeyEvent(e: KeyboardEvent): void {
        const key = e.which || e.keyCode || 0;
        const isAd = this.#player.isAd();
        const settingsBtnFocused = document?.activeElement?.classList.contains('op-controls__settings');

        const menuFocused =
            document?.activeElement?.classList.contains('op-settings__menu-content') ||
            document?.activeElement?.classList.contains('op-settings__back') ||
            document?.activeElement?.classList.contains('op-settings__submenu-label');
        if (!isAd) {
            if (settingsBtnFocused && (key === 13 || key === 32)) {
                this.clickEvent();
                e.preventDefault();
                e.stopPropagation();
            } else if (menuFocused && (key === 13 || key === 32)) {
                this.#events.global['settings.submenu'](e);
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }
}

export default Settings;
