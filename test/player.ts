import Player from '../src/player';

describe('player', () => {
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
    });

    it('forbids creating a player instance with elements different than video/audio, or without the `op-player__media` class', async () => {
        const container = document.createElement('div') as unknown as HTMLMediaElement;
        const player = new Player(container);
        await player.init();
        expect(player.id).toBeFalsy();
    });
});
