import { HAS_MSE } from '../utils/constants';
import { addEvent, loadScript } from '../utils/general';
import { isDashSource } from '../utils/media';
import Native from './native';
class DashMedia extends Native {
    #player;
    #events = {};
    #options = {};
    constructor(element, mediaSource, options) {
        super(element, mediaSource);
        this.#options = options;
        this._assign = this._assign.bind(this);
        this._preparePlayer = this._preparePlayer.bind(this);
        this.promise =
            typeof dashjs === 'undefined'
                ?
                    loadScript('https://cdn.dashjs.org/latest/dash.all.min.js')
                : new Promise((resolve) => {
                    resolve({});
                });
        this.promise.then(() => {
            this.#player = dashjs.MediaPlayer().create();
            this.instance = this.#player;
        });
    }
    canPlayType(mimeType) {
        return HAS_MSE && mimeType === 'application/dash+xml';
    }
    load() {
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
    destroy() {
        if (this.#events) {
            Object.keys(this.#events).forEach((event) => {
                this.#player.off(this.#events[event], this._assign);
            });
            this.#events = [];
        }
        this.#player.reset();
    }
    set src(media) {
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
    get levels() {
        const levels = [];
        if (this.#player) {
            const bitrates = this.#player.getBitrateInfoListFor('video');
            if (bitrates.length) {
                bitrates.forEach((item) => {
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
    set level(level) {
        if (level === 0) {
            this.#player.setAutoSwitchQuality(true);
        }
        else {
            this.#player.setAutoSwitchQuality(false);
            this.#player.setQualityFor('video', level);
        }
    }
    get level() {
        return this.#player ? this.#player.getQualityFor('video') : -1;
    }
    _assign(event) {
        if (event.type === 'error') {
            const details = {
                detail: {
                    message: event,
                    type: 'M(PEG)-DASH',
                },
            };
            const errorEvent = addEvent('playererror', details);
            this.element.dispatchEvent(errorEvent);
        }
        else {
            const e = addEvent(event.type, { detail: event });
            this.element.dispatchEvent(e);
        }
    }
    _preparePlayer() {
        this.#player.updateSettings({
            debug: {
                logLevel: dashjs.Debug.LOG_LEVEL_NONE,
            },
            streaming: {
                fastSwitchEnabled: true,
                scheduleWhilePaused: false,
            },
            ...(this.#options || {}),
        });
        this.#player.initialize();
        this.#player.attachView(this.element);
        this.#player.setAutoPlay(false);
    }
}
export default DashMedia;
