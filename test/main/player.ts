import OpenPlayer from '../../src/js/player';

describe('player', () => {
    let player;

    afterEach(() => {
        if (document.querySelector('.op-player__media').classList.contains('op-player')) {
            document.querySelector('.op-player__media').classList.remove('op-player');
        }
        if (OpenPlayer.instances.player1) {
            OpenPlayer.instances.player1.destroy();
        }
    });

    it('creates an instance of player by initializing it via configuration', () => {
        player = new OpenPlayer('player1');
        player.init();

        expect(player instanceof OpenPlayer).to.equal(true);
        expect(document.getElementById('player1').nodeName).to.equal('DIV');
        expect(OpenPlayer.instances.player1).to.not.equal(undefined);
        expect(player.id).to.equal('player1');
        expect(player.getContainer().style.width).to.equal('');
        expect(player.getContainer().style.height).to.equal('');

        expect(player.getControls().getContainer().querySelector('.op-controls__playpause')).to.not.equal(null);
        expect(player.getControls().getContainer().querySelector('.op-controls-time')).to.not.equal(null);
        expect(player.getControls().getContainer().querySelector('.op-controls__mute')).to.not.equal(null);
        expect(player.getControls().getContainer().querySelector('.op-controls__settings')).to.not.equal(null);

        expect(player.getContainer().querySelector('.op-player__play')).to.not.equal(null);
    });

    it('detects if user is using a mouse (by default) or keyboard', () => {
        player = new OpenPlayer('player1');
        player.init();
        expect(player.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(true);

        const event = new KeyboardEvent('keydown', {
            bubbles: true, cancelable: true, key: 'Q',
        });
        player.getContainer().dispatchEvent(event);
        expect(player.getContainer().classList.contains('op-player__keyboard--inactive')).to.equal(false);
    });

    it('detects the type of media to be played (i.e., video)', () => {
        player = new OpenPlayer('player1');
        player.init();
        expect(player.getContainer().classList.contains('op-player__video')).to.equal(true);
    });

    it('displays a different UI when changing the mode to `fill` or `fit` (ONLY for video)', () => {
        player = new OpenPlayer('player1', { mode: 'fill' });
        player.init();
        expect(player.getContainer().classList.contains('op-player__full')).to.equal(true);
        player.destroy();

        player = new OpenPlayer('player1', { mode: 'fit' });
        player.init();
        expect(player.getContainer().classList.contains('op-player__fit')).to.equal(true);
        expect(player.getContainer().parentElement.classList.contains('op-player__fit--wrapper')).to.equal(true);
    });

    it('uses the width and/or height (in px or %) indicated in the configuration', () => {
        player = new OpenPlayer('player1', { width: 100 });
        player.init();
        expect(player.getContainer().style.width).to.equal('100px');
        expect(player.getContainer().style.height).to.equal('');
        player.destroy();

        player = new OpenPlayer('player1', { height: 100 });
        player.init();
        expect(player.getContainer().style.width).to.equal('');
        expect(player.getContainer().style.height).to.equal('100px');
        player.destroy();

        player = new OpenPlayer('player1', { width: '100%', height: '50%' });
        player.init();
        expect(player.getContainer().style.width).to.equal('100%');
        expect(player.getContainer().style.height).to.equal('50%');
    });

    it('detects whether or not ads will be played', function () {
        this.timeout(2000);
        player = new OpenPlayer('player1');
        player.init();
        expect(player.isAd()).to.equal(false);
        player.destroy();

        player = new OpenPlayer('player1', {
            ads: {
                src: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpostoptimizedpod&cmsid=496&vid=short_onecue&correlator=',
            },
        });
        player.init();
        player.play();
        setTimeout(() => {
            expect(player.isAd()).to.equal(true);
            player.pause();
        }, 2000);
    });

    it('displays the duration of media when player is loaded', function () {
        this.timeout(2500);
        player = new OpenPlayer('player1');
        player.init();
        player.play();

        setTimeout(() => {
            expect(player.getContainer().querySelector('.op-controls__duration').innerText).to.not.equal('00:00');
        }, 1000);

        player.destroy();

        document.getElementById('player1').setAttribute('preload', 'none');
        player = new OpenPlayer('player1');
        player.init();
        expect(player.getContainer().querySelector('.op-controls__duration').innerText).to.equal('00:00');
        player.play();

        setTimeout(() => {
            expect(player.getContainer().querySelector('.op-controls__duration').innerText).to.not.equal('00:00');
        }, 1000);
        document.getElementById('player1').removeAttribute('preload');
    });

    // it('Autoplays if `autoplay` attribute is present', function (done) {
    //     this.timeout(1500);
    //     expect(player.autoplay).to.equal(false);
    //     player.autoplay = true;
    //     setTimeout(() => {
    //         expect(player.autoplay).to.equal(true);
    //         player.pause();
    //         player.autoplay = false;
    //         expect(player.autoplay).to.equal(false);
    //         done();
    //     }, 1000);
    // });

    // it('Allows user to manipulate player with keyboard', () => {
    //     const event = new CustomEvent('keydown');
    //     event.keyCode = 39;
    //     player.getContainer().dispatchEvent(event);
    //     expect(player.media.currentTime > 0).to.equal(true);

    //     const e = new CustomEvent('keydown');
    //     e.keyCode = 37;
    //     player.getContainer().dispatchEvent(e);
    //     expect(player.media.currentTime === 0).to.equal(true);

    //     const playEvent = new CustomEvent('keydown');
    //     playEvent.keyCode = 13;
    //     player.getContainer().dispatchEvent(playEvent);
    //     expect(player.media.paused).to.equal(!!player.media.paused);
    //     player.media.currentTime = 0;
    // });

    // it('Plays/pauses media correctly', done => {
    //     player.pause();
    //     setTimeout(() => {
    //         expect(player.getContainer().querySelector('.op-player__play--paused')).to.equal(null);
    //         player.play();

    //         setTimeout(() => {
    //             expect(player.getContainer().querySelector('.op-player__play--paused')).to.not.equal(null);
    //             player.pause();
    //             done();
    //         }, 300);
    //     }, 1000);
    // });

    // it('Creates controls if browser is not iOS', () => {
    //     if (iOS) {
    //         expect(player.getContainer().querySelector('.op-controls')).to.equal(null);
    //     } else {
    //         expect(player.getContainer().querySelector('.op-controls')).to.not.equal(null);
    //     }
    // });

    // it('Creates play/loader button at the level of media display element', () => {
    //     expect(player.getContainer().querySelector('.op-player__play')).to.not.equal(null);
    //     expect(player.getContainer().querySelector('.op-player__loader')).to.not.equal(null);
    // });

    // it('Detects captions if `track` tag(s) present', function (done) {
    //     this.timeout(1500);
    //     const trackTags = player.element.querySelectorAll('track');
    //     setTimeout(() => {
    //         expect(player.getContainer().getAttribute('class').indexOf('op-captions--detected') > -1).to.equal(!!trackTags.length);
    //         done();
    //     }, 1000);
    // });

    // it('Displays captions automatically if `track` tag(s) present', done => {
    //     expect(player.getContainer().querySelector('.op-controls__captions')
    // .getAttribute('class').indexOf('op-controls__captions--on') > -1).to.equal(true);
    //     player.play();
    //     setTimeout(() => {
    //         expect(player.getContainer().querySelector('.op-captions>span').innerHTML).to.not.equal('');
    //         setTimeout(() => {
    //             player.pause();
    //             done();
    //         }, 500);
    //     }, 1000);
    // });

    // // it('Adds caption dynamically and renders it if `default` attribute is passed in object', function (done) {
    // //     this.timeout(1500);
    // //     player.addCaptions({
    // //         srclang: 'br_PT',
    // //         src: 'http://brenopolanski.com/html5-video-webvtt-example/MIB2-subtitles-pt-BR.vtt',
    // //         kind: 'subtitles',
    // //         label: 'Portuguese (BR)',
    // //         default: true
    // //     });

    // //     setTimeout(() => {
    // //         expect(player.getContainer().querySelector('.op-controls__captions')
    // .getAttribute('data-active-captions')).to.equal('br_PT');
    // //         expect(player.getContainer().querySelector('.op-settings__menu-label[data-value="captions-br_PT"]')).to.not.equal(null);
    // //         done();
    // //     }, 1000);
    // // });

    // it('Unmutes/mutes media when clicking on `Mute` button', () => {
    //     const mute = player.getContainer().querySelector('.op-controls__mute');
    //     const event = new CustomEvent('click');
    //     const isMuted = player.media.muted;
    //     mute.dispatchEvent(event);
    //     expect(player.getContainer().querySelector('.op-controls__mute').getAttribute('aria-label'))
    //         .to.equal((isMuted ? 'Mute' : 'Unmute'));
    //     mute.dispatchEvent(event);
    //     expect(player.getContainer().querySelector('.op-controls__mute').getAttribute('aria-label'))
    //         .to.equal((isMuted ? 'Unmute' : 'Mute'));
    // });

    // it('Renders a `fullscreen` button only for video', () => {
    //     if (iOS) {
    //         expect(player.getContainer().querySelector('.op-controls__fullscreen')).to.equal(null);
    //     } else {
    //         expect(player.getContainer().querySelector('.op-controls__fullscreen')).to.not.equal(null);
    //     }
    // });

    // // it('Toggles fullscreen when clicking on `Fullscreen` button', function (done) {
    // //     this.timeout(3500);
    // //     const fullscreen = player.getContainer().querySelector('.op-controls__fullscreen');
    // //     const event = new CustomEvent('click');
    // //     fullscreen.dispatchEvent(event);
    // //     done();
    // //     setTimeout(() => {
    // //         expect(player.getContainer().querySelector('.op-controls__fullscreen--out')).to.not.equal(null);
    // //         const e = new CustomEvent('click');
    // //         fullscreen.dispatchEvent(e);
    // //         setTimeout(() => {
    // //             expect(player.getContainer().querySelector('.op-controls__fullscreen--out')).to.equal(null);
    // //             done();
    // //         }, 1000);
    // //     }, 1000);
    // // });

    // it('Toggles settings when clicking on button', () => {
    //     const button = player.getContainer().querySelector('.op-controls__settings');
    //     const event = new CustomEvent('click');
    //     button.dispatchEvent(event);
    //     expect(player.getContainer().querySelector('.op-settings').getAttribute('aria-hidden')).to.equal('false');
    //     button.dispatchEvent(event);
    //     expect(player.getContainer().querySelector('.op-settings').getAttribute('aria-hidden')).to.equal('true');
    // });

    // it('Changes source correctly (from MP4 to HLS, and viceversa)', function (done) {
    //     this.timeout(2500);
    //     player.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
    //     player.load();
    //     player.play();
    //     expect(player.src[0].src).to.equal('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8');
    //     expect(player.src[0].type).to.equal('application/x-mpegURL');
    //     setTimeout(() => {
    //         player.pause();
    //         player.src = 'http://clips.vorwaerts-gmbh.de/VfE_html5.mp4';
    //         player.load();
    //         expect(player.src[0].src).to.equal('http://clips.vorwaerts-gmbh.de/VfE_html5.mp4');
    //         expect(player.src[0].type).to.equal('video/mp4');
    //         done();
    //     }, 2000);
    // });

    // it('Destroys player correctly', done => {
    //     setTimeout(() => {
    //         player.destroy();
    //         expect(player.getContainer().getAttribute('class').indexOf('.op-player') > -1).to.equal(false);
    //         expect(document.getElementById('player1').nodeName).to.equal('VIDEO');
    //         done();
    //     }, 1000);
    // });

    // it('Recreate player correctly', () => {
    //     player = new OpenPlayer('player1');
    //     player.init();
    //     expect(player instanceof OpenPlayer).to.equal(true);
    //     expect(document.getElementById('player1').nodeName).to.equal('DIV');

    //     player.destroy();
    //     expect(player.getContainer().getAttribute('class').indexOf('.op-player') > -1).to.equal(false);
    //     expect(document.getElementById('player1').nodeName).to.equal('VIDEO');

    //     player = new OpenPlayer('player1');
    //     player.init();
    //     expect(player instanceof OpenPlayer).to.equal(true);
    //     expect(document.getElementById('player1').nodeName).to.equal('DIV');
    // });
});
