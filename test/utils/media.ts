import { expect } from 'chai';
import * as media from '../../src/js/utils/media';
import '../helper';

describe('utils/media', () => {
    it('determines the extension of a source', (done) => {
        expect(media.getExtension('https://www.w3schools.com/xml/note.xml')).to.equal('xml');
        expect(media.getExtension('test.pdf')).to.equal('pdf');
        expect(media.getExtension('test')).to.equal('');
        done();
    });
    it('determines if media source is an HLS resource', (done) => {
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
                type: 'video/mp4',
            })
        ).to.equal(true);
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'application/x-mpegURL',
            })
        ).to.equal(true);
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'application/vnd.apple.mpegurl',
            })
        ).to.equal(true);
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).to.equal(false);
        done();
    });
    it('determines if media source is an HLS playlist resource', (done) => {
        expect(
            media.isM3USource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u',
                type: 'video/mp4',
            })
        ).to.equal(true);
        expect(
            media.isM3USource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).to.equal(false);
        done();
    });
    it('determines if media source is an MPEG-DASH resource', (done) => {
        expect(
            media.isDashSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mpd',
                type: 'video/mp4',
            })
        ).to.equal(true);
        expect(
            media.isDashSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'application/dash+xml',
            })
        ).to.equal(true);
        expect(
            media.isDashSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).to.equal(false);
        done();
    });
    it('determines if media source is an FLV resource', (done) => {
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flv',
                type: 'video/mp4',
            })
        ).to.equal(true);
        expect(
            media.isFlvSource({
                src: 'rtmp://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flv',
                type: 'video/mp4',
            })
        ).to.equal(true);
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'video/x-flv',
            })
        ).to.equal(true);
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'video/flv',
            })
        ).to.equal(true);
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).to.equal(false);
        done();
    });
    it('predicts the extension of a media source based on the URL provided', (done) => {
        const video = document.getElementById('video') as HTMLMediaElement;
        const audio = document.getElementById('audio') as HTMLMediaElement;
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4', video)).to.equal('video/mp4');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.webm', video)).to.equal('video/webm');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.webm', audio)).to.equal('audio/webm');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogg', video)).to.equal('video/ogg');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogg', audio)).to.equal('audio/ogg');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', video)).to.equal(
            'application/x-mpegURL'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u', video)).to.equal(
            'application/x-mpegURL'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mpd', video)).to.equal(
            'application/dash+xml'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3', video)).to.equal('audio/mp3');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogv', video)).to.equal('video/ogg');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.oga', video)).to.equal('audio/ogg');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.3gp', video)).to.equal('audio/3gpp');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.wav', video)).to.equal('audio/wav');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.aac', video)).to.equal('audio/aac');
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flac', video)).to.equal('audio/flac');
        expect(media.predictMimeType('https://www.w3schools.com/xml/note.xml', video)).to.equal('video/mp4');
        expect(media.predictMimeType('test.pdf', video)).to.equal('video/mp4');
        expect(media.predictMimeType('test', video)).to.equal('video/mp4');
        done();
    });
    // it('checks if browser can autoplay media without being muted', () => {
    //     const video = document.getElementById('video') as HTMLMediaElement;
    //     video.muted = false;
    //     return new Promise<void>((resolve, reject) => {
    //         media.isAutoplaySupported(video, 1, () => {
    //             // expect(autoplay).to.equal(false);
    //         }, muted => {
    //             expect(muted).to.equal(false);
    //             video.pause();
    //             video.currentTime = 0;
    //             resolve();
    //         }, () => reject());
    //         video.muted = true;
    //     });
    // });
    // it('checks if browser can autoplay media being muted', async () => {
    //     const audio = document.getElementById('audio') as HTMLMediaElement;

    //     return new Promise<void>((resolve, reject) => {
    //         media.isAutoplaySupported(audio, 1, () => {
    //             // expect(autoplay).to.equal(false);
    //         }, muted => {
    //             expect(muted).to.equal(true);
    //             audio.pause();
    //             audio.currentTime = 0;
    //             resolve();
    //         }, () => reject());
    //     });
    // });
});
