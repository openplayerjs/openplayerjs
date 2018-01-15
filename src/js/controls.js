/**
 * Class that renders all control elements
 *
 * @class Controls
 */
class Controls {
    /**
     * Creates an instance of Controls.
     * @param {HTMLElement} element
     * @returns {Controls}
     * @memberof Controls
     */
    constructor(element) {
        element.controls = false;
        this.container = document.createElement('div');
        this.container.className = 'om-controls';
        return this;
    }
}

export default Controls;
