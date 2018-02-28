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
 * Test if browser supports autoplay (and if so, it it requires to be muted or not)
 *
 * It combines the techines described in https://raw.githubusercontent.com/googleads/googleads-ima-html5/2.11/attempt_to_autoplay/ads.js
 * and https://github.com/Modernizr/Modernizr/issues/1095#issuecomment-304682473
 * @export
 * @param {function} autoplay
 * @param {function} muted
 * @param {function} callback
 */
export function isAutoplaySupported(autoplay: (n: any) => any, muted: (n: any) => any, callback: () => any) {
    // try to play video
    const videoContent = document.createElement('video');
    videoContent.src = 'http://techslides.com/demos/sample-videos/small.mp4';
    // In browsers that don’t yet support this functionality,
    // playPromise won’t be defined.
    const playPromise = videoContent.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // If we make it here, unmuted autoplay works.
            videoContent.pause();
            autoplay(true);
            muted(false);
            callback();
        }).catch(() => {
            // Unmuted autoplay failed. Now try muted autoplay.
            videoContent.volume = 0;
            videoContent.muted = true;
            videoContent.play().then(() => {
                // If we make it here, muted autoplay works but unmuted autoplay does not.
                videoContent.pause();
                autoplay(true);
                muted(true);
                callback();
            }).catch(() => {
                // Both muted and unmuted autoplay failed. Fall back to click to play.
                videoContent.volume = 1;
                videoContent.muted = false;
                autoplay(false);
                muted(false);
                callback();
            });
        });
    } else {
        autoplay(!videoContent.paused || 'Promise' in window && playPromise instanceof Promise);
        muted(false);
        callback();
    }
}
