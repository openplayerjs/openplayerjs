import HlsMedia from './media/hls';
import NativeMedia from './media/native';

/**
 *
 */
class Media {
    constructor(element) {
        this.element = element;
        this.url = element.src || '';

        // If no single source inside tag, check first `<source>` tag
        if (!this.url) {
            const source = element.querySelector('source');
            this.url = source.src;
        }
        // Ensure that we set the URL if found
        if (this.url) {
            this.element.src = this.url;
        }

        return this;
    }

    /**
     *
     * @param {string} mimeType
     * @returns {boolean}
     */
    canPlayType(mimeType) {
        return !!(this.media.canPlayType(mimeType));
    }

    /**
     * Check URL and process it according to its type.
     *
     * It requires to run with Promises to avoid racing errors between execution of the action
     * and the time the potential libraries are loaded completely.
     *
     */
    load() {
        if (!this.url) {
            throw new TypeError('URL not set');
        }

        // @todo: Add method to grab correct MIME type
        // const mimeType = 'video/mp4';

        try {
            if (/.m3u8/.test(this.url)) {
                this.media = new HlsMedia(this.element);
            } else {
                this.media = new NativeMedia(this.element);
            }
        } catch (e) {
            if (e instanceof TypeError) {
                this.media = new NativeMedia(this.element);
            } else {
                throw e;
            }
        }

        try {
            // if (this.media.canPlayType(mimeType)) {
            //    throw new TypeError('Media cannot be played');
            // }
            this.media.promise.then(() => {
                this.media.load();
            });
        } catch (e) {
            // destroy media
            this.media.destroy();
        }
    }

    play() {
        this.promisePlay = new Promise(resolve => {
            resolve();
        }).then(() => {
            // Wait until any other Promise is resolved to execute the Play action
            this.media.promise.then(() => {
                this.media.play();
            });
        });

        return this.promisePlay;
    }

    pause() {
        this.promisePlay.then(() => {
            this.media.pause();
        });
    }

    set src(url) {
        this.element.src = url;
    }

    get src() {
        return this.element.src;
    }
}

export default Media;
