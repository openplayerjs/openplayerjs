import { PlayerComponent, SettingsItem } from '../interfaces';
import Player from '../player';
export default class Levels implements PlayerComponent {
    #private;
    constructor(player: Player, position: string, layer: string);
    create(): void;
    destroy(): void;
    addSettings(): SettingsItem | unknown;
    private _formatMenuItems;
    private _getResolutionsLabel;
    private _gatherLevels;
    private _buildMenu;
}
