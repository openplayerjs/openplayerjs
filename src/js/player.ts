import { isIframe, isAudio, isVideo } from './utils/dom';
import Media from './media';
import Controls from './controls';
import '../css/player.css';

/**
 *
 * @class Player
 * @description Class that creates an Open Player instance.
 * This is the entry point for the entire plugin.
 */
class Player {
    /**
     * @type Player[]
     */
    instances: Player[];
    /**
     * @type HTMLMediaElement
     */
    element: HTMLMediaElement|HTMLIFrameElement;

    /**
     * @type Object
     */
    ads: Object;

    /**
     * @type Media
     */
    media: Media;

    /**
     * Creates an instance of Player.
     * @param {HTMLMediaElement|HTMLIFrameElement} element
     * @memberof Player
     */
    constructor(element, ads) {
        this.element = element;
        this.ads = ads;
        if (this._isValid()) {
            this._prepareMedia();
            this._wrapInstance();
            this._createControls();
        }
        return this;
    }

    /**
     * Entry point
     * Convert all the video/audio/iframe tags with `om-player` class in a OpenMedia player
     */
    static init() {
        document.querySelectorAll('video.om-player, audio.om-player, iframe.om-player').forEach(target => {
            new Player(target, target.getAttribute('data-om-ads'));
        });
    }

    /**
     * Check if the element passed in the constructor is a valid video/audio/iframe tag
     * with 'om-player' class
     * @private
     * @memberof Player
     * @return {boolean}
     */
    _isValid() {
        const el = this.element;

        if (el instanceof HTMLElement === false) {
            return false;
        }

        if (!isAudio(el) && !isVideo(el) && !isIframe(el)) {
            return false;
        }

        if (!el.classList.contains('om-player')) {
            return false;
        }

        return true;
    }

    /**
     * Wrap media instance within a DIV
     * @private
     * @memberof Player
     */
    _wrapInstance() {
        const wrapper = document.createElement('div');
        wrapper.className = 'om-player om-player__keyboard--inactive';
        wrapper.className += isAudio(this.element) ? ' om-player__audio' : ' om-player__video';

        this.element.classList.remove('om-player');
        this.element.parentNode.insertBefore(wrapper, this.element);
        wrapper.appendChild(this.element);

        wrapper.addEventListener('keydown', () => {
            if (wrapper.classList.contains('om-player__keyboard--inactive')) {
                wrapper.classList.remove('om-player__keyboard--inactive');
            }
        });

        wrapper.addEventListener('click', () => {
            if (!wrapper.classList.contains('om-player__keyboard--inactive')) {
                wrapper.classList.add('om-player__keyboard--inactive');
            }
        });
    }

    /**
     * Build HTML markup for media controls
     *
     * @memberof Player
     */
    _createControls() {
        const controls = new Controls(this.media);
        controls.prepare();
        controls.render();
    }

    /**
     * Load callbacks/events depending of media type
     *
     * @memberof Player
     */
    _prepareMedia() {
        try {
            this.media = new Media(this.element, this.ads);
            this.media.load();

            if (isIframe(this.element)) {
                this._buildResponsiveIframe();
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Check for aspect ratio and create responsive behavior on an iframe
     * @private
     * @memberof Player
     */
    _buildResponsiveIframe() {
        const el = this.element;
        /**
         * Change dimensions of iframe when resizing window
         * @private
         */
        const resizeIframeCallback = (): void => {
            const width = (<HTMLElement>el.parentNode).offsetWidth;
            const height = width * parseFloat(el.getAttribute('data-ratio'));
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
        };

        // This workflow is used when the aspect ratio of the media is unknown
        const ratio = parseFloat(el.getAttribute('height')) / parseFloat(el.getAttribute('width'));
        el.setAttribute('data-ratio', `${ratio}`);
        el.removeAttribute('width');
        el.removeAttribute('height');

        // Resize correctly on page load
        const event = new Event('resize');
        window.addEventListener('resize', resizeIframeCallback);
        window.dispatchEvent(event);
    }
}

Player.init();
