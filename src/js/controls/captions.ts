import IEvent from '../components/interfaces/general/event';
// import { addEvent } from '../events';
import Player from '../player';
import { getAbsoluteUrl, request } from '../utils/general';
import { timeToSeconds } from '../utils/time';

class Captions {
    public player: Player;
    private button: HTMLButtonElement;
    private settings: HTMLButtonElement;
    private captions: HTMLDivElement;
    private events: IEvent;
    private tracks: any;
    private trackList: TextTrackList;
    private trackUrlList: any;
    private hasTracks: boolean;
    private current: any;

    /**
     * Creates an instance of Captions.
     *
     * @param {Player} player
     * @memberof Captions
     */
    constructor(player: Player) {
        this.player = player;
        this.events = {};
        this.trackUrlList = {};
        this.tracks = {};
        this.button = document.createElement('button');
        this.button.className = 'om-controls__captions om-control__right';
        this.button.setAttribute('aria-controls', player.uid);
        this.button.innerHTML = '<span class="om-sr">Toggle Captions</span>';

        const video = (this.player.element as HTMLVideoElement);
        this.trackList = video.textTracks;
        this.hasTracks = !!this.trackList.length;

        if (!this.hasTracks) {
            return this;
        }

        for (let i = 0, tracks = video.querySelectorAll('track'), total = tracks.length; i < total; i++) {
            const element = (tracks[i] as HTMLTrackElement);
            this.trackUrlList[element.srclang] = getAbsoluteUrl(element.src);
        }

        console.log(this.trackUrlList);

        for (let i = 0, total = this.trackList.length; i < total; i++) {
            this.trackList[i].mode = 'hidden';
        }

        // Build container to display captions to mitigate cross browser inconsistencies
        this.captions = document.createElement('div');
        this.captions.className = 'om-captions__container';

        if (this.trackList.length > 1) {
            this.settings = document.createElement('button');
            this.settings.className = 'om-controls__settings om-control__right';
            this.settings.setAttribute('aria-controls', player.uid);
            this.settings.innerHTML = '<span class="om-sr">Player Settings</span>';
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
                for (let i = 0, total = this.trackList.length; i < total; i++) {
                    // For the 'subtitles-off' button, the first condition will never match so all
                    // will subtitles be turned off
                    if (this.trackList[i].language === language) {
                        this.current = this.trackList[i];
                        this._displayCaptions();
                        button.setAttribute('data-state', 'active');
                    } else {
                        this.trackList[i].mode = 'hidden';
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
        for (let i = 0, total = this.trackList.length; i < total; i++) {
            subtitlesMenu.appendChild(createMenuItem(
                `om-controls__subtitles-${this.trackList[i].language}`,
                this.trackList[i].language,
                this.trackList[i].label,
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
     * @param {HTMLDivElement} controls
     * @returns {Captions}
     * @memberof Captions
     */
    public build(controls: HTMLDivElement) {
        if (this.hasTracks) {
            const target = (this.player.element.parentNode as HTMLElement);
            target.insertBefore(this.captions, target.firstChild);

            controls.appendChild(this.button);

            if (this.trackList.length > 1) {
                controls.appendChild(this.settings);
            }
        }
        return this;
    }

    private _getCues(webvttText: string) {
        const lines = webvttText.split(/\r?\n/);
        const entries = [];
        const urlRegexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        let timePattern = '^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --> ';
        timePattern += '((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$';
        const regexp = new RegExp(timePattern);

        let timecode;
        let text;
        let identifier;

        for (let i = 0, total = lines.length; i < total; i++) {
            timecode = regexp.exec(lines[i]);

            if (timecode && i < lines.length) {
                if ((i - 1) >= 0 && lines[i - 1] !== '') {
                    identifier = lines[i - 1];
                }
                i++;
                // grab all the (possibly multi-line) text that follows
                const line = lines[i];
                text = line;
                i++;
                while (line !== '' && i < lines.length) {
                    text = `${text}\n${line}`;
                    i++;
                }
                text = text.replace(urlRegexp, "<a href='$1' target='_blank'>$1</a>");
                const initTime = timeToSeconds(timecode[1]);

                entries.push({
                    identifier,
                    settings: timecode[5],
                    start: (initTime === 0) ? 0.200 : initTime,
                    stop: timeToSeconds(timecode[3]),
                    text,
                });
            }
            identifier = '';
        }
        return entries;
    }

    // private _load() {
    //     const el = (this.player.element as HTMLVideoElement);
    //     const tracks = el.querySelectorAll('track');
    //     for (let i = 0, total = tracks.length; i < total; i++) {
    //         request(tracks[i].src, 'text', d => {
    //             this.tracks[tracks[i].lang] = this._parse(d);
    //             // this._enable(this.tracks[tracks[i].lang]);
    //         }, () => {
    //             // this._remove(this.tracks[tracks[i].lang);
    //         });
    //     }
    // }

    private _displayCaptions() {
        if (!this.current.cues.length) {
            request(getAbsoluteUrl(this.trackUrlList[this.current.language]), 'text', d => {
                this.tracks[this.current.language] = this._getCues(d);
            });
        } else {
            this.tracks[this.current.language] = this.current.cues;
        }
    }
}

export default Captions;
