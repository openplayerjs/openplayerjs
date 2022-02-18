import OpenPlayerJS from '../../src/js/player';
import { formatTime } from '../../src/js/utils/time';
import '../helper';

describe('controls/time', () => {
    let player = null;

    afterEach((done) => {
        player.destroy();
        player = null;
        done();
    });

    it('displays the current time and duration in the control bar to the left by default', async (): Promise<void> => {
        player = new OpenPlayerJS('audio');
        await player.init();

        const current = player.getControls().getContainer().querySelector('.op-controls__current') as HTMLInputElement;
        expect(current).to.not.be(null);
        expect(current.getAttribute('role')).to.equal('timer');
        expect(current.getAttribute('aria-live')).to.equal('off');
        expect(current.getAttribute('aria-hidden')).to.equal('false');
        expect(current.textContent).to.equal('00:00');

        const delimiter = player.getControls().getContainer().querySelector('.op-controls__time-delimiter') as HTMLElement;
        expect(delimiter).to.not.be(null);
        expect(delimiter.getAttribute('aria-hidden')).to.equal('false');
        expect(delimiter.textContent).to.equal('/');

        const duration = player.getControls().getContainer().querySelector('.op-controls__duration') as HTMLInputElement;
        expect(duration).to.not.be(null);
        expect(duration.getAttribute('aria-hidden')).to.equal('false');
        expect(duration.textContent).to.equal(formatTime(player.getOptions().progress.duration));

        expect(player.getControls().getContainer().querySelector('.op-controls-time')).to.not.be(null);
    });

    it('displays current time and duration in the control bar in a different layer if indicated by options', async (): Promise<void> => {
        player = new OpenPlayerJS('video', {
            controls: {
                layers: {
                    'top-right': ['time'],
                },
            },
        });
        await player.init();

        expect(player.getControls().getContainer().querySelector('.op-control__right')).to.not.be(null);
        expect(player.getControls().getContainer().querySelector('.op-controls-layer__top')).to.not.be(null);
        const current = player.getControls().getContainer().querySelector('.op-controls__current') as HTMLInputElement;
        expect(current).to.not.be(null);
    });

    it('displays the current time ONLY in the control bar if indicated by options', async (): Promise<void> => {
        player = new OpenPlayerJS('video', {
            progress: {
                showCurrentTimeOnly: true,
            },
        });
        await player.init();

        const current = player.getControls().getContainer().querySelector('.op-controls__current') as HTMLInputElement;
        expect(current).to.not.be(null);

        const delimiter = player.getControls().getContainer().querySelector('.op-controls__time-delimiter') as HTMLElement;
        expect(delimiter).to.be(null);

        const duration = player.getControls().getContainer().querySelector('.op-controls__duration') as HTMLInputElement;
        expect(duration).to.be(null);
    });

    it('displays a different duration if indicated by options', async (): Promise<void> => {
        player = new OpenPlayerJS('video', {
            progress: {
                duration: 50,
            },
        });
        await player.init();

        const current = player.getControls().getContainer().querySelector('.op-controls__current') as HTMLInputElement;
        expect(current).to.not.be(null);

        const delimiter = player.getControls().getContainer().querySelector('.op-controls__time-delimiter') as HTMLElement;
        expect(delimiter).to.not.be(null);

        const duration = player.getControls().getContainer().querySelector('.op-controls__duration') as HTMLInputElement;
        expect(duration).to.not.be(null);
        expect(duration.textContent).to.equal(formatTime(50));
    });
});
