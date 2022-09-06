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
        let media = {
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video/mp4',
        };
        videoPlayer = new HTML5Media(video, media);
        expect(videoPlayer.src).toEqual(media);

        media = { src: 'https://ccrma.stanford.edu/~jos/mp3/Latin.mp3', type: 'audio/mp3' };

        videoPlayer.src = media;
        expect(videoPlayer.src).toEqual(media);
        expect(videoPlayer.element.src).toEqual(media.src);

        const loadSpy = jest.spyOn(video, 'load');
        videoPlayer.load();
        expect(loadSpy).toHaveBeenCalled();
        loadSpy.mockReset();
        loadSpy.mockRestore();
    });

    it('attempts to play a stalled media source for 30 seconds; after that, dispatches error', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clearSpy = jest.spyOn(HTML5Media.prototype as any, '_clearTimeout');

        const video = document.createElement('video') as HTMLMediaElement;
        video.src = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
        videoPlayer = new HTML5Media(video);

        jest.useFakeTimers();
        videoPlayer.element.dispatchEvent(addEvent('stalled'));
        expect(clearSpy).not.toHaveBeenCalled();
        jest.advanceTimersByTime(35000);
        expect(clearSpy).toHaveBeenCalled();

        clearSpy.mockReset();
        clearSpy.mockRestore();
    });

    it('detects when DVR media is being set (mobile devices setting HLS source)', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        videoPlayer = new HTML5Media(video, {
            src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            type: 'application/x-mpegURL',
        });

        expect(video.getAttribute('op-dvr__enabled')).toBeNull();

        const seekableSpy = jest.spyOn(video, 'seekable', 'get').mockReturnValue({
            length: 150,
            start: (val: number): number => val,
            end: (val: number): number => val,
        } as TimeRanges);

        videoPlayer.element.dispatchEvent(addEvent('loadeddata'));
        expect(seekableSpy).toHaveBeenCalled();
        expect(video.getAttribute('op-dvr__enabled')).toEqual('true');

        seekableSpy.mockReset();
        seekableSpy.mockRestore();
    });

    it.skip('reads ID3 tags from streaming (mobile devices setting HLS source)', () => {
        const video = document.createElement('video') as HTMLMediaElement;
        video.addTextTrack('metadata');

        videoPlayer = new HTML5Media(video, {
            src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            type: 'application/x-mpegURL',
        });

        const addTrackSpy = jest.spyOn(video.textTracks, 'addEventListener');
        video.textTracks[0].dispatchEvent(addEvent('cuechange'));
        expect(addTrackSpy).toHaveBeenCalledTimes(1);

        const track = video.addTextTrack('metadata');
        track.mode = 'showing';
        track.addCue(new VTTCue(0, 3, 'Test ID3 Tag'));

        const dispatchSpy = jest.spyOn(video, 'dispatchEvent');
        video.textTracks[1].dispatchEvent(addEvent('cuechange'));
        expect(addTrackSpy).toHaveBeenCalledTimes(2);
        expect(dispatchSpy.mock.calls[0][0]).toEqual('metadataready');

        addTrackSpy.mockReset();
        addTrackSpy.mockRestore();
        dispatchSpy.mockReset();
        dispatchSpy.mockRestore();
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

        expect(video.classList.contains('op-dvr__enabled')).toEqual(false);
        expect(removeEventListenerSpy.mock.calls[0][0]).toEqual('playing');
        expect(removeEventListenerSpy.mock.calls[1][0]).toEqual('stalled');
        expect(removeEventListenerSpy.mock.calls[2][0]).toEqual('error');
        expect(removeEventListenerSpy.mock.calls[3][0]).toEqual('loadeddata');

        removeEventListenerSpy.mockReset();
        removeEventListenerSpy.mockRestore();
    });
});
