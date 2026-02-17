export function formatTime(seconds: number, frameRate?: number): string {
  const f = Math.floor((seconds % 1) * (frameRate || 0));
  let s = Math.floor(seconds);
  let m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const wrap = (value: number): string => {
    const formattedVal = value.toString();
    if (value < 10) {
      if (value <= 0) {
        return '00';
      }
      return `0${formattedVal}`;
    }
    return formattedVal;
  };
  m %= 60;
  s %= 60;
  return `${h > 0 ? `${wrap(h)}:` : ''}${wrap(m)}:${wrap(s)}${f ? `:${wrap(f)}` : ''}`;
}

export function offset(el: HTMLElement): { left: number; top: number } {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
    top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
  };
}

export function isAudio(element: HTMLMediaElement): boolean {
  return element instanceof HTMLAudioElement;
}

export function isMobile(): boolean {
  return (
    (/ipad|iphone|ipod/i.test(window.navigator.userAgent) && !(window as any).MSStream) ||
    /android/i.test(window.navigator.userAgent)
  );
}

export function predictMimeType(media: HTMLMediaElement, url: string): string {
  const fragments = new URL(url).pathname.split('.');
  const extension = fragments.length > 1 ? fragments.pop()!.toLowerCase() : '';

  // If no extension found, check if media is a vendor iframe
  if (!extension) return isAudio(media) ? 'audio/mp3' : 'video/mp4';

  // Check native media types
  switch (extension) {
    case 'm3u8':
    case 'm3u':
      return 'application/x-mpegURL';
    case 'mpd':
      return 'application/dash+xml';
    case 'mp4':
      return isAudio(media) ? 'audio/mp4' : 'video/mp4';
    case 'mp3':
      return 'audio/mp3';
    case 'webm':
      return isAudio(media) ? 'audio/webm' : 'video/webm';
    case 'ogg':
      return isAudio(media) ? 'audio/ogg' : 'video/ogg';
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
      return isAudio(media) ? 'audio/mp3' : 'video/mp4';
  }
}
