import { Delegate } from "../library/delegate.js";
import { ElementStatics } from "../library/element-statics.js";
import { UIBuilder } from "./ui-builder.js";

export class SegmentedControlUIOption {
    /** @type {string} */
    displayLabel;
    /** @type {any} */
    value;

    /**
     * A segmented control option.
     * @param {string} displayLabel The display label.
     * @param {any} value The value of the option.
     */
    constructor(displayLabel, value) {
        this.displayLabel = displayLabel;
        this.value = value;
    }
}

export class SegmentedControlUI {
    /** @type {HTMLDivElement} */
    horizontalDiv = null;
    /** @type {SegmentedControlUIOption[]} */
    options = new Array();
    /** @type {HTMLButtonElement[]} */
    buttons = new Array();
    /** @type {HTMLButtonElement} */
    selectedButton = null;
    onClick = new Delegate();

    /**
     * Will create a segmented control UI, with a single option always selected.
     * @param {HTMLElement} parentElement The parent element.
     * @param  {...SegmentedControlUIOption} options The options on the segmented control.
     */
    constructor(parentElement, ...options) {
        this.horizontalDiv = UIBuilder.createElement("div", parentElement, "horizontal-form");

        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            this.options.push(option.value);
            let label = option.displayLabel;

            let button = UIBuilder.createElement("button", this.horizontalDiv, "segmented-control");
            button.innerText = label;
            ElementStatics.bindOnClick(button, this, async function(button, index) {
                this.#click(button, index);
            }, i);

            if (this.selectedButton == null) {
                this.#click(button);
            }
            this.buttons.push(button);
        }
    }

    #click(button, index) {
        if (this.selectedButton == button)
            return;

        if (this.selectedButton != null)
            this.selectedButton.id = "segmented-control";

        this.selectedButton = button;
        button.id = "selected-segmented-control";
        this.onClick.broadcast(button, this.options[index]);
    }

    /**
     * Gets the currently selected options value.
     * @returns {any} The value of the selected option.
     */
    getSelectedOption() {
        if (this.selectedButton == null)
            return null;

        return this.options[this.#getButtonIndex(this.selectedButton)];
    }

    /**
     * Sets the selected option by value.
     * @param {any} option The option to select.
     * @returns {void}
     */
    setSelectedOption(option) {
        let index = this.options.indexOf(option);
        if (index == -1)
        {
            console.error(`Tried to set segmented control with option ${option}, but it isn't a possible option!`);
            return;
        }

        this.#click(this.buttons[index]);
    }

    #getButtonIndex(button) {
        for (let i = 0; i < this.buttons.length; i++) {
            let current = this.buttons[i];
            if (current == button)
                return i;
        }

        return -1;
    }

    show() {
        this.horizontalDiv.style.display = "";
    }

    hide() {
        this.horizontalDiv.style.display = "none";
    }
}