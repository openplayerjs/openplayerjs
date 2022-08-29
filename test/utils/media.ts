import * as media from '../../src/utils/media';

describe('utils/media', () => {
    it('determines the extension of a source', (done) => {
        expect(media.getExtension('https://www.w3schools.com/xml/note.xml')).toEqual('xml');
        expect(media.getExtension('test.pdf')).toEqual('pdf');
        expect(media.getExtension('test')).toEqual('');
        done();
    });
    it('determines if media source is an HLS resource', (done) => {
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
                type: 'video/mp4',
            })
        ).toBeTrue();
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'application/x-mpegURL',
            })
        ).toBeTrue();
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'application/vnd.apple.mpegurl',
            })
        ).toBeTrue();
        expect(
            media.isHlsSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).toBeFalse();
        done();
    });
    it('determines if media source is an HLS playlist resource', (done) => {
        expect(
            media.isM3USource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u',
                type: 'video/mp4',
            })
        ).toBeTrue();
        expect(
            media.isM3USource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).toBeFalse();
        done();
    });
    it('determines if media source is an MPEG-DASH resource', (done) => {
        expect(
            media.isDashSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mpd',
                type: 'video/mp4',
            })
        ).toBeTrue();
        expect(
            media.isDashSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'application/dash+xml',
            })
        ).toBeTrue();
        expect(
            media.isDashSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).toBeFalse();
        done();
    });
    it('determines if media source is an FLV resource', (done) => {
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flv',
                type: 'video/mp4',
            })
        ).toBeTrue();
        expect(
            media.isFlvSource({
                src: 'rtmp://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flv',
                type: 'video/mp4',
            })
        ).toBeTrue();
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'video/x-flv',
            })
        ).toBeTrue();
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4',
                type: 'video/flv',
            })
        ).toBeTrue();
        expect(
            media.isFlvSource({
                src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3',
                type: 'audio/mp3',
            })
        ).toBeFalse();
        done();
    });
    it('predicts the extension of a media source based on the URL provided', (done) => {
        const video = document.createElement('video') as HTMLMediaElement;
        const audio = document.createElement('audio') as HTMLMediaElement;

        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4', video)).toEqual(
            'video/mp4'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp4', audio)).toEqual(
            'audio/mp4'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.webm', video)).toEqual(
            'video/webm'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.webm', audio)).toEqual(
            'audio/webm'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogg', video)).toEqual(
            'video/ogg'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogg', audio)).toEqual(
            'audio/ogg'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', video)).toEqual(
            'application/x-mpegURL'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u', video)).toEqual(
            'application/x-mpegURL'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mpd', video)).toEqual(
            'application/dash+xml'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.mp3', video)).toEqual(
            'audio/mp3'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.ogv', video)).toEqual(
            'video/ogg'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.oga', video)).toEqual(
            'audio/ogg'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.3gp', video)).toEqual(
            'audio/3gpp'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.wav', video)).toEqual(
            'audio/wav'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.aac', video)).toEqual(
            'audio/aac'
        );
        expect(media.predictMimeType('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.flac', video)).toEqual(
            'audio/flac'
        );
        expect(media.predictMimeType('https://www.w3schools.com/xml/note.xml', video)).toEqual('video/mp4');
        expect(media.predictMimeType('test.pdf', video)).toEqual('video/mp4');
        expect(media.predictMimeType('test', video)).toEqual('video/mp4');
        expect(media.predictMimeType('test.pdf', audio)).toEqual('audio/mp3');
        done();
    });
    // it('checks if browser can autoplay media without being muted', () => {
    //     const video = document.getElementById('video') as HTMLMediaElement;
    //     video.muted = false;
    //     return new Promise<void>((resolve, reject) => {
    //         media.isAutoplaySupported(video, 1, () => {
    //             // expect(autoplay).toBeFalse();
    //         }, muted => {
    //             expect(muted).toBeFalse();
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
    //             // expect(autoplay).toBeFalse();
    //         }, muted => {
    //             expect(muted).toBeTrue();
    //             audio.pause();
    //             audio.currentTime = 0;
    //             resolve();
    //         }, () => reject());
    //     });
    // });
});
