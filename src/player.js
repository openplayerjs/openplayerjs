class Player {
    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.element = element;
        if (this._validate()) {
            this._build();
        }
    }

    /**
     * Evaluate the attributes of the element to create player,
     * and wrap the tag inside a DIV to create responsiveness
     */
    _build() {
        const el = this.element;

        // Add wrapper div for responsive media
        const wrapper = document.createElement('div');
        wrapper.className = 'om__player-wrapper';
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);

        if (el.tagName.toLowerCase() === 'iframe') {
            this._buildResponsiveIframe();
        }
    }

    /**
     * Check if the element passed in the constructor is a valid video/audio/iframe tag
     * with 'om__player' class
     * @return {boolean}
     */
    _validate() {
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
     * Check for aspect ratio and create responsive behavior on an iframe
     */
    _buildResponsiveIframe() {
        const el = this.element;
        /**
         * @private
         */
        const resizeIframeCallback = () => {
            const width = el.parentNode.offsetWidth;
            el.style.width = `${width}px`;
            el.style.height = `${width * el.getAttribute('data-ratio')}`;
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

export default Player;
