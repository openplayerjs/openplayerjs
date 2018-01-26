/**
 * Get media file extension from URL
 *
 * @export
 * @param {string} url
 * @returns {string}
 */
export function getExtension(url: string) {
    if (typeof url !== 'string') {
        throw new Error('`url` argument must be a string');
    }

    const baseUrl = url.split('?')[0];
    const baseName = baseUrl.split('\\').pop().split('/').pop();
    return baseName.indexOf('.') > -1 ? baseName.substring(baseName.lastIndexOf('.') + 1) : '';
}

/**
 * Check if URL is an HLS element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isHlsSource(url: string) {
    return /\.m3u8/i.test(url);
}

/**
 * Check if URL is an MPEG-DASH element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isDashSource(url: string) {
    return /\.mpd/i.test(url);
}

/**
 * Check if URL is a YouTube element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isYouTubeSource(url: string) {
    return /\/\/(www\.youtube|youtu\.?be)/i.test(url);
}
/**
 * Check if URL is a Vimeo element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isVimeoSource(url: string) {
    return /(\/\/player\.vimeo|vimeo\.com)/i.test(url);
}

/**
 * Check if URL is a Twitch element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isTwitchSource(url: string) {
    return /\/\/(www|player).twitch.tv/i.test(url);
}

/**
 * Check if URL is a Facebook element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isFacebookSource(url: string) {
    return url.toLowerCase().indexOf('//www.facebook') > -1;
}

/**
 * Check if URL is a Dailymotion element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isDailymotionSource(url: string) {
    return /\/\/((www\.)?dailymotion\.com|dai\.ly)/i.test(url);
}
/**
 * Get a base MIME type using a URL anc hecking its file extension;
 * it will default to `video/mp4` if nothing found
 *
 * @export
 * @param {string} url
 * @returns {string}
 */
export function predictType(url: string) {
    const extension = getExtension(url);
    let type;

    // If no extension found, check if media is a vendor iframe
    if (!extension) {
        if (isDailymotionSource(url)) {
            return 'video/x-dailymotion';
        }
        if (isFacebookSource(url)) {
            return 'video/x-facebook';
        }
        if (isTwitchSource(url)) {
            return 'video/x-twitch';
        }
        if (isVimeoSource(url)) {
            return 'video/x-vimeo';
        }
        if (isYouTubeSource(url)) {
            return 'video/x-youtube';
        }
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
        default:
            type = 'video/mp4';
            break;
    }
    return type;
}
