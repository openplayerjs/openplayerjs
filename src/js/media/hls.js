import {loadScript} from '../utils/dom';

/**
 * Class that creates the setup to play HLS using hls.js library
 *
 * @class MediaHls
 */
class MediaHls {
    /**
     * Creates an instance of MediaHls.
     * @memberof MediaHls
     * @return {MediaHls}
     */
    constructor() {
        this.promise = null;

        function createPlayer() {
            this._createPlayer();
        }

        this.promise = (typeof Hls === 'undefined') ?
            loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest') :
            new Promise(resolve => {
                resolve();
            });

        this.promise.then(createPlayer);
        return this;
    }
}

export default MediaHls;
