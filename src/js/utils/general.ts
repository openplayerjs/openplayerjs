declare const ActiveXObject: any;

/**
 * Get the complete URL of a relative path.
 *
 * @export
 * @param {string} url
 * @returns {string}
 */
export function getAbsoluteUrl(url: string) {
    let a: HTMLAnchorElement;
    if (!a) {
        a = document.createElement('a');
    }
    a.href = url;
    return a.href;
}

/**
 * Determine if element is a video element.
 *
 * @export
 * @param {Element} element
 * @return {boolean}
 */
export function isVideo(element: Element) {
    return element.tagName.toLowerCase() === 'video';
}

/**
 * Determine if element is a audio element.
 *
 * @export
 * @param {Element} element
 * @return {boolean}
 */
export function isAudio(element: Element) {
    return element.tagName.toLowerCase() === 'audio';
}

/**
 * Load an external script using Promises
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
 * Perform an asynchronous (AJAX) request.
 *
 * @export
 * @param {string} url
 * @param {string} dataType
 * @param {function} success
 * @param {function} error
 */
export function request(url: string, dataType: string, success: (n: any) => any, error?: (n: any) => any) {
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
 * Determine if element has a specific class.
 *
 * @export
 * @param {HTMLElement} target  The target element.
 * @param {string} className   The class to search in the `class` attribute.
 * @returns {boolean}
 */
export function hasClass(target: HTMLElement, className: string) {
    return !!(target.className.split(' ').indexOf(className) > -1);
}

/**
 * Obtain the top/left offset values of an element.
 *
 * @export
 * @param {HTMLElement} el  The target element.
 * @returns {object}
 */
export function offset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
        top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
    };
}

/**
 * Determine if string is a valid XML structure.
 *
 * @export
 * @param {string} input
 * @returns {boolean}
 */
export function isXml(input: string) {
    let parsedXml;

    if (typeof (window as any).DOMParser !== 'undefined') {
        parsedXml = (text: string) => new (window as any).DOMParser().parseFromString(text, 'text/xml');
    } else if (typeof (window as any).ActiveXObject !== 'undefined' && new (window as any).ActiveXObject('Microsoft.XMLDOM')) {
        parsedXml = (text: string) => {
            const xmlDoc = new (window as any).ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = false;
            xmlDoc.loadXML(text);
            return xmlDoc;
        };
    } else {
        return false;
    }

    try {
        parsedXml(input);
    } catch (e) {
        return false;
    }
    return true;
}
