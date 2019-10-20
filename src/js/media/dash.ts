import DashOptions from '../interfaces/dash-options';
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
     * Instance of dashjs player.
     *
     * @type dashjs
     * @memberof DashMedia
     */
    private player: any;

    /**
     * DashJS events that will be triggered in Player.
     *
     * @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
     * @type EventsList
     * @memberof DashMedia
     */
    private events: EventsList = {};

    private options: DashOptions;

    /**
     * Creates an instance of DashMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {Source} mediaSource
     * @memberof DashMedia
     */
    constructor(element: HTMLMediaElement, mediaSource: Source, options?: DashOptions) {
        super(element, mediaSource);
        this.options = options;

        /**
         * @private
         */
        function createInstance() {
            this.player = dashjs.MediaPlayer().create();
        }
        this.promise = (typeof dashjs === 'undefined') ?
            // Ever-green script
            loadScript('https://cdn.dashjs.org/latest/dash.all.min.js') :
            new Promise(resolve => resolve());

        this.promise.then(createInstance.bind(this));
        return this;
    }

    /**
     *
     * @inheritDoc
     * @memberof DashMedia
     */
    public canPlayType(mimeType: string) {
        return HAS_MSE && mimeType === 'application/dash+xml';
    }

    /**
     *
     * @inheritDoc
     * @memberof DashMedia
     */
    public load() {
        this._preparePlayer();
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
     * @inheritDoc
     * @memberof DashMedia
     */
    public destroy() {
        this._revoke();
    }

    /**
     *
     * @inheritDoc
     * @memberof DashMedia
     */
    set src(media: Source) {
        if (isDashSource(media)) {
            this._revoke();
            this.player = dashjs.MediaPlayer().create();
            this._preparePlayer();
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
    private _assign(event: any): void {
        if (event.type === 'error') {
            const details = {
                detail: {
                    type: `M(PEG)-DASH`,
                    message: event,
                },
            };
            const errorEvent = addEvent('playererror', { ...details });
            this.element.dispatchEvent(errorEvent);
        } else {
            const e = addEvent(event.type, event);
            this.element.dispatchEvent(e);
        }
    }

    /**
     * Remove all dash.js events and destroy dashjs player instance.
     *
     * @memberof DashMedia
     */
    private _revoke(): void {
        if (this.events) {
            Object.keys(this.events).forEach(event => {
                this.player.off(this.events[event], this._assign.bind(this));
            });
            this.events = null;
        }
        this.player.reset();
    }

    /**
     * Set player with proper configuration to have better performance.
     *
     * Also, considers the addition of DRM settings.
     *
     * @memberof DashMedia
     */
    private _preparePlayer() {
        this.player.getDebug().setLogToBrowserConsole(false);
        this.player.initialize();
        this.player.setScheduleWhilePaused(false);
        this.player.setFastSwitchEnabled(true);
        this.player.attachView(this.element);
        this.player.setAutoPlay(false);

        // If DRM is set, load protection data
        if (this.options && typeof this.options.drm === 'object' && Object.keys(this.options.drm).length) {
            this.player.setProtectionData(this.options.drm);
            if (this.options.robustnessLevel && this.options.robustnessLevel) {
                this.player.getProtectionController().setRobustnessLevel(this.options.robustnessLevel);
            }
        }
    }
}

export default DashMedia;
