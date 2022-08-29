/* eslint-disable @typescript-eslint/no-explicit-any */
import * as general from '../../src/utils/general';

describe('utils/general', () => {
    it('must return the absolute URL of a relative one', (done) => {
        expect(general.getAbsoluteUrl('example.pdf')).toEqual(`${window.location.origin}/example.pdf`);
        done();
    });

    it('must detect if media is a video element', (done) => {
        const video = document.createElement('video');
        expect(general.isVideo(video)).toBeTrue();

        const audio = document.createElement('audio');
        expect(general.isVideo(audio)).toBeFalse();
        done();
    });

    it('must detect if media is an audio element', (done) => {
        const video = document.createElement('video');
        expect(general.isAudio(video)).toBeFalse();

        const audio = document.createElement('audio');
        expect(general.isAudio(audio)).toBeTrue();
        done();
    });

    it.skip('should load a script and destroy the script tag on the header', async () => {
        try {
            await general.loadScript('https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js');
            expect((window as any).OpenPlayerJS).not.toEqual(null);
        } catch (err) {
            expect(err).toBeEmpty();
        }

        // try {
        //     await general.loadScript('https://cdn.jsdelivr.net/npm/openplayerjs@0.0.0/dist/openplayer.min.js');
        // } catch (err) {
        //     expect(err.src).toEqual('https://cdn.jsdelivr.net/npm/openplayerjs@0.0.0/dist/openplayer.min.js');
        // }
    }, 8000);

    it('sanitizes string from XSS attacks', (done) => {
        const content = '<div onclick="javascript:alert(\'XSS\')">Test<script>alert("Test");</script></div>';
        expect(general.sanitize(content)).toEqual('Test');
        expect(general.sanitize(content, false)).toEqual('<div>Test</div>');
        done();
    });

    it('checks if string is a valid XML source', (done) => {
        expect(general.isXml('<invalid>')).toBeFalse();
        expect(
            general.isXml(`<note>
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading>
            <body>Don't forget me this weekend!</body>
            </note>`)
        ).toBeTrue();
        done();
    });

    it('checks if string is a valid JSON source', (done) => {
        expect(general.isJson('abc123')).toBeFalse();
        expect(
            general.isJson(`{
                "test": true,
                "id": 12345,
                "name": "test"
            }`)
        ).toBeTrue();
        done();
    });

    it('must return a custom event to be dispatched', (done) => {
        let event = general.addEvent('custom');
        let custom = new CustomEvent('custom');
        expect(event.type).toEqual(custom.type);

        event = general.addEvent('test', { detail: { data: 'test' } });
        custom = new CustomEvent('test', { detail: { data: 'test' } });
        expect(event.detail.data).toEqual((custom.detail as any).data);
        done();
    });
});
