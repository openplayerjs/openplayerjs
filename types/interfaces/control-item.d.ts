/**
 * Control item
 *
 * @description An object that stores the definition for custom controls
 * @interface ControlItem
 * @export
 */
export default interface ControlItem {
    /**
     * The icon image to present the custom control
     *
     * @type string
     */
    icon: string;
    /**
     * The custom control label (for accessibility purposes)
     *
     * @type string
     */
    title: string;
    /**
     * The custom control position (left, middle or right)
     *
     * @type string
     */
    position: string;
    /**
     * Flag to indicate is a custom control
     *
     * @type boolean
     */
    custom?: boolean;
    /**
     * The custom control callback to be executed when clicking on it
     *
     * @memberof ControlItem
     */
    click(): void;
}
