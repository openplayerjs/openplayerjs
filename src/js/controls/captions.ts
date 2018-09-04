import Cue from '../interfaces/captions/cue';
import CueList from '../interfaces/captions/cue-list';
import TrackURL from '../interfaces/captions/track-urls';
import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import SettingsItem from '../interfaces/settings/item';
import Player from '../player';
import { addEvent } from '../utils/events';
import { getAbsoluteUrl, hasClass, request } from '../utils/general';
import { timeToSeconds } from '../utils/time';

/**
 * Closed Captions element.
 *
 * @description Using `<track>` tags, this class allows the displaying of both local and remote captions
 * bypassing CORS, and without the use of the `crossorigin` attribute.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
 * @see https://www.html5rocks.com/en/tutorials/track/basics/
 * @class Captions
 * @implements PlayerComponent
 */
class Captions implements PlayerComponent {
    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Captions
     */
    private player: Player;

    /**
     * Button to toggle captions.
     *
     * @private
     * @type HTMLButtonElement
     * @memberof Captions
     */
    private button: HTMLButtonElement;

    /**
     * Container to display captions.
     *
     * @private
     * @type HTMLDivElement
     * @memberof Captions
     */
    private captions: HTMLDivElement;

    /**
     * Events that will be triggered in Caption element:
     *  - button (for the caption toggle element)
     *  - global (for dynamic elements)
     *  - media (to update captions on `timeupdate`, instead of using `oncuechanged`)
     *
     * @private
     * @type EventsList
     * @memberof Captions
     */
    private events: EventsList = {
        button: {},
        global: {},
        media: {},
    };

    /**
     * List of cues associated with a specific language.
     *
     * @private
     * @type CueList
     * @memberof Captions
     */
    private tracks: CueList = {};

    /**
     * List of tracks found in current media.
     *
     * @private
     * @type TextTrackList
     * @memberof Captions
     */
    private trackList: TextTrackList;

    /**
     * List of remote/local track sources in case no cues are detected natively.
     *
     * @private
     * @type TrackURL
     * @memberof Captions
     */
    private trackUrlList: TrackURL = {};

    /**
     * Whether tracks were found in current media or not.
     *
     * @private
     * @type boolean
     * @memberof Captions
     */
    private hasTracks: boolean;

    /**
     * Current track (either specified by `default` attribute or chosen by the user).
     *
     * @private
     * @type TextTrack
     * @memberof Captions
     */
    private current: TextTrack;

    /**
     * Initial language to be used to render captions when turned on, and
     * also as a default value in the `Settings` component.
     *
     * @see [[Captions.addSettings]]
     * @private
     * @type string
     * @memberof Captions
     */
    private default: string;

    /**
     * Create an instance of Captions.
     *
     * @param {Player} player
     * @memberof Captions
     * @returns {Captions}
     */
    constructor(player: Player) {
        this.player = player;
        this.trackList = this.player.getElement().textTracks;
        this.hasTracks = !!this.trackList.length;
        return this;
    }

    /**
     * Create a button and a container to display captions if tracks are detected.
     *
     * @inheritDoc
     * @memberof Captions
     */
    public create(): void {
        if (!this.hasTracks) {
            return;
        }

        this.button = document.createElement('button');
        this.button.className = 'om-controls__captions om-control__right';
        this.button.tabIndex = 0;
        this.button.title = 'Toggle Captions';
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Toggle Captions');
        this.button.innerHTML = '<span class="om-sr">Toggle Captions</span>';

        this.player.getContainer().classList.add('om-captions--detected');

        for (let i = 0, tracks = this.player.getElement().querySelectorAll('track'), total = tracks.length; i < total; i++) {
            const element = (tracks[i] as HTMLTrackElement);
            if (element.kind === 'subtitles') {
                this.trackUrlList[element.srclang] = getAbsoluteUrl(element.src);
                if (element.default) {
                    this.default = element.srclang;
                    this.button.classList.add('om-controls__captions--on');
                }
            }
        }

        for (let i = 0, total = this.trackList.length; i < total; i++) {
            this.trackList[i].mode = 'hidden';
        }

        // Build container to display captions to mitigate cross browser inconsistencies
        this.captions = document.createElement('div');
        this.captions.className = 'om-captions';
        this.captions.innerHTML = '<span></span>';

        // Assign by default first track or the one with `default` attribute
        this.current = this.default ? Array.from(this.trackList)
            .filter(item => item.language === this.default).pop() : this.trackList[0];

        const container = this.captions.querySelector('span');
        this.events.media.timeupdate = () => {
            if (this.player.isMedia()) {
                const currentCues = this.tracks[this.current.language];
                if (currentCues !== undefined) {
                    const index = this._search(currentCues, this.player.getMedia().currentTime);
                    container.innerHTML = '';
                    if (index > -1 && hasClass(this.button, 'om-controls__captions--on')) {
                        this.captions.classList.add('om-captions--on');
                        container.innerHTML = this._sanitize(currentCues[index].text);
                    } else {
                        this._hide();
                    }
                }
            }
        };

        if (this.default) {
            this._show();
        }

        // Show/hide captions
        this.events.button.click = (e: Event) => {
            const button = (e.target as HTMLDivElement);
            button.setAttribute('aria-pressed', 'true');
            if (hasClass(button, 'om-controls__captions--on')) {
                this._hide();
                button.classList.remove('om-controls__captions--on');
            } else {
                this._show();
                button.classList.add('om-controls__captions--on');
            }
        };

        this.button.addEventListener('click', this.events.button.click);

        if (this.hasTracks) {
            const target = this.player.getContainer();
            target.insertBefore(this.captions, target.firstChild);
            this.player.getControls().getContainer().appendChild(this.button);
        }

        // For the following workflow it is required to have more than 1 language available
        if (this.trackList.length <= 1) {
            return;
        }

        this.events.global.click = (e: Event) => {
            const option = (e.target as HTMLElement);
            if (option.closest(`#${this.player.id}`) && hasClass(option, 'om-subtitles__option')) {
                const language = option.getAttribute('data-value').replace('captions-', '');
                this.current = Array.from(this.trackList).filter(item => item.language === language).pop();
                this._show();
                const event = addEvent('captionschanged');
                this.player.getElement().dispatchEvent(event);
            }
        };

        if (typeof this.events.global.click !== 'undefined') {
            document.addEventListener('click', this.events.global.click);
        }
    }

