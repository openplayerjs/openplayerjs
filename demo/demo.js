(function () {
<<<<<<< Updated upstream
    var sourcesSelector = document.querySelectorAll('select[name=sources]');
    var destroyBtn = document.querySelectorAll('button.destroy-player');
    var captionBtn = document.querySelectorAll('button.load-caption');
    var controlBtn = document.querySelectorAll('button.add-control');
    var playlistBtn = document.querySelectorAll('button.add-playlist');
    var players = document.querySelectorAll('.op-player__media');
    var instances = [];

    for (var i = 0, total = players.length; i < total; i++) {
        instances[i] = new OpenPlayer(players[i].id, {
            ads: {
                src: players[i].getAttribute('data-op-ads'),
            },
            hls: {
                startLevel: -1
=======
    var sourcesSelector = document.querySelectorAll("select[name=sources]");
    var destroyBtn = document.querySelectorAll("button.destroy-player");
    var captionBtn = document.querySelectorAll("button.load-caption");
    var controlBtn = document.querySelectorAll("button.add-control");
    var players = document.querySelectorAll(".op-player__media");
    var instances = [];

    for (var i = 0, total = players.length; i < total; i++) {
        instances[i] = new OpenPlayer(
            players[i].id,
            "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpostoptimizedpod&cmsid=496&vid=short_onecue&correlator=",
            false,
            {
                ads: {
                    debug: false,
                },
                hls: {
                    startLevel: -1,
                },
>>>>>>> Stashed changes
            }
        );
        instances[i].init();
    }

    function loadMedia() {
        var id = this.closest(".players").querySelector(".op-player").id;
        var player = OpenPlayer.instances[id];
        var isAudio = !!this.closest(".audio-player");

        if (isAudio) {
            document.getElementById("stream-info").innerHTML = "";
            document.getElementById("stream-info").classList.add("hidden");
        }

        player.src = this.value.replace("&amp;", "&");
        player.load();
    }

    function destroyPlayer() {
        var id = this.closest(".players").querySelector(".op-player").id;
        var player = OpenPlayer.instances[id];
        player.destroy();
        this.removeEventListener("click", destroyPlayer);

        for (var i = 0, total = sourcesSelector.length; i < total; i++) {
            sourcesSelector[i].removeEventListener("change", loadMedia);
        }
    }

    function loadCaption() {
        var id = this.closest(".players").querySelector(".op-player").id;
        var player = OpenPlayer.instances[id];
        player.addCaptions({
            srclang: "br_PT",
            src:
                "http://brenopolanski.com/html5-video-webvtt-example/MIB2-subtitles-pt-BR.vtt",
            kind: "subtitles",
            label: "Portuguese (BR)",
        });
        this.removeEventListener("click", loadCaption);
    }

    function addControl() {
        var id = this.closest(".players").querySelector(".op-player").id;
        var player = OpenPlayer.instances[id];
        player.addControl({
            icon:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Love_Heart_SVG.svg/32px-Love_Heart_SVG.svg.png",
            title: "Test",
            position: "right",
            click: function () {
                alert("You clicked the new " + id + " control");
            },
        });
        this.removeEventListener("click", addControl);
    }

    function addPlaylist() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        player.loadPlaylist([{
            src: 'https://www.html5rocks.com/en/tutorials/video/basics/devstories.mp4',
            name: 'Test 1',
        }, {
            src: 'http://thenewcode.com/assets/videos/ocean-small.mp4',
            name: 'Test 2',
        }, {
            src: 'https://playertest.longtailvideo.com/adaptive/vod-with-mp3/manifest.m3u8',
            name: 'Test 3',
        }, {
            src: 'https://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
            name: 'Test 4',
        },]);
        this.removeEventListener('click', addPlaylist);
    }

    for (var i = 0, total = sourcesSelector.length; i < total; i++) {
        sourcesSelector[i].addEventListener("change", loadMedia);
    }

    for (var i = 0, total = destroyBtn.length; i < total; i++) {
        destroyBtn[i].addEventListener("click", destroyPlayer);
    }
    for (var i = 0, total = captionBtn.length; i < total; i++) {
        captionBtn[i].addEventListener("click", loadCaption);
    }
    for (var i = 0, total = controlBtn.length; i < total; i++) {
        controlBtn[i].addEventListener("click", addControl);
    }
    for (var i = 0, total = playlistBtn.length; i < total; i++) {
        playlistBtn[i].addEventListener('click', addPlaylist);
    }

<<<<<<< Updated upstream
    instances[1].getElement().addEventListener('readmetadata', function (event) {
        const { samples } = event.detail;
        var parsedTag = [];

        if (samples) {
            samples.forEach(function (sample) {
                if (sample && sample.data) {
                    sample.data.forEach(element => {
                        parsedTag.push(String.fromCharCode(element));
                    });
                }
            });
        }
=======
    instances[1]
        .getElement()
        .addEventListener("hlsFragParsingMetadata", function (event) {
            var encodedTag = event.detail.samples[0].data;
            var parsedTag = [];

            encodedTag.forEach(function (element) {
                parsedTag.push(String.fromCharCode(element));
            });
>>>>>>> Stashed changes

            var tagAsString = parsedTag.toString().replace(/,/g, "");
            extractMeta(tagAsString, instances[1].getElement());
        });

    function extractMeta(data, audio) {
        var name,
            desc,
            title,
            artist,
            image,
            infoArea,
            metaInfo,
            startLoc,
            endLoc;

        // name
        startLoc = data.indexOf("TRSN") + 11;
        endLoc = data.indexOf("TRSO");
        name = data.substring(startLoc, endLoc);

        // desc
        startLoc = data.indexOf("TRSO") + 11;
        endLoc = data.indexOf("TIT2");
        desc = data.substring(startLoc, endLoc);

        // artist
        startLoc = data.indexOf("TPE1") + 11;
        endLoc = data.indexOf("TPE2");
        artist = data.substring(startLoc, endLoc);

        // title
        startLoc = data.indexOf("TIT2") + 11;
        endLoc = data.indexOf("TPE1");
        title = data.substring(startLoc, endLoc);

        // image
        image = data.match("(http://|https://).*.(jpg|png|svg)")[0];
        infoArea = document.getElementById("stream-info");
        metaInfo =
            '<img src="' +
            image +
            '" alt="' +
            title +
            ", by " +
            artist +
            ' width="300"/><p>Name: ' +
            name +
            "</p>" +
            "<p>Desc: " +
            desc +
            "</p>" +
            "<p>Artist: " +
            artist +
            "</p>" +
            "<p>Title: " +
            title +
            "</p>";

        infoArea.innerHTML = metaInfo;
        infoArea.classList.remove("hidden");
        audio.poster = image;
    }
})();
