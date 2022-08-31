import HTML5Media from '../../src/media/html5';

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

    it('dispatches different errors', () => {
        videoPlayer.src = { src: 'https://example.com/blahblah.mp4', type: 'video/mp4' };
        videoPlayer.element.onerror = (): void => {
            console.error(`Error with media: ${videoPlayer.element?.error?.code}`);
        };
    });
});
