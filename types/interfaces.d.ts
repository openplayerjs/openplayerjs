export interface Cue {
    readonly endTime: number;
    readonly identifier: string;
    readonly settings: Record<string, unknown>;
    readonly startTime: number;
    readonly text: string;
}
export interface CueList {
    [language: string]: Cue[];
}
export interface TrackURL {
    [code: string]: string;
}
export interface Track {
    readonly srclang: string;
    readonly src: string;
    readonly kind: string;
    readonly default: boolean;
    readonly label: string;
}
export interface SettingsSubItem {
    key: string;
    label?: string;
}
export interface SettingsItem {
    readonly className: string;
    readonly default: string;
    readonly key: string;
    readonly name: string;
    subitems?: SettingsSubItem[];
}
export interface SettingsSubMenu {
    [key: string]: string;
}
export interface Source {
    src: string;
    type: string;
}
export interface AdsOptions {
    readonly src: string | string[];
    readonly vpaidMode?: 'enabled' | 'disabled' | 'insecure';
    readonly autoPlayAdBreaks?: boolean;
    customClick?: {
        enabled: boolean;
        label: string;
    };
    audioSkip?: {
        enabled: boolean;
        label: string;
        remainingLabel: string;
        element?: string | HTMLElement;
    };
    readonly debug?: boolean;
    readonly enablePreloading?: boolean;
    readonly language?: string;
    readonly loop?: boolean;
    readonly numRedirects?: number;
    readonly publisherId?: string | number;
    sdkPath?: string;
    readonly sessionId?: string;
}
export interface PlayerComponent {
    custom?: boolean;
    create(): void;
    destroy(): void;
    addSettings?: () => SettingsItem | unknown;
}
export interface ElementItem {
    readonly icon?: string;
    readonly alt?: string;
    readonly title?: string;
    readonly id: string;
    readonly showInAds: boolean;
    position: 'right' | 'left' | 'middle' | string;
    layer?: 'top' | 'center' | 'bottom' | 'main' | string;
    index?: number;
    type: string;
    custom: boolean;
    content?: string;
    styles?: Record<string, string | number>;
    subitems?: {
        id: string;
        label: string;
        title?: string;
        icon?: string;
        alt?: string;
        click(): void;
    }[];
    click?(event: Event): void;
    init?(player: unknown): void;
    destroy?(player: unknown): void;
    mouseenter?(event: Event): void;
    mouseleave?(event: Event): void;
    keydown?(event: Event): void;
    blur?(event: Event): void;
    focus?(event: Event): void;
}
export interface CustomMedia {
    media: {
        [key: string]: any;
    };
    optionsKey: {
        [key: string]: string;
    };
    rules: ((mediaUrl: string) => string)[];
}
export interface EventsList {
    [key: string]: any;
}
export interface Level {
    readonly height: number;
    readonly id: string;
    readonly label: string;
}
export type PlayerLayers = {
    left?: string[];
    middle?: string[];
    right?: string[];
    main?: string[];
    'top-right'?: string[];
    'top-middle'?: string[];
    'top-left'?: string[];
    'bottom-right'?: string[];
    'bottom-middle'?: string[];
    'bottom-left'?: string[];
};
export type Languages = {
    [key: string]: string;
};
export type PlayerLabels = {
    auto?: string;
    captions?: string;
    click?: string;
    fullscreen?: string;
    lang?: Languages;
    levels?: string;
    live?: string;
    mediaLevels?: string;
    mute?: string;
    off?: string;
    pause?: string;
    play?: string;
    progressRail?: string;
    progressSlider?: string;
    settings?: string;
    speed?: string;
    speedNormal?: string;
    tap?: string;
    toggleCaptions?: string;
    unmute?: string;
    volume?: string;
    volumeControl?: string;
    volumeSlider?: string;
};
export interface PlayerOptions {
    dash?: unknown;
    hls?: unknown;
    flv?: unknown;
    ads?: AdsOptions;
    controls?: {
        alwaysVisible?: boolean;
        layers?: PlayerLayers;
    };
    defaultLevel?: string;
    detachMenus?: boolean;
    forceNative?: boolean;
    height?: number | string;
    hidePlayBtnTimer?: number;
    labels?: PlayerLabels;
    live?: {
        showLabel?: boolean;
        showProgress?: boolean;
    };
    media?: {
        pauseOnClick?: boolean;
    };
    mode?: 'responsive' | 'fill' | 'fit';
    onError?: (e: unknown) => void;
    pauseOthers?: boolean;
    progress?: {
        allowRewind?: boolean;
        allowSkip?: boolean;
        duration?: number;
        showCurrentTimeOnly?: boolean;
    };
    showLoaderOnInit?: boolean;
    startTime?: number;
    startVolume?: number;
    step?: number;
    width?: number | string;
    [key: string]: unknown;
}
export interface FullscreenDocument extends Document {
    mozFullScreenEnabled?: boolean;
    msFullscreenEnabled?: boolean;
    webkitSupportsFullscreen?: boolean;
    webkitFullscreenEnabled?: boolean;
    msExitFullscreen?: () => void;
    mozCancelFullScreen?: () => void;
    webkitExitFullscreen?: () => void;
    webkitCancelFullScreen?: () => void;
}
export interface FullscreenElement extends HTMLElement {
    webkitRequestFullScreen?: () => void;
    msRequestFullscreen?: () => void;
    mozRequestFullScreen?: () => void;
    webkitRequestFullscreen?: () => void;
    webkitCancelFullScreen?: () => void;
    webkitEnterFullscreen?: () => void;
}
