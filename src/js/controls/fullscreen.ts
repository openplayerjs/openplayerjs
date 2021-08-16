import PlayerComponent from '../interfaces/component';
import Player from '../player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IPHONE } from '../utils/constants';
import { removeElement } from '../utils/general';

/**
 * Fullscreen element.
 *
 * @description Following the Fullscreen API, this class toggles media dimensions to present video
 * using the user's entire screen, even when the player is playing Ads.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#Fullscreen
 * @class Fullscreen
 * @implements PlayerComponent
 */
class Fullscreen implements PlayerComponent {
    /**
     * Flag to determine if fullscreen is available natively.
     *
     * @type boolean
     * @memberof Fullscreen
     */
    public fullScreenEnabled: boolean;

    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Fullscreen
     */
    #player: Player;

    /**
     * Flag to determine if media is currently being played in fullscreen mode.
     *
     * @private
     * @type boolean
     * @memberof Fullscreen
     */
    #isFullscreen: boolean;

    /**
     * Button to toggle fullscreen effect.
     *
     * @private
     * @type HTMLButtonElement
     * @memberof Fullscreen
     */
    #button: HTMLButtonElement;

    /**
     * List of events when fullscreen change is fired.
     *
     * @private
     * @type string[]
     * @memberof Fullscreen
     */
    #fullscreenEvents: string[] = [];

    /**
     * Storage for user's full screen width.
     *
     * @private
     * @type number
     * @memberof Fullscreen
     */
    #fullscreenWidth: number = 0;

    /**
     * Storage for user's full screen height.
     *
     * @private
     * @type number
     * @memberof Fullscreen
     */
    #fullscreenHeight: number = 0;

    /**
     * Callback when user clicks Fullscreen button.
     *
     * @private
     * @memberof Fullscreen
     */
    #clickEvent: () => void;

    /**
     * Default labels from player's config
     *
     * @private
     * @type object
     * @memberof Fullscreen
     */
    #labels: any;

    /**
     * Position of the button to be indicated as part of its class name
     *
     * @private
     * @type {string}
     * @memberof Fullscreen
     */
    #position: string;

    /**
     * Layer where the control item will be placed
     *
     * @private
     * @type {string}
     * @memberof Captions
     */
    #layer: string;

    /**
     * Create an instance of Fullscreen.
     *
     * @param {Player} player
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#labels = player.getOptions().labels;
        this.#position = position;
        this.#layer = layer;
        this.#isFullscreen = document.body.classList.contains('op-fullscreen__on');

        const target = (document as any);

        // Check if fullscreen is supported
        this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled ||
            target.msFullscreenEnabled || target.webkitSupportsFullscreen ||
            target.webkitFullscreenEnabled || (document.createElement('video') as any).webkitRequestFullScreen);

        this._keydownEvent = this._keydownEvent.bind(this);
        this._fullscreenChange = this._fullscreenChange.bind(this);

        this.#fullscreenEvents = [
            'fullscreenchange',
            'mozfullscreenchange',
            'webkitfullscreenchange',
            'msfullscreenchange',
        ];

        this.#fullscreenEvents.forEach(event => {
            document.addEventListener(event, this._fullscreenChange, EVENT_OPTIONS);
        });
        this._setFullscreenData(false);

        this.#player.getContainer().addEventListener('keydown', this._keydownEvent, EVENT_OPTIONS);

        // Since iPhone still doesn't accept the regular Fullscreen API, use the following events
        if (IS_IPHONE) {
            this.#player.getElement().addEventListener('webkitbeginfullscreen', () => {
                this.#isFullscreen = true;
                this._setFullscreenData(true);
                document.body.classList.add('op-fullscreen__on');
            }, EVENT_OPTIONS);
            this.#player.getElement().addEventListener('webkitendfullscreen', () => {
                this.#isFullscreen = false;
                this._setFullscreenData(false);
                document.body.classList.remove('op-fullscreen__on');
            }, EVENT_OPTIONS);
        }
        return this;
    }

    /**
     * Create a button and set global events to toggle fullscreen.
     *
     * @inheritDoc
     * @memberof Fullscreen
     */
    public create(): void {
        this.#button = document.createElement('button');
        this.#button.type = 'button';
        this.#button.className = `op-controls__fullscreen op-control__${this.#position}`;
        this.#button.tabIndex = 0;
        this.#button.title = this.#labels.fullscreen;
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-pressed', 'false');
        this.#button.setAttribute('aria-label', this.#labels.fullscreen);
        this.#button.innerHTML = `<span class="op-sr">${this.#labels.fullscreen}</span>`;

        this.#clickEvent = () => {
            this.#button.setAttribute('aria-pressed', 'true');
            this.toggleFullscreen();
        };

        this.#clickEvent = this.#clickEvent.bind(this);

        this.#button.addEventListener('click', this.#clickEvent, EVENT_OPTIONS);

