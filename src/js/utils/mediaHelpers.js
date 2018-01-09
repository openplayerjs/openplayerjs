/**
 * Checks if element is an iframe
 *
 * @export
 * @param {HTMLElement} element
 * @return {boolean}
 */
export function isIframe(element) {
    return element.tagName.toLowerCase() === 'iframe';
}

/**
 * Checks if element is a video tag
 *
 * @export
 * @param {HTMLElement} element
 * @return {boolean}
 */
export function isVideo(element) {
    return element.tagName.toLowerCase() === 'video';
}

/**
 * Checks if element is an audio tag
 *
 * @export
 * @param {HTMLElement} element
 * @return {boolean}
 */
export function isAudio(element) {
    return element.tagName.toLowerCase() === 'audio';
}

/**
 * Get media file extension from URL
 *
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
 * @param {string} type
 * @returns {string}
 */
export function getMimeType(type) {
    if (typeof type !== 'string') {
        throw new Error('`type` argument must be a string');
    }

    return (type && type.indexOf(';') > -1) ? type.substr(0, type.indexOf(';')) : type;
}
