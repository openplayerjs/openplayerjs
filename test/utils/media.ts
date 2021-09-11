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
        const video = document.getElementById('video') as HTMLMediaElement;
        const audio = document.getElementById('audio') as HTMLMediaElement;
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4', video)).to.equal('video/mp4');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.webm', video)).to.equal('video/webm');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.webm', audio)).to.equal('audio/webm');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogg', video)).to.equal('video/ogg');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogg', audio)).to.equal('audio/ogg');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', video))
            .to.equal('application/x-mpegURL');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u', video))
            .to.equal('application/x-mpegURL');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mpd', video))
            .to.equal('application/dash+xml');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3', video)).to.equal('audio/mp3');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogv', video)).to.equal('video/ogg');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.oga', video)).to.equal('audio/ogg');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.3gp', video)).to.equal('audio/3gpp');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.wav', video)).to.equal('audio/wav');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.aac', video)).to.equal('audio/aac');
        expect(media.predictType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flac', video)).to.equal('audio/flac');
        expect(media.predictType('https://www.w3schools.com/xml/note.xml', video)).to.equal('video/mp4');
        expect(media.predictType('test.pdf', video)).to.equal('video/mp4');
        expect(media.predictType('test', video)).to.equal('video/mp4');
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
