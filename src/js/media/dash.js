import { HAS_MSE } from '../utils/constants';
import { loadScript } from '../utils/dom';
import { addEvent } from '../events';

/**
 *
 * @class DashMedia
 * @description Class that handles the dash.js API within the player
 */
class DashMedia {
    /**
     * Creates an instance of DashMedia.
     *
     * @param {HTMLElement} element
     * @param {object} mediaFile
     * @memberof DashMedia
     */
    constructor(element, mediaFile) {
        /**
         * @private
         */
        function createInstance() {
            this.dashPlayer = dashjs.MediaPlayer().create();
        }
        this.element = element;
        this.media = mediaFile;
        this.dashPlayer = null;
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
        this.dashPlayer.getDebug().setLogToBrowserConsole(false);
        this.dashPlayer.initialize();
        this.dashPlayer.setScheduleWhilePaused(false);
        this.dashPlayer.setFastSwitchEnabled(true);
        this.dashPlayer.attachView(this.element);
        this.dashPlayer.setAutoPlay(false);

        // If DRM is set, load protection data
        if (typeof this.media.drm === 'object' && Object.keys(this.media.drm).length) {
            this.dashPlayer.setProtectionData(this.media.drm);
            // if (isString(options.dash.robustnessLevel) && options.dash.robustnessLevel) {
            //     this.dashPlayer.getProtectionController().setRobustnessLevel(options.dash.robustnessLevel);
            // }
        }
        this.dashPlayer.attachSource(this.media.src);

        if (!this.events) {
            this.events = dashjs.MediaPlayer.events;
            Object.keys(this.events).forEach(event => {
                this.dashPlayer.on(this.events[event], this._assign.bind(this));
            });
        }
    }

    destroy() {
        this._revoke();
    }

    set src(media) {
        this._revoke();
        this.dashPlayer = dashjs.MediaPlayer().create();
    }

    /**
     * Custom M(PEG)-DASH events
     *
     * These events can be attached to the original node using addEventListener and the name of the event,
     * not using dashjs.MediaPlayer.events object
     * @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
     * @param {MediaPlayerEvents} event
     */
    _assign(event) {
        if (event.type === 'error') {
            // mediaElement.generateError(event.message, node.src);
            console.error(e);
        } else {
            const e = addEvent(event.type);
            e.data = event;
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
                this.dashPlayer.off(this.events[event], this._assign.bind(this));
            });
            this.events = null;
        }
        this.dashPlayer.reset();
    }
}

export default DashMedia;
