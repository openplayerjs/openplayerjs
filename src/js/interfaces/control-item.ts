/**
 * Control item
 *
 * @description An object that stores the definition for custom controls
 * @interface ControlItem
 * @export
 */
export default interface ControlItem {
    icon: string;
    title: string;
    position: string;
    custom?: boolean;
    click(): void;
}
