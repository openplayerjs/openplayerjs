import HLSMedia from '../../media/types/hls';

describe('media/hls', () => {
    let videoPlayer: HLSMedia;

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('can only accept video/audio tags', () => {
        try {
            videoPlayer = new HLSMedia(document.createElement('div') as unknown as HTMLMediaElement);
            expect(videoPlayer).not.toBeUndefined();
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty('message', 'Native method only supports video/audio tags');
        }
    });
});
