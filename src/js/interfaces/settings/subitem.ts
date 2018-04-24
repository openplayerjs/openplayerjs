/**
 * Settings Subitem.
 *
 * @description An element that contains a key identifier and a human-readable label
 * in the `Settings` submenus.
 * @see [[SettingsItem.subitems]]
 * @interface SettingsSubItem
 * @export
 */
export default interface SettingsSubItem {
    /**
     *
     *
     * @type string
     * @memberof SettingsSubItem
     */
    key: string;

    /**
     *
     *
     * @type string
     * @memberof SettingsSubItem
     */
    label: string;
}
