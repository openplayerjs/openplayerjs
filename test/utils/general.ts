import { expect } from 'chai';
import { JSDOM, ResourceLoader } from 'jsdom';

import * as general from '../../src/js/utils/general';

describe('utils/general', () => {
    it.skip('must return the absolute URL of a relative one', () => {
        const doc = new JSDOM('<!doctype html><html><body></body></html>', {
            resources: new ResourceLoader({
                proxy: 'http://127.0.0.1',
                strictSSL: false,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
            }),
        });
        expect(general.getAbsoluteUrl('example.pdf')).to.equal(`${doc.window.location}example.pdf`);
    }).timeout(10000);
    it('must detect if media is a video element', () => {
        const video = document.createElement('video');
        expect(general.isVideo(video)).to.equal(true);

        const audio = document.createElement('audio');
        expect(general.isVideo(audio)).to.equal(false);
    });
    it('must detect if media is an audio element', () => {
        const video = document.createElement('video');
        expect(general.isAudio(video)).to.equal(false);

        const audio = document.createElement('audio');
        expect(general.isAudio(audio)).to.equal(true);
    });
    it('should load a script and destroy the script tag on the header', async (done) => {
        const doc = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
            resources: new ResourceLoader({
                strictSSL: false,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
            }),
          });
        done();
        const response = await general.loadScript('https://cdnjs.cloudflare.com/ajax/libs/openplayerjs/2.2.3/openplayer.min.js');
        expect(response).to.equal(null);
        expect(doc.window.document.querySelector('script')).to.equal(null);
    });
    it('removes a DOM element', () => {
        const doc = new JSDOM('<!doctype html><html><body><p>Test</p></body></html>');
        general.removeElement(doc.window.document.querySelector('p') as Node);
        expect(doc.window.document.querySelector('p')).to.equal(null);
    });
    it('checks if DOM element has a class', () => {
        const doc = new JSDOM('<!doctype html><html><body><p class="test">Test</p></body></html>');
        let hasClass = general.hasClass(doc.window.document.querySelector('p') as HTMLElement, 'test');
        expect(hasClass).to.equal(true);

        hasClass = general.hasClass(doc.window.document.querySelector('p') as HTMLElement, 'no-class');
        expect(hasClass).to.equal(false);
    });
    // it('returns the offset of a DOM element', () => {
    //     general.offset
    // });
    // it('polyfills the input range for mobile devices', () => {
    //     general.rangeTouchPolyfill
    // });
    it('checks if string is a valid XML source', () => {
        expect(general.isXml('<invalid>')).to.equal(false);
        expect(general.isXml(`<note>
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading>
            <body>Don't forget me this weekend!</body>
            </note>`,
        )).to.equal(true);
    });
});
