import OpenPlayerJS from '../../src/js/player';
import '../helper';

describe('controls/play', (): void => {
    let player = null;

    afterEach((done) => {
        player.pause();

        if (OpenPlayerJS.instances.video) {
            OpenPlayerJS.instances.video.destroy();
        }
        if (OpenPlayerJS.instances.audio) {
            OpenPlayerJS.instances.audio.destroy();
        }

        player = null;
        done();
    });

    it('displays a Play button in the control bar to the left by default', async (): Promise<void> => {
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

    it('displays a Play button in the control bar in a different layer if indicated by options', async (): Promise<void> => {
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

    it('shows a Pause icon while playing media, and a Replay icon when ended (changes ARIA values)', async function test(): Promise<void> {
        this.timeout(60000);

        player = new OpenPlayerJS('video', {
            startTime: 731,
            startVolume: 0,
        });
        await player.init();
        return new Promise((resolve) => {
            const events = {
                ended: (): void => {
                    const play = player.getControls().getContainer().querySelector('.op-controls__playpause--replay') as HTMLButtonElement;
                    expect(play).to.not.be(null);
                    expect(play.getAttribute('aria-label')).to.equal('Play');
                    expect(player.getElement().paused).to.equal(true);

                    Object.keys(events).forEach((event) => {
                        player.getElement().removeEventListener(event, events[event]);
                    });
                    player.getElement().currentTime = 0;
                    resolve();
                },
                play: (): void => {
                    const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
                    expect(play).to.not.be(null);
                    expect(play.classList.contains('op-controls__playpause--replay')).to.be(false);
                    expect(play.classList.contains('op-controls__playpause--pause')).to.be(true);
                    expect(play.getAttribute('aria-label')).to.equal('Pause');
                    expect(player.getElement().paused).to.equal(false);
                },
                playing: (): void => {
                    const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
                    expect(play).to.not.be(null);
                    expect(play.classList.contains('op-controls__playpause--replay')).to.be(false);
                    expect(play.classList.contains('op-controls__playpause--pause')).to.be(true);
                    expect(play.getAttribute('aria-label')).to.equal('Pause');
                    expect(player.getElement().paused).to.equal(false);
                },
            };

            Object.keys(events).forEach((event) => {
                player.getElement().addEventListener(event, events[event]);
            });
            try {
                player.play();
            } catch (err) {
                throw new Error('error');
            }
        });
    });
    it('plays/pauses the media when clicking on the play button', async (): Promise<void> => {
        player = new OpenPlayerJS('video');
        await player.init();

        return new Promise<void>((resolve) => {
            const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
            const e = new CustomEvent('click');
            play.dispatchEvent(e);

            expect(play.classList.contains('op-controls__playpause--pause')).to.be(true);
            resolve();
        });
    });

    it('plays/pauses the media when using the Enter/tab space keys and play button is focused', async (): Promise<void> => {
        player = new OpenPlayerJS('video');
        await player.init();

        return new Promise<void>((resolve) => {
            const play = player.getControls().getContainer().querySelector('.op-controls__playpause') as HTMLButtonElement;
            let e = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                keyCode: 13,
            });
            play.focus();
            play.dispatchEvent(e);

            setTimeout((): void => {
                expect(play.classList.contains('op-controls__playpause--pause')).to.be(true);

                e = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: ' ',
                    keyCode: 32,
                });

                play.dispatchEvent(e);
                expect(play.classList.contains('op-controls__playpause--pause')).to.be(false);
                resolve();
            }, 500);
        });
    });
});
