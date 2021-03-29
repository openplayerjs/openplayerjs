import { expect } from 'chai';
import { JSDOM, ResourceLoader } from 'jsdom';

import * as media from '../../src/js/utils/media';

describe('utils/media', () => {
    it('determines the extension of a source', () => {
        expect(media.getExtension('https://www.w3schools.com/xml/note.xml')).to.equal('xml');
        expect(media.getExtension('test.pdf')).to.equal('pdf');
        expect(media.getExtension('test')).to.equal('');
    });
    it('determines if media source is an HLS resource', () => {
        expect(media.isHlsSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
            type: 'video/mp4',
        })).to.equal(true);
        expect(media.isHlsSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
            type: 'application/x-mpegURL',
        })).to.equal(true);
        expect(media.isHlsSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
            type: 'application/vnd.apple.mpegurl',
        })).to.equal(true);
        expect(media.isHlsSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
            type: 'audio/mp3',
        })).to.equal(false);
    });
    it('determines if media source is an HLS playlist resource', () => {
        expect(media.isM3USource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u',
            type: 'video/mp4',
        })).to.equal(true);
        expect(media.isM3USource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
            type: 'audio/mp3',
        })).to.equal(false);
    });
    it('determines if media source is an MPEG-DASH resource', () => {
        expect(media.isDashSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mpd',
            type: 'video/mp4',
        })).to.equal(true);
        expect(media.isDashSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
            type: 'application/dash+xml',
        })).to.equal(true);
        expect(media.isDashSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
            type: 'audio/mp3',
        })).to.equal(false);
    });
    it('determines if media source is an FLV resource', () => {
        expect(media.isFlvSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flv',
            type: 'video/mp4',
        })).to.equal(true);
        expect(media.isFlvSource({
            src: 'rtmp://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flv',
            type: 'video/mp4',
        })).to.equal(true);
        expect(media.isFlvSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
            type: 'video/x-flv',
        })).to.equal(true);
        expect(media.isFlvSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
            type: 'video/flv',
        })).to.equal(true);
        expect(media.isFlvSource({
            src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
            type: 'audio/mp3',
        })).to.equal(false);
    });
    it('predicts the extension of a media source based on the URL provided', () => {
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4')).to.equal('video/mp4');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.webm')).to.equal('video/webm');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogg')).to.equal('video/ogg');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8')).to.equal('application/x-mpegURL');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u')).to.equal('application/x-mpegURL');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mpd')).to.equal('application/dash+xml');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3')).to.equal('audio/mp3');
        expect(media.predictType('https://www.w3schools.com/xml/note.xml')).to.equal('video/mp4');
        expect(media.predictType('test.pdf')).to.equal('video/mp4');
        expect(media.predictType('test')).to.equal('video/mp4');
    });
    it.skip('checks if browser can autoplay media without being muted', () => {
        const doc = new JSDOM(`<!doctype html>
            <html>
                <body>
                    <video src="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4" controls></video>
                </body>
            </html>`, { resources: new ResourceLoader({
                strictSSL: false,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
              }),
        });
        media.isAutoplaySupported(doc.window.document.querySelector('video') as HTMLMediaElement, 1, (autoplay) => {
            expect(autoplay).to.equal(false);
        }, (muted) => {
            expect(muted).to.equal(false);
        }, () => {
            return true;
        });
    });
    it.skip('checks if browser can autoplay media being muted', () => {
        const doc = new JSDOM(`<!doctype html>
            <html>
                <body>
                    <video src="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4" controls muted autoplay></video>
                </body>
            </html>`, { resources: new ResourceLoader({
                strictSSL: false,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
              }),
        });
        media.isAutoplaySupported(doc.window.document.querySelector('video') as HTMLMediaElement, 1, (autoplay) => {
            expect(autoplay).to.equal(false);
        }, (muted) => {
            expect(muted).to.equal(true);
        }, () => {
            return true;
        });
    });
    it.skip('checks if browser can autoplay in older browser (IE 11)', () => {
        const doc = new JSDOM(`<!doctype html>
            <html>
                <body>
                    <video src="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4" controls muted autoplay></video>
                </body>
            </html>`, { resources: new ResourceLoader({
                strictSSL: false,
                userAgent: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/8.0; .NET4.0C; .NET4.0E)',
              }),
        });
        media.isAutoplaySupported(doc.window.document.querySelector('video') as HTMLMediaElement, 1, (autoplay) => {
            expect(autoplay).to.equal(false);
        }, (muted) => {
            expect(muted).to.equal(false);
        }, () => {
            const video = doc.window.document.querySelector('video');
            if (video) {
                expect(video.paused).to.equal(true);
            }
        });
    });
});
