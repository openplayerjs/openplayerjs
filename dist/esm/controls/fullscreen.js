import { EVENT_OPTIONS, IS_ANDROID, IS_IPHONE } from '../utils/constants';
class Fullscreen {
    fullScreenEnabled;
    #player;
    #isFullscreen;
    #button;
    #fullscreenEvents = [];
    #fullscreenWidth = 0;
    #fullscreenHeight = 0;
    #clickEvent;
    #controlPosition;
    #controlLayer;
    constructor(player, position, layer) {
        this.#player = player;
        this.#controlPosition = position;
        this.#controlLayer = layer;
        this.#isFullscreen = document.body.classList.contains('op-fullscreen__on');
        const target = document;
        this.fullScreenEnabled = !!(target.fullscreenEnabled ||
            target.mozFullScreenEnabled ||
            target.msFullscreenEnabled ||
            target.webkitSupportsFullscreen ||
            target.webkitFullscreenEnabled ||
            document.createElement('video').webkitRequestFullScreen);
        this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
        this._resize = this._resize.bind(this);
        this._fullscreenChange = this._fullscreenChange.bind(this);
        this._setFullscreen = this._setFullscreen.bind(this);
        this._unsetFullscreen = this._unsetFullscreen.bind(this);
        this.#fullscreenEvents = [
            'fullscreenchange',
            'mozfullscreenchange',
            'webkitfullscreenchange',
            'msfullscreenchange',
        ];
        this.#fullscreenEvents.forEach((event) => {
            document.addEventListener(event, this._fullscreenChange, EVENT_OPTIONS);
        });
        this._setFullscreenData(false);
        this.#player.getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);
        if (IS_IPHONE) {
            this.#player.getElement().addEventListener('webkitbeginfullscreen', this._setFullscreen, EVENT_OPTIONS);
            this.#player.getElement().addEventListener('webkitendfullscreen', this._unsetFullscreen, EVENT_OPTIONS);
        }
    }
    create() {
        const { labels } = this.#player.getOptions();
        this.#button = document.createElement('button');
        this.#button.type = 'button';
        this.#button.className = `op-controls__fullscreen op-control__${this.#controlPosition}`;
        this.#button.tabIndex = 0;
        this.#button.title = labels?.fullscreen || '';
        this.#button.setAttribute('aria-controls', this.#player.id);
        this.#button.setAttribute('aria-pressed', 'false');
        this.#button.setAttribute('aria-label', labels?.fullscreen || '');
        this.#clickEvent = () => {
            this.#button.setAttribute('aria-pressed', 'true');
            this.toggleFullscreen();
        };
        this.#clickEvent = this.#clickEvent.bind(this);
        this.#button.addEventListener('click', this.#clickEvent, EVENT_OPTIONS);
        this.#player.getControls().getLayer(this.#controlLayer).appendChild(this.#button);
    }
    destroy() {
        this.#player.getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);
        this.#fullscreenEvents.forEach((event) => {
            document.removeEventListener(event, this._fullscreenChange);
        });
        if (IS_IPHONE) {
            this.#player.getElement().removeEventListener('webkitbeginfullscreen', this._setFullscreen);
            this.#player.getElement().removeEventListener('webkitendfullscreen', this._unsetFullscreen);
        }
        this.#button.removeEventListener('click', this.#clickEvent);
        this.#button.remove();
    }
    toggleFullscreen() {
        if (this.#isFullscreen) {
            const target = document;
            if (target.exitFullscreen) {
                target.exitFullscreen();
            }
            else if (target.mozCancelFullScreen) {
                target.mozCancelFullScreen();
            }
            else if (target.webkitCancelFullScreen) {
                target.webkitCancelFullScreen();
            }
            else if (target.msExitFullscreen) {
                target.msExitFullscreen();
            }
            else {
                this._fullscreenChange();
            }
            document.body.classList.remove('op-fullscreen__on');
        }
        else {
            const video = this.#player.getElement();
            this.#fullscreenWidth = window.screen.width;
            this.#fullscreenHeight = window.screen.height;
            if (video.requestFullscreen) {
                video.parentElement.requestFullscreen();
            }
            else if (video.mozRequestFullScreen) {
                video.parentElement.mozRequestFullScreen();
            }
            else if (video.webkitRequestFullScreen) {
                video.parentElement.webkitRequestFullScreen();
            }
            else if (video.msRequestFullscreen) {
                video.parentElement.msRequestFullscreen();
            }
            else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            }
            else {
                this._fullscreenChange();
            }
            document.body.classList.add('op-fullscreen__on');
        }
        if (typeof window !== 'undefined' && (IS_ANDROID || IS_IPHONE)) {
            const { screen } = window;
            if (screen.orientation && !this.#isFullscreen) {
                screen.orientation.lock('landscape');
            }
        }
    }
    _fullscreenChange() {
        const width = this.#isFullscreen ? undefined : this.#fullscreenWidth;
        const height = this.#isFullscreen ? undefined : this.#fullscreenHeight;
        this._setFullscreenData(!this.#isFullscreen);
        if (this.#player.isAd()) {
            this.#player.getAd().resizeAds(width, height);
        }
        this.#isFullscreen = !this.#isFullscreen;
        if (this.#isFullscreen) {
            document.body.classList.add('op-fullscreen__on');
        }
        else {
            document.body.classList.remove('op-fullscreen__on');
        }
        this._resize(width, height);
    }
    _setFullscreenData(isFullscreen) {
        this.#player.getContainer().setAttribute('data-fullscreen', (!!isFullscreen).toString());
        if (this.#button) {
            if (isFullscreen) {
                this.#button.classList.add('op-controls__fullscreen--out');
            }
            else {
                this.#button.classList.remove('op-controls__fullscreen--out');
            }
        }
    }
    _resize(width, height) {
        const wrapper = this.#player.getContainer();
        const video = this.#player.getElement();
        const options = this.#player.getOptions();
        let styles = '';
        if (width) {
            wrapper.style.width = '100%';
            video.style.width = '100%';
        }
        else if (options.width) {
            const defaultWidth = typeof options.width === 'number' ? `${options.width}px` : options.width;
            styles += `width: ${defaultWidth} !important;`;
            video.style.removeProperty('width');
        }
        else {
            video.style.removeProperty('width');
            wrapper.style.removeProperty('width');
        }
        if (height) {
            video.style.height = '100%';
            wrapper.style.height = '100%';
        }
        else if (options.height) {
            const defaultHeight = typeof options.height === 'number' ? `${options.height}px` : options.height;
            styles += `height: ${defaultHeight} !important;`;
            video.style.removeProperty('height');
        }
        else {
            video.style.removeProperty('height');
            wrapper.style.removeProperty('height');
        }
        if (styles) {
            wrapper.setAttribute('style', styles);
        }
    }
    _enterSpaceKeyEvent(e) {
        const key = e.which || e.keyCode || 0;
        const fullscreenBtnFocused = document?.activeElement?.classList.contains('op-controls__fullscreen');
        if (fullscreenBtnFocused && (key === 13 || key === 32)) {
            this.toggleFullscreen();
            e.preventDefault();
            e.stopPropagation();
        }
    }
    _setFullscreen() {
        this.#isFullscreen = true;
        this._setFullscreenData(true);
        document.body.classList.add('op-fullscreen__on');
    }
    _unsetFullscreen() {
        this.#isFullscreen = false;
        this._setFullscreenData(false);
        document.body.classList.remove('op-fullscreen__on');
    }
}
export default Fullscreen;