    /**
     *
     * @inheritDoc
     * @memberof Captions
     */
    public destroy(): void {
        if (typeof this.events.global.click !== 'undefined') {
            document.removeEventListener('click', this.events.global.click);
        }

        if (this.hasTracks) {
            this.button.removeEventListener('click', this.events.button.click);
            this.player.getElement().removeEventListener('timeupdate', this.events.media.timeupdate);
            this.button.remove();
            this.captions.remove();
        }
    }

    /**
     * Add list of available captions in the `Settings` menu.
     *
     * @see [[Settings.addSettings]]
     * @returns {SettingsItem|object}
     * @memberof Captions
     */
    public addSettings(): SettingsItem|object {
        if (this.trackList.length <= 1) {
            return {};
        }
        let subitems = [{key: 'off', label: 'Off'}];
        // Build object based on available languages
        for (let i = 0, total = this.trackList.length; i < total; i++) {
            const track = this.trackList[i];
            // Override language item if duplicated when passing list of settings subitems
            subitems = subitems.filter(el => el.key !== track.language);
            subitems.push({key: track.language, label: this.trackList[i].label});
        }
        return {
            className: 'om-subtitles__option',
            default: this.default || 'off',
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
     * @returns {Cue[]}
     * @memberof Captions
     */
    private _getCues(webvttText: string): Cue[] {
        const lines = webvttText.split(/\r?\n/);
        const entries: Cue[] = [];
        const urlRegexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        let timePattern = '^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --> ';
        timePattern += '((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*?)$';
        const regexp = new RegExp(timePattern);

        let identifier;

        function isJson(item: any) {
            item = typeof item !== 'string' ? JSON.stringify(item) : item;
            try {
                item = JSON.parse(item);
            } catch (e) {
                return false;
            }

            if (typeof item === 'object' && item !== null) {
                return true;
            }

            return false;
        }

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
                    endTime: timeToSeconds(timecode[3]),
                    identifier,
                    settings: isJson(timecode[5]) ? JSON.parse(timecode[5]) : {},
                    startTime: (initTime === 0) ? 0.200 : initTime,
                    text: cue,
                });
            }
            identifier = '';
        }
        return entries;
    }
    /**
     * Display current caption checking for cues or parsing remote source.
     *
     * @memberof Captions
     */
    private _show(): void {
        if (typeof this.current.cues === 'undefined') {
            return;
        }

        // const t = this;
        const container = this.captions.querySelector('span');
        container.innerHTML = '';

        if (!this.current.cues.length) {
            request(getAbsoluteUrl(this.trackUrlList[this.current.language]), 'text', d => {
                this.tracks[this.current.language] = this._getCues(d);
                // Use `timeupdate` to update remote captions
                this.player.getElement().addEventListener('timeupdate', this.events.media.timeupdate);
            });
        } else {
            // To avoid issues with native `oncuechange` event, build new cues and use `timeupdate` event
            const cues: Cue[] = [];
            Object.keys(this.current.cues).forEach(index => {
                const i = parseInt(index, 10);
                const current = this.current.cues[i];
                cues.push({
                    endTime: current.endTime,
                    identifier: current.id,
                    settings: {},
                    startTime: current.startTime,
                    text: current.text,
                });
            });
            this.tracks[this.current.language] = cues;
            this.player.getElement().addEventListener('timeupdate', this.events.media.timeupdate);
        }
    }

    /**
     * Turn captions off.
     *
     * It removed the class from the captions container to hide any text displayed.
     *
     * @private
     * @memberof Captions
     */
    private _hide(): void {
        this.captions.classList.remove('om-captions--on');
    }

    /**
     * Search track text position using binary search algorithm.
     *
     * It determines the position of the track based on the media's current time.
     * @see https://www.geeksforgeeks.org/binary-search/
     * @private
     * @param {Cue[]} tracks
     * @param {number} currentTime
     * @returns {number}
     * @memberof Captions
     */
    private _search(tracks: Cue[], currentTime: number): number {
        let low = 0;
        let high = tracks.length - 1;
        while (low <= high) {
            const mid = ((low + high) >> 1);
            const start = tracks[mid].startTime;
            const stop = tracks[mid].endTime;

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
     * Clean HTML text.
     *
     * Prevents the triggering of script code coming from captions' text, removed styles and
     * also any potential events prefixed with `on`.
     *
     * @private
     * @param {string} html
     * @returns {string}
     * @memberof Captions
     */
    private _sanitize(html: string): string {
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