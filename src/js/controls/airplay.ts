import IEvent from '../components/interfaces/general/event';
import { addEvent } from '../events';
import Media from '../media';

class AirPlay {
    public media: Media;
    private button: HTMLButtonElement;
    private events: IEvent;
    private canUseAirplay: boolean;
    /**
     * Creates an instance of AirPlay.
     *
     * @param {Media} media
     * @memberof AirPlay
     */
    constructor(media: Media) {
        this.media = media;
        this.events = {};
        this.canUseAirplay = (window as any).WebKitPlaybackTargetAvailabilityEvent;
        this.button = document.createElement('button');
        this.button.className = 'om-controls__airplay';
        this.button.innerHTML = '<span class="om-sr">AirPlay</span>';

        this.button.addEventListener('click', () => {
            this.media.element.webkitShowPlaybackTargetPicker();
        });

        const acceptAirPlay = this.media.element.getAttribute('x-webkit-airplay');
        if (!acceptAirPlay || acceptAirPlay !== 'allow') {
            this.media.element.setAttribute('x-webkit-airplay', 'allow');
        }

        this.events['webkitcurrentplaybacktargetiswirelesschanged'] = () => {
            const isWireless = this.media.element.webkitCurrentPlaybackTargetIsWireless;
            const name = isWireless ? 'Started' : 'Stopped';
            const status = isWireless ? 'active' : '';
            const event = addEvent(`airplay${name}`);
            this.media.element.dispatchEvent(event);

            if (status === 'active') {
                this.button.classList.add('active');
            } else {
                this.button.classList.remove('active');
            }
        };
    }

    /**
     *
     * @returns {AirPlay}
     * @memberof AirPlay
     */
    public register() {
        if (this.canUseAirplay) {
            Object.keys(this.events).forEach(event => {
                this.media.addEventListener(event, this.events[event]);
            });
        }

        return this;
    }

    public unregister() {
        if (this.canUseAirplay) {
            Object.keys(this.events).forEach(event => {
                this.media.removeEventListener(event, this.events[event]);
            });

            this.events = {};
        }

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} container
     * @returns {AirPlay}
     * @memberof AirPlay
     */
    public build(container: HTMLDivElement) {
        if (this.canUseAirplay) {
            this.media.addEventListener('webkitplaybacktargetavailabilitychanged', (e: any) => {
                if (e.availability === 'available') {
                    container.appendChild(this.button);
                }
            });
        }

        return this;
    }
}

export default AirPlay;
