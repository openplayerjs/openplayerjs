import SettingsSubItem from './subitem';

/**
 * Settings Item.
 *
 * @description An element to create elements in the `Settings` menu and submenus linked
 * to them.
 * @see [[Settings.addSettings]]
 * @interface SettingsItem
 * @export
 */
export default interface SettingsItem {
    /**
     * Specific class name to be used for:
     * - event listeners and dispatchers
     * - specific styling
     *
     * @type string
     * @memberof SettingsItem
     */
    className: string;

    /**
     * Identifier to indicate the initial value of `Settings` element when created.
     *
     * This element must exist in the `submenu` attribute (if not empty).
     * @type string
     * @memberof SettingsItem
     */
    default: string;

    /**
     * Unique identifier to avoid collisions with other items.
     *
     * @type string
     * @memberof SettingsItem
     */
    key: string;

    /**
     * Human-readable name of the item.
     *
     * @type string
     * @memberof SettingsItem
     */
    name: string;

    /**
     * List of elements to generate a submenu linked to item.
     *
     * @type SettingsSubItem[]
     * @memberof SettingsItem
     */
    subitems?: SettingsSubItem[];
}
