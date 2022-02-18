import OpenPlayerJS from '../src/js/player';
import './helper';

describe('player', (): void => {
    const defaultVideo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    // const defaultAudio = 'https://ccrma.stanford.edu/~jos/mp3/Latin.mp3';
    let videoPlayer;
    let audioPlayer;

    afterEach((): void => {
        if (OpenPlayerJS.instances.video) {
            OpenPlayerJS.instances.video.destroy();
        }
        if (OpenPlayerJS.instances.audio) {
            OpenPlayerJS.instances.audio.destroy();
        }

        videoPlayer = null;
        audioPlayer = null;
    });

    it('creates an instance of a video player by initializing it via configuration', async (): Promise<void> => {
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

    it('creates an instance of an audio player by initializing it via configuration', async (): Promise<void> => {
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

    it('detects if user is using a mouse (by default) or keyboard', async (): Promise<void> => {
        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(true);

        const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Q',
        });
        videoPlayer.getContainer().dispatchEvent(event);
        expect(videoPlayer.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(false);
    });

    it('detects the type of media to be played (i.e., video)', async (): Promise<void> => {
        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        expect(videoPlayer.getContainer().classList.contains('op-player__video')).to.equal(true);

        audioPlayer = new OpenPlayerJS('audio');
        await audioPlayer.init();
        expect(audioPlayer.getContainer().classList.contains('op-player__audio')).to.equal(true);
    });

    it('displays a different UI when changing the mode to `fill` or `fit` (ONLY for video)', async (): Promise<void> => {
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

    it('uses the width and/or height (in px or %) indicated in the configuration (#184)', async (): Promise<void> => {
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

    it('displays the duration of media when player plays media, and `preload` attribute is set to `none`', async (): Promise<void> => {
        document.getElementById('video').setAttribute('preload', 'none');

        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        return new Promise<void>((resolve, reject) => {
            const checkDuration = (): void => {
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

    it('allows user to add/remove control elements via configuration (#156)', async (): Promise<void> => {
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

    it('prevents XSS attacks when users sets control labels (#287)', async (): Promise<void> => {
        audioPlayer = new OpenPlayerJS('audio', {
            labels: {
                play: '<div onclick="javascript:alert(\'XSS\')">Test<script>alert("Test");</script></div>',
            },
        });
        await audioPlayer.init();
        const play = audioPlayer.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
        expect(play.getAttribute('aria-label')).to.equal('Test');
    });

    it('allows the user to add captions dynamically', async (): Promise<void> => {
        const media = document.getElementById('video') as HTMLMediaElement;
        media.setAttribute('crossorigin', 'anonymous');

        videoPlayer = new OpenPlayerJS('video');
        await videoPlayer.init();
        expect(videoPlayer.getContainer().querySelector('.op-controls__captions')).to.be(null);

        videoPlayer.addCaptions({
            kind: 'subtitle',
            label: 'Test',
            src: 'http://www.mediaelementjs.com/dist/mediaelement.vtt',
            srclang: 'en-UK',
        });

        return new Promise<void>((resolve) => {
            videoPlayer.getElement().addEventListener('controlschanged', (): void => {
                expect(videoPlayer.getContainer().querySelector('.op-controls__captions')).to.not.be(null);
                media.removeAttribute('crossorigin');
                resolve();
            });
            try {
                const e = new CustomEvent('controlschanged');
                videoPlayer.getElement().dispatchEvent(e);
            } catch (err) {
                throw new Error('error');
            }
        });
    });

    it('handles attempts to play an invalid source', async (): Promise<void> => {
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

    it.skip('allows to play Ads setting them up from the configuration', async () => {
        videoPlayer = new OpenPlayerJS('video', {
            ads: {
                src: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=',
            },
        });
        await videoPlayer.init();

        return new Promise<void>((resolve) => {
            const checkForAds = (): void => {
                setTimeout(() => {
                    expect(videoPlayer.getElement().closest('.op-ads--active')).to.not.be(null);
                    videoPlayer.getElement().removeEventListener('play', checkForAds);
                    resolve();
                }, 2000);
            };
            videoPlayer.getElement().addEventListener('play', checkForAds);
            const play = videoPlayer.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
            const e = new CustomEvent('click');
            play.dispatchEvent(e);
        });
    });

    it.skip('allows to play an Ad in a loop setting them up from the configuration', async function x(done) {
        this.timeout(30000);
        videoPlayer = new OpenPlayerJS('video', {
            ads: {
                loop: true,
                src: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=',
            },
        });
        await videoPlayer.init();
        const play = videoPlayer.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
        const e = new CustomEvent('click');
        play.dispatchEvent(e);

        setTimeout(() => {
            expect(videoPlayer.getElement().closest('.op-ads--active')).to.not.be(null);
            done();
        }, 5000);
    });

    it.skip('allows to play media with Ads in loop', async function x() {
        this.timeout(30000);
        const media = document.getElementById('video') as HTMLMediaElement;
        media.loop = true;

        videoPlayer = new OpenPlayerJS('video', {
            ads: {
                loop: true,
                src: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=',
            },
        });
        await videoPlayer.init();

        return new Promise<void>((resolve) => {
            const play = videoPlayer.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
            const e = new CustomEvent('click');
            play.dispatchEvent(e);

            setTimeout(() => {
                expect(videoPlayer.getElement().closest('.op-ads--active')).to.not.be(null);
                media.loop = false;
                resolve();
            }, 2000);
        });
    });

    it('allows to set dynamically any sources (media and Ads) when no sources are detected in media (#283)', async () => {
        const id = 'video';
        const source = document.getElementById(id).querySelector('source');
        const media = document.getElementById(id) as HTMLMediaElement;
        media.setAttribute('preload', 'none');
        media.querySelector('source').remove();

        videoPlayer = new OpenPlayerJS(id);
        await videoPlayer.init();

        return new Promise<void>((resolve) => {
            let assessed = false;
            videoPlayer.getElement().addEventListener('play', (): void => {
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

    it('should allow listening to custom events and add custom config (i.e., HLS library) (#279)', async (): Promise<void> => {
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

        return new Promise((resolve) => {
            const manifestEvent = (): void => {
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

    it('allows user to add programmatically a new custom control, and remove it (#207)', async () => {
        audioPlayer = new OpenPlayerJS('audio');
        await audioPlayer.init();

        const control = {
            icon: 'https://banner2.cleanpng.com/20181210/syw/kisspng-computer-icons-scalable-vector-graphics-portable-n-browse-internet-network-svg-png-icon-free-download-5c0ee917c56041.3009306615444810478085.jpg',
            id: 'switch',
            title: 'Switch to source',
            position: 'left',
        };

        return new Promise<void>((resolve) => {
            const controlsChangedEvent = (): void => {
                expect(audioPlayer.getCustomControls().length).to.equal(1);
                audioPlayer.getElement().removeEventListener('controlschanged', controlsChangedEvent);
                audioPlayer.removeControl('switch');
                setTimeout(() => {
                    expect(audioPlayer.getCustomControls().length).to.equal(0);
                    resolve();
                }, 500);
            };
            audioPlayer.getElement().addEventListener('controlschanged', controlsChangedEvent);
            audioPlayer.addControl(control);
        });
    });
});
