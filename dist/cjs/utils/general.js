"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEvent = exports.isJson = exports.isXml = exports.sanitize = exports.offset = exports.loadScript = exports.isAudio = exports.isVideo = exports.getAbsoluteUrl = void 0;
function getAbsoluteUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    return a.href;
}
exports.getAbsoluteUrl = getAbsoluteUrl;
function isVideo(element) {
    return element.tagName.toLowerCase() === 'video';
}
exports.isVideo = isVideo;
function isAudio(element) {
    return element.tagName.toLowerCase() === 'audio';
}
exports.isAudio = isAudio;
function loadScript(url) {
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
            reject(new Error(`${url} could not be loaded`));
        };
        if (document.head) {
            document.head.appendChild(script);
        }
    });
}
exports.loadScript = loadScript;
function offset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
        top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
    };
}
exports.offset = offset;
function sanitize(html, plainText = true) {
    const parser = new DOMParser();
    const content = parser.parseFromString(html, 'text/html');
    const formattedContent = content.body || document.createElement('body');
    const scripts = formattedContent.querySelectorAll('script');
    for (let i = 0, total = scripts.length; i < total; i++) {
        scripts[i].remove();
    }
    const clean = (element) => {
        const nodes = element.children;
        for (let i = 0, total = nodes.length; i < total; i++) {
            const node = nodes[i];
            const { attributes } = node;
            for (let j = 0, t = attributes.length; j < t; j++) {
                const { name, value } = attributes[j];
                const val = value.replace(/\s+/g, '').toLowerCase();
                if (['src', 'href', 'xlink:href'].includes(name)) {
                    if (val.includes('javascript:') || val.includes('data:')) {
                        node.removeAttribute(name);
                    }
                }
                if (name.startsWith('on')) {
                    node.removeAttribute(name);
                }
            }
            clean(node);
        }
    };
    clean(formattedContent);
    return plainText ? (formattedContent.textContent || '').replace(/\s{2,}/g, '') : formattedContent.innerHTML;
}
exports.sanitize = sanitize;
function isXml(input) {
    let parsedXml;
    if (typeof DOMParser !== 'undefined') {
        parsedXml = (text) => new DOMParser().parseFromString(text, 'text/xml');
    }
    else {
        return false;
    }
    try {
        const response = parsedXml(input);
        if (response.getElementsByTagName('parsererror').length > 0) {
            return false;
        }
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isXml = isXml;
function isJson(item) {
    item = typeof item !== 'string' ? JSON.stringify(item) : item;
    try {
        item = JSON.parse(item);
    }
    catch (e) {
        return false;
    }
    if (typeof item === 'object' && item !== null) {
        return true;
    }
    return false;
}
exports.isJson = isJson;
function addEvent(event, details) {
    let detail = {};
    if (details && details.detail) {
        detail = { detail: details.detail };
    }
    return new CustomEvent(event, detail);
}
exports.addEvent = addEvent;
