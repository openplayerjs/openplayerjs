import SettingsSubItem from './subitem';

/**
 *
 * @export
 * @interface SettingsItem
 */
export default interface SettingsItem {
    /**
     *
     *
     * @type {string}
     * @memberof SettingsItem
     */
    className: string;
    /**
     *
     *
     * @type {string}
     * @memberof SettingsItem
     */
    default: string;
    /**
     *
     *
     * @type {string}
     * @memberof SettingsItem
     */
    key: string;
    /**
     *
     *
     * @type {string}
     * @memberof SettingsItem
     */
    name: string;
    /**
     *
     *
     * @type {SettingsSubItem[]}
     * @memberof SettingsItem
     */
    subitems?: SettingsSubItem[];
}
