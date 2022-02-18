import { EventsList, Level, PlayerComponent, SettingsItem, SettingsSubItem } from '../interfaces';
import Player from '../player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS, NAV } from '../utils/constants';
import { addEvent, sanitize } from '../utils/general';
import { isDashSource, isHlsSource } from '../utils/media';

class Levels implements PlayerComponent {
    #player: Player;

    #button: HTMLButtonElement;

    #menu: HTMLDivElement;

    #events: EventsList = {
        button: {},
        global: {},
        media: {},
    };

    #levels: Level[] = [];

    #defaultLevel = '';

    #controlPosition: string;

    #controlLayer: string;

    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#controlPosition = position;
        this.#controlLayer = layer;
        return this;
    }

    create(): void {
        const { labels, defaultLevel: startLevel, detachMenus } = this.#player.getOptions();
        const initialLevel = startLevel !== null ? parseInt(startLevel || '0', 10) : this.#player.getMedia().level;
        this.#defaultLevel = `${initialLevel}`;
        const menuItems = this._formatMenuItems();
        const defaultLevel = menuItems.length ? menuItems.find((items) => items.key === this.#defaultLevel) : null;
        const defaultLabel = defaultLevel ? defaultLevel.label : labels?.auto || '';
        let levelSet = false;

        this.#button = document.createElement('button');
        this.#button.className = `op-controls__levels op-control__${this.#controlPosition}`;
        this.#button.tabIndex = 0;
        this.#button.title = labels?.mediaLevels || '';
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-label', labels?.mediaLevels || '');
        this.#button.setAttribute('data-active-level', this.#defaultLevel);
        this.#button.innerHTML = `<span>${defaultLabel}</span>`;

        const loadLevelsEvent = (): void => {
            if (!this.#levels.length) {
                this._gatherLevels();
                setTimeout((): void => {
                    this.#player.getMedia().level = initialLevel;
                    const e = addEvent('controlschanged');
                    this.#player.getElement().dispatchEvent(e);
                }, 0);
            } else if (!levelSet) {
                this.#player.getMedia().level = initialLevel;
                levelSet = true;
            }
        };

        this.#events.media.loadedmetadata = loadLevelsEvent.bind(this);
        this.#events.media.manifestLoaded = loadLevelsEvent.bind(this);
        this.#events.media.hlsManifestParsed = loadLevelsEvent.bind(this);

        if (detachMenus) {
            this._buildMenu();
            this.#events.button.click = (): void => {
                if (detachMenus) {
                    const menus = this.#player.getContainer().querySelectorAll('.op-settings');
                    for (let i = 0, total = menus.length; i < total; ++i) {
                        if (menus[i] !== this.#menu) {
                            menus[i].setAttribute('aria-hidden', 'true');
                        }
                    }
                    if (this.#menu.getAttribute('aria-hidden') === 'true') {
                        this.#menu.setAttribute('aria-hidden', 'false');
                    } else {
                        this.#menu.setAttribute('aria-hidden', 'true');
                    }
                }
            };
            this.#events.button.mouseover = (): void => {
                if (!IS_IOS && !IS_ANDROID) {
                    const menus = this.#player.getContainer().querySelectorAll('.op-settings');
                    for (let i = 0, total = menus.length; i < total; ++i) {
                        if (menus[i] !== this.#menu) {
                            menus[i].setAttribute('aria-hidden', 'true');
                        }
                    }
                    if (this.#menu.getAttribute('aria-hidden') === 'true') {
                        this.#menu.setAttribute('aria-hidden', 'false');
                    }
                }
            };
            this.#events.button.mouseout = (): void => {
                if (!IS_IOS && !IS_ANDROID) {
                    const menus = this.#player.getContainer().querySelectorAll('.op-settings');
                    for (let i = 0, total = menus.length; i < total; ++i) {
                        menus[i].setAttribute('aria-hidden', 'true');
                    }
                    if (this.#menu.getAttribute('aria-hidden') === 'false') {
                        this.#menu.setAttribute('aria-hidden', 'true');
                    }
                }
            };

            this.#button.addEventListener('click', this.#events.button.click, EVENT_OPTIONS);
            this.#button.addEventListener('mouseover', this.#events.button.mouseover, EVENT_OPTIONS);
            this.#menu.addEventListener('mouseover', this.#events.button.mouseover, EVENT_OPTIONS);
            this.#menu.addEventListener('mouseout', this.#events.button.mouseout, EVENT_OPTIONS);
            this.#player.getElement().addEventListener('controlshidden', this.#events.button.mouseout, EVENT_OPTIONS);
        }

        this.#events.global.click = (e: Event): void => {
            const option = e.target as HTMLElement;
            const { currentTime } = this.#player.getMedia();
            const isPaused = this.#player.getMedia().paused;
            if (option.closest(`#${this.#player.id}`) && option.classList.contains('op-levels__option')) {
                const levelVal = option.getAttribute('data-value');
                const level = parseInt(levelVal ? levelVal.replace('levels-', '') : '-1', 10);
                this.#defaultLevel = `${level}`;
                if (detachMenus) {
                    this.#button.setAttribute('data-active-level', `${level}`);
                    this.#button.innerHTML = `<span>${sanitize(option.innerText, true)}</span>`;
                    const levels =
                        option.parentElement && option.parentElement.parentElement
                            ? option.parentElement.parentElement.querySelectorAll('.op-settings__submenu-item')
                            : [];
                    for (let i = 0, total = levels.length; i < total; ++i) {
                        levels[i].setAttribute('aria-checked', 'false');
                    }
                    if (option.parentElement) {
                        option.parentElement.setAttribute('aria-checked', 'true');
                    }
                    this.#menu.setAttribute('aria-hidden', 'false');
                }
                this.#player.getMedia().level = level;
                this.#player.getMedia().currentTime = currentTime;
                if (!isPaused) {
                    this.#player.play();
                }

                const event = addEvent('levelchanged', {
                    detail: {
                        label: option.innerText.trim(),
                        level,
                    },
                });
                this.#player.getElement().dispatchEvent(event);
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const connection = NAV?.connection || NAV?.mozConnection || NAV?.webkitConnection;
        this.#events.global.connection = (): void => {
            // Check connectivity to switch levels (only HTML5 since HLS and Dash can use adaptive streaming)
            const media = this.#player.getMedia().current;
            if (!isDashSource(media) && !isHlsSource(media)) {
                const type = connection?.effectiveType || '';
                const levels = this.#levels.map((item) => ({
                    ...item,
                    resolution: parseInt(item.label.replace('p', ''), 10),
                }));

                let level = levels.find((item) => item.resolution < 360);
                if (type === '4g') {
                    level = levels.find((item) => item.resolution >= 720);
                } else if (type === '3g') {
                    level = levels.find((item) => item.resolution >= 360 && item.resolution < 720);
                }

                if (level) {
                    this.#player.pause();
                    this.#player.getMedia().level = level.id;
                    this.#player.play();
                }
            }
        };

        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });

        document.addEventListener('click', this.#events.global.click, EVENT_OPTIONS);
        if (connection) {
            connection.addEventListener('change', this.#events.global.connection, EVENT_OPTIONS);
        }
    }

    destroy(): void {
        const { detachMenus } = this.#player.getOptions();
        const connection = NAV?.connection || NAV?.mozConnection || NAV?.webkitConnection;

        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().removeEventListener(event, this.#events.media[event]);
        });
        document.removeEventListener('click', this.#events.global.click);
        if (connection) {
            connection.removeEventListener('change', this.#events.global.connection);
        }
        if (detachMenus) {
            this.#button.removeEventListener('click', this.#events.button.click);
            this.#button.remove();
            this.#button.removeEventListener('mouseover', this.#events.button.mouseover);
            this.#menu.removeEventListener('mouseover', this.#events.button.mouseover);
            this.#menu.removeEventListener('mouseout', this.#events.button.mouseout);
            this.#player.getElement().removeEventListener('controlshidden', this.#events.button.mouseout);
            this.#menu.remove();
        }
    }

    addSettings(): SettingsItem | unknown {
        const { labels, detachMenus } = this.#player.getOptions();
        if (detachMenus) {
            return {};
        }
        const subitems = this._formatMenuItems();
        // Avoid implementing submenu for levels if only 2 options were available
        return subitems.length > 2
            ? {
                  className: 'op-levels__option',
                  default: this.#defaultLevel || '-1',
                  key: 'levels',
                  name: labels?.levels,
                  subitems,
              }
            : {};
    }

    private _formatMenuItems(): SettingsSubItem[] {
        const { labels } = this.#player.getOptions();
        const levels = this._gatherLevels();
        const total = levels.length;
        let items = total ? [{ key: '-1', label: labels?.auto }] : [];
        for (let i = 0; i < total; i++) {
            const level = levels[i];
            items = items.filter((el) => el.key !== level.id);
            items.push({ key: level.id, label: level.label });
        }

        // Remove duplicated labels
        return items
            .reduce((acc: SettingsSubItem[], current) => {
                const duplicate = acc.find((item) => item.label === current.label);
                if (!duplicate) {
                    return acc.concat([current]);
                }
                return acc;
            }, [])
            .sort((a, b) => (parseInt(a?.label || '', 10) > parseInt(b?.label || '', 10) ? 1 : -1));
    }

    // @see https://en.wikipedia.org/wiki/Computer_display_standard#Standards
    private _getResolutionsLabel(height: number): string {
        const { labels } = this.#player.getOptions();
        if (height >= 4320) {
            return '8K';
        }
        if (height >= 2160) {
            return '4K';
        }
        if (height >= 1440) {
            return '1440p';
        }
        if (height >= 1080) {
            return '1080p';
        }
        if (height >= 720) {
            return '720p';
        }
        if (height >= 480) {
            return '480p';
        }
        if (height >= 360) {
            return '360p';
        }
        if (height >= 240) {
            return '240p';
        }
        if (height >= 144) {
            return '144p';
        }
        return labels?.auto || '';
    }

    private _gatherLevels(): Level[] {
        if (!this.#levels.length) {
            this.#player.getMedia().levels.forEach((level: Level) => {
                this.#levels.push({ ...level, label: level.label || this._getResolutionsLabel(level.height) });
            });
        }
        return this.#levels;
    }

    private _buildMenu(): void {
        const { detachMenus } = this.#player.getOptions();
        // Build menu if detachMenu is `true`
        if (detachMenus) {
            this.#button.classList.add('op-control--no-hover');
            this.#menu = document.createElement('div');
            this.#menu.className = 'op-settings op-levels__menu';
            this.#menu.setAttribute('aria-hidden', 'true');
            const className = 'op-levels__option';
            const options = this._formatMenuItems();

            // Store the submenu to reach all options for current menu item
            const menu = `<div class="op-settings__menu" role="menu" id="menu-item-levels">
                ${options
                    .map(
                        (item) => `
                <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio"
                    aria-checked="${this.#defaultLevel === item.key ? 'true' : 'false'}">
                    <div class="op-settings__submenu-label ${className || ''}" data-value="levels-${item.key}">${item.label}</div>
                </div>`
                    )
                    .join('')}
            </div>`;
            this.#menu.innerHTML = menu;

            const itemContainer = document.createElement('div');
            itemContainer.className = `op-controls__container op-control__${this.#controlPosition}`;
            itemContainer.appendChild(this.#button);
            itemContainer.appendChild(this.#menu);
            this.#player
                .getControls()
                .getLayer(this.#controlLayer)
                .appendChild(itemContainer);
        }
    }
}

export default Levels;
