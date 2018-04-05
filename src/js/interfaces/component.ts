/**
 * Player Component
 *
 * @interface PlayerComponent
 */
export default interface PlayerComponent {
    /**
     * Create HTML and insert it into OpenPlayer's DOM.
     *
     * This method must include its events setup.
     * @memberof PlayerComponent
     */
    create(): void;
    /**
     * Remove HTML associated to specific OpenPlayer's element.
     *
     * This method must include the removal of its previously set events.
     * @memberof PlayerComponent
     */
    destroy(): void;
}
