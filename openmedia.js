import Player from './src/player';

const targets = document.querySelectorAll('video.om__player, audio.om__player, iframe.om__player');
const instances = [];
for (let i = 0, total = targets.length; i < total; i++) {
    instances.push(new Player(targets[i]));
}
