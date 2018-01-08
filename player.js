import * as Utils from './src/js/utils/media';
import playIcon from './src/css/play.svg';
import muteIcon from './src/css/volume-off.svg';
import './src/css/player.css';
// import pauseIcon from './src/css/pause.svg';
// import replayIcon from './src/css/replay.svg';

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
        if (this.element instanceof HTMLElement === false) {
            return false;
        }

        if (!/^(video|audio|iframe)$/.test(this.element.tagName.toLowerCase())) {
            return false;
        }

        if (!this.element.classList.contains('om-player')) {
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
     * @memberof Player
     */
    _createControls() {
        this.element.controls = false;
        const container = document.createElement('div');
        container.className = 'om-controls';

        // Append basic buttons
        const play = document.createElement('button');
        play.type = 'button';
        play.className = 'om-controls__playpause';
        play.innerHTML = `<svg viewBox="${playIcon.viewBox}">
            <use xlink:href="#${playIcon.id}" />
        </svg> <span class="om-sr">Play/Pause</span>`;
        container.appendChild(play);

        const current = document.createElement('time');
        current.className = 'om-controls__current';
        current.innerText = this.element.currentTime;
        container.appendChild(current);

        const duration = document.createElement('time');
        duration.className = 'om-controls__duration';
        duration.innerText = this.element.duration;
        container.appendChild(duration);

        const progress = document.createElement('input');
        progress.type = 'range';
        progress.className = 'om-controls__progress';
        progress.setAttribute('min', this.element.currentTime);
        progress.setAttribute('max', this.element.duration);
        progress.setAttribute('step', 0.1);
        progress.value = 0;
        container.appendChild(progress);

        const mute = document.createElement('button');
        mute.type = 'button';
        mute.className = 'om-controls__mute';
        mute.innerHTML = `<svg viewBox="${muteIcon.viewBox}">
            <use xlink:href="#${muteIcon.id}" />
        </svg> <span class="om-sr">Mute</span>`;
        container.appendChild(mute);

        const volume = document.createElement('input');
        volume.type = 'range';
        volume.className = 'om-controls__volume';
        volume.setAttribute('min', 0);
        volume.setAttribute('max', 1);
        volume.setAttribute('step', 0.1);
        volume.value = 0.8;
        container.appendChild(volume);

        const fullscreen = document.createElement('button');
        fullscreen.type = 'button';
        fullscreen.className = 'om-controls__fullscreen';
        fullscreen.innerText = 'Fullscreen';
        container.appendChild(fullscreen);

        // Append controls to wrapper
        this.element.parentNode.appendChild(container);
    }

    /**
     * Load callbacks/events depending of media type
     * @memberof Player
     */
    _prepareMedia() {
        if (Utils.isIframe(this.element)) {
            this._buildResponsiveIframe();
        } else {
            this.element.canPlayType('');
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
const targets = document.querySelectorAll('video.om-player, audio.om-player, iframe.om-player');
const instances = [];
for (let i = 0, total = targets.length; i < total; i++) {
    instances.push(new Player(targets[i]));
}
