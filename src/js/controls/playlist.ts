// import PlayerComponent from '../interfaces/component';
// import EventsList from '../interfaces/events-list';
// import Player from '../player';
// import { removeElement } from '../utils/general';

// /**
//  * Playlist element.
//  *
//  * @description
//  * @class Playlist
//  * @implements PlayerComponent
//  */
// class Playlist implements PlayerComponent {
//     /**
//      * Instance of OpenPlayer.
//      *
//      * @private
//      * @type Player
//      * @memberof Playlist
//      */
//     private player: Player;

//     /**
//      * Button to go to previous element on playlist.
//      *
//      * @private
//      * @type HTMLButtonElement
//      * @memberof Playlist
//      */
//     private prevButton: HTMLButtonElement;

//     /**
//      * Button to go to next element on playlist.
//      *
//      * @private
//      * @type HTMLButtonElement
//      * @memberof Playlist
//      */
//     private nextButton: HTMLButtonElement;

//     /**
//      * Button to go to first element on playlist.
//      *
//      * @private
//      * @type HTMLButtonElement
//      * @memberof Playlist
//      */
//     private firstButton: HTMLButtonElement;

//     /**
//      * Button to go to last element on playlist.
//      *
//      * @private
//      * @type HTMLButtonElement
//      * @memberof Playlist
//      */
//     private lastButton: HTMLButtonElement;

//     /**
//      * Button to go open/close playlist.
//      *
//      * @private
//      * @type HTMLButtonElement
//      * @memberof Playlist
//      */
//     private toggleButton: HTMLButtonElement;

//     /**
//      * Events that will be triggered:
//      *  - button (to display menu of Playlist if detached menus are active)
//      *  - media (to check the available Playlist)
//      *
//      * @private
//      * @type EventsList
//      * @memberof Playlist
//      */
//     private events: EventsList = {
//         button: {},
//         media: {},
//     };

//     /**
//      * Position of the button to be indicated as part of its class name
//      *
//      * @private
//      * @type {string}
//      * @memberof Playlist
//      */
//     private position: string;

//     /**
//      * Default labels from player's config
//      *
//      * @private
//      * @type object
//      * @memberof Play
//      */
//     private labels: any;

//     /**
//      * Create an instance of Captions.
//      *
//      * @param {Player} player
//      * @memberof Playlist
//      * @returns {Playlist}
//      */
//     constructor(player: Player, position: string) {
//         this.player = player;
//         this.labels = player.getOptions().labels;
//         this.position = position;
//         return this;
//     }

//     /**
//      * Create a series of buttons to manipulate playlist.
//      *
//      * @inheritDoc
//      * @memberof Playlist
//      */
//     public create(): void {
//         const { playlist } = this.player;

//         let currentItem = playlist.findIndex(item => item.default);
//         if (currentItem === -1) {
//             currentItem = 0;
//         }
//         const total = playlist.length - 1;

//         this.firstButton = document.createElement('button');
//         this.firstButton.type = 'button';
//         this.firstButton.className = `op-controls__playlist-first op-control__${this.position}`;
//         this.firstButton.tabIndex = 0;
//         this.firstButton.title = this.labels.playlist.first;
//         this.firstButton.setAttribute('aria-controls', this.player.id);
//         this.firstButton.setAttribute('aria-pressed', 'false');
//         this.firstButton.setAttribute('aria-label', this.labels.playlist.first);
//         this.firstButton.innerHTML = `<span class="op-sr">${this.labels.playlist.first}</span>`;
//         this.player.getControls().getContainer().appendChild(this.firstButton);
//         this.events.button.first = () => {
//             currentItem = 0;
//             this.player.getElement().src = playlist[0].src;
//             this.player.load();
//         };
//         this.firstButton.addEventListener('click', this.events.button.first.bind(this));

