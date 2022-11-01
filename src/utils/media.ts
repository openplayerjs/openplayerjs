import { Source } from '../interfaces';
import { isAudio } from './general';

export const getExtension = (url: string): string => {
    const baseUrl = url.split('?')[0];
    const baseFrags = (baseUrl || '').split('\\');
    const baseUrlFragment = (baseFrags || []).pop();
    const baseNameFrags = (baseUrlFragment || '').split('/');
    const baseName = (baseNameFrags || []).pop() || '';
    return baseName.includes('.') ? baseName.substring(baseName.lastIndexOf('.') + 1) : '';
};

export const isHlsSource = (media: Source): boolean =>
    /\.m3u8$/i.test(media.src) || ['application/x-mpegURL', 'application/vnd.apple.mpegurl'].includes(media.type);

export const isM3USource = (media: Source): boolean => /\.m3u$/i.test(media.src);

export const predictMimeType = (url: string, element: HTMLMediaElement): string => {
    const extension = getExtension(url);

    // If no extension found, check if media is a vendor iframe
    if (!extension) {
        return isAudio(element) ? 'audio/mp3' : 'video/mp4';
    }

    // Check native media types
    switch (extension) {
        case 'm3u8':
        case 'm3u':
            return 'application/x-mpegURL';
        case 'mpd':
            return 'application/dash+xml';
        case 'mp4':
            return isAudio(element) ? 'audio/mp4' : 'video/mp4';
        case 'mp3':
            return 'audio/mp3';
        case 'webm':
            return isAudio(element) ? 'audio/webm' : 'video/webm';
        case 'ogg':
            return isAudio(element) ? 'audio/ogg' : 'video/ogg';
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
            return isAudio(element) ? 'audio/mp3' : 'video/mp4';
    }
};

// @see https://raw.githubusercontent.com/googleads/googleads-ima-html5/2.11/attempt_to_autoplay/ads.js
// @see https://github.com/Modernizr/Modernizr/issues/1095#issuecomment-304682473
export const isAutoplaySupported = async (
    media: HTMLMediaElement,
    defaultVol: number,
    autoplay: (playing: boolean) => void,
    muted: (playing: boolean) => void,
    callback: () => void
): Promise<void> => {
    try {
        const playPromise = await media.play();
        if (playPromise !== undefined) {
            // Unmuted autoplay works.
            media.pause();
            autoplay(true);
            muted(false);
            callback();
        } else {
            autoplay(!media.paused);
            media.pause();
            muted(false);
            callback();
        }
    } catch (err) {
        // Unmuted autoplay failed. New attempt with muted autoplay.
        media.volume = 0;
        media.muted = true;

        try {
            await media.play();
            // Muted autoplay works.
            media.pause();
            autoplay(true);
            muted(true);
            callback();
        } catch (e) {
            // Both muted and unmuted autoplay failed. Fallback to click to play.
            media.volume = defaultVol;
            media.muted = false;
            autoplay(false);
            muted(false);
            callback();
        }
    }
};