        this.#player.getControls().getLayer(this.#layer).appendChild(this.#button);
    }

    /**
     *
     * @inheritDoc
     * @memberof Fullscreen
     */
    public destroy(): void {
        this.#player.getContainer().removeEventListener('keydown', this._keydownEvent);

        this.#fullscreenEvents.forEach(event => {
            document.removeEventListener(event, this._fullscreenChange);
        });
        if (IS_IPHONE) {
            this.#player.getElement().removeEventListener('webkitbeginfullscreen', () => {
                this.#isFullscreen = true;
                this._setFullscreenData(false);
                document.body.classList.add('op-fullscreen__on');
            });
            this.#player.getElement().removeEventListener('webkitendfullscreen', () => {
                this.#isFullscreen = false;
                this._setFullscreenData(true);
                document.body.classList.remove('op-fullscreen__on');
            });
        }
        this.#button.removeEventListener('click', this.#clickEvent);
        removeElement(this.#button);
    }

    /**
     * Enter/cancel fullscreen depending of browser's capabilities.
     *
     * If browser does not support native Fullscreen API, player will adjust the video
     * and its parent container's dimensions via width and height styles.
     * @memberof Fullscreen
     */
    public toggleFullscreen(): void {
        // The video is currently in fullscreen mode
        if (this.#isFullscreen) {
            const target = (document as any);
            if (target.exitFullscreen) {
                target.exitFullscreen();
            } else if (target.mozCancelFullScreen) {
                target.mozCancelFullScreen();
            } else if ((document as any).webkitCancelFullScreen) {
                target.webkitCancelFullScreen();
            } else if (target.msExitFullscreen) {
                target.msExitFullscreen();
            } else {
                this._fullscreenChange();
            }
            document.body.classList.remove('op-fullscreen__on');
        } else {
            const video = (this.#player.getElement() as any);
            this.#fullscreenWidth = window.screen.width;
            this.#fullscreenHeight = window.screen.height;

            if (video.requestFullscreen) {
                video.parentElement.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.parentElement.mozRequestFullScreen();
            } else if (video.webkitRequestFullScreen) {
                video.parentElement.webkitRequestFullScreen();
            } else if (video.msRequestFullscreen) {
                video.parentElement.msRequestFullscreen();
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            } else {
                this._fullscreenChange();
            }

            document.body.classList.add('op-fullscreen__on');
        }

        if (typeof window !== 'undefined' && (IS_ANDROID || IS_IPHONE)) {
            const screen = window.screen;
            if (screen.orientation) {
                if (!this.#isFullscreen) {
                    screen.orientation.lock('landscape');
                }
            }
        }
    }

    /**
     * Callback to toggle fullscreen for browsers that do not support native Fullscreen API.
     *
     * @private
     * @memberof Fullscreen
     */
    private _fullscreenChange(): void {
        const width = this.#isFullscreen ? 0 : this.#fullscreenWidth;
        const height = this.#isFullscreen ? 0 : this.#fullscreenHeight;
        this._setFullscreenData(!this.#isFullscreen);

        if (this.#player.isAd()) {
            this.#player.getAd().resizeAds(width, height);
        }
        this.#isFullscreen = !this.#isFullscreen;

        if (this.#isFullscreen) {
            document.body.classList.add('op-fullscreen__on');
        } else {
            document.body.classList.remove('op-fullscreen__on');
        }
        this._resize(width, height);
    }

    /**
     * Update the `data-fullscreen` of the player's container and toggle button's class
     * depending if player is on fullscreen mode or not.
     *
     * @private
     * @param {boolean} state  Whether media is fullscreen or not
     * @memberof Fullscreen
     */
    private _setFullscreenData(state: boolean): void {
        this.#player.getContainer().setAttribute('data-fullscreen', (!!state).toString());
        if (this.#button) {
            if (state) {
                this.#button.classList.add('op-controls__fullscreen--out');
            } else {
                this.#button.classList.remove('op-controls__fullscreen--out');
            }
        }
    }

    /**
     * Set dimensions for the video tag and player's container.
     *
     * @private
     * @param {?number} width The width of the media
     * @param {?number} height The height of the media
     * @memberof Fullscreen
     */
    private _resize(width?: number, height?: number): void {
        const wrapper = this.#player.getContainer();
        const video = this.#player.getElement();
        const options = this.#player.getOptions();
        let styles = '';
        if (width) {
            wrapper.style.width = '100%';
            video.style.width = '100%';
        } else if (options.width) {
            const defaultWidth = typeof options.width === 'number' ? `${options.width}px` : options.width;
            styles += `width: ${defaultWidth} !important;`;
            video.style.removeProperty('width');
        } else {
            video.style.removeProperty('width');
            wrapper.style.removeProperty('width');
        }
        if (height) {
            video.style.height = '100%';
            wrapper.style.height = '100%';
        } else if (options.height) {
            const defaultHeight = typeof options.height === 'number' ? `${options.height}px` : options.height;
            styles += `height: ${defaultHeight} !important;`;
            video.style.removeProperty('height');
        } else {
            video.style.removeProperty('height');
            wrapper.style.removeProperty('height');
        }

        if (styles) {
            wrapper.setAttribute('style', styles);
        }
    }

    /**
     * Use the `Enter` and space bar keys to go fullscreen if the focus is on player.
     *
     * @private
     * @param {KeyboardEvent} e
     * @memberof Fullscreen
     */
    private _keydownEvent(e: KeyboardEvent) {
        const key = e.which || e.keyCode || 0;
        const fullscreenBtnFocused = document?.activeElement?.classList.contains('op-controls__fullscreen');
        if (fullscreenBtnFocused && (key === 13 || key === 32)) {
            this.toggleFullscreen();
            e.preventDefault();
        }
    }
}

export default Fullscreen;