//         this.prevButton = document.createElement('button');
//         this.prevButton.type = 'button';
//         this.prevButton.className = `op-controls__playlist-previous op-control__${this.position}`;
//         this.prevButton.tabIndex = 0;
//         this.prevButton.title = this.labels.playlist.previous;
//         this.prevButton.setAttribute('aria-controls', this.player.id);
//         this.prevButton.setAttribute('aria-pressed', 'false');
//         this.prevButton.setAttribute('aria-label', this.labels.playlist.previous);
//         this.prevButton.innerHTML = `<span class="op-sr">${this.labels.playlist.previous}</span>`;
//         this.player.getControls().getContainer().appendChild(this.prevButton);
//         this.events.button.previous = () => {
//             const previous = currentItem - 1;
//             const pos = (previous < 0) ? 0 : previous;
//             currentItem = pos;
//             this.player.getElement().src = playlist[pos].src;
//             this.player.load();
//         };
//         this.prevButton.addEventListener('click', this.events.button.previous.bind(this));

//         this.nextButton = document.createElement('button');
//         this.nextButton.type = 'button';
//         this.nextButton.className = `op-controls__playlist-next op-control__${this.position}`;
//         this.nextButton.tabIndex = 0;
//         this.nextButton.title = this.labels.playlist.next;
//         this.nextButton.setAttribute('aria-controls', this.player.id);
//         this.nextButton.setAttribute('aria-pressed', 'false');
//         this.nextButton.setAttribute('aria-label', this.labels.playlist.next);
//         this.nextButton.innerHTML = `<span class="op-sr">${this.labels.playlist.next}</span>`;
//         this.player.getControls().getContainer().appendChild(this.nextButton);
//         this.events.button.next = () => {
//             const next = currentItem + 1;
//             const pos = (next > total) ? total : next;
//             currentItem = pos;
//             this.player.getElement().src = playlist[pos].src;
//             this.player.load();
//         };
//         this.nextButton.addEventListener('click', this.events.button.next.bind(this));

//         this.lastButton = document.createElement('button');
//         this.lastButton.type = 'button';
//         this.lastButton.className = `op-controls__playlist-last op-control__${this.position}`;
//         this.lastButton.tabIndex = 0;
//         this.lastButton.title = this.labels.playlist.last;
//         this.lastButton.setAttribute('aria-controls', this.player.id);
//         this.lastButton.setAttribute('aria-pressed', 'false');
//         this.lastButton.setAttribute('aria-label', this.labels.playlist.last);
//         this.lastButton.innerHTML = `<span class="op-sr">${this.labels.playlist.last}</span>`;
//         this.player.getControls().getContainer().appendChild(this.lastButton);
//         this.events.button.last = () => {
//             currentItem = total;
//             this.player.getElement().src = playlist[total].src;
//             this.player.load();
//         };
//         this.lastButton.addEventListener('click', this.events.button.last.bind(this));

//         this.toggleButton = document.createElement('button');
//         this.toggleButton.type = 'button';
//         this.toggleButton.className = `op-controls__playlist-toggle op-control__${this.position}`;
//         this.toggleButton.tabIndex = 0;
//         this.toggleButton.title = this.labels.playlist.toggle;
//         this.toggleButton.setAttribute('aria-controls', this.player.id);
//         this.toggleButton.setAttribute('aria-pressed', 'false');
//         this.toggleButton.setAttribute('aria-label', this.labels.playlist.toggle);
//         this.toggleButton.innerHTML = `<span class="op-sr">${this.labels.playlist.toggle}</span>`;
//         this.player.getControls().getContainer().appendChild(this.toggleButton);
//         this.events.button.toggle = () => {
//             const target = document.getElementById('op-playlist');
//             if (target.classList.contains('op-player__playlist--closed')) {
//                 target.classList.remove('op-player__playlist--closed');
//             } else {
//                 target.classList.add('op-player__playlist--closed');
//             }
//         };
//         this.toggleButton.addEventListener('click', this.events.button.toggle.bind(this));
//     }

//     public destroy(): void {
//         this.firstButton.removeEventListener('click', this.events.button.first.bind(this));
//         this.prevButton.removeEventListener('click', this.events.button.previous.bind(this));
//         this.nextButton.removeEventListener('click', this.events.button.next.bind(this));
//         this.lastButton.removeEventListener('click', this.events.button.last.bind(this));
//         this.toggleButton.removeEventListener('click', this.events.button.toggle.bind(this));
//         removeElement(this.firstButton);
//         removeElement(this.prevButton);
//         removeElement(this.nextButton);
//         removeElement(this.lastButton);
//         removeElement(this.toggleButton);
//     }
// }

// export default Playlist;
