import {loadScript} from '../utils/dom';

/**
 * Class that handles the dash.js API within the player
 *
 * @class DashMedia
 */
class DashMedia {
    /**
     * Creates an instance of DashMedia.
     *
     * @param {HTMLElement} element
     * @param {object} media
     * @param {object?} drm
     * @memberof DashMedia
     */
    constructor(element, media, drm) {
        /**
         * @private
         */
        function createInstance() {
            this.dashPlayer = dashjs.MediaPlayer().create();
        }
        this.element = element;
        this.media = media;
        this.drm = drm;
        this.dashPlayer = null;
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
        return mimeType === 'application/dash+xml' && this.media.type === mimeType;
    }

    load() {
        this.dashPlayer.getDebug().setLogToBrowserConsole(false);
        this.dashPlayer.initialize();
        this.dashPlayer.setScheduleWhilePaused(false);
        this.dashPlayer.setFastSwitchEnabled(true);
        this.dashPlayer.attachView(this.element);
        this.dashPlayer.setAutoPlay(false);

        // If DRM is set, load protection data
        if (typeof this.drm === 'object' && Object.keys(this.drm).length) {
            this.dashPlayer.setProtectionData(this.drm);
            // if (isString(options.dash.robustnessLevel) && options.dash.robustnessLevel) {
            //     this.dashPlayer.getProtectionController().setRobustnessLevel(options.dash.robustnessLevel);
            // }
        }
        this.dashPlayer.attachSource(this.media.src);
    }

    play() {
        this.element.play();
    }

    pause() {
        this.element.pause();
    }
}

export default DashMedia;
