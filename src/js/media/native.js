import {isAudio, isVideo} from '../utils/media';

/**
 *
 */
class NativeMedia {
    constructor(element) {
        // We need this only if browser doesn't support HLS natively
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
        this.element = element;
        this.promise = new Promise(resolve => {
            resolve();
        });
        return this;
    }

    load() {
        this.promise.then(() => {
            this.element.load();
        });
    }
}

export default NativeMedia;
