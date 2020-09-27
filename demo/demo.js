(function () {
    const sourcesSelector = document.querySelectorAll("select[name=sources]");
    const destroyBtn = document.querySelectorAll("button.destroy-player");
    const captionBtn = document.querySelectorAll("button.load-caption");
    const controlBtn = document.querySelectorAll("button.add-control");
    const players = document.querySelectorAll(".op-player__media");
    const instances = [];
    for (let i = 0, total = players.length; i < total; i++) {
        instances[i] = new OpenPlayerJS(players[i].id, {
            ads: {
                src: players[i].getAttribute("data-op-ads") || null,
            },
            hls: {
                startLevel: -1,
            },
        });
        instances[i].init();
    }
    function loadMedia() {
        const id = this.closest(".players").querySelector(".op-player").id;
        const player = OpenPlayer.instances[id];
        const isAudio = !!this.closest(".audio-player");
        if (isAudio) {
            document.getElementById("stream-info").innerHTML = "";
            document.getElementById("stream-info").classList.add("hidden");
        }
        player.src = this.value.replace("&amp;", "&");
        player.load();
    }
    function destroyPlayer() {
        const id = this.closest(".players").querySelector(".op-player").id;
        const player = OpenPlayer.instances[id];
        player.destroy();
        this.removeEventListener("click", destroyPlayer);
        for (let i = 0, total = sourcesSelector.length; i < total; i++) {
            sourcesSelector[i].removeEventListener("change", loadMedia);
        }
    }
    function loadCaption() {
        const id = this.closest(".players").querySelector(".op-player").id;
        const player = OpenPlayer.instances[id];
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
        const id = this.closest(".players").querySelector(".op-player").id;
        const player = OpenPlayer.instances[id];
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
    for (let i = 0, total = sourcesSelector.length; i < total; i++) {
        sourcesSelector[i].addEventListener("change", loadMedia);
    }
    for (let i = 0, total = destroyBtn.length; i < total; i++) {
        destroyBtn[i].addEventListener("click", destroyPlayer);
    }
    for (let i = 0, total = captionBtn.length; i < total; i++) {
        captionBtn[i].addEventListener("click", loadCaption);
    }
    for (let i = 0, total = controlBtn.length; i < total; i++) {
        controlBtn[i].addEventListener("click", addControl);
    }
    instances[1]
        .getElement()
        .addEventListener("metadataready", function (event) {
            const { samples } = event.detail;
            const parsedTag = [];
            if (samples) {
                samples.forEach(function (sample) {
                    if (sample && sample.data) {
                        sample.data.forEach((element) => {
                            parsedTag.push(String.fromCharCode(element));
                        });
                    }
                });
                const tagAsString = parsedTag.toString().replace(/,/g, "");
                extractMeta(tagAsString, instances[1].getElement());
            }
        });
    function extractMeta(data, audio) {
        let name,
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
