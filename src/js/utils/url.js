/**
 * Get media file extension from URL
 *
 * @export
 * @param {string} url
 * @returns {string}
 */
export function getExtension(url) {
    if (typeof url !== 'string') {
        throw new Error('`url` argument must be a string');
    }

    const baseUrl = url.split('?')[0];
    const baseName = baseUrl.split('\\').pop().split('/').pop();
    return baseName.indexOf('.') > -1 ? baseName.substring(baseName.lastIndexOf('.') + 1) : '';
}

/**
 * Return MIME type ignoring the codec string
 * i.e., `video/mp4; codecs="avc1.42E01E, mp4a.40.2"` becomes `video/mp4`
 *
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#the-source-element
 * @export
 * @param {string} type
 * @returns {string}
 */
export function getMimeType(type) {
    if (typeof type !== 'string') {
        throw new Error('`type` argument must be a string');
    }

    return (type && type.indexOf(';') > -1) ? type.substr(0, type.indexOf(';')) : type;
}

/**
 * Check if URL is a YouTube element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isYouTubeSource(url) {
    return /\/\/(www\.youtube|youtu\.?be)/i.test(url);
}
/**
 * Check if URL is a Vimeo element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isVimeoSource(url) {
    return /(\/\/player\.vimeo|vimeo\.com)/i.test(url);
}

/**
 * Check if URL is a Twitch element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isTwitchSource(url) {
    return /\/\/(www|player).twitch.tv/i.test(url);
}

/**
 * Check if URL is a Facebook element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isFacebookSource(url) {
    return url.toLowerCase().indexOf('//www.facebook') > -1;
}

/**
 * Check if URL is a Dailymotion element
 *
 * @export
 * @param {string} url
 * @returns {boolean}
 */
export function isDailymotionSource(url) {
    return /\/\/((www\.)?dailymotion\.com|dai\.ly)/i.test(url);
}

export function predictType(url) {
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
    switch (extension) {
        case 'm3u8':
            type = 'application/x-mpegURL';
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
