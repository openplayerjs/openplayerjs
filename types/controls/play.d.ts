import { PlayerComponent } from '../interfaces';
import Player from '../player';
export default class Play implements PlayerComponent {
    #private;
    constructor(player: Player, position: string, layer: string);
    create(): void;
    destroy(): void;
    private _enterSpaceKeyEvent;
}
