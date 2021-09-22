import OpenPlayerJS from '../../src/js/player';

describe('controls > play', () => {
    let player = null;

    before(done => {
        setTimeout(done, 1000);
    });

    afterEach(done => {
        if (OpenPlayerJS.instances.video) {
            OpenPlayerJS.instances.video.destroy();
        }

        player = null;
        setTimeout(done, 1000);
    });

    it('displays a Play button in the control bar to the left by default', async () => {
        player = new OpenPlayerJS('video');
        await player.init();

        const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
        expect(play).to.not.be(null);
        expect(play.tabIndex).to.equal(0);
        expect(play.title).to.equal('Play');
        expect(play.getAttribute('aria-controls')).to.equal('video');
        expect(play.getAttribute('aria-pressed')).to.equal('false');
        expect(play.getAttribute('aria-label')).to.equal('Play');
    });

    it('displays a Play button in the control bar in a different layer if indicated by options', async () => {
        player = new OpenPlayerJS('audio', {
            controls: {
                layers: {
                    'top-right': ['play'],
                },
            },
        });
        await player.init();

        expect(player.getControls().getContainer().querySelector('.op-control__right')).to.not.be(null);
        expect(player.getControls().getContainer().querySelector('.op-controls-layer__top')).to.not.be(null);
    });

    it.skip('shows a Play icon when loading media\'s metadata', done => {
        player = new OpenPlayerJS('audio', {
            startVolume: 0,
        });
        player.init();

        const checkPlay = () => {
            console.log(player.getControls());
            const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
            expect(play.classList.contains('op-controls__playpause--replay')).to.be(false);
            expect(play.classList.contains('op-controls__playpause--pause')).to.be(false);
            expect(play.title).to.equal('Play');
            expect(play.getAttribute('aria-label')).to.equal('Play');
            player.getElement().removeEventListener('loadedmetadata', checkPlay);
            done();
        };

        player.getElement().addEventListener('loadedmetadata', checkPlay);
        const e = new CustomEvent('loadedmetadata');
        player.getElement().dispatchEvent(e);
    });

    it.skip('shows a Pause icon and changes its ARIA attributes while playing media, and a Replay icon when ended', async function (done) {
        this.timeout(60000);

        player = new OpenPlayerJS('video', {
            startTime: 731,
            startVolume: 0,
        });
        await player.init();

        const events = {
            ended: () => {
                const play = player.getControls().getContainer().querySelector('.op-controls__playpause--replay') as HTMLButtonElement;
                expect(play).to.not.be(null);
                expect(play.getAttribute('aria-label')).to.equal('Play');
                expect(player.getElement().paused).to.equal(true);

                Object.keys(events).forEach(event => {
                    player.getElement().removeEventListener(event, events[event]);
                });
                done();
            },
            play: () => {
                const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
                expect(play).to.not.be(null);
                expect(play.classList.contains('op-controls__playpause--replay')).to.be(false);
                expect(play.classList.contains('op-controls__playpause--pause')).to.be(true);
                expect(play.getAttribute('aria-label')).to.equal('Pause');
                expect(player.getElement().paused).to.equal(false);
            },
            playing: () => {
                const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
                expect(play).to.not.be(null);
                expect(play.classList.contains('op-controls__playpause--replay')).to.be(false);
                expect(play.classList.contains('op-controls__playpause--pause')).to.be(true);
                expect(play.getAttribute('aria-label')).to.equal('Pause');
                expect(player.getElement().paused).to.equal(false);
            },
        };

        Object.keys(events).forEach(event => {
            player.getElement().addEventListener(event, events[event]);
        });
        player.play();
    });
});
