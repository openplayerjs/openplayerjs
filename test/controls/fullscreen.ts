import OpenPlayerJS from '../../src/js/player';
import '../helper';

describe('controls/fullscreen', () => {
    let player = null;

    afterEach((done) => {
        if (OpenPlayerJS.instances.video) {
            OpenPlayerJS.instances.video.destroy();
        }
        if (OpenPlayerJS.instances.audio) {
            OpenPlayerJS.instances.audio.destroy();
        }

        player = null;
        done();
    });

    it('displays a Fullscreen button in the control bar to the right by default', async (): Promise<void> => {
        player = new OpenPlayerJS('video');
        await player.init();

        const fullscreen = player.getControls().getContainer().querySelector('.op-controls__fullscreen') as HTMLButtonElement;
        expect(fullscreen).to.not.be(null);
        expect(fullscreen.tabIndex).to.equal(0);
        expect(fullscreen.title).to.equal('Fullscreen');
        expect(fullscreen.getAttribute('aria-controls')).to.equal('video');
        expect(fullscreen.getAttribute('aria-pressed')).to.equal('false');
        expect(fullscreen.getAttribute('aria-label')).to.equal('Fullscreen');
        expect(document.body.classList.contains('op-fullscreen__on')).to.be(false);
    });

    it('does not display a button when using an audio player', async (): Promise<void> => {
        player = new OpenPlayerJS('audio');
        await player.init();

        const fullscreen = player.getControls().getContainer().querySelector('.op-controls__fullscreen') as HTMLButtonElement;
        expect(fullscreen).to.be(null);
    });

    it('displays a Fullscreen button in the control bar in a different layer if indicated by options', async (): Promise<void> => {
        player = new OpenPlayerJS('video', {
            controls: {
                layers: {
                    'top-right': ['fullscreen'],
                },
            },
        });
        await player.init();

        expect(player.getControls().getContainer().querySelector('.op-control__right')).to.not.be(null);
        expect(player.getControls().getContainer().querySelector('.op-controls-layer__top')).to.not.be(null);
        const fullscreen = player.getControls().getContainer().querySelector('.op-controls__fullscreen') as HTMLButtonElement;
        expect(fullscreen).to.not.be(null);
    });

    it('shows the screen on fullscreen mode when clicking on the fullscreen button', async (): Promise<void> => {
        player = new OpenPlayerJS('video');
        await player.init();

        return new Promise<void>((resolve) => {
            const fullscreen = player.getControls().getContainer().querySelector('.op-controls__fullscreen') as HTMLButtonElement;
            const e = new CustomEvent('click');
            fullscreen.dispatchEvent(e);
            expect(document.body.classList.contains('op-fullscreen__on')).to.be(true);
            resolve();
        });
    });

    it('shows fullscreen mode when using the Enter/tab space keys and fullscreen button is focused', async (): Promise<void> => {
        player = new OpenPlayerJS('video');
        await player.init();

        return new Promise<void>((resolve) => {
            const fullscreen = player.getControls().getContainer().querySelector('.op-controls__fullscreen') as HTMLButtonElement;
            const checkFullScreen = (): void => {
                expect(document.body.classList.contains('op-fullscreen__on')).to.be(true);
                resolve();
            };

            fullscreen.addEventListener('keydown', checkFullScreen);
            fullscreen.focus();

            const event = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: ' ',
            });
            fullscreen.dispatchEvent(event);
        });
    });
});
