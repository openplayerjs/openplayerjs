import IEvent from '../components/interfaces/general/event';
import Player from '../player';
import { getAbsoluteUrl, hasClass, request } from '../utils/general';
import { timeToSeconds } from '../utils/time';

class Captions {
    public player: Player;
    private button: HTMLButtonElement;
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

        for (let i = 0, total = this.trackList.length; i < total; i++) {
            // Determine default or make first caption visible
            this.trackList[i].mode = 'hidden';
        }

        // Build container to display captions to mitigate cross browser inconsistencies
        this.captions = document.createElement('div');
        this.captions.className = 'om-captions__container';

        if (this.trackList.length <= 1) {
            return this;
        }

        // Assign event to caption options
        document.addEventListener('click', (e: any) => {
            if (hasClass(e.target, 'om-subtitles__option')) {
                const button = e.target;
                const language = button.getAttribute('data-value').replace('captions-', '');
                this.current = Array.from(this.trackList).filter(item => item.language === language);
                this._displayCaptions();
            }
        });

        this.button.addEventListener('click', () => {
            // Show/hide captions
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
        }
        return this;
    }

    public addSettingsMenu() {
        if (!this.hasTracks) {
            return {};
        }
        const subitems = [{key: 'off', label: 'Off'}];
        // Build object based on available languages
        for (let i = 0, total = this.trackList.length; i < total; i++) {
            subitems.push({key: this.trackList[i].language, label: this.trackList[i].label});
        }
        return {
            className: 'om-subtitles__option',
            default: 'off',
            key: 'captions',
            name: 'Subtitles/CC',
            subitems,
        };
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
        if (typeof this.current.cues === 'undefined') {
            return;
        }
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
