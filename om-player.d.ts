// Type definitions for OpenPlayer v1.0.0
// Project: https://github.com/rafa8626/openplayer
// Definitions by: Rafael Miranda <https://github.com/rafa8626/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace OpenPlayer {
    /**
     * List of methods to be integrated on most of the player's elements.
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
     * An object that maps a list of events with callbacks.
     */
    interface EventsList {
        /**
         *
         * @type object
         */
        [key: string]: any;
    }


    /**
     * Object that contains the defaut elements for a media source.
     */
    export interface Source {
        /**
         * The path/URL to the media source.
         *
         * @type string
         */
        src: string;
        /**
         * The MIME type of the media.
         *
         * @type string
         */
        type: string;
        /**
         * Digital rights management object to allow play restricted media.
         *
         * @type object
         */
        drm?: object;
    }

    /**
     * An object that mimics the `track` tag attributes.
     */
    export interface Track {
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
     * Class that creates the Media Component in the player.
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
         * @returns {Promise}
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
        // Setters/getters
        src(media?: Source[]): Source[];
        volume(value?: number): number;
        muted(value?: boolean): boolean;
        playbackRate(value?: number): number;
        currentTime(value?: number): number;
        duration(): number;
        paused(): boolean;
        ended(): boolean;
    }

    /**
     * This class implements Google IMA SDK v3.0 to display VAST and VPAID advertisements
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
         */
        load(): void;
        /**
         * Start playing/resume Ad if `adsManager` is active.
         */
        play(): void;
        /**
         * Pause Ad if `adsManager` is active.
         */
        pause(): void;
        /**
         * Execute any callbacks to destroy Ads.
         */
        destroy(): void;
        /**
         * Change dimensions of Ad.
         *
         * @param {?number} width       The new width of the Ad's container.
         * @param {?number} height      The new height of the Ad's container.
         * @param {?string} transform   CSS `transform` property to align Ad if `fill` mode is enabled.
         */
        resizeAds(width?: number, height?: number, transform?: string): void;
        // Setters/getters
        volume(value: number): number;
        muted(value: boolean): boolean;
        currentTime(value: number): number;
        duration(): number;
        paused(): boolean;
        ended(): boolean;
    }

    /**
     * This class handles the creation/destruction of all player's control elements.
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
    }

    /**
     * This class generates controls to play native media (such as MP4, MP3, HLS, M(PEG-DASH),
     * and have a unified look-and-feel on all modern browsers (including IE11)
     */
    export class Player {
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
        // Setters/getters
        src(media?: Source[]): Source[];
        id(): string;
    }
}
