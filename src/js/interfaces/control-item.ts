/**
 * Control item
 *
 * @description An object that stores the definition for custom controls
 * @interface ControlItem
 * @export
 */
export default interface ControlItem {
    readonly icon: string;
    readonly title: string;
    readonly position: 'right' | 'left' | 'middle';
    custom?: boolean;
    click(): void;
}
