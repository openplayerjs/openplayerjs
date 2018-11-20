/**
 * Get media file extension from a URL.
 *
 * @export
 * @param {string} url  The target URL.
 * @returns {string}
 */
export function getExtension(url: string): string {
    if (typeof url !== 'string') {
        throw new Error('`url` argument must be a string');
    }

    const baseUrl = url.split('?')[0];
    const baseName = baseUrl.split('\\').pop().split('/').pop();
    return baseName.indexOf('.') > -1 ? baseName.substring(baseName.lastIndexOf('.') + 1) : '';
}

/**
 * Check if URL is an HLS element.
 *
 * @export
 * @param {string} url  The target URL.
 * @returns {boolean}
 */
export function isHlsSource(url: string): boolean {
    return /\.m3u8/i.test(url);
}

/**
 * Check if URL is an MPEG-DASH element.
 *
 * @export
 * @param {string} url  The target URL.
 * @returns {boolean}
 */
export function isDashSource(url: string): boolean {
    return /\.mpd/i.test(url);
}

/**
 * Get a base MIME type using a URL anc hecking its file extension;
 * it will default to `video/mp4` if nothing found
 *
 * @export
 * @param {string} url  The target URL to check media extension from.
 * @returns {string}
 */
export function predictType(url: string): string {
    const extension = getExtension(url);
    let type;

    // If no extension found, check if media is a vendor iframe
    if (!extension) {
        return 'video/mp4';
    }

    // Check native media types
    switch (extension) {
        case 'm3u8':
            type = 'application/x-mpegURL';
            break;
        case 'mpd':
            type = 'application/dash+xml';
            break;
        case 'mp3':
            type = 'audio/mp3';
            break;
        case 'webm':
            type = 'video/webm';
            break;
        default:
            type = 'video/mp4';
            break;
    }
    return type;
}

/**
 * Test if browser supports autoplay.
 *
 * It also checks if media requires to be muted or not, per browser's constrains.
 * @see https://raw.githubusercontent.com/googleads/googleads-ima-html5/2.11/attempt_to_autoplay/ads.js
 * @see https://github.com/Modernizr/Modernizr/issues/1095#issuecomment-304682473
 * @export
 * @param {HTMLMediaElement} media  Callback to determine if browser can autoplay.
 * @param {function} autoplay  Callback to determine if browser can autoplay.
 * @param {function} muted  Callback to determine if browser requires media to be muted.
 * @param {function} callback  Custom callback after prior checks have been run.
 */
export function isAutoplaySupported(media: HTMLMediaElement, autoplay: (n: any) => any, muted: (n: any) => any, callback: () => any): void {
    const playPromise = media.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Umuted autoplay works.
            media.pause();
            autoplay(true);
            muted(false);
            callback();
        }).catch(() => {
            // Unmuted autoplay failed. New attempt with muted autoplay.
            media.volume = 0;
            media.muted = true;
            media.play().then(() => {
                // Muted autoplay works.
                media.pause();
                autoplay(true);
                muted(true);
                callback();
            }).catch(() => {
                // Both muted and unmuted autoplay failed. Fallback to click to play.
                media.volume = 1;
                media.muted = false;
                autoplay(false);
                muted(false);
                callback();
            });
        });
    } else {
        autoplay(!media.paused || 'Promise' in window && playPromise instanceof Promise);
        media.pause();
        muted(false);
        callback();
    }
}
