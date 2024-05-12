import Captions from './controls/captions';
import Fullscreen from './controls/fullscreen';
import Levels from './controls/levels';
import Play from './controls/play';
import Progress from './controls/progress';
import Settings from './controls/settings';
import Time from './controls/time';
import Volume from './controls/volume';
import { ElementItem, EventsList, PlayerComponent, PlayerLayers, SettingsItem } from './interfaces';
import Player from './player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS } from './utils/constants';
import { addEvent, isAudio, isVideo, sanitize } from './utils/general';

class Controls implements PlayerComponent {
    events: EventsList = {
        media: {},
        mouse: {},
    };

    #settings: Settings;

    #timer = 0;

    #controls: HTMLDivElement;

    #player: Player;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #items: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #controlEls: any = {
        Captions,
        Fullscreen,
        Levels,
        Play,
        Progress,
        Settings,
        Time,
        Volume,
    };

    constructor(player: Player) {
        this.#player = player;
        this._setElements();
    }

    create(): void {
        this.#player.getElement().controls = false;

        const isMediaVideo = isVideo(this.#player.getElement());

        this._createControlsLayer();
        this._buildElements();

        this.events.controlschanged = (): void => {
            this.destroy();
            this._setElements();
            this.create();
        };

        this.events.ended = (): void => {
            this.#player.getContainer().classList.remove('op-controls--hidden');
        };

        this.#player.getElement().addEventListener('controlschanged', this.events.controlschanged, EVENT_OPTIONS);
        this.#player.getElement().addEventListener('ended', this.events.ended, EVENT_OPTIONS);

        const { alwaysVisible } = this.#player.getOptions().controls || {};

        if (!alwaysVisible) {
            const showControls = (): void => {
                if (isMediaVideo) {
                    this.#player.getContainer().classList.remove('op-controls--hidden');
                    this._stopControlTimer();
                }
            };

            this.events.mouse.mouseenter = (): void => {
                if (isMediaVideo && !this.#player.activeElement().paused) {
                    this._stopControlTimer();
                    if (this.#player.activeElement().currentTime) {
                        this.#player.playBtn.setAttribute('aria-hidden', this.#player.isMedia() ? 'false' : 'true');
                        this.#player.loader.setAttribute('aria-hidden', 'true');
                    } else if (this.#player.getOptions().showLoaderOnInit) {
                        this.#player.playBtn.setAttribute('aria-hidden', 'true');
                        this.#player.loader.setAttribute('aria-hidden', 'false');
                    }
                    this.#player.getContainer().classList.remove('op-controls--hidden');
                    this._startControlTimer(2500);
                }
            };
            this.events.mouse.mousemove = (): void => {
                if (isMediaVideo && !this.#player.activeElement().paused) {
                    if (this.#player.activeElement().currentTime) {
                        this.#player.loader.setAttribute('aria-hidden', 'true');
                        this.#player.playBtn.setAttribute('aria-hidden', this.#player.isMedia() ? 'false' : 'true');
                    } else {
                        this.#player.playBtn.setAttribute(
                            'aria-hidden',
                            this.#player.getOptions().showLoaderOnInit ? 'true' : 'false'
                        );
                        this.#player.loader.setAttribute(
                            'aria-hidden',
                            this.#player.getOptions().showLoaderOnInit ? 'false' : 'true'
                        );
                    }

                    this.#player.getContainer().classList.remove('op-controls--hidden');
                    this._startControlTimer(2500);
                }
            };
            this.events.mouse.mouseleave = (): void => {
                if (isMediaVideo && !this.#player.activeElement().paused) {
                    this._startControlTimer(1000);
                }
            };
            this.events.media.play = (): void => {
                if (isMediaVideo) {
                    this._startControlTimer(this.#player.getOptions().hidePlayBtnTimer || 350);
                }
            };
            this.events.media.loadedmetadata = showControls.bind(this);
            this.events.media.pause = showControls.bind(this);
            this.events.media.waiting = showControls.bind(this);
            this.events.media.stalled = showControls.bind(this);
            this.events.media.playererror = showControls.bind(this);

            Object.keys(this.events.media).forEach((event) => {
                this.#player.getElement().addEventListener(event, this.events.media[event], EVENT_OPTIONS);
            });

            if (IS_ANDROID || IS_IOS) {
                this.#player.getContainer().addEventListener('click', this.events.mouse.mouseenter, EVENT_OPTIONS);
            } else {
                Object.keys(this.events.mouse).forEach((event) => {
                    this.#player.getContainer().addEventListener(event, this.events.mouse[event], EVENT_OPTIONS);
                });
            }

            // Initial countdown to hide controls
            if (isMediaVideo && !this.#player.activeElement().paused) {
                this._startControlTimer(3000);
            }
        }
    }

    destroy(): void {
        if (!IS_ANDROID && !IS_IOS) {
            Object.keys(this.events.mouse).forEach((event) => {
                this.#player.getContainer().removeEventListener(event, this.events.mouse[event]);
            });

            Object.keys(this.events.media).forEach((event) => {
                this.#player.getElement().removeEventListener(event, this.events.media[event]);
            });

            this._stopControlTimer();
        }

        this.#player.getElement().removeEventListener('controlschanged', this.events.controlschanged);
        this.#player.getElement().removeEventListener('ended', this.events.ended);

        Object.keys(this.#items).forEach((position: string) => {
            this.#items[position].forEach((item: unknown) => {
                if ((item as ElementItem).custom) {
                    this._destroyCustomElement(item as ElementItem);
                } else if (typeof (item as PlayerComponent).destroy === 'function') {
                    (item as PlayerComponent).destroy();
                }
            });
        });

        this.#controls.remove();
    }

    getContainer(): HTMLDivElement {
        return this.#controls;
    }

    getLayer(layer: string): HTMLDivElement {
        return this.#controls.querySelector(`.op-controls-layer__${layer}`) || this.#controls;
    }

    private _createControlsLayer(): void {
        if (!this.#controls || !this.#player.getContainer().querySelector('.op-controls')) {
            this.#controls = document.createElement('div');
            this.#controls.className = 'op-controls';
            this.#player.getContainer().appendChild(this.#controls);

            const messageContainer = document.createElement('div');
            messageContainer.className = 'op-status';
            messageContainer.innerHTML = '<span></span>';
            messageContainer.tabIndex = -1;
            messageContainer.setAttribute('aria-hidden', 'true');

            if (isAudio(this.#player.getElement())) {
                this.#controls.appendChild(messageContainer);
            }
        }
    }

    private _startControlTimer(time: number): void {
        const el = this.#player.activeElement();
        this._stopControlTimer();

        if (typeof window !== 'undefined') {
            this.#timer = window.setTimeout(() => {
                if ((!el.paused || !el.ended) && isVideo(this.#player.getElement())) {
                    this.#player.getContainer().classList.add('op-controls--hidden');
                    this.#player.playBtn.setAttribute('aria-hidden', 'true');
                    this._stopControlTimer();
                    const event = addEvent('controlshidden');
                    this.#player.getElement().dispatchEvent(event);
                }
            }, time);
        }
    }

    private _stopControlTimer(): void {
        if (this.#timer !== 0) {
            clearTimeout(this.#timer);
            this.#timer = 0;
        }
    }

    private _setElements(): void {
        const controls = this.#player.getOptions().controls?.layers || {};
        this.#items = {
            'bottom-left': [],
            'bottom-middle': [],
            'bottom-right': [],
            left: [],
            main: [],
            middle: [],
            right: [],
            'top-left': [],
            'top-middle': [],
            'top-right': [],
        };

        const isVideoEl = isVideo(this.#player.getElement());
        const isAudioEl = isAudio(this.#player.getElement());

        const controlPositions = Object.keys(controls);
        const layersExist = controlPositions.find((item) => /^(top|bottom)/.test(item));
        this._createControlsLayer();

        controlPositions.forEach((position: string) => {
            const [layer, pos] = position.split('-');

            // Create extra layers if top/bottom exist
            if (pos) {
                if (!this.#controls.classList.contains('op-controls__stacked')) {
                    this.#controls.classList.add('op-controls__stacked');
                }
                const className = `op-controls-layer__${layer}`;
                if (!this.#controls.querySelector(`.${className}`)) {
                    const controlLayer = document.createElement('div');
                    controlLayer.className = className;
                    this.#controls.appendChild(controlLayer);
                }
            } else if (layersExist) {
                const className = 'op-controls-layer__center';
                if (!this.#controls.querySelector(`.${className}`)) {
                    const controlLayer = document.createElement('div');
                    controlLayer.className = className;
                    this.#controls.appendChild(controlLayer);
                }
            }

            const layers = controls ? controls[position as keyof PlayerLayers] : null;
            if (layers) {
                // remove duplicate values in the same position
                layers
                    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
                    .forEach((el: string) => {
                        const currentLayer = layersExist && !pos ? 'center' : layer;
                        const className = `${el.charAt(0).toUpperCase()}${el.slice(1)}`;
                        const item = new this.#controlEls[className](this.#player, pos || layer, currentLayer);
                        if (el === 'settings') {
                            this.#settings = item as Settings;
                        }
                        if (isVideoEl || (el !== 'fullscreen' && isAudioEl)) {
                            this.#items[position].push(item);
                        }
                    });
            }
        });

        // Append/prepend the custom items (if any) depending on their position:
        // If position is right, always prepend so Settings and Fullscreen are the last items;
        // otherwise, append new controls
        this.#player.getCustomControls().forEach((item) => {
            const [layer, pos] = item.position.split('-');
            const currentLayer = layersExist && !pos ? 'center' : layer;
            item.layer = currentLayer;
            item.position = pos || layer;

            if (typeof item.index === 'number') {
                this.#items[item.position].splice(item.index, 0, item);
            } else if (item.position === 'right') {
                this.#items[item.position].unshift(item);
            } else {
                this.#items[item.position].push(item);
            }
        });
    }

    private _buildElements(): void {
        // Loop controls to build them and register events
        Object.keys(this.#items).forEach((position) => {
            this.#items[position].forEach((item: unknown) => {
                if ((item as ElementItem).custom) {
                    this._createCustomElement(item as ElementItem);
                } else {
                    (item as PlayerComponent).create();
                }
            });
        });

        Object.keys(this.#items).forEach((position) => {
            this.#items[position].forEach((item: unknown) => {
                const allowDefault = !this.#player.getOptions().detachMenus || item instanceof Settings;
                const current = item as PlayerComponent;
                if (allowDefault && !current.custom && typeof current.addSettings === 'function') {
                    const menuItem = current.addSettings() as SettingsItem;
                    if (this.#settings && Object.keys(menuItem).length) {
                        this.#settings.addItem(
                            menuItem.name,
                            menuItem.key,
                            menuItem.default,
                            menuItem.subitems,
                            menuItem.className
                        );
                    }
                }
            });
        });

        const e = addEvent('controlschanged');
        this.#controls.dispatchEvent(e);
    }

    private _hideCustomMenu(menu: HTMLDivElement): void {
        let timeout;
        if (timeout && typeof window !== 'undefined') {
            window.cancelAnimationFrame(timeout);
        }

        if (typeof window !== 'undefined') {
            timeout = window.requestAnimationFrame(() => {
                menu.setAttribute('aria-hidden', 'true');
            });
        }
    }

    private _toggleCustomMenu(event: Event, menu: HTMLDivElement, item: ElementItem): void {
        const menus = this.#player.getContainer().querySelectorAll('.op-settings');
        menus.forEach((m) => {
            if (m.getAttribute('aria-hidden') === 'false' && m.id !== menu.id) {
                m.setAttribute('aria-hidden', 'true');
            }
        });
        menu.setAttribute('aria-hidden', menu.getAttribute('aria-hidden') === 'true' ? 'false' : 'true');
        if (typeof item.click === 'function') {
            item.click(event);
        }
    }

    private _createCustomElement(item: ElementItem): void {
        const element = document.createElement(item.type);
        element.tabIndex = 0;
        element.id = item.id;
        element.className = `op-controls__${item.id} op-control__${item.position} ${
            item.showInAds ? '' : 'op-control__hide-in-ad'
        }`;

        if (item.styles) {
            Object.assign(element.style, item.styles);
        }

        if (item.type === 'button' && item.icon) {
            element.innerHTML = /\.(jpg|png|svg|gif)$/.test(item.icon)
                ? `<img src="${sanitize(item.icon)}"${item.alt ? `alt="${sanitize(item.alt)}"` : ''}>`
                : sanitize(item.icon);
        } else if (item.content) {
            element.innerHTML = sanitize(item.content, false);
        }
        if (item.type === 'button' && item.title) {
            element.title = sanitize(item.title);
        }
        if (item.type === 'img' && item.alt) {
            (element as HTMLImageElement).alt = sanitize(item.alt);
        }
        if (item.type !== 'button' && item.click && typeof item.click === 'function') {
            element.setAttribute('aria-role', 'button');
        }

        // In the event we have subitems for a button control, create menu and attach events for each item
        if (item.type === 'button' && item.subitems && Array.isArray(item.subitems) && item.subitems.length > 0) {
            const menu = document.createElement('div');
            menu.className = 'op-settings op-settings__custom';
            menu.id = `${item.id}-menu`;
            menu.setAttribute('aria-hidden', 'true');

            const items = item.subitems.map((s) => {
                let itemIcon = '';
                if (s.icon) {
                    itemIcon = /\.(jpg|png|svg|gif)$/.test(s.icon)
                        ? `<img src="${sanitize(s.icon)}"${s.alt ? `alt="${sanitize(s.alt)}"` : ''}>`
                        : sanitize(s.icon, false);
                }
                return `<div class="op-settings__menu-item" tabindex="0" ${
                    s.title ? `title="${s.title}"` : ''
                } role="menuitemradio">
                    <div class="op-settings__menu-label" id="${s.id}" data-value="${item.id}-${s.id}">${itemIcon} ${
                    s.label
                }</div>
                </div>`;
            });

            menu.innerHTML = `<div class="op-settings__menu" role="menu">${items.join('')}</div>`;
            this.#player.getContainer().appendChild(menu);

            item.subitems.forEach((subitem) => {
                const menuItem = menu.querySelector(`#${subitem.id}`);
                if (menuItem && subitem.click && typeof subitem.click === 'function') {
                    menuItem.addEventListener('click', subitem.click, EVENT_OPTIONS);
                }
            });

            // Ensure to toggle menu, hide other settings menus and dispatch a general custom
            // click event (if created)
            element.addEventListener('click', (e) => this._toggleCustomMenu(e, menu, item), EVENT_OPTIONS);

            this.#player
                .getElement()
                .addEventListener('controlshidden', () => this._hideCustomMenu(menu), EVENT_OPTIONS);
        } else if (item.click && typeof item.click === 'function') {
            element.addEventListener('click', item.click, EVENT_OPTIONS);
        }
        if (item.mouseenter && typeof item.mouseenter === 'function') {
            element.addEventListener('mouseenter', item.mouseenter, EVENT_OPTIONS);
        }
        if (item.mouseleave && typeof item.mouseleave === 'function') {
            element.addEventListener('mouseleave', item.mouseleave, EVENT_OPTIONS);
        }
        if (item.keydown && typeof item.keydown === 'function') {
            element.addEventListener('keydown', item.keydown, EVENT_OPTIONS);
        }
        if (item.blur && typeof item.blur === 'function') {
            element.addEventListener('blur', item.blur, EVENT_OPTIONS);
        }
        if (item.focus && typeof item.focus === 'function') {
            element.addEventListener('focus', item.focus, EVENT_OPTIONS);
        }
        if (item.layer) {
            if (item.layer === 'main') {
                this.#player.getContainer().appendChild(element);
            } else {
                this.getLayer(item.layer).appendChild(element);
            }
        }

        // If there's an initial set of operations to dispatch as soon as the control
        // is created, dispatch them
        if (item.init && typeof item.init === 'function') {
            item.init(this.#player);
        }
    }

    private _destroyCustomElement(item: ElementItem): void {
        const control = this.getContainer().querySelector(`.op-controls__${item.id}`);
        if (control) {
            if (item.subitems && Array.isArray(item.subitems) && item.subitems.length > 0) {
                const menu = this.#player.getContainer().querySelector(`#${item.id}-menu`) as HTMLDivElement;
                if (menu) {
                    item.subitems.forEach((subitem) => {
                        const menuItem = menu.querySelector(`#${subitem.id}`);
                        if (menuItem && subitem.click && typeof subitem.click === 'function') {
                            menuItem.removeEventListener('click', subitem.click);
                        }
                    });

                    control.removeEventListener('click', (e) => this._toggleCustomMenu(e, menu, item));

                    this.#player.getElement().removeEventListener('controlshidden', () => this._hideCustomMenu(menu));
                    menu.remove();
                }
            }
            if (item.click && typeof item.click === 'function') {
                control.removeEventListener('click', item.click);
            }
            if (item.mouseenter && typeof item.mouseenter === 'function') {
                control.removeEventListener('mouseenter', item.mouseenter);
            }
            if (item.mouseleave && typeof item.mouseleave === 'function') {
                control.removeEventListener('mouseleave', item.mouseleave);
            }
            if (item.keydown && typeof item.keydown === 'function') {
                control.removeEventListener('keydown', item.keydown);
            }
            if (item.blur && typeof item.blur === 'function') {
                control.removeEventListener('blur', item.blur);
            }
            if (item.focus && typeof item.focus === 'function') {
                control.removeEventListener('focus', item.focus);
            }
            control.remove();

            // If there's an initial set of operations to dispatch as soon as the control
            // is created, dispatch them
            if (item.destroy && typeof item.destroy === 'function') {
                item.destroy(this.#player);
            }
        }
    }
}

export default Controls;
