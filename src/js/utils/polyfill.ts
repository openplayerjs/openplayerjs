/**
 * Polyfill loader.
 *
 * @description This class checks if browser supports specific methods needed in player's code;
 * otherwise, loads the Ployfill.io service to include them.
 * @see
 * @class Polyfill
 */
class Polyfill {
    /**
     * Verify if all necessary polyfills required by the player are available in current browser.
     *
     * @static
     * @param {function} callback
     * @memberof Polyfill
     */
    public static check(callback: (n?: any) => any) {
        const features: string[] = [];
        const map: any = {
            CustomEvent: {
                conditional: (window as any).CustomEvent !== 'function',
                key: 'window',
            },
            Promise: {
                conditional: !(window as any).Promise,
                key: 'window',
            },
            closest: {
                conditional: !Element.prototype.closest,
                key: 'Element.prototype',
            },
            find: {
                conditional: !Array.prototype.find,
                key: 'Array.prototype',
            },
            from: {
                conditional: !Array.from,
                key: 'Array',
            },
            remove: {
                conditional: !Element.prototype.remove,
                key: 'Element.prototype',
            },
        };

        Object.keys(map).forEach(method => {
            if (map[method].conditional) {
                features.push(`${(map[method].key !== 'window' ? `${map[method].key}.` : '')}${method}`);
            }
        });

        if (features.length) {
            const f = features.join(',');
            const s = document.createElement('script');
            s.src = `https://cdn.polyfill.io/v2/polyfill.min.js?features=${f}&flags=gated,always&callback=main`;
            s.addEventListener('load', callback);
            document.head.appendChild(s);
        } else {
            callback();
        }
    }
}

export default Polyfill;
