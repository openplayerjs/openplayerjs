(function () {
    var sourcesSelector = document.querySelectorAll('select[name=sources]');
    var destroyBtn = document.querySelectorAll('button.destroy-player');
    var captionBtn = document.querySelectorAll('button.load-caption');
    var players = document.querySelectorAll('.op-player__media');
    var instances = [];

    for (var i = 0, total = players.length; i < total; i++) {
        var ads = i === 0 ? [players[i].getAttribute('data-op-ads'),] : null;
        instances[i] = new OpenPlayer(players[i].id, ads, false, {
            ads: {
                debug: false,
            },
            hls: {
                startLevel: -1
            }
        });
        instances[i].init();
    }

    function loadMedia() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        var isAudio = !!this.closest('.audio-player');

        if (isAudio) {
            document.getElementById('stream-info').innerHTML = '';
            document.getElementById('stream-info').classList.add('hidden');
        }

        player.src = this.value.replace('&amp;', '&');
        player.load();
    }

    function destroyPlayer() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        player.destroy();
        this.removeEventListener('click', destroyPlayer);

        for (var i = 0, total = sourcesSelector.length; i < total; i++) {
            sourcesSelector[i].removeEventListener('change', loadMedia);
        }
    }

    function loadCaption() {
        var id = this.closest('.players').querySelector('.op-player').id;
        var player = OpenPlayer.instances[id];
        player.addCaptions({
            srclang: 'br_PT',
            src: 'http://brenopolanski.com/html5-video-webvtt-example/MIB2-subtitles-pt-BR.vtt',
            kind: 'subtitles',
            label: 'Portuguese (BR)'
        });
        this.removeEventListener('click', loadCaption);
    }

    for (var i = 0, total = sourcesSelector.length; i < total; i++) {
        sourcesSelector[i].addEventListener('change', loadMedia);
    }

    for (var i = 0, total = destroyBtn.length; i < total; i++) {
        destroyBtn[i].addEventListener('click', destroyPlayer);
    }
    for (var i = 0, total = captionBtn.length; i < total; i++) {
        captionBtn[i].addEventListener('click', loadCaption);
    }

    instances[1].getElement().addEventListener('hlsFragParsingMetadata', function (event) {
        var encodedTag = event.detail.samples[0].data;
        var parsedTag = [];

        encodedTag.forEach(function (element) {
            parsedTag.push(String.fromCharCode(element));
        });

        var tagAsString = parsedTag.toString().replace(/,/g, '');
        extractMeta(tagAsString, instances[1].getElement());
    });

    function extractMeta(data, audio) {
        var name, desc, title, artist, image, infoArea, metaInfo, startLoc, endLoc;

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
        image = data.match('(http:\/\/|https:\/\/).*\.(jpg|png|svg)')[0];
        infoArea = document.getElementById('stream-info');
        metaInfo = '<img src="' + image + '" alt="' + title + ', by ' + artist + ' width="300"/><p>Name: ' + name + '</p>' + '<p>Desc: ' + desc + '</p>' + '<p>Artist: ' + artist + '</p>' + '<p>Title: ' + title + '</p>';

        infoArea.innerHTML = metaInfo;
        infoArea.classList.remove('hidden');
        audio.poster = image;
    }
})();