/**
 *
 * @export
 * @param {HTMLMediaElement} element
 * @return {boolean}
 */
export function isIframe(element) {
    return element.tagName.toLowerCase() === 'iframe';
}

/**
 *
 * @export
 * @param {HTMLMediaElement} element
 * @return {boolean}
 */
export function isVideo(element) {
    return element.tagName.toLowerCase() === 'video';
}

/**
 *
 * @export
 * @param {HTMLMediaElement} element
 * @return {boolean}
 */
export function isAudio(element) {
    return element.tagName.toLowerCase() === 'audio';
}

/**
 * Load an external script via Promise
 *
 * @export
 * @param {string} url
 * @returns {Promise}
 */
export function loadScript(url) {
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
export function request(url, dataType, success, error) {
    const xhr = (<any>window).XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
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
