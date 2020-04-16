(function () {
    var destroyBtn = document.querySelector('button.destroy-player');
    var playAdBtn = document.querySelector('button.play-ad');
    var player = document.querySelector('.op-player__media');
    var instance = new OpenPlayer(player.id, player.getAttribute('data-op-ads'), false, {
        ads: {
            debug: false,
            autoPlayAdBreaks: false,
            numRedirects: 6,
        },
    });

    instance.init();

    function playAd() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        if (player.isAd()) {
    		alert('Already Playing an ad');
    		return;
    	}
        var adsInstance = player.getAd();
        adsInstance.load(true); // Have to set force when using manual ad breaks
    }

    function destroyPlayer() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        player.destroy();
        this.removeEventListener('click', destroyPlayer);

        for (var i = 0, total = playAdBtn.length; i < total; i++) {
            playAdBtn.removeEventListener('click', playAd);
        }
    }

    destroyBtn.addEventListener('click', destroyPlayer);
    playAdBtn.addEventListener('click', playAd);
})();