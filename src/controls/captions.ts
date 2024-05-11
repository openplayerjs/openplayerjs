import { EventsList, PlayerComponent, SettingsItem, SettingsSubItem } from '../interfaces';
import Player from '../player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS } from '../utils/constants';
import { addEvent } from '../utils/general';

class Captions implements PlayerComponent {
    #player: Player;

    #button: HTMLButtonElement;

    #captions: HTMLDivElement;

    #menu: HTMLDivElement;

    #events: EventsList = {
        button: {},
        global: {},
        media: {},
    };

    #mediaTrackList: TextTrack[];

    #hasTracks: boolean;

    #currentTrack?: TextTrack;

    #default = 'off';

    #controlPosition: string;

    #controlLayer: string;

    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#controlPosition = position;
        this.#controlLayer = layer;

        this._formatMenuItems = this._formatMenuItems.bind(this);
        this._setDefaultTrack = this._setDefaultTrack.bind(this);
        this._showCaptions = this._showCaptions.bind(this);
        this._hideCaptions = this._hideCaptions.bind(this);
    }

    custom?: boolean | undefined;

    create(): void {
        const { textTracks } = this.#player.getElement();
        const { labels, detachMenus } = this.#player.getOptions();

        this.#mediaTrackList = Object.keys(textTracks)
            .map((k) => textTracks[Number(k)])
            .filter((el) => ['subtitles', 'captions'].includes(el.kind) && el.language);

        this.#hasTracks = !!this.#mediaTrackList.length;

        if (!this.#hasTracks) {
            return;
        }

        this.#button = document.createElement('button');
        this.#button.className = `op-controls__captions op-control__${this.#controlPosition}`;
        this.#button.tabIndex = 0;
        this.#button.title = labels?.toggleCaptions || '';
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-pressed', 'false');
        this.#button.setAttribute('aria-label', labels?.toggleCaptions || '');
        this.#button.setAttribute('data-active-captions', 'off');

        // Build container to display captions to mitigate cross browser inconsistencies
        this.#captions = document.createElement('div');
        this.#captions.className = 'op-captions';
        const target = this.#player.getContainer();
        target.insertBefore(this.#captions, target.firstChild);

        if (detachMenus) {
            this.#button.classList.add('op-control--no-hover');
            this.#menu = document.createElement('div');
            this.#menu.className = 'op-settings op-captions__menu';
            this.#menu.setAttribute('aria-hidden', 'true');
            this.#menu.innerHTML = `<div class="op-settings__menu" role="menu" id="menu-item-captions">
                <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio" aria-checked="${
                    this.#default === 'off' ? 'true' : 'false'
                }">
                    <div class="op-settings__submenu-label op-subtitles__option" data-value="captions-off">${
                        labels?.off
                    }</div>
                </div>
            </div>`;

            const itemContainer = document.createElement('div');
            itemContainer.className = `op-controls__container op-control__${this.#controlPosition}`;
            itemContainer.append(this.#button, this.#menu);
            this.#player.getControls().getLayer(this.#controlLayer).append(itemContainer);

            for (const track of this.#mediaTrackList) {
                const item = document.createElement('div');
                const label = labels?.lang?.[track.language] || null;
                item.className = 'op-settings__submenu-item';
                item.tabIndex = 0;
                item.setAttribute('role', 'menuitemradio');
                item.setAttribute('aria-checked', this.#default === track.language ? 'true' : 'false');
                item.innerHTML = `<div class="op-settings__submenu-label op-subtitles__option"
                    data-value="captions-${track.language}">
                    ${label || track.label}
                </div>`;
                this.#menu.append(item);
            }
        } else {
            this.#player.getControls().getLayer(this.#controlLayer).append(this.#button);
        }

        // Show/hide captions
        this.#events.button.click = (e: Event): void => {
            const button = e.target as HTMLDivElement;
            if (detachMenus) {
                const menus = this.#player.getContainer().querySelectorAll('.op-settings');
                for (const menuItem of Array.from(menus)) {
                    if (menuItem !== this.#menu) {
                        menuItem.setAttribute('aria-hidden', 'true');
                    }
                }
                if (this.#menu.getAttribute('aria-hidden') === 'true') {
                    this.#menu.setAttribute('aria-hidden', 'false');
                } else {
                    this.#menu.setAttribute('aria-hidden', 'true');
                }
            } else {
                button.setAttribute('aria-pressed', 'true');
                if (button.classList.contains('op-controls__captions--on')) {
                    button.classList.remove('op-controls__captions--on');
                    button.setAttribute('data-active-captions', 'off');
                    this._hideCaptions();
                } else {
                    button.classList.add('op-controls__captions--on');
                    button.setAttribute('data-active-captions', this.#currentTrack?.language || 'off');
                    this._showCaptions();
                }

                for (const track of this.#mediaTrackList) {
                    track.mode = button.getAttribute('data-active-captions') === track.language ? 'showing' : 'hidden';
                }
            }
        };

        this.#events.button.mouseover = (): void => {
            if (!IS_IOS && !IS_ANDROID && detachMenus) {
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
            if (!IS_IOS && !IS_ANDROID && detachMenus) {
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

        this.#events.global.click = (e: Event): void => {
            const option = e.target as HTMLElement;
            if (option.closest(`#${this.#player.id}`) && option.classList.contains('op-subtitles__option')) {
                const language = option.getAttribute('data-value')!.replace('captions-', '');

                this._hideCaptions();

                if (language === 'off') {
                    this.#currentTrack = undefined;
                }

                for (const track of this.#mediaTrackList) {
                    track.mode = track.language === language ? 'showing' : 'hidden';
                    if (track.language === language) {
                        this.#currentTrack = track;
                        this._showCaptions();
                    }
                }

                if (detachMenus) {
                    if (this.#button.classList.contains('op-controls__captions--on')) {
                        this.#button.classList.remove('op-controls__captions--on');
                        this.#button.setAttribute('data-active-captions', 'off');
                    } else {
                        this.#button.classList.add('op-controls__captions--on');
                        this.#button.setAttribute('data-active-captions', language);
                    }

                    const captions = this.#menu.querySelectorAll('.op-settings__submenu-item');
                    for (const caption of Array.from(captions)) {
                        caption.setAttribute('aria-checked', 'false');
                    }
                    option.parentElement!.setAttribute('aria-checked', 'true');
                    this.#menu.setAttribute('aria-hidden', 'false');
                } else {
                    this.#button.setAttribute('data-active-captions', language);
                }
                const event = addEvent('captionschanged');
                this.#player.getElement().dispatchEvent(event);
            }
        };

        this.#events.global.cuechange = (e: Event): void => {
            this._hideCaptions();
            const t = e.target as TextTrack;
            if (t.mode !== 'showing' || this.#button.getAttribute('data-active-captions') === 'off') {
                return;
            }

            if (t.activeCues && t.activeCues?.length > 0) {
                this._showCaptions();
            }
        };

        if (detachMenus) {
            this.#button.addEventListener('mouseover', this.#events.button.mouseover, EVENT_OPTIONS);
            this.#menu.addEventListener('mouseover', this.#events.button.mouseover, EVENT_OPTIONS);
            this.#menu.addEventListener('mouseout', this.#events.button.mouseout, EVENT_OPTIONS);
            this.#player.getElement().addEventListener('controlshidden', this.#events.button.mouseout, EVENT_OPTIONS);
        }

        document.addEventListener('click', this.#events.global.click, EVENT_OPTIONS);

        for (const track of this.#mediaTrackList) {
            track.mode = track.mode !== 'showing' ? 'hidden' : track.mode;
            track.addEventListener('cuechange', this.#events.global.cuechange, EVENT_OPTIONS);
        }

        const targetTrack = this.#player
            .getElement()
            .querySelector('track:is([kind="subtitles"],[kind="captions"])[default]') as HTMLTrackElement;
        if (targetTrack) {
            const matchTrack = this.#mediaTrackList.find((el) => el.language === targetTrack.srclang);
            if (matchTrack) {
                this._setDefaultTrack(matchTrack);
            }
        }
    }

    destroy(): void {
        const { detachMenus } = this.#player.getOptions();

        if (!this.#hasTracks) {
            return;
        }

        for (const track of this.#mediaTrackList) {
            track.removeEventListener('cuechange', this.#events.global.cuechange);
        }

        document.removeEventListener('click', this.#events.global.click);
        this.#button.removeEventListener('click', this.#events.button.click);
        if (detachMenus) {
            this.#button.removeEventListener('mouseover', this.#events.button.mouseover);
            this.#menu.removeEventListener('mouseover', this.#events.button.mouseover);
            this.#menu.removeEventListener('mouseout', this.#events.button.mouseout);
            this.#player.getElement().removeEventListener('controlshidden', this.#events.button.mouseout);
            this.#menu.remove();
        }
        this.#button.remove();
    }

    addSettings(): SettingsItem | unknown {
        const { detachMenus, labels } = this.#player.getOptions();
        if (detachMenus || this.#mediaTrackList.length <= 1) {
            return {};
        }
        const subitems = this._formatMenuItems();

        // Avoid implementing submenu for captions if only 2 options were available
        return subitems.length > 2
            ? {
                  className: 'op-subtitles__option',
                  default: this.#default || 'off',
                  key: 'captions',
                  name: labels?.captions || '',
                  subitems,
              }
            : {};
    }

    private _formatMenuItems(): SettingsSubItem[] {
        const { labels, detachMenus } = this.#player.getOptions();
        if (this.#mediaTrackList.length <= 1 && !detachMenus) {
            return [];
        }

        let items = [{ key: 'off', label: labels?.off || '' }];
        for (const track of this.#mediaTrackList) {
            const label = labels?.lang ? labels.lang[track.language] : null;
            // Override language item if duplicated when passing list of items
            items = items.filter((el) => el.key !== track.language);
            items.push({ key: track.language, label: label || track.label });
        }

        return items;
    }

    private _setDefaultTrack(track: TextTrack): void {
        track.mode = 'showing';
        this.#default = track.language;
        this.#button.setAttribute('data-active-captions', this.#default);
        this.#button.classList.add('op-controls__captions--on');
        this.#captions.classList.add('op-captions--on');
        this.#currentTrack = track;

        const options = document.querySelectorAll('.op-settings__submenu-item') || [];
        for (const option of Array.from(options)) {
            option.setAttribute('aria-checked', 'false');
        }

        document
            .querySelector(`.op-subtitles__option[data-value="captions-${track.language}"]`)
            ?.parentElement?.setAttribute('aria-checked', 'true');
    }

    private _showCaptions() {
        for (const cue of Array.from(this.#currentTrack?.activeCues || [])) {
            const content = (cue as VTTCue)?.text || '';
            if (content && this.#captions) {
                const caption = document.createElement('span');
                caption.innerHTML = content;
                this.#captions.prepend(caption);
                this.#captions.classList.add('op-captions--on');
            } else {
                this._hideCaptions()
            }
        }
    }

    private _hideCaptions() {
        while (this.#captions?.lastChild) {
            this.#captions.removeChild(this.#captions.lastChild);
        }
    }
}

export default Captions;
