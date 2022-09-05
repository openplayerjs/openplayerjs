import HTML5Media from '../../media/types/html5';
import { addEvent } from '../../utils/general';

describe('media/html5', () => {
    let videoPlayer: HTML5Media;

    beforeAll(() => {
        Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
            value: (mimeType: string) =>
                ['video/mp4', 'audio/mp4', 'audio/acc', 'audio/mp3'].includes(mimeType) ? 'maybe' : 'no',
        });
    });

    it('can only accept video/audio tags', () => {
        try {
            const p = new HTML5Media(document.createElement('div') as unknown as HTMLMediaElement);
            expect(p).not.toBeUndefined();
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty('message', 'Native method only supports video/audio tags');
        }
    });

    it('prepares event listeners for `playing`, `stalled`, `error` and `loadedata` events', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        video.src = 'https://aaaa.com/video.mp4';
        const addEventListenerSpy = jest.spyOn(video, 'addEventListener');
        videoPlayer = new HTML5Media(video);

        expect(addEventListenerSpy.mock.calls[0][0]).toEqual('playing');
        expect(addEventListenerSpy.mock.calls[1][0]).toEqual('stalled');
        expect(addEventListenerSpy.mock.calls[2][0]).toEqual('error');
        expect(addEventListenerSpy.mock.calls[3][0]).toEqual('loadeddata');
    });

    it('can play mp4/mp3 sources by default', () => {
        const audio = document.createElement('audio') as HTMLMediaElement;
        audio.src = 'https://ccrma.stanford.edu/~jos/mp3/Latin.mp3';
        const audioPlayer = new HTML5Media(audio);
        expect(audioPlayer.canPlayType('audio/mp3')).toBeTrue();

        const video = document.createElement('video') as HTMLMediaElement;
        videoPlayer = new HTML5Media(video, {
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video/mp4',
        });
        expect(videoPlayer.canPlayType('video/mp4')).toBeTrue();
    });

    it('cannot play sources that browser cannot handle', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        videoPlayer = new HTML5Media(video, {
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video/mp4',
        });
        expect(videoPlayer.canPlayType('audio/test')).toBeFalse();
        expect(videoPlayer.canPlayType('x-video/youtube')).toBeFalse();
    });

    it('can set a new source', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        videoPlayer = new HTML5Media(video, {
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video/mp4',
        });
        expect(videoPlayer.src).toEqual({
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video/mp4',
        });

        videoPlayer.src = { src: 'https://ccrma.stanford.edu/~jos/mp3/Latin.mp3', type: 'audio/mp3' };
        expect(videoPlayer.src.src).toEqual('https://ccrma.stanford.edu/~jos/mp3/Latin.mp3');
        expect(videoPlayer.src.type).toEqual('audio/mp3');

        const loadSpy = jest.spyOn(videoPlayer, 'load');
        videoPlayer.load();
        expect(loadSpy).toHaveBeenCalled();
        loadSpy.mockReset();
        loadSpy.mockRestore();
    });

    it('attempts to play a stalled media source for 30 seconds; after that, dispatches error', () => {
        const clearSpy = jest.spyOn(HTML5Media.prototype as any, '_clearTimeout');

        const video = document.createElement('video') as HTMLMediaElement;
        video.src = 'https://aaaa.com/video.mp4';
        videoPlayer = new HTML5Media(video);

        jest.useFakeTimers();
        videoPlayer.element.dispatchEvent(addEvent('stalled'));
        expect(clearSpy).not.toHaveBeenCalled();
        jest.advanceTimersByTime(35000);
        expect(clearSpy).toHaveBeenCalled();
    });

    it('detects when DVR media is being set (mostly for iOS streaming)', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        videoPlayer = new HTML5Media(video, {
            src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            type: 'application/x-mpegURL',
        });
    });

    it('dispatches different errors', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        videoPlayer = new HTML5Media(video);
        videoPlayer.src = { src: 'https://example.com/blahblah.mp4', type: 'video/mp4' };
        videoPlayer.element.onerror = (): void => {
            console.error(`Error with media: ${videoPlayer.element?.error?.code}`);
        };
    });

    it('can destroy all events associated with it when calling `destroy`', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        const removeEventListenerSpy = jest.spyOn(video, 'removeEventListener');

        videoPlayer = new HTML5Media(video, {
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video/mp4',
        });

        videoPlayer.destroy();

        expect(removeEventListenerSpy.mock.calls[0][0]).toEqual('playing');
        expect(removeEventListenerSpy.mock.calls[1][0]).toEqual('stalled');
        expect(removeEventListenerSpy.mock.calls[2][0]).toEqual('error');
        expect(removeEventListenerSpy.mock.calls[3][0]).toEqual('loadeddata');
    });
});
