import { JSDOM } from 'jsdom';

declare global {
    namespace NodeJS {
        interface Global {
            document: Document;
            window: Window;
            navigator: Navigator;
        }
    }
}

// const resources = new ResourceLoader({
//     strictSSL: false,
//     userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
// });
const globalAny: any = global;
const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
    resources: 'usable',
    // runScripts: 'dangerously',
    url: 'http://localhost',
});
globalAny.document = window.document;
globalAny.window = global.document.defaultView;
globalAny.navigator = global.navigator;
