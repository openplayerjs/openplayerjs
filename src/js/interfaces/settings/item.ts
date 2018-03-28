import SettingsSubItem from './subitem';

/**
 *
 * @export
 * @interface SettingsItem
 */
export default interface SettingsItem {
    className: string;
    default: string;
    key: string;
    name: string;
    subitems?: SettingsSubItem[];
}
