import OpenPlayerJS from '../../src/js/player';

describe('player', () => {
    const defaultVideo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    const defaultAudio = 'https://ccrma.stanford.edu/~jos/mp3/Latin.mp3';
    let videoPlayer;

    afterEach(() => {
        if (document.querySelector('.op-player__media').classList.contains('op-player')) {
            document.querySelector('.op-player__media').classList.remove('op-player');
        }
        if (OpenPlayerJS.instances.video) {
            OpenPlayerJS.instances.video.destroy();
        }
        if (OpenPlayerJS.instances.audio) {
            OpenPlayerJS.instances.audio.destroy();
        }
    });

    it('creates an instance of player by initializing it via configuration', () => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();

        expect(videoPlayer instanceof OpenPlayerJS).to.equal(true);
        expect(document.getElementById('video').nodeName).to.equal('DIV');
        expect(OpenPlayerJS.instances.video).to.not.equal(undefined);
        expect(videoPlayer.id).to.equal('video');
        expect(videoPlayer.getContainer().style.width).to.equal('');
        expect(videoPlayer.getContainer().style.height).to.equal('');

        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__playpause')).to.not.equal(null);
        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls-time')).to.not.equal(null);
        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__mute')).to.not.equal(null);
        expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__settings')).to.not.equal(null);

        expect(videoPlayer.getContainer().querySelector('.op-player__play')).to.not.equal(null);
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

    it('detects whether or not ads will be played', async function () {
        this.timeout(3000);
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        expect(videoPlayer.isAd()).to.equal(false);
        videoPlayer.destroy();

        videoPlayer = new OpenPlayerJS('video', {
            ads: {
                src: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpostoptimizedpod&cmsid=496&vid=short_onecue&correlator=',
            },
        });
        videoPlayer.init();
        await videoPlayer.play();
        setTimeout(() => {
            expect(videoPlayer.isAd()).to.equal(true);
            videoPlayer.pause();
        }, 3000);
    });

    it('displays the duration of media when player is loaded', function () {
        this.timeout(2500);
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        videoPlayer.play();

        setTimeout(() => {
            expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.not.equal('00:00');
        }, 1000);

        videoPlayer.destroy();

        document.getElementById('video').setAttribute('preload', 'none');
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.equal('00:00');
        videoPlayer.play();

        setTimeout(() => {
            expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.not.equal('00:00');
        }, 1000);
        document.getElementById('video').removeAttribute('preload');
    });

    it('returns a Promise when attempting to play media', () => {
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        const promise = videoPlayer.play();
        expect(promise).not.to.be(null);
        videoPlayer.destroy();

        const source = document.getElementById('video').querySelector('source');

        source.setAttribute('src', 'https://player.webvideocore.net/CL1olYogIrDWvwqiIKK7eLBkzvO18gwo9ERMzsyXzwt_t-ya8ygf2kQBZww38JJT/8i4vvznv8408.m3u8');
        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        try {
            videoPlayer.play();
            videoPlayer.pause();
            videoPlayer.destroy();
        } catch (err) {
            console.log(err);
            expect(err).not.to.be(null);
        }

        source.setAttribute('src', 'https://non-existing.test/test.mp4');

        videoPlayer = new OpenPlayerJS('video');
        videoPlayer.init();
        videoPlayer.play().catch(err => {
            expect(err instanceof DOMException).to.be(true);
        });
        source.setAttribute('src', defaultVideo);
    });
});
