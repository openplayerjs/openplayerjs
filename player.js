import Media from './src/media';

/**
 * Class that creates the OpenMedia player
 *
 * @class Player
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
            this._build();
        }
    }

    /**
     * Evaluate the attributes of the element to create player
     * @private
     * @memberof Player
     */
    _build() {
        this.media = new Media(this.element);

        try {
            this.media.load();

            this._wrapInstance();

            if (this.element.tagName.toLowerCase() === 'iframe') {
                this._buildResponsiveIframe();
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Check if the element passed in the constructor is a valid video/audio/iframe tag
     * with 'om__player' class
     * @private
     * @memberof Player
     * @return {boolean}
     */
    _isValid() {
        if (this.element instanceof HTMLElement === false) {
            return false;
        }

        if (!/^(video|audio|iframe)$/.test(this.element.tagName.toLowerCase())) {
            return false;
        }

        if (!this.element.classList.contains('om__player')) {
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
        wrapper.className = 'om__player-wrapper';

        this.element.parentNode.insertBefore(wrapper, this.element);
        wrapper.appendChild(this.element);
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
 * Convert all the video/audio/iframe with 'om__player' class in a OpenMedia player
 */
const targets = document.querySelectorAll('video.om__player, audio.om__player, iframe.om__player');
const instances = [];
for (let i = 0, total = targets.length; i < total; i++) {
    instances.push(new Player(targets[i]));
}
