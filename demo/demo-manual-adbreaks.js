(function () {
    var destroyBtn = document.querySelectorAll('button.destroy-player');
    var playAdBtn = document.querySelectorAll('button.play-ad');
    var players = document.querySelectorAll('.op-player__media');
    var instances = [];

    for (var i = 0, total = players.length; i < total; i++) {
        var ads = i === 0 ? players[i].getAttribute('data-op-ads') : null;
        instances[i] = new OpenPlayer(players[i].id, ads, false, {
            ads: {
                debug: false,
                autoPlayAdBreaks: false
            },
            hls: {
                startLevel: -1
            }
        });

        instances[i].init();
    }

    function playAd() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        if(player.isAd()) {
    		alert('Already Playing an ad');
    		return;
    	}
        var adsInstance = player.getAd();
        adsInstance.load(true); //Have to set force when using manual ad breaks
    }

    function destroyPlayer() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        player.destroy();
        this.removeEventListener('click', destroyPlayer);

        for (var i = 0, total = sourcesSelector.length; i < total; i++) {
            sourcesSelector[i].removeEventListener('change', loadMedia);
        }

        for (var i = 0, total = playAdBtn.length; i < total; i++) {
            playAdBtn[i].removeEventListener('click', playAd);
        }
    }

    for (var i = 0, total = destroyBtn.length; i < total; i++) {
        destroyBtn[i].addEventListener('click', destroyPlayer);
    }

    for (var i = 0, total = playAdBtn.length; i < total; i++) {
        playAdBtn[i].addEventListener('click', playAd);
    }

})();