import { HAS_MSE } from '../utils/constants';
import { loadScript } from '../utils/dom';
import { addEvent } from '../events';
import Native from "../components/native";

/**
 *
 * @class DashMedia
 * @description Class that handles the dash.js API within the player
 */
class DashMedia extends Native {
    player: MediaPlayer;

    events: object;

    /**
     * Creates an instance of DashMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {object} mediaFile
     * @memberof DashMedia
     */
    constructor(element, mediaFile) {
        super(element, mediaFile);
        /**
         * @private
         */
        function createInstance() {
            this.player = dashjs.MediaPlayer().create();
        }
        this.player = null;
        this.events = null;
        this.promise = (typeof dashjs === 'undefined') ?
            // Ever-green script
            loadScript('https://cdn.dashjs.org/latest/dash.all.min.js') :
            new Promise(resolve => {
                resolve();
            });

        this.promise.then(createInstance.bind(this));
        return this;
    }

    canPlayType(mimeType) {
        return HAS_MSE && mimeType === 'application/dash+xml' && this.media.type === mimeType;
    }

    load() {
        this.player.getDebug().setLogToBrowserConsole(false);
        this.player.initialize();
        this.player.setScheduleWhilePaused(false);
        this.player.setFastSwitchEnabled(true);
        this.player.attachView(this.element);
        this.player.setAutoPlay(false);

        // If DRM is set, load protection data
        if (typeof this.media.drm === 'object' && Object.keys(this.media.drm).length) {
            this.player.setProtectionData(this.media.drm);
            // if (isString(options.dash.robustnessLevel) && options.dash.robustnessLevel) {
            //     this.player.getProtectionController().setRobustnessLevel(options.dash.robustnessLevel);
            // }
        }
        this.player.attachSource(this.media.src);

        if (!this.events) {
            this.events = dashjs.MediaPlayer.events;
            Object.keys(this.events).forEach(event => {
                this.player.on(this.events[event], this._assign.bind(this));
            });
        }
    }

    play() {
        this.element.play();
    }

    pause() {
        this.element.pause();
    }

    destroy() {
        this._revoke();
    }

    set src(media) {
        this._revoke();
        this.player = dashjs.MediaPlayer().create();
    }

    get src() {
        return 'aaaaa';
    }

    set volume(value) {
        this.element.volume = value;
    }

    get volume() {
        return this.element.volume;
    }

    set muted(value) {
        this.element.muted = value;
    }

    get muted() {
        return this.element.muted;
    }

    /**
     * Custom M(PEG)-DASH events
     *
     * These events can be attached to the original node using addEventListener and the name of the event,
     * not using dashjs.MediaPlayer.events object
     * @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
     * @param {dashjs.MediaPlayerEvents.events} event
     */
    _assign(event) {
        if (event.type === 'error') {
            // mediaElement.generateError(event.message, node.src);
            console.error(event);
        } else {
            const e = addEvent(event.type, event);
            this.element.dispatchEvent(e);
        }
    }

    /**
     *
     *
     * @memberof DashMedia
     */
    _revoke() {
        if (this.events) {
            Object.keys(this.events).forEach(event => {
                this.player.off(this.events[event], this._assign.bind(this));
            });
            this.events = null;
        }
        this.player.reset();
    }
}

export default DashMedia;
