// import PlayerComponent from '../interfaces/component';
// // import EventsList from '../interfaces/events-list';
// import Player from '../player';

// /**
//  * Quality element.
//  *
//  * @description
//  * @class Quality
//  * @implements PlayerComponent
//  */
// class Quality implements PlayerComponent {
//     /**
//      * Instance of OpenPlayer.
//      *
//      * @private
//      * @type Player
//      * @memberof Quality
//      */
//     private player: Player;

//     /**
//      * Button to toggle captions.
//      *
//      * @private
//      * @type HTMLButtonElement
//      * @memberof Quality
//      */
//     // private button: HTMLButtonElement;

//     /**
//      * Container to display quality options if `detachMenus` is set as `true`.
//      *
//      * @private
//      * @type HTMLDivElement
//      * @memberof Quality
//      */
//     // private menu: HTMLDivElement;

//     /**
//      * Events that will be triggered in Caption element:
//      *  - button (for the caption toggle element)
//      *  - global (for dynamic elements)
//      *  - media (to update captions on `timeupdate`, instead of using `oncuechanged`)
//      *
//      * @private
//      * @type EventsList
//      * @memberof Quality
//      */
//     // private events: EventsList = {
//     //     button: {},
//     //     global: {},
//     //     media: {},
//     // };

//     /**
//      * Determine if a submenu must be created with the CC button, instead of using the Settings menu.
//      *
//      * @private
//      * @type boolean
//      * @memberof Quality
//      */
//     // private detachMenu: boolean;

//     /**
//      * Create an instance of Captions.
//      *
//      * @param {Player} player
//      * @memberof Quality
//      * @returns {Captions}
//      */
//     constructor(player: Player) {
//         this.player = player;
//         // this.labels = player.getOptions().labels;
//         // this.detachMenu = player.getOptions().detachMenus;
//         return this;
//     }

//     /**
//      * Create a button and a container to display quality levels (if any).
//      *
//      * @inheritDoc
//      * @memberof Quality
//      */
//     public create(): void {
//         setTimeout(() => {
//             console.log(this.player.getMedia().levels);
//         }, 2500);
//     }

//     public destroy(): void {
//         console.log(this.player.getMedia().levels);
//     }
// }

// export default Quality;
