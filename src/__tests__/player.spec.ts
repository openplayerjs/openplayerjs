import Player from '../player';

describe('player', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'crypto', {
            value: { getRandomValues: jest.fn().mockReturnValueOnce(new Uint32Array(10)) },
        });
    });

    afterEach(() => {
        Object.keys(Player.instances).forEach((instance) => {
            Player.instances[instance].destroy();
        });
    });

    it('creates player using video/audio tags', async () => {
        const video = document.createElement('video') as HTMLMediaElement;
        video.className = 'op-player__media';
        video.id = 'video';
        video.controls = true;
        video.muted = true;

        const player = new Player(video);
        await player.init();
        expect(player.id).toEqual('video');
        expect(player.initialized()).toBeTrue();
        expect(Player.instances[player.id]).not.toBeUndefined();

        const audio = document.createElement('video') as HTMLMediaElement;
        audio.className = 'op-player__media';
        audio.controls = true;

        const audioPlayer = new Player(audio);
        await audioPlayer.init();
        expect(audioPlayer.id).not.toBeUndefined();
        expect(audioPlayer.initialized()).toBeTrue();
        expect(Player.instances[audioPlayer.id]).not.toBeUndefined();
    });

    it('forbids creating a player instance with elements different than video/audio, or without the `op-player__media` class', async () => {
        const container1 = document.createElement('div') as unknown as HTMLMediaElement;
        const player1 = new Player(container1);
        await player1.init();
        expect(player1.id).toBeFalsy();

        const container2 = document.createElement('div') as unknown as HTMLMediaElement;
        container2.className = 'my-test-class';
        const player2 = new Player(container2);
        await player2.init();
        expect(player2.id).toBeFalsy();
    });
});
