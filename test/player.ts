import timers from '@sinonjs/fake-timers';
import OpenPlayerJS from '../src/js/player';
import './helper';

describe('player', () => {
    // const assertAfter = async (assertCondition, time = 1000) => {
    //     const setTimeoutPromise = timeout => new Promise(resolve => setTimeout(resolve, timeout));
    //     await setTimeoutPromise(time);
    //     return assertCondition;
    // };

    const defaultVideo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    // const defaultAudio = 'https://ccrma.stanford.edu/~jos/mp3/Latin.mp3';
    let videoPlayer;
    let audioPlayer;
    let clock;

    beforeEach(() => {
        clock = timers.install();
    });
    afterEach(() => {
        clock.uninstall();

        if (OpenPlayerJS.instances.video) {
            OpenPlayerJS.instances.video.destroy();
        }
        if (OpenPlayerJS.instances.audio) {
            OpenPlayerJS.instances.audio.destroy();
        }

        videoPlayer = null;
        audioPlayer = null;
    });

    it('creates an instance of a video player by initializing it via configuration', async () => {
        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();

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
        expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.equal('00:00');
    });

    it('creates an instance of an audio player by initializing it via configuration', async () => {
        audioPlayer = new OpenPlayerJS('audio');
        await audioPlayer.init();

        expect(audioPlayer.id).to.equal('audio');
        expect(document.querySelector('audio#audio')).to.be(null);
        expect(OpenPlayerJS.instances.audio).to.not.equal(undefined);
        expect(audioPlayer.getContainer().classList.contains('op-player__audio')).to.be(true);
        expect(audioPlayer.getContainer().style.width).to.equal('');
        expect(audioPlayer.getContainer().style.height).to.equal('');

        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls__playpause')).to.not.equal(null);
        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls-time')).to.not.equal(null);
        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls__mute')).to.not.equal(null);
        expect(audioPlayer.getControls().getContainer().querySelector('.op-controls__settings')).to.not.equal(null);
        expect(audioPlayer.getContainer().querySelector('.op-player__play')).to.equal(null);
        expect(audioPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.equal('00:00');
    });

    it('detects if user is using a mouse (by default) or keyboard', async () => {
        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(true);

        const event = new KeyboardEvent('keydown', {
            bubbles: true, cancelable: true, key: 'Q',
        });
        videoPlayer.getContainer().dispatchEvent(event);
        expect(videoPlayer.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(false);
    });

    it('detects the type of media to be played (i.e., video)', async () => {
        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__video')).to.equal(true);

        audioPlayer = new OpenPlayerJS('audio');
        await audioPlayer.init();
        expect(audioPlayer.getContainer().classList.contains('op-player__audio')).to.equal(true);
    });

    it('displays a different UI when changing the mode to `fill` or `fit` (ONLY for video)', async () => {
        videoPlayer = new OpenPlayerJS('video', { mode: 'fill' });
        await videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__full')).to.equal(true);
        videoPlayer.destroy();

        videoPlayer = new OpenPlayerJS('video', { mode: 'fit' });
        await videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__fit')).to.equal(true);
        expect(videoPlayer.getContainer().parentElement.classList.contains('op-player__fit--wrapper')).to.equal(true);

        audioPlayer = new OpenPlayerJS('audio', { mode: 'fill' });
        await audioPlayer.init();
        expect(audioPlayer.getContainer().classList.contains('op-player__full')).to.equal(false);
        audioPlayer.destroy();

        audioPlayer = new OpenPlayerJS('audio', { mode: 'fit' });
        await audioPlayer.init();
        expect(audioPlayer.getContainer().classList.contains('op-player__fit')).to.equal(false);
        expect(audioPlayer.getContainer().parentElement.classList.contains('op-player__fit--wrapper')).to.equal(false);
    });

    it('uses the width and/or height (in px or %) indicated in the configuration (#184)', async () => {
        videoPlayer = new OpenPlayerJS('video', { width: 100 });
        await videoPlayer.init();
        expect(videoPlayer.getContainer().style.width).to.equal('100px');
        expect(videoPlayer.getContainer().style.height).to.equal('');
        videoPlayer.destroy();

        videoPlayer = new OpenPlayerJS('video', { height: 100 });
        await videoPlayer.init();
        expect(videoPlayer.getContainer().style.width).to.equal('');
        expect(videoPlayer.getContainer().style.height).to.equal('100px');
        videoPlayer.destroy();

        videoPlayer = new OpenPlayerJS('video', { width: '100%', height: '50%' });
        await videoPlayer.init();
        expect(videoPlayer.getContainer().style.width).to.equal('100%');
        expect(videoPlayer.getContainer().style.height).to.equal('50%');
    });

    it('displays the duration of media when player plays media, and `preload` attribute is set to `none`', async () => {
        document.getElementById('video').setAttribute('preload', 'none');

        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        return new Promise<void>((resolve, reject) => {
            const checkDuration = () => {
                expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.equal('00:00');
                videoPlayer.getElement().removeEventListener('play', checkDuration);
                document.getElementById('video').removeAttribute('preload');
                resolve();
            };
            videoPlayer.getElement().addEventListener('play', checkDuration);

            try {
                videoPlayer.play();
            } catch (err) {
                reject();
            }
        });
    });

    it('allows user to add/remove control elements via configuration (#156)', async () => {
        const controls = {
            layers: {
                left: ['play', 'volume'],
                middle: [],
                right: [],
            },
        };

        audioPlayer = new OpenPlayerJS('audio', { controls });
        await audioPlayer.init();
        expect(audioPlayer.getContainer().querySelector('.op-controls__duration')).to.be(null);
        expect(audioPlayer.getContainer().querySelector('.op-controls__playpause')).to.not.be(null);
    });

    it.skip('handles attempts to play an invalid source', async () => {
        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        videoPlayer.src = 'https://non-existing.test/test.mp4';
        videoPlayer.load();

        try {
            videoPlayer.play();
        } catch (err) {
            expect(err instanceof DOMException).to.equal(true);
            videoPlayer.src = defaultVideo;
        }
    });

    it('allows to set dynamically any sources (media and Ads) when no sources are detected in media (#283)', async () => {
        const id = 'video';
        const source = document.getElementById(id).querySelector('source');
        const media = (document.getElementById(id) as HTMLMediaElement);
        media.setAttribute('preload', 'none');
        media.querySelector('source').remove();

        videoPlayer = new OpenPlayerJS(id);
        await videoPlayer.init();

        return new Promise<void>(resolve => {
            let assessed = false;
            videoPlayer.getElement().addEventListener('play', () => {
                const target = videoPlayer.activeElement();
                if (!assessed && target.currentTime > 0) {
                    expect(target.currentTime).to.not.equal(0);
                    media.appendChild(source);
                    assessed = true;
                    resolve();
                }
            });

            videoPlayer.src = 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3';
            videoPlayer.load();
            videoPlayer.loadAd(
                'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator='
            );

            try {
                videoPlayer.play();
            } catch (err) {
                throw new Error('error');
            }
        });
    });

    it('should allow listening to custom events and add custom config (i.e., HLS library) (#279)', async () => {
        const media = document.getElementById('video') as HTMLMediaElement;
        const source = media.querySelector('source');
        media.querySelector('source').remove();
        media.src = 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine-hls/hls.m3u8';

        videoPlayer = new OpenPlayerJS('video', {
            hls: {
                emeEnabled: true,
                enableWorker: true,
                startLevel: -1,
                widevineLicenseUrl: 'https://cwip-shaka-proxy.appspot.com/no_auth',
            },
        });
        await videoPlayer.init();

        return new Promise(resolve => {
            const manifestEvent = () => {
                expect(true).to.be(true);
                videoPlayer.getElement().removeEventListener('hlsLevelLoaded', manifestEvent);
                media.src = '';
                document.getElementById('video').appendChild(source);
                resolve();
            };
            videoPlayer.getElement().addEventListener('hlsLevelLoaded', manifestEvent);

            try {
                videoPlayer.play();
            } catch (err) {
                throw new Error('error');
            }
        });
    });
});
