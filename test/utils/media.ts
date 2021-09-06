import { expect } from 'chai';
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
    it('checks if browser can autoplay media without being muted', async () => {
        const video = window.document.querySelector('video');
        video.muted = false;
        await media.isAutoplaySupported(video, 1, autoplay => {
            expect(autoplay).to.equal(false);
        }, muted => {
            expect(muted).to.equal(false);
        }, () => true);
        video.muted = true;
    });
    it('checks if browser can autoplay media being muted', async () => {
        await media.isAutoplaySupported(window.document.querySelector('video'), 1, autoplay => {
            expect(autoplay).to.equal(false);
        }, muted => {
            expect(muted).to.equal(true);
        }, () => true);
    });
});
