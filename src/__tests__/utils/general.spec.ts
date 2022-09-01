/* eslint-disable @typescript-eslint/no-explicit-any */
import * as general from '../../utils/general';

describe('utils/general', () => {
    it('must return the absolute URL of a relative one', () => {
        expect(general.getAbsoluteUrl('example.pdf')).toEqual(`${window.location.origin}/example.pdf`);
    });

    it('returns the offset of an element', () => {
        const container = document.createElement('div') as HTMLDivElement;
        const offset = general.offset(container);
        expect(offset.top).toEqual(0);
        expect(offset.left).toEqual(0);
    });

    it('must detect if media is a video element', () => {
        const video = document.createElement('video');
        expect(general.isVideo(video)).toBeTrue();

        const audio = document.createElement('audio');
        expect(general.isVideo(audio)).toBeFalse();
    });

    it('must detect if media is an audio element', () => {
        const video = document.createElement('video');
        expect(general.isAudio(video)).toBeFalse();

        const audio = document.createElement('audio');
        expect(general.isAudio(audio)).toBeTrue();
    });

    it('sanitizes string from XSS attacks', () => {
        const content =
            '<div onclick="javascript:alert(\'XSS\');">Test<script>alert("Test");</script><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==" alt="Test" /></div>';
        expect(general.sanitize(content)).toEqual('Test');
        expect(general.sanitize(content, false)).toEqual('<div>Test<img alt="Test"></div>');
    });

    it('checks if string is a valid XML source', () => {
        expect(general.isXml('<invalid>')).toBeFalse();
        expect(
            general.isXml(`<note>
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading>
            <body>Don't forget me this weekend!</body>
            </note>`)
        ).toBeTrue();
    });

    it('checks if string is a valid JSON source', () => {
        expect(general.isJson('abc123')).toBeFalse();
        expect(
            general.isJson(`{
                "test": true,
                "id": 12345,
                "name": "test"
            }`)
        ).toBeTrue();
    });

    it('must return a custom event to be dispatched', () => {
        let event = general.addEvent('custom');
        let custom = new CustomEvent('custom');
        expect(event.type).toEqual(custom.type);

        event = general.addEvent('test', { detail: { data: 'test' } });
        custom = new CustomEvent('test', { detail: { data: 'test' } });
        expect(event.detail.data).toEqual((custom.detail as any).data);
    });
});
