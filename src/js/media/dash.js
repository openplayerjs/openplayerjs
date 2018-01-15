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
     * @memberof DashMedia
     */
    constructor(element, media) {
        /**
         * @private
         */
        function createInstance() {
            this.dashPlayer = new Hls();
        }
        this.element = element;
        this.media = media;
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
        console.log(this);
    }
}

export default DashMedia;
