import { isIframe, isAudio, isVideo } from './utils/dom';
import Media from './media';
import Controls from './controls';

/**
 *
 * @class Player
 * @description Class that creates an Open Player instance.
 * This is the entry point for the entire plugin.
 */
class Player {
    /**
     * Creates an instance of Player.
     * @param {HTMLElement} element
     * @memberof Player
     */
    constructor(element) {
        this.element = element;
        if (this._isValid()) {
            this._prepareMedia();
            this._wrapInstance();
            this._createControls();
        }
        return this;
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
        wrapper.className = 'om-player';

        this.element.classList.remove('om-player');
        this.element.parentNode.insertBefore(wrapper, this.element);
        wrapper.appendChild(this.element);
    }

    /**
     * Build HTML markup for media controls
     *
     * @memberof Player
     */
    _createControls() {
        this.element.controls = false;
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
            this.media = new Media(this.element);
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
        const resizeIframeCallback = () => {
            const width = el.parentNode.offsetWidth;
            el.style.width = `${width}px`;
            el.style.height = `${width * el.getAttribute('data-ratio')}px`;
        };

        // This workflow is used when the aspect ratio of the media is unknown
        const ratio = el.getAttribute('height') / el.getAttribute('width');
        el.setAttribute('data-ratio', ratio);
        el.removeAttribute('width');
        el.removeAttribute('height');

        // Resize correctly on page load
        const event = new Event('resize');
        window.addEventListener('resize', resizeIframeCallback);
        window.dispatchEvent(event);
    }
}

/**
 * Entry point
 * Convert all the video/audio/iframe with 'om-player' class in a OpenMedia player
 */
Player.instances = [];
Player.init = () => {
    document.querySelectorAll('video.om-player, audio.om-player, iframe.om-player').forEach(target => {
        Player.instances.push(new Player(target));
    });
};

Player.init();
