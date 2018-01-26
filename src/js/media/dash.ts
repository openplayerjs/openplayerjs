import Native from '../components/native';
import { addEvent } from '../events';
import { HAS_MSE } from '../utils/constants';
import { loadScript } from '../utils/dom';

declare const dashjs: any;

/**
 *
 * @class DashMedia
 * @description Class that handles the dash.js API within the player
 */
class DashMedia extends Native {
    private player: any;
    private events: object;

    /**
     * Creates an instance of DashMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {File} mediaFile
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

    protected canPlayType(mimeType) {
        return HAS_MSE && mimeType === 'application/dash+xml';
    }

    protected load() {
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

    protected destroy() {
        this._revoke();
    }

    set src(media) {
        this._revoke();
        this.player = dashjs.MediaPlayer().create();
    }

    /**
     * Custom M(PEG)-DASH events
     *
     * These events can be attached to the original node using addEventListener and the name of the event,
     * not using dashjs.MediaPlayer.events object
     * @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
     * @param {dashjs.MediaPlayerEvents.events} event
     */
    private _assign(event) {
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
    private _revoke() {
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
