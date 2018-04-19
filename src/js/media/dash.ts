import EventsList from '../interfaces/events-list';
import Source from '../interfaces/source';
import { HAS_MSE } from '../utils/constants';
import { addEvent } from '../utils/events';
import { loadScript } from '../utils/general';
import { isDashSource } from '../utils/media';
import Native from './native';

declare const dashjs: any;

/**
 * M(PEG)-DASH Media.
 *
 * @description Class that handles MPD files using dash.js within the player
 * @see https://github.com/Dash-Industry-Forum/dash.js/
 * @class DashMedia
 */
class DashMedia extends Native {
    /**
     *
     *
     * @private
     * @type {*}
     * @memberof DashMedia
     */
    private player: any;

    /**
     *
     *
     * @private
     * @type {EventsList}
     * @memberof DashMedia
     */
    private events: EventsList = {};

    /**
     * Creates an instance of DashMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaSource
     * @memberof DashMedia
     */
    constructor(element: HTMLMediaElement, mediaSource: Source) {
        super(element, mediaSource);
        /**
         * @private
         */
        function createInstance() {
            this.player = dashjs.MediaPlayer().create();
        }
        this.promise = (typeof dashjs === 'undefined') ?
            // Ever-green script
            loadScript('https://cdn.dashjs.org/latest/dash.all.min.js') :
            new Promise(resolve => {
                resolve();
            });

        this.promise.then(createInstance.bind(this));
        return this;
    }

    /**
     *
     *
     * @param {string} mimeType
     * @returns
     * @memberof DashMedia
     */
    public canPlayType(mimeType: string) {
        return HAS_MSE && mimeType === 'application/dash+xml';
    }

    /**
     *
     *
     * @memberof DashMedia
     */
    public load() {
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

        const e = addEvent('loadedmetadata');
        this.element.dispatchEvent(e);

        if (!this.events) {
            this.events = dashjs.MediaPlayer.events;
            Object.keys(this.events).forEach(event => {
                this.player.on(this.events[event], this._assign.bind(this));
            });
        }
    }

    /**
     *
     *
     * @memberof DashMedia
     */
    public destroy() {
        this._revoke();
    }

    /**
     *
     *
     * @memberof DashMedia
     */
    set src(media: Source) {
        if (isDashSource(media.src)) {
            this._revoke();
            this.player = dashjs.MediaPlayer().create();
            // If DRM is set, load protection data
            if (typeof media.drm === 'object' && Object.keys(this.media.drm).length) {
                this.player.setProtectionData(media.drm);
            }
            this.player.attachSource(media.src);

            this.events = dashjs.MediaPlayer.events;
            Object.keys(this.events).forEach(event => {
                this.player.on(this.events[event], this._assign.bind(this));
            });
        }
    }

    /**
     * Custom M(PEG)-DASH events
     *
     * These events can be attached to the original node using addEventListener and the name of the event,
     * not using dashjs.MediaPlayer.events object
     * @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
     * @param {dashjs.MediaPlayerEvents.events} event
     */
    private _assign(event: any) {
        if (event.type === 'error') {
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
