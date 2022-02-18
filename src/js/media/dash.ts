import { EventsList, Level, Source } from '../interfaces';
import { HAS_MSE } from '../utils/constants';
import { addEvent, loadScript } from '../utils/general';
import { isDashSource } from '../utils/media';
import Native from './native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const dashjs: any;

class DashMedia extends Native {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #player: any;

    // @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
    #events: EventsList = {};

    #options?: unknown = {};

    constructor(element: HTMLMediaElement, mediaSource: Source, options?: unknown) {
        super(element, mediaSource);
        this.#options = options;

        this._assign = this._assign.bind(this);
        this._preparePlayer = this._preparePlayer.bind(this);

        this.promise =
            typeof dashjs === 'undefined'
                ? // Ever-green script
                  loadScript('https://cdn.dashjs.org/latest/dash.all.min.js')
                : new Promise((resolve) => {
                      resolve({});
                  });

        this.promise.then(() => {
            this.#player = dashjs.MediaPlayer().create();
            this.instance = this.#player;
        });

        return this;
    }

    canPlayType(mimeType: string): boolean {
        return HAS_MSE && mimeType === 'application/dash+xml';
    }

    load(): void {
        this._preparePlayer();
        this.#player.attachSource(this.media.src);

        const e = addEvent('loadedmetadata');
        this.element.dispatchEvent(e);

        if (!this.#events) {
            this.#events = dashjs.MediaPlayer.events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], this._assign);
            });
        }
    }

    destroy(): void {
        if (this.#events) {
            Object.keys(this.#events).forEach((event) => {
                this.#player.off(this.#events[event], this._assign);
            });
            this.#events = [];
        }
        this.#player.reset();
    }

    set src(media: Source) {
        if (isDashSource(media)) {
            this.destroy();
            this.#player = dashjs.MediaPlayer().create();
            this._preparePlayer();
            this.#player.attachSource(media.src);

            this.#events = dashjs.MediaPlayer.events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], this._assign);
            });
        }
    }

    get levels(): Level[] {
        const levels: Level[] = [];
        if (this.#player) {
            const bitrates = this.#player.getBitrateInfoListFor('video');
            if (bitrates.length) {
                bitrates.forEach((item: number) => {
                    if (bitrates[item]) {
                        const { height, name } = bitrates[item];
                        const level = {
                            height,
                            id: `${item}`,
                            label: name || null,
                        };
                        levels.push(level);
                    }
                });
            }
        }
        return levels;
    }

    set level(level: number) {
        if (level === 0) {
            this.#player.setAutoSwitchQuality(true);
        } else {
            this.#player.setAutoSwitchQuality(false);
            this.#player.setQualityFor('video', level);
        }
    }

    get level(): number {
        return this.#player ? this.#player.getQualityFor('video') : -1;
    }

    // @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
    private _assign(event: Event): void {
        if (event.type === 'error') {
            const details = {
                detail: {
                    message: event,
                    type: 'M(PEG)-DASH',
                },
            };
            const errorEvent = addEvent('playererror', details);
            this.element.dispatchEvent(errorEvent);
        } else {
            const e = addEvent(event.type, { detail: event });
            this.element.dispatchEvent(e);
        }
    }

    private _preparePlayer(): void {
        this.#player.updateSettings({
            debug: {
                logLevel: dashjs.Debug.LOG_LEVEL_NONE,
            },
            streaming: {
                fastSwitchEnabled: true,
                scheduleWhilePaused: false,
            },
            ...((this.#options as Record<string, unknown>) || {}),
        });
        this.#player.initialize();
        this.#player.attachView(this.element);
        this.#player.setAutoPlay(false);
    }
}

export default DashMedia;
