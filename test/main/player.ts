import timers from '@sinonjs/fake-timers';
import OpenPlayerJS from '../../src/js/player';

describe('player', () => {
    const defaultVideo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    // const defaultAudio = 'https://ccrma.stanford.edu/~jos/mp3/Latin.mp3';
    let videoPlayer;
    let audioPlayer;
    let clock;

    beforeEach(() => {
        clock = timers.install();
    });

    afterEach('clean code', done => {
        if (document.querySelector('.op-player__media').classList.contains('op-player')) {
            document.querySelector('.op-player__media').classList.remove('op-player');
        }
        if (OpenPlayerJS.instances.video) {
            OpenPlayerJS.instances.video.destroy();
        }
        if (OpenPlayerJS.instances.audio) {
            OpenPlayerJS.instances.audio.destroy();
        }

        clock.uninstall();
        setTimeout(done, 1000);
    });

    it('creates an instance of player by initializing it via configuration', () => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();

        expect(videoPlayer instanceof OpenPlayerJS).to.equal(true);
        expect(document.getElementById('video').nodeName).to.equal('DIV');
        expect(videoPlayer.id).to.equal('video');
        expect(document.querySelector('video#video')).to.be(null);
        expect(OpenPlayerJS.instances.video).to.not.equal(undefined);
        expect(videoPlayer.getContainer().classList.contains('op-player__video')).to.be(true);
        expect(videoPlayer.getContainer().style.width).to.equal('');
        expect(videoPlayer.getContainer().style.height).to.equal('');

        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__playpause')).to.not.equal(null);
        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls-time')).to.not.equal(null);
        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__mute')).to.not.equal(null);
        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__settings')).to.not.equal(null);
        expect(videoPlayer.getContainer().querySelector('.op-player__play')).to.not.equal(null);

        audioPlayer = new OpenPlayerJS('audio');
        audioPlayer.init();

        expect(audioPlayer.id).to.equal('audio');
        expect(document.querySelector('audio#audio')).to.be(null);
        expect(OpenPlayerJS.instances.video).to.not.equal(undefined);
        expect(audioPlayer.getContainer().classList.contains('op-player__audio')).to.be(true);
        expect(audioPlayer.getContainer().style.width).to.equal('');
        expect(audioPlayer.getContainer().style.height).to.equal('');

        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls__playpause')).to.not.equal(null);
        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls-time')).to.not.equal(null);
        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls__mute')).to.not.equal(null);
        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls__settings')).to.not.equal(null);
        expect(audioPlayer.getContainer().querySelector('.op-player__play')).to.equal(null);
    });

    it('detects if user is using a mouse (by default) or keyboard', () => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(true);

        const event = new KeyboardEvent('keydown', {
            bubbles: true, cancelable: true, key: 'Q',
        });
        videoPlayer.getContainer().dispatchEvent(event);
        expect(videoPlayer.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(false);
    });

    it('detects the type of media to be played (i.e., video)', () => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__video')).to.equal(true);

        audioPlayer = new OpenPlayerJS('audio');
        audioPlayer.init();
        expect(audioPlayer.getContainer().classList.contains('op-player__audio')).to.equal(true);
    });

    it('displays a different UI when changing the mode to `fill` or `fit` (ONLY for video)', () => {
        videoPlayer = new OpenPlayerJS('video', { mode: 'fill' });
        videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__full')).to.equal(true);
        videoPlayer.destroy();

        videoPlayer = new OpenPlayerJS('video', { mode: 'fit' });
        videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__fit')).to.equal(true);
        expect(videoPlayer.getContainer().parentElement.classList.contains('op-player__fit--wrapper')).to.equal(true);

        audioPlayer = new OpenPlayerJS('audio', { mode: 'fill' });
        audioPlayer.init();
        expect(audioPlayer.getContainer().classList.contains('op-player__full')).to.equal(false);
        audioPlayer.destroy();

        audioPlayer = new OpenPlayerJS('audio', { mode: 'fit' });
        audioPlayer.init();
        expect(audioPlayer.getContainer().classList.contains('op-player__fit')).to.equal(false);
        expect(audioPlayer.getContainer().parentElement.classList.contains('op-player__fit--wrapper')).to.equal(false);
    });

    it('uses the width and/or height (in px or %) indicated in the configuration', () => {
        videoPlayer = new OpenPlayerJS('video', { width: 100 });
        videoPlayer.init();
        expect(videoPlayer.getContainer().style.width).to.equal('100px');
        expect(videoPlayer.getContainer().style.height).to.equal('');
        videoPlayer.destroy();

        videoPlayer = new OpenPlayerJS('video', { height: 100 });
        videoPlayer.init();
        expect(videoPlayer.getContainer().style.width).to.equal('');
        expect(videoPlayer.getContainer().style.height).to.equal('100px');
        videoPlayer.destroy();

        videoPlayer = new OpenPlayerJS('video', { width: '100%', height: '50%' });
        videoPlayer.init();
        expect(videoPlayer.getContainer().style.width).to.equal('100%');
        expect(videoPlayer.getContainer().style.height).to.equal('50%');
    });

    // @todo Determine why Ads script is not loaded here
    it.skip('detects whether or not ads will be played', async function (done) {
        this.timeout(40000);
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        await videoPlayer.play();
        clock.tick(510);
        expect(videoPlayer.isAd()).to.equal(false);
        videoPlayer.destroy();
        videoPlayer = new OpenPlayerJS('video', {
            ads: {
                src: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpostoptimizedpod&cmsid=496&vid=short_onecue&correlator=',
            },
        });
        videoPlayer.init();
        videoPlayer.play();
        setTimeout(() => {
            videoPlayer.pause();
            console.log(videoPlayer.isAd());
            done();
        }, 5000);
    });

    // @todo Determine why media is not loaded and plays
    it.skip('displays the duration of media when player is loaded, or when it starts playing and `preload` attribute is `none`', done => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        videoPlayer.play();
        setTimeout(() => {
            videoPlayer.pause();
            console.log(videoPlayer.getElement().currentTime);
        }, 1000);
        clock.tick(1100);
        expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.not.equal('00:00');
        videoPlayer.destroy();

        document.getElementById('video').setAttribute('preload', 'none');
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.equal('00:00');
        videoPlayer.play();
        clock.tick(1100);
        expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.not.equal('00:00');
        document.getElementById('video').removeAttribute('preload');
        done();
    });

    it('allows user to add/remove control elements via configuration', () => {
        const controls = {
            layers: {
                left: ['play', 'volume'],
                middle: [],
                right: [],
            },
        };

        videoPlayer = new OpenPlayerJS('video', { controls });
        videoPlayer.init();
        expect(videoPlayer.getContainer().querySelector('.op-controls__duration')).to.be(null);
        expect(videoPlayer.getContainer().querySelector('.op-controls__playpause')).to.not.be(null);

        audioPlayer = new OpenPlayerJS('audio', { controls });
        audioPlayer.init();
        expect(audioPlayer.getContainer().querySelector('.op-controls__duration')).to.be(null);
        expect(audioPlayer.getContainer().querySelector('.op-controls__playpause')).to.not.be(null);
    });

    it('allows to set a source or more after it has been initialized', async () => {
        const source = document.getElementById('video').querySelector('source');
        document.getElementById('video').querySelector('source').remove();

        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        videoPlayer.src = { type: 'video/mp4', src: defaultVideo };
        await videoPlayer.load();

        expect(videoPlayer.getMedia().src).to.eql([{
            type: 'video/mp4',
            // tslint:disable-next-line:object-literal-sort-keys
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        }]);
        document.getElementById('video').appendChild(source);
    });

    it('returns a Promise when playing media', done => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        const promise = videoPlayer.play();
        expect(promise).not.to.be(null);
        done();
    });

    it('handles attempts to play an invalid source', done => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.src = 'https://non-existing.test/test.mp4';
        videoPlayer.init();
        try {
            videoPlayer.play();
        } catch (err) {
            expect(err instanceof DOMException).to.equal(true);
        } finally {
            videoPlayer.src = defaultVideo;
            done();
        }
    });

    it('loads new media correctly by just setting the source, even after initializing the player', done => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.src = 'https://player.webvideocore.net/CL1olYogIrDWvwqiIKK7eLBkzvO18gwo9ERMzsyXzwt_t-ya8ygf2kQBZww38JJT/8i4vvznv8408.m3u8';
        videoPlayer.init();
        videoPlayer.play();
        const f = true;
        try {
            setTimeout(() => {
                console.log(videoPlayer.getElement().duration);
                expect(f).to.be(true);
                done();
            }, 1000);
        } catch (err) {
            done();
        }
    });

    it('should allow listening to custom events and add custom config for HLS library', function (done) {
        this.timeout(6000);
        const media = (document.getElementById('video') as HTMLMediaElement);
        // media.autoplay = true;
        videoPlayer = new OpenPlayerJS('video', {
            hls: {
                emeEnabled: true,
                enableWorker: true,
                startLevel: -1,
                widevineLicenseUrl: 'https://cwip-shaka-proxy.appspot.com/no_auth',
            },
        });
        videoPlayer.src = 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine-hls/hls.m3u8';
        videoPlayer.init();
        videoPlayer.play();

        videoPlayer.getElement().addEventListener('hlsLevelLoaded', (e, data) => {
            console.log(data);
            expect(e).to.not.be(null);
            videoPlayer.src = defaultVideo;
            media.autoplay = false;
            done();
        });
    });

    it('should allow listening to custom events and add custom config for FLV library', function (done) {
        this.timeout(6000);
        const media = (document.getElementById('video') as HTMLMediaElement);
        // media.autoplay = true;

        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.src = 'https://flv.bdplay.nodemedia.cn/live/bbb.flv';
        videoPlayer.init();

        videoPlayer.getElement().addEventListener('error', e => {
            expect(e).to.not.be(null);
            videoPlayer.src = defaultVideo;
            media.autoplay = false;
            done();
        });
    });
});
