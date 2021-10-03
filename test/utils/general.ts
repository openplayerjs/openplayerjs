import { expect } from 'chai';
import * as general from '../../src/js/utils/general';
import '../helper';

describe('utils/general', () => {
    it('must return the absolute URL of a relative one', done => {
        expect(general.getAbsoluteUrl('example.pdf')).to.equal(`${window.location.origin}/example.pdf`);
        done();
    });
    it('must detect if media is a video element', done => {
        const video = document.createElement('video');
        expect(general.isVideo(video)).to.equal(true);

        const audio = document.createElement('audio');
        expect(general.isVideo(audio)).to.equal(false);
        done();
    });
    it('must detect if media is an audio element', done => {
        const video = document.createElement('video');
        expect(general.isAudio(video)).to.equal(false);

        const audio = document.createElement('audio');
        expect(general.isAudio(audio)).to.equal(true);
        done();
    });
    it('should load a script and destroy the script tag on the header', async () => {
        try {
            await general.loadScript('https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js');
            expect((window as any).OpenPlayerJS).to.not.equal(null);
        } catch (err) {
            expect(err.src).to.be(null);
        }

        // try {
        //     await general.loadScript('https://cdn.jsdelivr.net/npm/openplayerjs@0.0.0/dist/openplayer.min.js');
        // } catch (err) {
        //     expect(err.src).to.equal('https://cdn.jsdelivr.net/npm/openplayerjs@0.0.0/dist/openplayer.min.js');
        // }
    });
    it('removes a DOM element', done => {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'test';
        document.body.appendChild(paragraph);
        general.removeElement(document.querySelector('p'));
        expect(window.document.querySelector('p')).to.equal(null);
        done();
    });
    it('checks if DOM element has a specific class', done => {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'test';
        paragraph.className = 'test';
        document.body.appendChild(paragraph);
        let hasClass = general.hasClass(document.querySelector('p'), 'test');
        expect(hasClass).to.equal(true);

        hasClass = general.hasClass(window.document.querySelector('p'), 'no-class');
        expect(hasClass).to.equal(false);
        general.removeElement(window.document.querySelector('p'));
        done();
    });
    it('checks if string is a valid XML source', done => {
        expect(general.isXml('<invalid>')).to.equal(false);
        expect(general.isXml(`<note>
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading>
            <body>Don't forget me this weekend!</body>
            </note>`)).to.equal(true);
        done();
    });
});
