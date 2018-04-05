class Polyfill {
    /**
     * Verify if all necessary polyfills are available in browser
     *
     * @static
     * @param {any} callback
     * @memberof Polyfill
     */
    public static check(callback: (n?: any) => any) {
        const features: string[] = [];
        const map: any = {
            CustomEvent: {
                key: 'window',
                object: (window as any),
            },
            Promise: {
                key: 'window',
                object: (window as any),
            },
            closest: {
                key: 'Element.prototype',
                object: Element.prototype,
            },
            find: {
                key: 'Array.prototype',
                object: Array.prototype,
            },
            from: {
                key: 'Array',
                object: Array,
            },
            remove: {
                key: 'Element.prototype',
                object: Element.prototype,
            },
        };

        Object.keys(map).forEach(method => {
            if (method in map[method].object !== true) {
                features.push(`${(map[method].key !== 'window' ? `${map[method].key}.` : '')}${method}`);
            }
        });

        if (features.length) {
            const f = features.join(',');
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = `https://cdn.polyfill.io/v2/polyfill.min.js?features=${f}&flags=gated,always&callback=main`;
            s.onload = () => {
                callback();
            };
            document.head.appendChild(s);
        }

        callback();
    }
}

export default Polyfill;
