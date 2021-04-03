import { assert, expect } from 'chai';
import '../jsdom';

import OpenPlayer from '../../src/js/player';
import { loadScript } from '../../src/js/utils/general';

describe('player', () => {
    it('should create an instance of OpenPlayer by using classes', async () => {
        const video = window.document.createElement('video');
        video.id = 'video1';
        video.autoplay = true;
        video.muted = true;
        video.src = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        video.controls = true;
        global.document.body.appendChild(video);

        await loadScript('https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js');
        expect(global.window.document.querySelector('.op-player')).to.equal(true);
        assert.ok(true);
    });
    it('should create an instance of OpenPlayer by instantiating the player', async () => {
        const video = window.document.createElement('video');
        video.id = 'video1';
        video.autoplay = true;
        video.muted = true;
        video.src = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        video.controls = true;
        global.document.body.appendChild(video);
        const player = new OpenPlayer(global.window.document.querySelector('video') as HTMLMediaElement);
        await player.init();
        console.log(global.window.document.body);
        expect(global.window.document.querySelector('.op-player')).to.equal(true);
    });
});
