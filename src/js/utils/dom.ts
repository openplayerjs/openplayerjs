declare const ActiveXObject: any;

/**
 *
 * @export
 * @param {Element} element
 * @return {boolean}
 */
export function isIframe(element: Element) {
    return element.tagName.toLowerCase() === 'iframe';
}

/**
 *
 * @export
 * @param {Element} element
 * @return {boolean}
 */
export function isVideo(element: Element) {
    return element.tagName.toLowerCase() === 'video';
}

/**
 *
 * @export
 * @param {Element} element
 * @return {boolean}
 */
export function isAudio(element: Element) {
    return element.tagName.toLowerCase() === 'audio';
}

/**
 * Load an external script via Promise
 *
 * @export
 * @param {string} url
 * @returns {Promise}
 */
export function loadScript(url: string) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
            script.remove();
            resolve();
        };
        script.onerror = () => {
            script.remove();
            reject();
        };
        document.head.appendChild(script);
    });
}
/**
 * Perform an asynchronous request
 *
 * @export
 * @param {string} url
 * @param {string} dataType
 * @param {function} success
 * @param {function} error
 */
export function request(url: string, dataType: string, success: (n: any) => any, error: (n: any) => any) {
    const xhr = (window as any).XMLHttpRequest ? new XMLHttpRequest() :
        new ActiveXObject('Microsoft.XMLHTTP');
    let type;
    switch (dataType) {
        case 'text':
            type = 'text/plain';
            break;
        case 'json':
            type = 'application/json, text/javascript';
            break;
        case 'html':
            type = 'text/html';
            break;
        case 'xml':
            type = 'application/xml, text/xml';
            break;
        default:
            type = 'application/x-www-form-urlencoded; charset=UTF-8';
            break;
    }

    let completed = false;
    const accept = type !== 'application/x-www-form-urlencoded' ? `${type}, */*; q=0.01` : '*/'.concat('*');

    if (xhr) {
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Accept', accept);
        xhr.onreadystatechange = () => {
            // Ignore repeat invocations
            if (completed) {
                return;
            }

            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    completed = true;
                    let data;
                    switch (dataType) {
                        case 'json':
                            data = JSON.parse(xhr.responseText);
                            break;
                        case 'xml':
                            data = xhr.responseXML;
                            break;
                        default:
                            data = xhr.responseText;
                            break;
                    }
                    success(data);
                } else if (typeof error === 'function') {
                    error(xhr.status);
                }
            }
        };
        xhr.send();
    }
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
