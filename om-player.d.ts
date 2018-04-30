// Type definitions for OpenPlayer v1.0.0
// Project: https://github.com/rafa8626/openplayer
// Definitions by: Rafael Miranda <https://github.com/rafa8626/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace OpenPlayer {
    /**
     * Cue
     *
     * @description Object that mimics the native HTML5 Cue.
     */
    interface Cue {
        /**
         * Time in STMP format to indicate when cue must be hidden.
         *
         * @type number
         */
        endTime: number;

        /**
         * Cue ID set in VTT file.
         *
         * @type string
         */
        identifier: string;

        /**
         * Extra attributes detected in cue (generally empty).
         *
         * @type object
         */
        settings: object;

        /**
         * Time in STMP format to indicate when cue must be displayed.
         *
         * @type number
         */
        startTime: number;

        /**
         * Text in cue to be displayed.
         *
         * @type string
         */
        text: string;
    }

    /**
     * Cue List
     *
     * @description A collection of cues per language code.
     */
    interface CueList {
        /**
         * @type object
         */
        [language: string]: Cue[];
    }

    /**
     * Track URLs
     *
     * @description A collection of track `src` URLs identified by its language code.
     */
    interface TrackURL {
        /**
         * @type object
         */
        [key: string]: string;
    }

    /**
     * Track
     *
     * @description An object that mimics the `track` tag attributes.
     */
    interface Track {
        /**
         * The language short code of the track (`en`, `es`, `pt`, etc.)
         *
         * @type string
         */
        srclang: string;

        /**
         * Path/URL to obtain track's content.
         *
         * @type string
         */
        src: string;

        /**
         * Type of track.
         *
         * Possible values (although, OpenPlayer only supports the first one):
         *  - `subtitles`
         *  - `captions`
         *  - `descriptions`
         *  - `chapters`
         *  - `metadata`
         *
         * @see https://mzl.la/2HyGCbg
         * @type string
         */
        kind: string;

        /**
         * Human-friendly name for the track to be displayed in `Settings` menu.
         *
         * @type string
         */
        label: string;

        /**
         * Flag to indicate if player should display track's content initially or not.
         *
         * @type boolean
         */
        default?: boolean;
    }

    /**
     * Settings Subitem.
     *
     * @description An element that contains a key identifier and a human-readable label
     * in the `Settings` submenus.
     */
    interface SettingsSubItem {
        /**
         *
         * @type string
         */
        key: string;

        /**
         *
         * @type string
         */
        label: string;
    }

    /**
     * Settings Submenu
     *
     * @description An element that stores the submenu identified by a unique identifier,
     * provided by the `Settings` item.
     */
    interface SettingsSubMenu {
        /**
         * @type object
         */
        [key: string]: string;
    }


    /**
     * Settings Item.
     *
     * @description An element to create elements in the `Settings` menu and submenus linked
     * to them.
     */
    interface SettingsItem {
        /**
         * Specific class name to be used for:
         * - event listeners and dispatchers
         * - specific styling
         *
         * @type string
         */
        className: string;

        /**
         * Identifier to indicate the initial value of `Settings` element when created.
         *
         * This element must exist in the `submenu` attribute (if not empty).
         * @type string
         */
        default: string;

        /**
         * Unique identifier to avoid collisions with other items.
         *
         * @type string
         */
        key: string;

        /**
         * Human-readable name of the item.
         *
         * @type string
         */
        name: string;

        /**
         * List of elements to generate a submenu linked to item.
         *
         * @type SettingsSubItem[]
         */
        subitems?: SettingsSubItem[];
    }

    /**
     * Player Component
     */
    interface PlayerComponent {
        /**
         * Create HTML and insert it into OpenPlayer's DOM.
         *
         * This method must include its events setup.
         */
        create(): void;
        /**
         * Remove HTML associated to specific OpenPlayer's element.
         *
         * This method must include the removal of its previously set events.
         */
        destroy(): void;
    }

    /**
     * Event list
     *
     * @export
     * @interface EventsList
     */
    interface EventsList {
        /**
         * @type object
         */
        [key: string]: any;
    }

    /**
     * Player instance list
     */
    interface PlayerInstanceList {
        /**
         * @type object
         */
        [id: string]: Player;
    }

    /**
     * Media source
     */
    interface Source {
        /**
         *
         * @type string
         */
        src: string;
        /**
         *
         * @type string
         */
        type: string;
        /**
         *
         * @type object
         */
        drm?: object;
    }

    /**
     * Native Media.
     *
     * @description Class that mimics the HTML5 MediaElement's standard methods.
     * All the methods are availabe for the different types of media; the exceptions
     * are the getter/setter of a source, load it and determine if media can be played,
     * since each one of the media types handle those in a different way.
     *
     * @abstract
     */
    abstract class Native {
        /**
         * Create an instance of Native.
         *
         * @param {HTMLMediaElement} element The `video/audio` source.
         * @param {Source} media The `Media` instance.
         */
        constructor(element: HTMLMediaElement, media: Source);

        /**
         * Check if player can play the current media type (MIME type).
         *
         * @abstract
         * @param {string} mimeType
         * @returns {boolean}
         */
        abstract canPlayType(mimeType: string): boolean;

        /**
         * Prepare current media to be played.
         *
         * @abstract
         * @returns {void}
         */
        abstract load(): void;

        /**
         * Execute any callbacks to destroy the current media element.
         *
         * @abstract
         * @returns {any}
         */
        abstract destroy(): any;

        /**
         * Set a new media source.
         *
         * @abstract
         * @returns {void}
         */
        abstract set src(media: Source);

        /**
         * Return the current media source.
         *
         * @abstract
         * @returns {Source}
         */
        abstract get src(): Source;

        /**
         * Play current media.
         *
         * @returns {void}
         */
        play(): void;

        /**
         * Pause current media.
         *
         * @returns {void}
         */
        pause(): void;

        /**
         * Set the current media's volume level.
         *
         * @returns {void}
         */
        set volume(value: number): void;

        /**
         * Retrieve current media's volume level.
         *
         * @returns {number}
         * @memberof Native
         */
        get volume(): number;

        /**
         * Set the current media's muted status.
         *
         * @returns {void}
         */
        set muted(value: boolean): void;

        /**
         * Retrieve the current media's muted status.
         *
         * @returns {boolean}
         */
        get muted(): boolean;

        /**
         * Set the current media's playback rate.
         *
         * @returns {void}
         */
        set playbackRate(value: number): void;

        /**
         * Retrieve the current media's playback rate.
         *
         * @returns {number}
         */
        get playbackRate(): number;

        /**
         * Set the current media's current time position.
         *
         * @returns {void}
         */
        set currentTime(value: number): void;

        /**
         * Retrieve the current media's current time position.
         *
         * @returns {number}
         */
        get currentTime(): number;

        /**
         * Retrieve the current media's current duration.
         *
         * @returns {number}
         */
        get duration(): number;

        /**
         * Retrieve the current media's paused status.
         *
         * @returns {boolean}
         */
        get paused(): boolean;

        /**
         * * Retrieve the current media's ended status.
         *
         * @returns {boolean}
         */
        get ended(): boolean;
    }

    /**
     * HTML5 Media.
     *
     * @description Class that wraps the native HTML5 media methods
     */
    class HTML5Media extends Native {
        /**
         * Creates an instance of NativeMedia.
         *
         * @param {HTMLMediaElement} element
         * @param {Source} mediaFile
         * @returns {NativeMedia}
         */
        constructor(element: HTMLMediaElement, mediaFile: Source);

        /**
         *
         * @param {string} mimeType
         * @returns {boolean}
         */
        canPlayType(mimeType: string): boolean;

        /**
         *
         * @inheritDoc
         */
        load(): void;

        /**
         *
         * @inheritDoc
         * @returns {HTML5Media}
         */
        destroy(): HTML5Media;

        /**
         *
         * @inheritDoc
         */
        set src(media: Source): void;
    }

    /**
     * HLS Media.
     *
     * @description Class that handles M3U8 files using hls.js within the player
     * @see https://github.com/video-dev/hls.js/
     */
    class HlsMedia extends Native {
        /**
         * Creates an instance of HlsMedia.
         *
         * @param {HTMLMediaElement} element
         * @param {Source} mediaSource
         */
        constructor(element: HTMLMediaElement, mediaSource: Source);

        /**
         * Provide support via hls.js if browser does not have native support for HLS
         *
         * @inheritDoc
         */
        canPlayType(mimeType: string): boolean;

        /**
         *
         * @inheritDoc
         */
        load(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;

        /**
         *
         * @inheritDoc
         */
        set src(media: Source): void;
    }

    class DashMedia extends Native {
        /**
         * Creates an instance of DashMedia.
         *
         * @param {HTMLMediaElement} element
         * @param {Source} mediaSource
         */
        constructor(element: HTMLMediaElement, mediaSource: Source);

        /**
         *
         * @inheritDoc
         */
        canPlayType(mimeType: string): boolean;

        /**
         *
         * @inheritDoc
         */
        load(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;

        /**
         *
         * @inheritDoc
         */
        set src(media: Source): void;
    }

    /**
     * Ads Media.
     *
     * @description This class implements Google IMA SDK v3.0 to display VAST and VPAID advertisements
     * @see https://developers.google.com/interactive-media-ads/
     */
    class Ads {
        /**
         * Create an instance of Ads.
         *
         * @param {Media} media
         * @param {string} adsUrl
         * @returns {Ads}
         */
        constructor(media: Media, adsUrl: string);

        /**
         * Create the Ads container and loader to process the Ads URL provided.
         *
         * @returns {void}
         */
        load(): void;

        /**
         * Start playing/resume Ad if `adsManager` is active.
         *
         * @returns {void}
         */
        play(): void;

        /**
         * Pause Ad if `adsManager` is active.
         *
         * @returns {void}
         */
        pause(): void;

        /**
         * Execute any callbacks to destroy Ads.
         *
         * @returns {void}
         */
        destroy(): void;

        /**
         * Change dimensions of Ad.
         *
         * @param {?number} width       The new width of the Ad's container.
         * @param {?number} height      The new height of the Ad's container.
         * @param {?string} transform   CSS `transform` property to align Ad if `fill` mode is enabled.
         * @returns {void}
         */
        resizeAds(width?: number, height?: number, transform?: string): void;

        /**
         * Set the current Ad's volume level.
         *
         * @returns {void}
         */
        set volume(value: number): void;

        /**
         * Retrieve current Ad's volume level.
         *
         * @returns {number}
         */
        get volume(): number;

        /**
         * Set the current Ad's muted status.
         *
         * @returns {void}
         */
        set muted(value: boolean): void;

        /**
         * Retrieve the current Ad's muted status.
         *
         * @returns {boolean}
         */
        get muted(): boolean;

        /**
         * Set the current Ad's current time position.
         *
         * @returns {void}
         */
        set currentTime(value: number): void;

        /**
         * Retrieve the current Ad's current time position.
         *
         * @returns {number}
         * @memberof Ads
         */
        get currentTime(): number;

        /**
         * Retrieve the current Ad's duration.
         *
         * @returns {number}
         */
        get duration(): number;

        /**
         * Retrieve the current Ad's paused status.
         *
         * @returns {boolean}
         */
        get paused(): boolean;

        /**
         * Retrieve the current Ad's ended status.
         *
         * @returns {boolean}
         */
        get ended(): boolean;
    }

    /**
     * Closed Captions element.
     *
     * @description Using `<track>` tags, this class allows the displaying of both local and remote captions
     * bypassing CORS, and without the use of the `crossorigin` attribute.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
     * @see https://www.html5rocks.com/en/tutorials/track/basics/
     */
    class Captions implements PlayerComponent {
        /**
         * Create an instance of Captions.
         *
         * @param {Player} player
         * @returns {Captions}
         */
        constructor(player: Player);

        /**
         * Create a button and a container to display captions if tracks are detected.
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;

        /**
         * Add list of available captions in the `Settings` menu.
         *
         * @returns {SettingsItem|object}
         */
        addSettings(): SettingsItem | object;
    }

    /**
     * Fullscreen element.
     *
     * @description Following the Fullscreen API, this class toggles media dimensions to present video
     * using the user's entire screen, even when the player is playing Ads.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
     * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#Fullscreen
     */
    class Fullscreen implements PlayerComponent {
        /**
         * Create an instance of Fullscreen.
         *
         * @param {Player} player
         * @returns {Fullscreen}
         */
        constructor(player: Player);

        /**
         * Create a button and set global events to toggle fullscreen.
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;

        /**
         * Enter/cancel fullscreen depending of browser's capabilities.
         *
         * If browser does not support native Fullscreen API, player will adjust the video
         * and its parent container's dimensions via width and height styles.
         */
        toggleFullscreen(): void;
    }

    /**
     * Play/pause element.
     *
     * @description This class controls the state of the media, by playing or pausing it, and
     * when it ends, updates the state to replay the current media.
     * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#PlayPause
     */
    class Play implements PlayerComponent {
        /**
         * Create an instance of Play.
         *
         * @param {Player} player
         * @returns {Play}
         */
        constructor(player: Player);

        /**
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;
    }

    /**
     * Progress bar element.
     *
     * @description This class creates a progress bar to track how much time media has been played,
     * downloaded and its current time, using `semantic markup`, such as input range and progress elements.
     * @see https://codepen.io/mi-lee/post/an-overview-of-html5-semantics
     * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#Progress
     * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/buffering_seeking_time_ranges
    */
    class Progress implements PlayerComponent {
        /**
         * Create an instance of Progress.
         *
         * @param {Player} player
         * @returns {Progress}
         */
        constructor(player: Player);

        /**
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;
    }

    /**
     * Settings element.
     *
     * @description This class creates a menu of options to manipulate media that cannot
     * be placed in the main control necessarily (such as different captions associated with media,
     * levels of speed to play media, etc.)
     * This element is based on YouTube's Settings element.
     */
    class Settings implements PlayerComponent {
        /**
         * Create an instance of Settings.
         *
         * @param {Player} player
         * @returns {Settings}
         */
        constructor(player: Player);

        /**
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;

        /**
         * Build `Settings` default option: media speed levels
         *
         * @returns {SettingItem}
         */
        addSettings(): SettingsItem;

        /**
         * Add a new element and subelements to Setting's menu.
         *
         * The subelements will be transformed in HTML output, and this will be cached via
         * `Settings.submenu` element. A global event will be associated with the newly
         * added elements.
         *
         * @param {string} name  The name of the Settings element.
         * @param {string} key  Identifier to generate unique Settings' items and subitems.
         * @param {string} defaultValue  It can represent a number or a string.
         * @param {?SettingsSubItem[]} submenu  A collection of subitems.
         * @param {?string} className  A specific class to trigger events on submenu items.
         */
        addItem(name: string, key: string, defaultValue: string, submenu?: SettingsSubItem[], className?: string): void;
    }

    /**
     * Time element.
     *
     * @description Class that renders media's current time and duration in human-readable format
     * (hh:mm:ss), and if media is a live streaming, a `Live Broadcast` message will be displayed.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration
     */
    class Time implements PlayerComponent {
        /**
         * Create an instance of Time.
         *
         * @param {Player} player
         * @returns {Time}
         */
        constructor(player: Player);

        /**
         * When no duration (Infinity) is detected, the `Live Broadcast` will be displayed.
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         * @memberof Time
         */
        destroy(): void;
    }

    /**
     * Volume controller element.
     *
     * @description This class controls the media's volume level using `semantic markup`,
     * such as input range and progress elements.
     * @see https://codepen.io/mi-lee/post/an-overview-of-html5-semantics
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume
     * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#Volume
     */
    class Volume implements PlayerComponent {
        /**
         * Create an instance of Volume.
         *
         * @param {Player} player
         * @returns {Volume}
         */
        constructor(player: Player);

        /**
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;
    }

    /**
     * Controls element.
     *
     * @description This class handles the creation/destruction of all player's control elements.
     */
    class Controls implements PlayerComponent {
        /**
         * Create an instance of Controls.
         *
         * @param {Player} player
         * @returns {Controls}
         */
        constructor(player: Player);

        /**
         *
         * @inheritDoc
         */
        create(): void;

        /**
         *
         * @inheritDoc
         */
        destroy(): void;

        /**
         * Retrieve the main container of all control elements, to add/remove them in latter steps.
         *
         * @returns {HTMLDivElement}
         */
        getContainer(): HTMLDivElement;

        /**
         * Retrieve an instance of Fullscreen object.
         *
         * @returns {Fullscreen}
         */
        getFullscreen(): Fullscreen;
    }

    /**
     * Media element.
     *
     * @description Class that creates the Media Component in the player.
     * `Media` is the visual/audio entity that results from playing  a valid source (MP4, MP3, M3U8, MPD, etc.)
     */
    class Media {
        /**
         * Create an instance of Media.
         *
         * @param {HTMLMediaElement} element
         * @returns {Media}
         */
        constructor(element: HTMLMediaElement);

        /**
         * Check if player can play the current media type (MIME type).
         *
         * @param {string} mimeType  A valid MIME type, that can include codecs.
         * @returns {boolean}
         */
        canPlayType(mimeType: string): boolean;

        /**
         * Check media associated and process it according to its type.
         *
         * It requires to run with Promises to avoid racing errors between execution of the action
         * and the time the potential libraries are loaded completely.
         * It will loop the media list found until it reached the first element that can be played.
         */
        load(): void;

        /**
         * Wrapper for `play` method.
         *
         * It returns a Promise to avoid browser's race issues when attempting to pause media.
         * @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
         * @returns {Promise<void>}
         */
        play(): Promise<void>;

        /**
         * Wrapper for `pause` method.
         *
         * It checks if play Promise has been resolved in order to trigger pause
         * to avoid browser's race issues.
         * @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
         */
        pause(): void;

        /**
         * Invoke `destroy` method of current media type.
         *
         * Streaming that uses hls.js or dash.js libraries require to destroy their players and
         * their custom events.
         */
        destroy(): void;

        set src(media);
        get src(): Source[];
        set volume(value): void;
        get volume(): number;
        set muted(value): void;
        get muted(): boolean;
        get playbackRate(): number;
        set playbackRate(value): void;
        set currentTime(value: number): void;
        get currentTime(): number;
        get duration(): number;
        get paused(): boolean;
        get ended(): boolean;
    }

    /**
     * OpenMedia Player.
     *
     * @description This class generates controls to play native media (such as MP4, MP3, HLS, M(PEG-DASH),
     * and have a unified look-and-feel on all modern browsers (including IE11)
     */
    class Player {
        /**
         * Convert all the video/audio tags with `om-player` class in a OpenMedia player instance.
         */
        static init(): void;

        /**
         * Create an instance of Player.
         *
         * @param {(HTMLMediaElement|string)} element  A video/audio tag or its identifier.
         * @param {?string} adsUrl  A URL to play Ads via Google IMA SDK.
         * @param {?boolean} fill  Determine if video should be scaled and scrop to fit container.
         * @returns {Player}
         */
        constructor(element: HTMLMediaElement | string, adsUrl?: string, fill?: boolean);

        /**
         * Create all the markup and events needed for the player.
         *
         * Note that no controls will be created if user is trying to instantiate a video element
         * in an iPhone, because iOS will only use QuickTime as a default constrain.
         */
        init(): void;

        /**
         * Load media.
         *
         * HLS and M(PEG)-DASH perform more operations during loading if browser does not support them natively.
         */
        load(): void;

        /**
         * Play media.
         *
         * If Ads are detected, different methods than the native ones are triggered with this operation.
         */
        play(): void;

        /**
         * Pause media.
         *
         * If Ads are detected, different methods than the native ones are triggered with this operation.
         */
        pause(): void;

        /**
         * Destroy OpenMedia Player instance (including all events associated) and return the
         * video/audio tag to its original state.
         */
        destroy(): void;

        /**
         * Retrieve the parent element (with `om-player` class) of the native video/audio tag.
         *
         * This element is mostly useful to attach other player component's markup in a place
         * different than the controls bar.
         * @returns {HTMLElement}
         */
        getContainer(): HTMLElement;

        /**
         * Retrieve an instance of the controls object used in the player instance.
         *
         * This element is mostly useful to attach other player component's markup in the controls bar.
         * @returns {Controls}
         */
        getControls(): Controls;

        /**
         * Retrieve the original video/audio tag.
         *
         * This element is useful to attach different events in other player's components.
         * @returns {HTMLMediaElement}
         */
        getElement(): HTMLMediaElement;

        /**
         * Retrieve the events attached to the player.
         *
         * This list does not include individual events associated with other player's components.
         * @returns {EventsList}
         */
        getEvents(): EventsList;

        /**
         * Retrieve the current media object (could be Ads or any other media type).
         *
         * @returns {(Ads|Media)}
         */
        activeElement(): Ads | Media;

        /**
         * Check if current media is an instance of a native media type.
         *
         * @returns {boolean}
         */
        isMedia(): boolean;

        /**
         * Check if current media is an instance of an Ad.
         *
         * @returns {boolean}
         */
        isAd(): boolean;

        /**
         * Retrieve an instance of the `Media` object.
         *
         * @returns {Media}
         */
        getMedia(): Media;

        /**
         * Retrieve an instance of the `Ads` object.
         *
         * @returns {Ads}
         */
        getAd(): Ads;

        /**
         * Append a new `<track>` tag to the video/audio tag and dispatch event
         * so it gets registered/loaded in the player, via `controlschanged` event.
         *
         * @param {Track} args
         */
        addCaptions(args: Track): void;

        /**
         * Set a Source object to the current media.
         */
        set src(media: Source[]): void;

        /**
         * Retrieve the current Source list associated with the player.
         *
         * @type Source[]
         * @readonly
         */
        get src(): Source[];

        /**
         * Retrieve current player's unique identifier.
         *
         * @type string
         * @readonly
         */
        get id(): string;
    }
}