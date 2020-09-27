(function () {
    const destroyBtn = document.querySelector("button.destroy-player");
    const playAdBtn = document.querySelector("button.play-ad");
    const player = document.querySelector(".op-player__media");
    const instance = new OpenPlayerJS(player.id, {
        ads: {
            debug: false,
            autoPlayAdBreaks: false,
            numRedirects: 6,
            src: player.getAttribute("data-op-ads"),
        },
    });

    instance.init();

    function playAd() {
        const id = this.closest(".players").querySelector(".op-player").id;
        const player = OpenPlayer.instances[id];
        if (player.isAd()) {
            alert("Already Playing an ad");
            return;
        }
        const adsInstance = player.getAd();
        adsInstance.load(true); // Have to set force when using manual ad breaks
    }

    function destroyPlayer() {
        const id = this.closest(".players").querySelector(".op-player").id;
        const player = OpenPlayer.instances[id];
        player.destroy();
        this.removeEventListener("click", destroyPlayer);

        for (let i = 0, total = playAdBtn.length; i < total; i++) {
            playAdBtn.removeEventListener("click", playAd);
        }
    }

    destroyBtn.addEventListener("click", destroyPlayer);
    playAdBtn.addEventListener("click", playAd);
})();
