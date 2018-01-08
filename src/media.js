import HlsMedia from './hls';
import NativeMedia from './native';
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

    setSrc(url) {
        this.element.src = url;
    }

    /**
     * Check URL and process it according to its type
     *
     */
    load() {
        if (!this.url) {
            throw new TypeError('URL not set');
        }

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

        this.media.load();
    }
}

export default Media;
