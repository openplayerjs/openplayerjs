import { Source } from '../interfaces';
export declare const getExtension: (url: string) => string;
export declare const isHlsSource: (media: Source) => boolean;
export declare const isM3USource: (media: Source) => boolean;
export declare const predictMimeType: (url: string, element: HTMLMediaElement) => string;
export declare const isAutoplaySupported: (
    media: HTMLMediaElement,
    defaultVol: number,
    autoplay: (playing: boolean) => void,
    muted: (playing: boolean) => void,
    callback: () => void
) => Promise<void>;
