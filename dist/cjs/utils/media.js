"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAutoplaySupported = exports.predictMimeType = exports.isFlvSource = exports.isDashSource = exports.isM3USource = exports.isHlsSource = exports.getExtension = void 0;
const general_1 = require("./general");
function getExtension(url) {
    const baseUrl = url.split('?')[0];
    const baseFrags = (baseUrl || '').split('\\');
    const baseUrlFragment = (baseFrags || []).pop();
    const baseNameFrags = (baseUrlFragment || '').split('/');
    const baseName = (baseNameFrags || []).pop() || '';
    return baseName.includes('.') ? baseName.substring(baseName.lastIndexOf('.') + 1) : '';
}
exports.getExtension = getExtension;
function isHlsSource(media) {
    return (/\.m3u8$/i.test(media.src) || ['application/x-mpegURL', 'application/vnd.apple.mpegurl'].includes(media.type));
}
exports.isHlsSource = isHlsSource;
function isM3USource(media) {
    return /\.m3u$/i.test(media.src);
}
exports.isM3USource = isM3USource;
function isDashSource(media) {
    return /\.mpd/i.test(media.src) || media.type === 'application/dash+xml';
}
exports.isDashSource = isDashSource;
function isFlvSource(media) {
    return /(^rtmp:\/\/|\.flv$)/i.test(media.src) || ['video/x-flv', 'video/flv'].includes(media.type);
}
exports.isFlvSource = isFlvSource;
function predictMimeType(url, element) {
    const extension = getExtension(url);
    if (!extension) {
        return (0, general_1.isAudio)(element) ? 'audio/mp3' : 'video/mp4';
    }
    switch (extension) {
        case 'm3u8':
        case 'm3u':
            return 'application/x-mpegURL';
        case 'mpd':
            return 'application/dash+xml';
        case 'mp4':
            return (0, general_1.isAudio)(element) ? 'audio/mp4' : 'video/mp4';
        case 'mp3':
            return 'audio/mp3';
        case 'webm':
            return (0, general_1.isAudio)(element) ? 'audio/webm' : 'video/webm';
        case 'ogg':
            return (0, general_1.isAudio)(element) ? 'audio/ogg' : 'video/ogg';
        case 'ogv':
            return 'video/ogg';
        case 'oga':
            return 'audio/ogg';
        case '3gp':
            return 'audio/3gpp';
        case 'wav':
            return 'audio/wav';
        case 'aac':
            return 'audio/aac';
        case 'flac':
            return 'audio/flac';
        default:
            return (0, general_1.isAudio)(element) ? 'audio/mp3' : 'video/mp4';
    }
}
exports.predictMimeType = predictMimeType;
function isAutoplaySupported(media, defaultVol, autoplay, muted, callback) {
    const playPromise = media.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
            media.pause();
            autoplay(true);
            muted(false);
            callback();
        })
            .catch(() => {
            media.volume = 0;
            media.muted = true;
            media
                .play()
                .then(() => {
                media.pause();
                autoplay(true);
                muted(true);
                callback();
            })
                .catch(() => {
                media.volume = defaultVol;
                media.muted = false;
                autoplay(false);
                muted(false);
                callback();
            });
        });
    }
    else {
        autoplay(!media.paused || ('Promise' in window && playPromise instanceof Promise));
        media.pause();
        muted(false);
        callback();
    }
}
exports.isAutoplaySupported = isAutoplaySupported;
