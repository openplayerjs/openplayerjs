import IEvent from '../components/interfaces/general/event';
// import { addEvent } from '../events';
import Player from '../player';

class Captions {
    public player: Player;
    private button: HTMLButtonElement;
    private events: IEvent;
    private tracks: TextTrackList;
    private hasTracks: boolean;

    /**
     * Creates an instance of Captions.
     *
     * @param {Player} player
     * @memberof Captions
     */
    constructor(player: Player) {
        this.player = player;
        this.events = {};
        this.button = document.createElement('button');
        this.button.className = 'om-controls__captions';
        this.button.innerHTML = '<span class="om-sr">Captions</span>';

        const video = (this.player.element as HTMLVideoElement);
        this.tracks = video.textTracks;
        this.hasTracks = !!this.tracks.length;

        if (!this.hasTracks) {
            return this;
        }

        for (let i = 0, total = this.tracks.length; i < total; i++) {
            video.textTracks[i].mode = 'hidden';
        }

        const subtitleMenuButtons: any = [];
        const createMenuItem = (id: string, lang: string, label: string) => {
            const listItem = document.createElement('li');
            const button = listItem.appendChild(document.createElement('button'));
            button.setAttribute('id', id);
            button.className = 'om-controls__subtitles-button';
            if (lang.length > 0) {
                button.setAttribute('lang', lang);
            }
            button.value = label;
            button.setAttribute('data-state', 'inactive');
            button.appendChild(document.createTextNode(label));
            button.addEventListener('click', () => {
                // Set all buttons to inactive
                subtitleMenuButtons.map((v: any) => {
                    v.setAttribute('data-state', 'inactive');
                });
                // Find the language to activate
                const language = button.getAttribute('lang');
                for (let i = 0, total = video.textTracks.length; i < total; i++) {
                    // For the 'subtitles-off' button, the first condition will never match so all
                    // will subtitles be turned off
                    if (video.textTracks[i].language === language) {
                        video.textTracks[i].mode = 'showing';
                        button.setAttribute('data-state', 'active');
                    } else {
                        video.textTracks[i].mode = 'hidden';
                    }
                }
                subtitlesMenu.style.display = 'none';
            });
            subtitleMenuButtons.push(button);
            return listItem;
        };

        let subtitlesMenu: any;
        const df = document.createDocumentFragment();
        subtitlesMenu = df.appendChild(document.createElement('ul'));
        subtitlesMenu.className = 'om-controls__subtitles-menu';
        subtitlesMenu.appendChild(createMenuItem('subtitles-off', '', 'Off'));
        for (let i = 0, total = this.tracks.length; i < total; i++) {
            subtitlesMenu.appendChild(createMenuItem(
                `om-controls__subtitles-${video.textTracks[i].language}`,
                video.textTracks[i].language,
                video.textTracks[i].label,
            ));
        }
        this.player.element.parentNode.appendChild(subtitlesMenu);

        this.button.addEventListener('click', () => {
            if (subtitlesMenu) {
                subtitlesMenu.style.display = (subtitlesMenu.style.display === 'block' ? 'none' : 'block');
            }
        });

        return this;
    }

    /**
     *
     * @returns {Captions}
     * @memberof Captions
     */
    public register() {
        Object.keys(this.events).forEach(event => {
            this.player.media.element.addEventListener(event, this.events[event]);
        });
        return this;
    }

    public unregister() {
        Object.keys(this.events).forEach(event => {
            this.player.media.element.removeEventListener(event, this.events[event]);
        });

        this.events = {};
        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {Captions}
     * @memberof Captions
     */
    public build(container: HTMLDivElement) {
        if (this.hasTracks) {
            container.appendChild(this.button);
        }
        return this;
    }
}

export default Captions;
