export function getAbsoluteUrl(url: string): string {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    return a.href;
}

export function isVideo(element: Element): boolean {
    return element.tagName.toLowerCase() === 'video';
}

export function isAudio(element: Element): boolean {
    return element.tagName.toLowerCase() === 'audio';
}

export function loadScript(src: string, async = true): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const el = document.createElement('script');
            const container = document.head || document.body;
            el.async = async;
            el.src = src;

            el.addEventListener('load', () => {
                resolve();
            });

            el.addEventListener('error', () => {
                reject(new Error(`Failed to load the script ${src}`));
            });

            container.appendChild(el);
        } catch (err) {
            reject(err);
        }
    });
}

export function offset(el: HTMLElement): { left: number; top: number } {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
        top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
    };
}

export function sanitize(html: string, plainText = true): string {
    if (!html) {
        return '';
    }
    const parser = new DOMParser();
    const content = parser.parseFromString(html, 'text/html');
    const formattedContent = content.body || document.createElement('body');

    const scripts = formattedContent.querySelectorAll('script');
    for (let i = 0, total = scripts.length; i < total; i++) {
        scripts[i].remove();
    }

    const clean = (element: Element): void => {
        const nodes = element.children;
        for (let i = 0, total = nodes.length; i < total; i++) {
            const node = nodes[i];
            const { attributes } = node;
            for (let j = 0, t = attributes.length; j < t; j++) {
                const { name, value } = attributes[j] || {};
                const val = (value || '').replace(/\s+/g, '').toLowerCase();
                if (name && ['src', 'href', 'xlink:href'].includes(name)) {
                    // eslint-disable-next-line no-script-url
                    if (val.includes('javascript:') || val.includes('data:')) {
                        node.removeAttribute(name);
                    }
                }
                if (name && name.startsWith('on')) {
                    node.removeAttribute(name);
                }
            }
            clean(node);
        }
    };

    clean(formattedContent);
    return plainText ? (formattedContent.textContent || '').replace(/\s{2,}/g, '') : formattedContent.innerHTML;
}

export function isXml(input: string): boolean {
    let parsedXml;

    if (typeof DOMParser !== 'undefined') {
        parsedXml = (text: string): Document => new DOMParser().parseFromString(text, 'text/xml');
    } else {
        return false;
    }

    try {
        const response = parsedXml(input);
        if (response.getElementsByTagName('parsererror').length > 0) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
}

export function isJson(item: unknown): boolean {
    item = typeof item !== 'string' ? JSON.stringify(item) : item;
    try {
        item = JSON.parse(item as string);
    } catch (e) {
        return false;
    }

    if (typeof item === 'object' && item !== null) {
        return true;
    }

    return false;
}

export function addEvent(event: string, details?: CustomEventInit): CustomEvent {
    let detail = {};
    if (details && details.detail) {
        detail = { detail: details.detail };
    }
    return new CustomEvent(event, detail);
}
