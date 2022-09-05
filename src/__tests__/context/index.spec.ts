import Media from '../../media';
import Ads from '../../media/ads/default';
import LiveAds from '../../media/ads/live';

describe('context', () => {
    let media: Media;
    let ads: Ads;
    let liveAds: LiveAds;

    it('allows to enhance `load` method', async () => {
        const video = document.createElement('video') as HTMLMediaElement;
        media = new Media(video);
        await media.load();
        expect(media.loaded).toEqual('media');

        ads = new Ads(media);
        await ads.load();
        expect(ads.loaded).toEqual('media:ads');

        liveAds = new LiveAds(ads);
        await liveAds.load();
        expect(liveAds.loaded).toEqual('media:ads:liveads');
    });

    it('allows to enhance `destroy` method', () => {
        liveAds.destroy();
        expect(liveAds.loaded).toEqual('media:ads');

        ads.destroy();
        expect(ads.loaded).toEqual('media');

        media.destroy();
        expect(media.loaded).toEqual('');
    });
});
