// import Controls from '../src/js/controls';
// import OpenPlayerJS from '../src/js/player';
// import './helper';

// describe('controls', () => {
//     let videoPlayer;
//     let controlBar;

//     afterEach(() => {
//         if (OpenPlayerJS.instances.video) {
//             OpenPlayerJS.instances.video.destroy();
//         }

//         videoPlayer = null;
//         controlBar = null;
//     });

//     it('creates the default controls of player if none are passed in the configuration', async () => {
//         videoPlayer = new OpenPlayerJS('video');
//         controlBar = new Controls(videoPlayer);
//         controlBar.create();

//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__playpause')).to.not.equal(null);
//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls-time')).to.not.equal(null);
//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__mute')).to.not.equal(null);
//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__settings')).to.not.equal(null);
//         expect(videoPlayer.getContainer().querySelector('.op-player__play')).to.not.equal(null);
//         expect(videoPlayer.getContainer().querySelector('.op-controls__duration').innerText).to.equal('00:00');
//         expect(videoPlayer.getContainer().querySelector('.op-status')).to.not.equal(null);
//     });

//     it('creates the specified controls of player when passed in the configuration', async () => {
//         videoPlayer = new OpenPlayerJS('video', {
//             controls: {
//                 layers: {
//                     'top-left': ['captions', 'fullscreen'],
//                     'top-right': ['play'],
//                 },
//             },
//         });

//         controlBar = new Controls(videoPlayer);
//         controlBar.create();

//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__playpause')).to.not.equal(null);
//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls-time')).to.equal(null);
//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__mute')).to.equal(null);
//         expect(videoPlayer.getControls().getContainer().querySelector('.op-controls__settings')).to.equal(null);
//         expect(videoPlayer.getContainer().querySelector('.op-player__play')).to.not.equal(null);
//         expect(videoPlayer.getContainer().querySelector('.op-controls__duration')).to.equal(null);
//         expect(videoPlayer.getContainer().querySelector('.op-status')).to.equal(null);
//     });

//     it('auto hides the control bar by default once media starts playing', async () => {
//         videoPlayer = new OpenPlayerJS('video');
//         controlBar = new Controls(videoPlayer);
//         controlBar.create();

//         return new Promise<void>((resolve) => {
//             expect(videoPlayer.getControls().getContainer().classList.contains('op-controls--hidden')).to.equal(false);
//             setTimeout(() => {
//                 expect(videoPlayer.getControls().getContainer().classList.contains('op-controls--hidden')).to.equal(true);
//                 resolve();
//             }, 500);
//         });
//     });

//     it('allows to show permanently the control bar if indicated in settings', async () => {
//         videoPlayer = new OpenPlayerJS('video', {
//             controls: {
//                 alwaysVisible: true,
//             },
//         });
//         controlBar = new Controls(videoPlayer);
//         controlBar.create();

//         return new Promise<void>((resolve) => {
//             expect(videoPlayer.getControls().getContainer().classList.contains('op-controls--hidden')).to.equal(false);
//             setTimeout(() => {
//                 expect(videoPlayer.getControls().getContainer().classList.contains('op-controls--hidden')).to.equal(false);
//                 resolve();
//             }, 500);
//         });
//     });
// });
