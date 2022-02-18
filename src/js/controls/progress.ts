import { EventsList, PlayerComponent } from '../interfaces';
import Player from '../player';
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS } from '../utils/constants';
import { isAudio, offset } from '../utils/general';
import { formatTime } from '../utils/time';

class Progress implements PlayerComponent {
    #player: Player;

    #progress: HTMLDivElement;

    #slider: HTMLInputElement;

    #buffer: HTMLProgressElement;

    #played: HTMLProgressElement;

    #tooltip: HTMLSpanElement;

    #events: EventsList = {
        container: {},
        controls: {},
        global: {},
        media: {},
        slider: {},
    };

    #forcePause = false;

    #controlPosition: string;

    #controlLayer: string;

    constructor(player: Player, position: string, layer: string) {
        this.#player = player;
        this.#controlPosition = position;
        this.#controlLayer = layer;

        this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
        return this;
    }

    create(): void {
        const { labels } = this.#player.getOptions();
        this.#progress = document.createElement('div');
        this.#progress.className = `op-controls__progress op-control__${this.#controlPosition}`;
        this.#progress.tabIndex = 0;
        this.#progress.setAttribute('aria-label', labels?.progressSlider || '');
        this.#progress.setAttribute('aria-valuemin', '0');

        this.#slider = document.createElement('input');
        this.#slider.type = 'range';
        this.#slider.className = 'op-controls__progress--seek';
        this.#slider.tabIndex = -1;
        this.#slider.setAttribute('min', '0');
        this.#slider.setAttribute('max', '0');
        this.#slider.setAttribute('step', '0.1');
        this.#slider.value = '0';
        this.#slider.setAttribute('aria-label', labels?.progressRail || '');
        this.#slider.setAttribute('role', 'slider');

        this.#buffer = document.createElement('progress');
        this.#buffer.className = 'op-controls__progress--buffer';
        this.#buffer.setAttribute('max', '100');
        this.#buffer.value = 0;

        this.#played = document.createElement('progress');
        this.#played.className = 'op-controls__progress--played';
        this.#played.setAttribute('max', '100');
        this.#played.setAttribute('role', 'presentation');
        this.#played.value = 0;

        this.#progress.appendChild(this.#slider);
        this.#progress.appendChild(this.#played);
        this.#progress.appendChild(this.#buffer);

        if (!IS_IOS && !IS_ANDROID) {
            this.#tooltip = document.createElement('span');
            this.#tooltip.className = 'op-controls__tooltip';
            this.#tooltip.tabIndex = -1;
            this.#tooltip.innerHTML = '00:00';
            this.#progress.appendChild(this.#tooltip);
        }

        const setInitialProgress = (): void => {
            if (this.#slider.classList.contains('error')) {
                this.#slider.classList.remove('error');
            }
            const el = this.#player.activeElement();
            if (
                el.duration !== Infinity &&
                !this.#player.getElement().getAttribute('op-live__enabled') &&
                !this.#player.getElement().getAttribute('op-dvr__enabled')
            ) {
                this.#slider.setAttribute('max', `${el.duration}`);
                const current = this.#player.isMedia() ? el.currentTime : el.duration - el.currentTime;
                this.#slider.value = current.toString();
                this.#progress.setAttribute('aria-valuemax', el.duration.toString());
            } else if (this.#player.getElement().getAttribute('op-dvr__enabled')) {
                this.#slider.setAttribute('max', '1');
                this.#slider.value = '1';
                this.#slider.style.backgroundSize = '100% 100%';
                this.#played.value = 1;
                this.#progress.setAttribute('aria-valuemax', '1');
                this.#progress.setAttribute('aria-hidden', 'false');
            } else if (!this.#player.getOptions().live?.showProgress) {
                this.#progress.setAttribute('aria-hidden', 'true');
            }
        };

        let lastCurrentTime = 0;
        const defaultDuration = this.#player.getOptions().progress?.duration || 0;
        const isAudioEl = isAudio(this.#player.getElement());

        this.#events.media.loadedmetadata = setInitialProgress.bind(this);
        this.#events.controls.controlschanged = setInitialProgress.bind(this);

        this.#events.media.progress = (e: Event): void => {
            const el = e.target as HTMLMediaElement;
            if (el.duration !== Infinity && !this.#player.getElement().getAttribute('op-live__enabled')) {
                if (el.duration > 0) {
                    for (let i = 0, total = el.buffered.length; i < total; i++) {
                        if (el.buffered.start(el.buffered.length - 1 - i) < el.currentTime) {
                            this.#buffer.value = (el.buffered.end(el.buffered.length - 1 - i) / el.duration) * 100;
                            break;
                        }
                    }
                }
            } else if (
                !this.#player.getElement().getAttribute('op-dvr__enabled') &&
                this.#progress.getAttribute('aria-hidden') === 'false' &&
                !this.#player.getOptions().live?.showProgress
            ) {
                this.#progress.setAttribute('aria-hidden', 'true');
            }
        };
        this.#events.media.waiting = (): void => {
            if (isAudioEl && !this.#slider.classList.contains('loading')) {
                this.#slider.classList.add('loading');
            }
            if (isAudioEl && this.#slider.classList.contains('error')) {
                this.#slider.classList.remove('error');
            }
        };
        this.#events.media.playererror = (): void => {
            if (isAudioEl && !this.#slider.classList.contains('error')) {
                this.#slider.classList.add('error');
            }
            if (isAudioEl && this.#slider.classList.contains('loading')) {
                this.#slider.classList.remove('loading');
            }
        };
        this.#events.media.pause = (): void => {
            const el = this.#player.activeElement();
            if (el.duration !== Infinity && !this.#player.getElement().getAttribute('op-live__enabled')) {
                const current = el.currentTime;
                this.#progress.setAttribute('aria-valuenow', current.toString());
                this.#progress.setAttribute('aria-valuetext', formatTime(current));
            }
        };
        this.#events.media.play = (): void => {
            if (isAudioEl && this.#slider.classList.contains('loading')) {
                this.#slider.classList.remove('loading');
            }
            if (isAudioEl && this.#slider.classList.contains('error')) {
                this.#slider.classList.remove('error');
            }
            if (this.#player.activeElement().duration !== Infinity && !this.#player.getElement().getAttribute('op-live__enabled')) {
                this.#progress.removeAttribute('aria-valuenow');
                this.#progress.removeAttribute('aria-valuetext');
            }
        };
        this.#events.media.playing = (): void => {
            if (isAudioEl && this.#slider.classList.contains('loading')) {
                this.#slider.classList.remove('loading');
            }
            if (isAudioEl && this.#slider.classList.contains('error')) {
                this.#slider.classList.remove('error');
            }
        };
        this.#events.media.timeupdate = (): void => {
            const el = this.#player.activeElement();
            if (
                el.duration !== Infinity &&
                (!this.#player.getElement().getAttribute('op-live__enabled') || this.#player.getElement().getAttribute('op-dvr__enabled'))
            ) {
                if (
                    !this.#slider.getAttribute('max') ||
                    this.#slider.getAttribute('max') === '0' ||
                    parseFloat(this.#slider.getAttribute('max') || '-1') !== el.duration
                ) {
                    this.#slider.setAttribute('max', `${el.duration}`);
                    this.#progress.setAttribute('aria-hidden', 'false');
                }

                // Adjust current time between Media and Ads; with the latter, it is convenient to add an extra
                // second to ensure it will reach the end of the rail
                const duration = el.duration - el.currentTime + 1 >= 100 ? 100 : el.duration - el.currentTime + 1;
                const current = this.#player.isMedia() ? el.currentTime : duration;
                const min = parseFloat(this.#slider.min);
                const max = parseFloat(this.#slider.max);
                this.#slider.value = current.toString();
                this.#slider.style.backgroundSize = `${((current - min) * 100) / (max - min)}% 100%`;
                this.#played.value =
                    el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration)
                        ? defaultDuration
                        : (current / el.duration) * 100;

                if (this.#player.getElement().getAttribute('op-dvr__enabled') && Math.floor(this.#played.value) >= 99) {
                    lastCurrentTime = el.currentTime;
                    this.#progress.setAttribute('aria-hidden', 'false');
                }
            } else if (
                !this.#player.getElement().getAttribute('op-dvr__enabled') &&
                this.#progress.getAttribute('aria-hidden') === 'false' &&
                !this.#player.getOptions().live?.showProgress
            ) {
                this.#progress.setAttribute('aria-hidden', 'true');
            }
        };

        this.#events.media.durationchange = (): void => {
            const el = this.#player.activeElement();
            const current = this.#player.isMedia() ? el.currentTime : el.duration - el.currentTime;
            this.#slider.setAttribute('max', `${el.duration}`);
            this.#progress.setAttribute('aria-valuemax', el.duration.toString());
            this.#played.value =
                el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration)
                    ? defaultDuration
                    : (current / el.duration) * 100;
        };

        this.#events.media.ended = (): void => {
            this.#slider.style.backgroundSize = '0% 100%';
            this.#slider.setAttribute('max', '0');
            this.#buffer.value = 0;
            this.#played.value = 0;
        };

        const updateSlider = (e: Event): void => {
            if (this.#slider.classList.contains('op-progress--pressed')) {
                return;
            }
            const target = e.target as HTMLInputElement;
            this.#slider.classList.add('.op-progress--pressed');

            const el = this.#player.activeElement();
            const min = parseFloat(target.min);
            const max = parseFloat(target.max);
            const val = parseFloat(target.value);
            this.#slider.style.backgroundSize = `${((val - min) * 100) / (max - min)}% 100%`;
            this.#played.value =
                el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration)
                    ? defaultDuration
                    : (val / el.duration) * 100;

            if (this.#player.getElement().getAttribute('op-dvr__enabled')) {
                el.currentTime = Math.round(this.#played.value) >= 99 ? lastCurrentTime : val;
            } else {
                el.currentTime = val;
            }

            this.#slider.classList.remove('.op-progress--pressed');
        };

        const forcePause = (e: KeyboardEvent): void => {
            const el = this.#player.activeElement();
            const key = e.which || e.keyCode || 0;
            // If current progress is not related to an Ad, manipulate current time
            if ((key === 1 || key === 0) && this.#player.isMedia()) {
                if (!el.paused) {
                    el.pause();
                    this.#forcePause = true;
                }
            }
        };

        const releasePause = (): void => {
            const el = this.#player.activeElement();
            if (this.#forcePause === true && this.#player.isMedia()) {
                if (el.paused) {
                    el.play();
                    this.#forcePause = false;
                }
            }
        };

        // When tapping on mobile, it will update the time and force pause
        const mobileForcePause = (e: TouchEvent): void => {
            const el = this.#player.activeElement();
            if (el.duration !== Infinity) {
                const { changedTouches } = e;
                const x = changedTouches[0]?.pageX || 0;
                const pos = x - offset(this.#progress).left;
                const percentage = pos / this.#progress.offsetWidth;
                const time = percentage * el.duration;
                this.#slider.value = time.toString();
                updateSlider(e);
                if (!el.paused) {
                    el.pause();
                    this.#forcePause = true;
                }
            }
        };

        this.#events.slider.input = updateSlider.bind(this);
        this.#events.slider.change = updateSlider.bind(this);
        this.#events.slider.mousedown = forcePause.bind(this);
        this.#events.slider.mouseup = releasePause.bind(this);
        this.#events.slider.touchstart = mobileForcePause.bind(this);
        this.#events.slider.touchend = releasePause.bind(this);

        if (!IS_IOS && !IS_ANDROID) {
            this.#events.container.mousemove = (e: MouseEvent): void => {
                const el = this.#player.activeElement();
                if (el.duration !== Infinity && !this.#player.isAd()) {
                    const x = e.pageX;

                    let pos = x - offset(this.#progress).left;
                    const half = this.#tooltip.offsetWidth / 2;
                    const percentage = pos / this.#progress.offsetWidth;
                    const time = percentage * el.duration;
                    const mediaContainer = this.#player.getContainer();
                    const limit = mediaContainer.offsetWidth - this.#tooltip.offsetWidth;

                    if (pos <= 0 || x - offset(mediaContainer).left <= half) {
                        pos = 0;
                    } else if (x - offset(mediaContainer).left >= limit) {
                        pos = limit - offset(this.#slider).left - 10;
                    } else {
                        pos -= half;
                    }

                    if (percentage >= 0 && percentage <= 1) {
                        this.#tooltip.classList.add('op-controls__tooltip--visible');
                    } else {
                        this.#tooltip.classList.remove('op-controls__tooltip--visible');
                    }

                    this.#tooltip.style.left = `${pos}px`;
                    this.#tooltip.innerHTML = Number.isNaN(time) ? '00:00' : formatTime(time);
                }
            };
            this.#events.global.mousemove = (e: MouseEvent): void => {
                if (!(e.target as HTMLElement).closest('.op-controls__progress') || this.#player.isAd()) {
                    this.#tooltip.classList.remove('op-controls__tooltip--visible');
                }
            };
        }

        Object.keys(this.#events.media).forEach((event) => {
            this.#player.getElement().addEventListener(event, this.#events.media[event], EVENT_OPTIONS);
        });

        Object.keys(this.#events.slider).forEach((event) => {
            this.#slider.addEventListener(event, this.#events.slider[event], EVENT_OPTIONS);
        });

        this.#progress.addEventListener('keydown', this.#player.getEvents().keydown, EVENT_OPTIONS);
        this.#progress.addEventListener('mousemove', this.#events.container.mousemove, EVENT_OPTIONS);
        document.addEventListener('mousemove', this.#events.global.mousemove, EVENT_OPTIONS);
        this.#player.getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);
        this.#player
            .getControls()
            .getContainer()
            .addEventListener('controlschanged', this.#events.controls.controlschanged, EVENT_OPTIONS);
        this.#player
            .getControls()
            .getLayer(this.#controlLayer)
            .appendChild(this.#progress);
    }

    destroy(): void {
        Object.keys(this.#events).forEach((event) => {
            this.#player.getElement().removeEventListener(event, this.#events[event]);
        });

        Object.keys(this.#events.slider).forEach((event) => {
            this.#slider.removeEventListener(event, this.#events.slider[event]);
        });

        this.#progress.removeEventListener('keydown', this.#player.getEvents().keydown);
        this.#progress.removeEventListener('mousemove', this.#events.container.mousemove);

        document.removeEventListener('mousemove', this.#events.global.mousemove);

        this.#player.getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);
        this.#player
            .getControls()
            .getContainer()
            .removeEventListener('controlschanged', this.#events.controls.controlschanged);

        this.#buffer.remove();
        this.#played.remove();
        this.#slider.remove();
        if (!IS_IOS && !IS_ANDROID) {
            this.#tooltip.remove();
        }
        this.#progress.remove();
    }

    private _enterSpaceKeyEvent(e: KeyboardEvent): void {
        const el = this.#player.activeElement();
        const isAd = this.#player.isAd();
        const key = e.which || e.keyCode || 0;
        // Use the 0-9 keys to manipulate current media time to set media (not Ads) to the 0% to 90% of duration.
        if (!isAd && key >= 48 && key <= 57 && el.duration !== Infinity) {
            let step = 0;
            for (let i = 48, limit = 57; i <= limit; i++) {
                if (i < key) {
                    step++;
                }
            }
            el.currentTime = el.duration * (0.1 * step);
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

export default Progress;
