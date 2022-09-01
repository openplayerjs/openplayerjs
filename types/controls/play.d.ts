import { Layer, PlayerComponent, Position } from '../interfaces';
import Player from '../player';
declare class Play implements PlayerComponent {
    #private;
    constructor(player: Player, position: Position, layer: Layer);
    create(): void;
    register(): void;
    destroy(): void;
    private _handleClick;
    private _enterSpaceKeyEvent;
}
export default Play;
