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
        this.captions.className = 'om-captions';
        this.captions.innerHTML = '<span></span>';

        // Assign by default first track
        this.current = this.trackList[0];

        // Show/hide captions
        this.button.addEventListener('click', (e: any) => {
            const button = (e.target as HTMLDivElement);
            if (hasClass(button, 'om-controls__captions--on')) {
                this._hide();
                button.classList.remove('om-controls__captions--on');
            } else {
                this._show();
                button.classList.add('om-controls__captions--on');
            }
        });

        // For the following workflow it is required to have more than 1 language available
        if (this.trackList.length <= 1) {
            return this;
        }

        // Assign event to caption options
        document.addEventListener('click', (e: any) => {
            if (e.target.closest(`#${this.player.id}`) && hasClass(e.target, 'om-subtitles__option')) {
                const option = e.target;
                const language = option.getAttribute('data-value').replace('captions-', '');
                this.current = Array.from(this.trackList).filter(item => item.language === language).pop();
                this._show();
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
        }
        return this;
    }
    /**
     * Add list of available captions in the Settings menu
     *
     * @returns {any}
     * @memberof Captions
     */
    public addSettingsMenu() {
        if (this.trackList.length <= 1) {
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
    /**
     * Parse WebVTT text from external domain to emulate native cues
     *
     * @private
     * @param {string} webvttText
     * @returns {any[]}
     * @memberof Captions
     */
    private _getCues(webvttText: string) {
        const lines = webvttText.split(/\r?\n/);
        const entries = [];
        const urlRegexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        let timePattern = '^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --> ';
        timePattern += '((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*?)$';
        const regexp = new RegExp(timePattern);

        let identifier;

        for (let i = 0, total = lines.length; i < total; i++) {
            const timecode = regexp.exec(lines[i]);

            if (timecode && i < lines.length) {
                if ((i - 1) >= 0 && lines[i - 1] !== '') {
                    identifier = lines[i - 1];
                }
                i++;
                // grab all the (possibly multi-line) text that follows
                let cue = lines[i];
                i++;
                while (lines[i] !== '' && i < lines.length) {
                    cue = `${cue}\n${lines[i]}`;
                    i++;
                }
                cue = cue.trim().replace(urlRegexp, "<a href='$1' target='_blank'>$1</a>");
                const initTime = timeToSeconds(timecode[1]);

                entries.push({
                    identifier,
                    settings: timecode[5] || {},
                    start: (initTime === 0) ? 0.200 : initTime,
                    stop: timeToSeconds(timecode[3]),
                    text: cue,
                });
            }
            identifier = '';
        }
        return entries;
    }
    /**
     * Display current caption checking for cues or parsing remote source
     *
     * @private
     * @returns {void}
     * @memberof Captions
     */
    private _show() {
        if (typeof this.current.cues === 'undefined') {
            return;
        }

        const container = this.captions.querySelector('span');

        if (!this.current.cues.length) {
            request(getAbsoluteUrl(this.trackUrlList[this.current.language]), 'text', d => {
                this.tracks[this.current.language] = this._getCues(d);

                const currentCues = this.tracks[this.current.language];

                // Use `timeupdate` to update remote captions
                this.player.element.addEventListener('timeupdate', () => {
                    const el = this.player.activeElement();
                    const index = this._search(currentCues, el.currentTime);
                    container.innerHTML = '';
                    if (index > -1 && hasClass(this.button, 'om-controls__captions--on')) {
                        this.captions.classList.add('om-captions--on');
                        container.innerHTML = this._sanitize(currentCues[index].text);
                    } else {
                        this._hide();
                    }
                });
            });
        } else {
            const instance = this;
            this.current.oncuechange = function() {
                const cue = this.activeCues[0];
                container.innerHTML = '';
                if (cue && hasClass(this.button, 'om-controls__captions--on')) {
                    instance.captions.classList.add('om-captions--on');
                    container.appendChild(cue.getCueAsHTML());
                } else {
                    instance._hide();
                }
            };
        }
    }

    /**
     * Remove class to turn captions off
     *
     * @private
     * @memberof Captions
     */
    private _hide() {
        this.captions.classList.remove('om-captions--on');
    }

    /**
     * Search for match index using binary search algorithm
     *
     * @private
     * @param {any[]} tracks
     * @param {number} currentTime
     * @returns {number}
     * @memberof Captions
     */
    private _search(tracks: any[], currentTime: number) {
        let low = 0;
        let high = tracks.length - 1;
        while (low <= high) {
            const mid = ((low + high) >> 1);
            const start = tracks[mid].start;
            const stop = tracks[mid].stop;

            if (currentTime >= start && currentTime < stop) {
                return mid;
            } else if (start < currentTime) {
                low = mid + 1;
            } else if (start > currentTime) {
                high = mid - 1;
            }
        }
        return -1;
    }

    /**
     * Ensure that caption from remote source has clean output
     *
     * @private
     * @param {string} html
     * @returns {string}
     * @memberof Captions
     */
    private _sanitize(html: string) {
        const div = document.createElement('div');
        div.innerHTML = html;

        // Remove all `<script>` tags first
        const scripts = div.getElementsByTagName('script');
        let i = scripts.length;
        while (i--) {
            scripts[i].remove();
        }

        // Loop the elements and remove anything that contains value="javascript:" or an `on*` attribute
        // (`onerror`, `onclick`, etc.)
        const allElements = div.getElementsByTagName('*');
        for (let index = 0, n = allElements.length; index < n; index++) {
            const attributesObj = allElements[index].attributes;
            const attributes = Array.prototype.slice.call(attributesObj);

            for (let j = 0, total = attributes.length; j < total; j++) {
                if (/^(on|javascript:)/.test(attributes[j].name)) {
                    allElements[index].remove();
                } else if (attributes[j].name === 'style') {
                    allElements[index].removeAttribute(attributes[j].name);
                }
            }
        }
        return div.innerHTML;
    }
}

export default Captions;
