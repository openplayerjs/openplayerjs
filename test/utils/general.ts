/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as general from '../../src/js/utils/general';
import '../helper';

describe('utils/general', () => {
    it('must return the absolute URL of a relative one', (done) => {
        expect(general.getAbsoluteUrl('example.pdf')).to.equal(`${window.location.origin}/example.pdf`);
        done();
    });

    it('must detect if media is a video element', (done) => {
        const video = document.createElement('video');
        expect(general.isVideo(video)).to.equal(true);

        const audio = document.createElement('audio');
        expect(general.isVideo(audio)).to.equal(false);
        done();
    });

    it('must detect if media is an audio element', (done) => {
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

    it('sanitizes string from XSS attacks', (done) => {
        const content = '<div onclick="javascript:alert(\'XSS\')">Test<script>alert("Test");</script></div>';
        expect(general.sanitize(content)).to.equal('Test');
        expect(general.sanitize(content, false)).to.equal('<div>Test</div>');
        done();
    });

    it('checks if string is a valid XML source', (done) => {
        expect(general.isXml('<invalid>')).to.equal(false);
        expect(
            general.isXml(`<note>
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading>
            <body>Don't forget me this weekend!</body>
            </note>`)
        ).to.equal(true);
        done();
    });

    it('checks if string is a valid JSON source', (done) => {
        expect(general.isJson('abc123')).to.equal(false);
        expect(
            general.isJson(`{
                "test": true,
                "id": 12345,
                "name": "test"
            }`)
        ).to.equal(true);
        done();
    });

    it('must return a custom event to be dispatched', (done) => {
        let event = general.addEvent('custom');
        let custom = new CustomEvent('custom');
        expect(event.type).to.equal(custom.type);

        event = general.addEvent('test', { detail: { data: 'test' } });
        custom = new CustomEvent('test', { detail: { data: 'test' } });
        expect(event.detail.data).to.equal((custom.detail as any).data);
        done();
    });
});
