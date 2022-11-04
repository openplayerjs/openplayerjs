import { EventsList, PlayerComponent } from './interfaces';
import Player from './player';
export default class Controls implements PlayerComponent {
    #private;
    events: EventsList;
    constructor(player: Player);
    create(): void;
    destroy(): void;
    getContainer(): HTMLDivElement;
    getLayer(layer: string): HTMLDivElement;
    private _createControlsLayer;
    private _startControlTimer;
    private _stopControlTimer;
    private _setElements;
    private _buildElements;
    private _hideCustomMenu;
    private _toggleCustomMenu;
    private _createCustomElement;
    private _destroyCustomElement;
}
